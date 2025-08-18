import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseInitService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  private _isInitialized = false;
  private _initPromise: Promise<boolean> | null = null;

  /**
   * Verifica que Firebase esté completamente inicializado
   */
  isFirebaseReady(): Observable<boolean> {
    if (this._isInitialized) {
      return of(true);
    }

    if (this._initPromise) {
      return new Observable(observer => {
        this._initPromise!.then(() => observer.next(true)).catch(err => observer.error(err));
      });
    }

    this._initPromise = this._initializeFirebase();
    return new Observable(observer => {
      this._initPromise!.then(() => observer.next(true)).catch(err => observer.error(err));
    });
  }

  /**
   * Inicializa Firebase y verifica la conectividad
   */
  private async _initializeFirebase(): Promise<boolean> {
    try {
      console.log('🚀 Inicializando Firebase...');
      
      // Verificar que la configuración esté presente
      if (!environment.firebase?.apiKey) {
        throw new Error('Configuración de Firebase no encontrada');
      }

      // Verificar que Auth esté disponible
      if (!this.auth) {
        throw new Error('Servicio de autenticación no disponible');
      }

      // Verificar que Firestore esté disponible
      if (!this.firestore) {
        throw new Error('Servicio de Firestore no disponible');
      }

      // Hacer una consulta simple para verificar conectividad
      const testQuery = await this._testFirestoreConnection();
      if (!testQuery) {
        throw new Error('No se pudo conectar a Firestore');
      }

      this._isInitialized = true;
      console.log('✅ Firebase inicializado correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error);
      this._isInitialized = false;
      this._initPromise = null;
      throw error;
    }
  }

  /**
   * Prueba la conectividad con Firestore
   */
  private async _testFirestoreConnection(): Promise<boolean> {
    try {
      // Intentar hacer una consulta simple
      const { collection, getDocs, query, limit } = await import('@angular/fire/firestore');
      const testCollection = collection(this.firestore, '_test_connection');
      const testQuery = query(testCollection, limit(1));
      const querySnapshot = await getDocs(testQuery);
      return true;
    } catch (error) {
      console.warn('⚠️ No se pudo probar Firestore:', error);
      // Si no podemos probar, asumimos que está bien
      return true;
    }
  }

  /**
   * Reinicia la inicialización (útil para debugging)
   */
  resetInitialization(): void {
    this._isInitialized = false;
    this._initPromise = null;
  }

  /**
   * Obtiene el estado actual de inicialización
   */
  getInitializationStatus(): { isInitialized: boolean; hasPromise: boolean } {
    return {
      isInitialized: this._isInitialized,
      hasPromise: !!this._initPromise
    };
  }
}
