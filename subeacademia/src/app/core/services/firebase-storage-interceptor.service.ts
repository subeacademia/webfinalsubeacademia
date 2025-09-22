import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject, uploadBytes } from '@angular/fire/storage';
import { FallbackStorageService } from './fallback-storage.service';
import { StorageStatusService } from './storage-status.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio interceptor que intercepta todas las llamadas a Firebase Storage
 * y las redirige al fallback para evitar errores de Functions
 */
@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageInterceptorService {
  private storage = inject(Storage);
  private fallbackStorage = inject(FallbackStorageService);
  private storageStatus = inject(StorageStatusService);

  constructor() {
    // Considerar Firebase Storage disponible por defecto
    try {
      this.storageStatus.markFirebaseAvailable?.();
    } catch {}
  }

  /**
   * Intercepta uploads y los redirige al fallback
   */
  async uploadFile(file: File, pathPrefix: string): Promise<{ url: string; path: string; }> {
    try {
      const baseFolder = pathPrefix || environment.storage?.defaultPublicFolder || 'public/media';
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${baseFolder.replace(/\/$/, '')}/${Date.now()}-${safeName}`;
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable'
      });
      const url = await getDownloadURL(storageRef);
      return { url, path };
    } catch (error: any) {
      console.warn('FirebaseStorageInterceptor: Error subiendo a Firebase, usando fallback', error?.message);
      this.storageStatus.markFirebaseUnavailable(error?.message || 'Upload error');
      return this.fallbackStorage.uploadTo(pathPrefix, file);
    }
  }

  /**
   * Intercepta uploads públicos y los redirige al fallback
   */
  uploadPublicFile(file: File): Observable<{ progress: number; state: 'running'|'success'|'error'; downloadURL?: string; path?: string; error?: any; }> {
    return new Observable(observer => {
      const year = new Date().getFullYear();
      const month = (new Date().getMonth()+1).toString().padStart(2,'0');
      const folder = `${environment.storage?.defaultPublicFolder || 'public/media'}/${year}/${month}`;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${folder}/${Date.now()}-${safeName}`;
      const storageRef = ref(this.storage, path);

      try {
        const task = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000, immutable'
        });

        task.on('state_changed', (snap) => {
          const progress = snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
          observer.next({ progress, state: 'running', path });
        }, (error) => {
          console.warn('FirebaseStorageInterceptor: Error en upload resumable, usando fallback', error?.message);
          this.storageStatus.markFirebaseUnavailable(error?.message || 'Resumable error');
          const sub = this.fallbackStorage.uploadPublic(file).subscribe({
            next: v => observer.next(v),
            error: err => observer.error?.(err),
            complete: () => observer.complete()
          });
          return () => sub.unsubscribe();
        }, async () => {
          try {
            const downloadURL = await getDownloadURL(storageRef);
            observer.next({ progress: 100, state: 'success', downloadURL, path });
            observer.complete();
          } catch (e) {
            observer.next({ progress: 0, state: 'error', error: e });
            observer.complete();
          }
        });
      } catch (err: any) {
        console.warn('FirebaseStorageInterceptor: Excepción en upload, usando fallback', err?.message);
        this.storageStatus.markFirebaseUnavailable(err?.message || 'Upload exception');
        const sub = this.fallbackStorage.uploadPublic(file).subscribe({
          next: v => observer.next(v),
          error: e => observer.error?.(e),
          complete: () => observer.complete()
        });
        return () => sub.unsubscribe();
      }

      return () => {};
    });
  }

  /**
   * Intercepta eliminaciones y las redirige al fallback
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error: any) {
      console.warn('FirebaseStorageInterceptor: Error eliminando en Firebase, usando fallback', error?.message);
      this.storageStatus.markFirebaseUnavailable(error?.message || 'Delete error');
      return this.fallbackStorage.deletePublic(path);
    }
  }
}
