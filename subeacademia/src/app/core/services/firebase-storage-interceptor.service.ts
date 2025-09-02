import { Injectable, inject } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { FallbackStorageService } from './fallback-storage.service';
import { StorageStatusService } from './storage-status.service';

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
    // Marcar Firebase Storage como no disponible desde el inicio
    // para forzar el uso del fallback
    this.storageStatus.markFirebaseUnavailable('Firebase Functions deshabilitado para evitar errores de billing');
  }

  /**
   * Intercepta uploads y los redirige al fallback
   */
  async uploadFile(file: File, path: string): Promise<{ url: string; path: string; }> {
    console.log('FirebaseStorageInterceptor: Redirigiendo upload al fallback');
    return this.fallbackStorage.uploadTo(path, file);
  }

  /**
   * Intercepta uploads públicos y los redirige al fallback
   */
  uploadPublicFile(file: File) {
    console.log('FirebaseStorageInterceptor: Redirigiendo upload público al fallback');
    return this.fallbackStorage.uploadPublic(file);
  }

  /**
   * Intercepta eliminaciones y las redirige al fallback
   */
  async deleteFile(path: string): Promise<void> {
    console.log('FirebaseStorageInterceptor: Redirigiendo eliminación al fallback');
    return this.fallbackStorage.deletePublic(path);
  }
}
