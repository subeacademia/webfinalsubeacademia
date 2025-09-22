import { Injectable, signal } from '@angular/core';

export interface StorageStatus {
  isFirebaseAvailable: boolean;
  isUsingFallback: boolean;
  lastError?: string;
  errorCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageStatusService {
  private _status = signal<StorageStatus>({
    isFirebaseAvailable: true,
    isUsingFallback: false,
    errorCount: 0
  });

  public readonly status = this._status.asReadonly();

  /**
   * Marca que Firebase Storage no está disponible
   */
  markFirebaseUnavailable(error?: string) {
    this._status.update(current => ({
      ...current,
      isFirebaseAvailable: false,
      isUsingFallback: true,
      lastError: error,
      errorCount: current.errorCount + 1
    }));
    
    console.warn('StorageStatus: Firebase Storage marcado como no disponible', { error });
  }

  /**
   * Marca que Firebase Storage está disponible
   */
  markFirebaseAvailable() {
    this._status.update(current => ({
      ...current,
      isFirebaseAvailable: true,
      isUsingFallback: false,
      lastError: undefined,
      errorCount: 0
    }));
    
    console.info('StorageStatus: Firebase Storage marcado como disponible');
  }

  /**
   * Incrementa el contador de errores
   */
  incrementErrorCount(error?: string) {
    this._status.update(current => ({
      ...current,
      errorCount: current.errorCount + 1,
      lastError: error
    }));
  }

  /**
   * Resetea el estado del almacenamiento
   */
  reset() {
    this._status.set({
      isFirebaseAvailable: true,
      isUsingFallback: false,
      errorCount: 0
    });
  }

  /**
   * Verifica si se debe mostrar una advertencia al usuario
   */
  shouldShowWarning(): boolean {
    const current = this._status();
    return current.isUsingFallback && current.errorCount > 0;
  }

  /**
   * Obtiene un mensaje de error amigable para el usuario
   */
  getUserFriendlyMessage(): string {
    const current = this._status();
    
    if (!current.isFirebaseAvailable) {
      return 'El almacenamiento en la nube no está disponible temporalmente. Los archivos se procesarán localmente.';
    }
    
    if (current.errorCount > 3) {
      return 'Se han detectado múltiples problemas con el almacenamiento. Contacta al administrador para resolver la configuración.';
    }
    
    return 'Los archivos se están procesando con almacenamiento temporal. Para una experiencia completa, verifica la configuración del sistema.';
  }
}
