import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable } from 'rxjs';

export type UploadState = 'running' | 'success' | 'error';
export interface UploadProgress {
  progress: number;
  state: UploadState;
  path?: string;
  downloadURL?: string;
  error?: any;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);

  uploadPublic(file: File): Observable<UploadProgress> {
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `public/${Date.now()}-${safeName}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file, { cacheControl: 'public,max-age=31536000' });

    return new Observable<UploadProgress>((observer) => {
      const unsub = task.on('state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          observer.next({ progress: pct, state: 'running' });
        },
        (error) => {
          observer.next({ progress: 0, state: 'error', error });
          observer.complete();
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            observer.next({ progress: 100, state: 'success', path, downloadURL: url });
          } catch (error) {
            observer.next({ progress: 100, state: 'error', error });
          } finally {
            observer.complete();
          }
        }
      );

      return () => unsub();
    });
  }

  deletePublic(path: string) {
    return deleteObject(ref(this.storage, path));
  }

  /** Sube un archivo a un prefijo específico, retornando path y URL pública */
  uploadTo(pathPrefix: string, file: File): Promise<{ url: string; path: string; }> {
    const safePrefix = pathPrefix.replace(/\/$/, '');
    const safeName = file.name.replace(/\s+/g, '-');
    const path = `${safePrefix}/${Date.now()}-${safeName}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
    return new Promise((resolve, reject) => {
      task.on('state_changed', undefined, reject, async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path });
        } catch (e) { reject(e); }
      });
    });
  }
}

