import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly storage = inject(Storage);

  upload(file: File, folder = 'uploads', onProgress?: (p: number) => void) {
    const key = `${folder}/${Date.now()}-${(globalThis as any).crypto?.randomUUID?.() || uuid()}-${file.name}`;
    const storageRef = ref(this.storage, key);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    return new Promise<{ url: string; path: string; contentType: string; size: number }>((resolve, reject) => {
      task.on('state_changed', (snap) => {
        if (onProgress) {
          const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress(p);
        }
      }, reject, async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path: key, contentType: file.type, size: file.size });
      });
    });
  }
}

