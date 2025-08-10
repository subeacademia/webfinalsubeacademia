import { Injectable, inject } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes, uploadBytesResumable, deleteObject } from '@angular/fire/storage';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { MediaItem } from '../models/media.model';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly storage: Storage = inject(Storage);
  private readonly firestore: Firestore = inject(Firestore);
  private readonly auth: Auth = inject(Auth);

  async uploadMultiple(files: File[], options?: { convertToWebP?: boolean }): Promise<MediaItem[]> {
    const results = await Promise.all(
      files.map(file => this.uploadSingle(file, options))
    );
    return results;
  }

  uploadWithProgress(file: File, options?: { convertToWebP?: boolean }, onProgress?: (p: number) => void): Promise<MediaItem> {
    return new Promise<MediaItem>(async (resolve, reject) => {
      try {
        let uploadFile = file;
        if (options?.convertToWebP && file.type.startsWith('image/') && !file.type.includes('webp')) {
          try {
            const converted = await this.convertImageToWebP(file);
            if (converted) uploadFile = converted;
          } catch (_) {
            // ignore
          }
        }

        const timestamp = Date.now();
        const path = `media/${timestamp}_${uploadFile.name}`;
        const storageRef = ref(this.storage, path);
        const task = uploadBytesResumable(storageRef, uploadFile, { contentType: uploadFile.type });
        task.on('state_changed', (snap) => {
          const p = (snap.bytesTransferred / snap.totalBytes) * 100;
          onProgress?.(p);
        }, (err) => reject(err), async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          const createdBy = this.auth.currentUser?.uid ?? 'anonymous';
          const itemBase = {
            fileName: uploadFile.name,
            path,
            contentType: uploadFile.type,
            size: uploadFile.size,
            url,
            createdAt: timestamp,
            createdBy,
            meta: {}
          } as Omit<MediaItem, 'id'>;
          const docRef = await addDoc(collection(this.firestore, 'media'), itemBase as any);
          const item: MediaItem = { id: docRef.id, ...(itemBase as any) };
          resolve(item);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private async uploadSingle(file: File, options?: { convertToWebP?: boolean }): Promise<MediaItem> {
    let uploadFile = file;
    if (options?.convertToWebP && file.type.startsWith('image/') && !file.type.includes('webp')) {
      try {
        const converted = await this.convertImageToWebP(file);
        if (converted) uploadFile = converted;
      } catch (_) {
        // Si falla la conversión, subimos el archivo original
      }
    }

    const timestamp = Date.now();
    const path = `media/${timestamp}_${uploadFile.name}`;
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, uploadFile, {
      contentType: uploadFile.type
    });
    const url = await getDownloadURL(snapshot.ref);

    const createdBy = this.auth.currentUser?.uid ?? 'anonymous';

    const itemBase = {
      fileName: uploadFile.name,
      path,
      contentType: uploadFile.type,
      size: uploadFile.size,
      url,
      createdAt: timestamp,
      createdBy,
      meta: {}
    } as Omit<MediaItem, 'id'>;

    const docRef = await addDoc(collection(this.firestore, 'media'), itemBase as any);
    const item: MediaItem = { id: docRef.id, ...(itemBase as any) };
    return item;
  }

  private async convertImageToWebP(file: File): Promise<File | null> {
    return new Promise<File | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(null);
            const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
            resolve(webpFile);
          },
          'image/webp',
          0.9
        );
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  // Elimina un objeto de Storage por su path
  delete(path: string) {
    const r = ref(this.storage, path);
    return deleteObject(r);
  }
}

