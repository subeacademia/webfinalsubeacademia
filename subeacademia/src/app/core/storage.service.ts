import { Injectable, inject } from '@angular/core';
import { Storage, ref, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FallbackStorageService } from './services/fallback-storage.service';
import { StorageStatusService } from './services/storage-status.service';
import { FirebaseStorageInterceptorService } from './services/firebase-storage-interceptor.service';

export type UploadState = 'running' | 'success' | 'error';
export interface UploadProgress {
  progress: number;
  state: UploadState;
  path?: string;
  url?: string;
  downloadURL?: string;
  error?: any;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);
  private fallbackStorage = inject(FallbackStorageService);
  private storageStatus = inject(StorageStatusService);
  private interceptor = inject(FirebaseStorageInterceptorService);

  uploadPublic(file: File): Observable<UploadProgress> {
    // Usar directamente el interceptor para evitar cualquier uso de Firebase Functions
    console.log('StorageService: Usando interceptor para evitar Firebase Functions');
    return this.interceptor.uploadPublicFile(file);
  }

  deletePublic(path: string) {
    // Usar directamente el interceptor para evitar cualquier uso de Firebase Functions
    console.log('StorageService: Usando interceptor para eliminar archivo');
    return this.interceptor.deleteFile(path);
  }

  /** Sube un archivo a un prefijo específico, retornando path y URL pública */
  uploadTo(pathPrefix: string, file: File): Promise<{ url: string; path: string; }> {
    // Usar directamente el interceptor para evitar cualquier uso de Firebase Functions
    console.log('StorageService: Usando interceptor para uploadTo');
    return this.interceptor.uploadFile(file, pathPrefix);
  }
}