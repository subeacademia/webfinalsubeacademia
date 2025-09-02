import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export interface UploadProgress {
  progress: number;
  state: 'running' | 'success' | 'error';
  path?: string;
  downloadURL?: string;
  error?: any;
}

/**
 * Servicio de almacenamiento alternativo que maneja errores de Firebase Storage
 * y proporciona una solución de fallback cuando hay problemas de billing o permisos
 */
@Injectable({
  providedIn: 'root'
})
export class FallbackStorageService {
  
  /**
   * Simula una subida de archivo cuando Firebase Storage no está disponible
   * En un entorno de producción real, esto podría redirigir a otro servicio de almacenamiento
   */
  uploadPublic(file: File): Observable<UploadProgress> {
    return new Observable<UploadProgress>((observer) => {
      // Simular progreso de subida
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        observer.next({ 
          progress, 
          state: 'running' as const,
          path: `fallback/${Date.now()}-${file.name}`
        });
        
        if (progress >= 100) {
          clearInterval(interval);
          // Crear una URL de datos como fallback
          const reader = new FileReader();
          reader.onload = () => {
            observer.next({
              progress: 100,
              state: 'success' as const,
              path: `fallback/${Date.now()}-${file.name}`,
              downloadURL: reader.result as string
            });
            observer.complete();
          };
          reader.onerror = () => {
            observer.next({
              progress: 0,
              state: 'error' as const,
              error: { message: 'Error leyendo archivo para fallback' }
            });
            observer.complete();
          };
          reader.readAsDataURL(file);
        }
      }, 100);
      
      return () => clearInterval(interval);
    });
  }

  /**
   * Elimina un archivo (no implementado en fallback)
   */
  deletePublic(path: string): Promise<void> {
    console.warn('FallbackStorage: deletePublic no implementado para', path);
    return Promise.resolve();
  }

  /**
   * Sube un archivo a un prefijo específico
   */
  uploadTo(pathPrefix: string, file: File): Promise<{ url: string; path: string; }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          path: `${pathPrefix}/${Date.now()}-${file.name}`
        });
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    });
  }
}
