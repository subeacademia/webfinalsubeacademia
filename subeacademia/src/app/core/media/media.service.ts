import { Injectable, inject } from '@angular/core';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Firestore, collection, addDoc, serverTimestamp, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, defer } from 'rxjs';
import { generateSlug } from '../utils/slug.util';

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

  /**
   * Sube un archivo público con progreso y manejo de errores.
   * Path: `public/{timestamp}-{slug(file.name)}`
   */
  uploadPublic(file: File): Observable<{ progress: number; state: 'running'|'success'|'error'; url?: string; path?: string }>{
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
          observer.next({ progress: 0, state: 'error', path });
          observer.error?.(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            // Registrar en colección "media" (opcional, útil para histórico)
            const uid = this.auth.currentUser?.uid || 'anonymous';
            await addDoc(collection(this.db, 'media'), {
              name: file.name,
              path,
              size: file.size,
              type: file.type,
              url,
              createdAt: serverTimestamp(),
              createdBy: uid,
            });
            observer.next({ progress: 100, state: 'success', url, path });
            observer.complete?.();
          } catch (e) {
            observer.next({ progress: 0, state: 'error', path });
            observer.error?.(e);
          }
        }
      );

      // Cleanup
      return () => {
        try { task.cancel(); } catch { /* noop */ }
      };
    });
  }

  // Listado de media desde Firestore (encapsulado en servicio)
  listAll() {
    return defer(() => collectionData(collection(this.db, 'media'), { idField: 'id' }));
  }

  listRecent(limitCount: number = 60) {
    return defer(() => collectionData(query(collection(this.db, 'media'), orderBy('createdAt','desc')), { idField: 'id' }));
  }

  async recordUpload(entry: { name: string; path: string; url: string; size: number; type: string }) {
    await addDoc(collection(this.db, 'media'), {
      ...entry,
      createdAt: serverTimestamp(),
    });
  }
}

