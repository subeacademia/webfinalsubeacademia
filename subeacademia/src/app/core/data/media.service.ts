import { Injectable, inject } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { Firestore, addDoc, collection, serverTimestamp, collectionData, query, orderBy, doc, updateDoc, deleteDoc, where, limit } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateSlug } from '../utils/slug.util';
import { FallbackStorageService } from '../services/fallback-storage.service';
import { FirebaseStorageInterceptorService } from '../services/firebase-storage-interceptor.service';
import { MediaItem } from '../models/media.model';

@Injectable({ providedIn:'root' })
export class MediaService {
  private storage = inject(Storage);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private fallbackStorage = inject(FallbackStorageService);
  private interceptor = inject(FirebaseStorageInterceptorService);

  upload(file: File, folder='public/media', onProgress?: (p:number)=>void) {
    // Usar directamente el interceptor para evitar cualquier uso de Firebase Functions
    console.log('MediaService: Usando interceptor para upload');
    if (onProgress) onProgress(50);
    
    return this.interceptor.uploadFile(file, folder).then(result => {
      if (onProgress) onProgress(100);
      return {
        url: result.url,
        path: result.path,
        contentType: file.type,
        size: file.size
      };
    });
  }

  delete(path:string){
    // Usar directamente el interceptor para evitar cualquier uso de Firebase Functions
    console.log('MediaService: Usando interceptor para eliminar archivo');
    return this.interceptor.deleteFile(path);
  }

  listAll(): Observable<MediaItem[]> {
    const mediaCollection = collection(this.firestore, 'media');
    const q = query(mediaCollection, orderBy('uploadedAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as unknown as Observable<MediaItem[]>;
  }

  listRecent(limitCount: number = 60): Observable<MediaItem[]> {
    const mediaCollection = collection(this.firestore, 'media');
    const q = query(mediaCollection, orderBy('uploadedAt', 'desc'), limit(limitCount));
    return collectionData(q, { idField: 'id' }) as unknown as Observable<MediaItem[]>;
  }

  async recordUpload(entry: { name: string; path: string; url: string; size: number; type: string; category?: string; tags?: string[]; description?: string; }): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const mediaCollection = collection(this.firestore, 'media');
    const docData: MediaItem = {
      ...entry,
      uploadedBy: user.uid,
      uploadedAt: serverTimestamp(),
      name: entry.name,
      path: entry.path,
      url: entry.url,
      size: entry.size,
      type: entry.type,
    };

    try {
      const docRef = await addDoc(mediaCollection, docData as any);
      return docRef.id;
    } catch (error) {
      console.error('Error registrando media:', error);
      throw error;
    }
  }

  async update(itemId: string, partial: Partial<MediaItem>): Promise<void> {
    const ref = doc(this.firestore, 'media', itemId);
    await updateDoc(ref, { ...partial, updatedAt: serverTimestamp() } as any);
  }

  async remove(item: MediaItem): Promise<void> {
    try {
      await this.interceptor.deleteFile(item.path);
    } catch {}
    if (item.id) {
      await deleteDoc(doc(this.firestore, 'media', item.id));
    }
  }

  // Normaliza una imagen de logo a un formato estándar
  normalizeLogoImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Tamaño estándar para logos
        const maxSize = 512;
        let { width, height } = img;

        // Redimensionar manteniendo proporción
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob((blob) => {
          if (blob) {
            const normalizedFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now()
            });
            resolve(normalizedFile);
          } else {
            reject(new Error('Error procesando imagen'));
          }
        }, 'image/png', 0.9);
      };

      img.onerror = () => reject(new Error('Error cargando imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Convierte una imagen a formato WebP
  convertImageToWebP(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(webpFile);
          } else {
            reject(new Error('Error convirtiendo a WebP'));
          }
        }, 'image/webp', quality);
      };

      img.onerror = () => reject(new Error('Error cargando imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  uploadPublic(file: File): Observable<{ progress: number; state: 'running'|'success'|'error'; url?: string; path?: string; error?: any; downloadURL?: string }> {
    console.log('MediaService: Usando interceptor para uploadPublic');
    return this.interceptor.uploadPublicFile(file).pipe(
      map((v: any) => ({ ...v, url: v.url ?? v.downloadURL }))
    );
  }
}