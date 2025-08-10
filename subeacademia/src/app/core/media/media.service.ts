import { Injectable, inject } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private storage = getStorage();
  private db = inject(Firestore);

  upload(file: File, folder = 'uploads', onProgress?: (p: number) => void) {
    const path = `${folder}/${Date.now()}-${file.name}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

    return new Promise<{ url: string; path: string; size: number; contentType: string }>((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress?.(p);
        },
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          await addDoc(collection(this.db, 'media'), {
            name: file.name,
            path,
            url,
            size: file.size,
            contentType: file.type,
            createdAt: serverTimestamp(),
          });
          resolve({ url, path, size: file.size, contentType: file.type });
        }
      );
    });
  }
}

