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

  // Categorías públicas estándar para organizar el Storage
  public static readonly PUBLIC_CATEGORIES = [
    'media',
    'logos',
    'backgrounds',
    'documents',
    'avatars',
    'courses',
    'reports',
    'testimonials',
    'misc'
  ] as const;
  public static getPublicCategories(): ReadonlyArray<string> {
    return StorageService.PUBLIC_CATEGORIES as unknown as ReadonlyArray<string>;
  }

  /** Construye prefijo público estructurado: public/{category}/YYYY/MM */
  private buildPublicPathPrefix(category: string): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const base = 'public';
    const safeCategory = (category || 'media').toString();
    return `${base}/${safeCategory}/${year}/${month}`;
  }

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

  /** Sube un archivo a Firebase Storage en una categoría pública organizada */
  uploadPublicCategory(category: string, file: File): Promise<{ url: string; path: string; }> {
    const prefix = this.buildPublicPathPrefix(category);
    return this.interceptor.uploadFile(file, prefix);
  }
}