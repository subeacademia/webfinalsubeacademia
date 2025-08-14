import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Firestore, addDoc, collection, serverTimestamp, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, defer } from 'rxjs';
import { generateSlug } from '../utils/slug.util';

@Injectable({ providedIn:'root' })
export class MediaService {
  private storage = inject(Storage);
  private readonly firestore: Firestore = inject(Firestore);
  private readonly auth: Auth = inject(Auth, { optional: true } as any);

  upload(file: File, folder='public/media', onProgress?: (p:number)=>void) {
    const normFolder = folder.startsWith('public/') ? folder : `public/${folder}`;
    const uid = this.auth?.currentUser?.uid || 'anonymous';
    const key = `${normFolder}/${uid}/${Date.now()}-${(crypto as any).randomUUID?.() || Math.random()}-${file.name}`;
    const r = ref(this.storage, key);
    const task = uploadBytesResumable(r, file, { contentType: file.type });

    return new Promise<{url:string,path:string,contentType:string,size:number}>((resolve, reject)=>{
      task.on('state_changed',
        (snap)=>{
          if (onProgress) onProgress(Math.round((snap.bytesTransferred/snap.totalBytes)*100));
        },
        (err)=> reject(err),
        async ()=> {
          const url = await getDownloadURL(task.snapshot.ref);
          try {
            await addDoc(collection(this.firestore, 'media'), {
              name: file.name,
              path: key,
              size: file.size,
              type: file.type,
              url,
              createdAt: serverTimestamp(),
              createdBy: uid,
            } as any);
          } catch {}
          resolve({ url, path:key, contentType:file.type, size:file.size });
        }
      );
    });
  }

  delete(path:string){ return deleteObject(ref(this.storage, path)); }

  // Compat: listado y registro usados por admin
  listAll() {
    return defer(() => collectionData(collection(this.firestore, 'media'), { idField: 'id' }));
  }

  listRecent(limitCount: number = 60) {
    return defer(() => collectionData(query(collection(this.firestore, 'media'), orderBy('createdAt','desc')), { idField: 'id' }));
  }

  async recordUpload(entry: { name: string; path: string; url: string; size: number; type: string }) {
    await addDoc(collection(this.firestore, 'media'), {
      ...entry,
      createdAt: serverTimestamp(),
      createdBy: this.auth?.currentUser?.uid || 'anonymous',
    } as any);
  }

  // API opcional con conversión a WebP y progreso (migrado desde core/services)
  uploadWithProgress(file: File, options?: { convertToWebP?: boolean }, onProgress?: (p: number) => void): Promise<{ url: string; path: string; contentType: string; size: number; }> {
    return new Promise(async (resolve, reject) => {
      try {
        let uploadFile = file;
        if (options?.convertToWebP && file.type.startsWith('image/') && !file.type.includes('webp')) {
          try {
            const converted = await this.convertImageToWebP(file);
            if (converted) uploadFile = converted;
          } catch {}
        }
        const result = await this.upload(uploadFile, 'public/media', onProgress);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  async uploadMultiple(files: File[], options?: { convertToWebP?: boolean }, onEachProgress?: (index: number, p: number) => void): Promise<Array<{ url: string; path: string; contentType: string; size: number; }>> {
    const results: Array<{ url: string; path: string; contentType: string; size: number; }> = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // Reusa uploadWithProgress para conversión opcional
      const r = await this.uploadWithProgress(f, { convertToWebP: options?.convertToWebP }, (p) => onEachProgress?.(i, p));
      results.push(r);
    }
    return results;
  }

  /**
   * Normaliza una imagen de logo a una altura fija, centrada, con padding lateral y fondo opcional.
   * Devuelve un File PNG/WebP manteniendo transparencia.
   */
  async normalizeLogoImage(file: File, options?: { targetHeight?: number; maxWidth?: number; paddingX?: number; background?: string | null; format?: 'image/png' | 'image/webp'; quality?: number; }): Promise<File | null> {
    try {
      const targetHeight = options?.targetHeight ?? 64;
      const maxWidth = options?.maxWidth ?? 220;
      const paddingX = options?.paddingX ?? 12;
      const bg = options?.background ?? 'transparent';
      const format = options?.format ?? 'image/png';
      const quality = options?.quality ?? 0.92;

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = (e) => reject(e);
        i.src = URL.createObjectURL(file);
      });

      const ratio = img.width / img.height;
      const scaledWidth = Math.min(Math.round(targetHeight * ratio), maxWidth - paddingX * 2);
      const canvasWidth = Math.min(Math.max(scaledWidth + paddingX * 2, targetHeight), maxWidth);
      const canvasHeight = targetHeight + 0; // sin padding vertical

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      if (bg && bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
      const dx = Math.floor((canvasWidth - scaledWidth) / 2);
      const dy = Math.floor((canvasHeight - targetHeight) / 2);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, scaledWidth, targetHeight);

      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(b => resolve(b), format, quality));
      if (!blob) return null;
      const ext = format === 'image/webp' ? '.webp' : '.png';
      const normalized = new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: format });
      return normalized;
    } catch {
      return null;
    }
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
          0.9,
        );
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  // Observable con progreso para UI de colas (migrado desde core/media)
  uploadPublic(file: File): Observable<{ progress: number; state: 'running'|'success'|'error'; url?: string; path?: string; error?: any; downloadURL?: string }> {
    return new Observable(observer => {
      const timestamp = Date.now();
      const nameSlug = generateSlug(file.name.replace(/\.[^.]+$/, '')) || 'file';
      const path = `public/${timestamp}-${nameSlug}${(file.name.match(/\.[^.]+$/)?.[0] ?? '')}`;
      const storageRef = ref(this.storage, path);
      const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

      const nextProgress = (p: number) => observer.next({ progress: Math.round(p), state: 'running', path });

      task.on('state_changed',
        (snap) => {
          const p = (snap.bytesTransferred / snap.totalBytes) * 100;
          nextProgress(p);
        },
        (err) => {
          observer.next({ progress: 0, state: 'error', path, error: err });
          observer.error?.(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            const uid = this.auth?.currentUser?.uid || 'anonymous';
            await addDoc(collection(this.firestore, 'media'), {
              name: file.name,
              path,
              size: file.size,
              type: file.type,
              url,
              createdAt: serverTimestamp(),
              createdBy: uid,
            });
            observer.next({ progress: 100, state: 'success', url, path, downloadURL: url });
            observer.complete?.();
          } catch (e) {
            observer.next({ progress: 0, state: 'error', path, error: e });
            observer.error?.(e);
          }
        }
      );

      return () => {
        try { task.cancel(); } catch { /* noop */ }
      };
    });
  }
}

