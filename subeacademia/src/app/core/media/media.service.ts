import { Injectable, inject } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private storage = getStorage();
  private db = inject(Firestore);
  private auth = inject(Auth);

  upload(file: File, folder = 'public/media', onProgress?: (p: number) => void) {
    const uid = this.auth.currentUser?.uid || 'anonymous';
    const normalizedFolder = folder.startsWith('public/') ? folder : `public/${folder}`;
    const path = `${normalizedFolder}/${uid}/${Date.now()}-${file.name}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

    return new Promise<{ url: string; path: string; size: number; type: string; name: string }>((resolve, reject) => {
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
            size: file.size,
            type: file.type,
            url,
            createdAt: serverTimestamp(),
            createdBy: uid,
          });
          resolve({ url, path, size: file.size, type: file.type, name: file.name });
        }
      );
    });
  }
}

