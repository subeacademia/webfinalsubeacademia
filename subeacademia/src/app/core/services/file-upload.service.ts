import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, from, switchMap, map, catchError, throwError } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private basePath = 'certifications';

  constructor(private storage: AngularFireStorage) {}

  /**
   * Sube un archivo a Firebase Storage
   * @param file Archivo a subir
   * @param folder Carpeta donde guardar (opcional)
   * @returns Observable con la URL de descarga
   */
  uploadFile(file: File, folder?: string): Observable<string> {
    // Validar archivo antes de subir
    if (!this.validateFileType(file)) {
      return throwError(() => new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).'));
    }
    
    if (!this.validateFileSize(file)) {
      return throwError(() => new Error('El archivo es demasiado grande. Máximo 5MB.'));
    }

    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = folder ? `${this.basePath}/${folder}/${fileName}` : `${this.basePath}/${fileName}`;
    
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);

    return from(uploadTask).pipe(
      switchMap(() => fileRef.getDownloadURL()),
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => new Error(`Error al subir el archivo: ${error.message}`));
      })
    );
  }

  /**
   * Sube múltiples archivos
   * @param files Array de archivos
   * @param folder Carpeta donde guardar
   * @returns Observable con array de URLs
   */
  uploadMultipleFiles(files: File[], folder?: string): Observable<string[]> {
    const uploadObservables = files.map(file => this.uploadFile(file, folder));
    return from(Promise.all(uploadObservables.map(obs => obs.toPromise()))).pipe(
      map(urls => urls.filter((url): url is string => url !== undefined))
    );
  }

  /**
   * Elimina un archivo de Firebase Storage
   * @param url URL del archivo a eliminar
   */
  deleteFile(url: string): Observable<void> {
    const fileRef = this.storage.refFromURL(url);
    return from(fileRef.delete());
  }

  /**
   * Valida el tipo de archivo
   * @param file Archivo a validar
   * @param allowedTypes Tipos permitidos
   * @returns true si es válido
   */
  validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Valida el tamaño del archivo
   * @param file Archivo a validar
   * @param maxSizeMB Tamaño máximo en MB
   * @returns true si es válido
   */
  validateFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Genera un nombre único para el archivo
   * @param originalName Nombre original del archivo
   * @returns Nombre único
   */
  generateUniqueFileName(originalName: string): string {
    const fileExtension = originalName.split('.').pop();
    const fileId = uuidv4();
    return `${fileId}.${fileExtension}`;
  }

  /**
   * Comprime una imagen antes de subirla
   * @param file Archivo de imagen a comprimir
   * @param maxWidth Ancho máximo (default: 1920)
   * @param maxHeight Alto máximo (default: 1080)
   * @param quality Calidad de compresión (0-1, default: 0.8)
   * @returns Promise con el archivo comprimido
   */
  async compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Sube un archivo con compresión automática
   * @param file Archivo a subir
   * @param folder Carpeta donde guardar
   * @param compress Si debe comprimir la imagen (default: true)
   * @returns Observable con la URL de descarga
   */
  uploadFileWithCompression(file: File, folder?: string, compress: boolean = true): Observable<string> {
    if (compress && this.validateFileType(file)) {
      return from(this.compressImage(file)).pipe(
        switchMap(compressedFile => this.uploadFile(compressedFile, folder))
      );
    } else {
      return this.uploadFile(file, folder);
    }
  }

  /**
   * Obtiene el progreso de carga de un archivo
   * @param file Archivo a subir
   * @param folder Carpeta donde guardar
   * @returns Observable con el progreso de carga
   */
  uploadFileWithProgress(file: File, folder?: string): Observable<{ progress: number; url?: string }> {
    if (!this.validateFileType(file)) {
      return throwError(() => new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).'));
    }
    
    if (!this.validateFileSize(file)) {
      return throwError(() => new Error('El archivo es demasiado grande. Máximo 5MB.'));
    }

    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = folder ? `${this.basePath}/${folder}/${fileName}` : `${this.basePath}/${fileName}`;
    
    const fileRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, file);

    return new Observable(observer => {
      uploadTask.percentageChanges().subscribe(percentage => {
        observer.next({ progress: percentage || 0 });
      });

      uploadTask.then(() => {
        fileRef.getDownloadURL().subscribe(url => {
          observer.next({ progress: 100, url });
          observer.complete();
        });
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
