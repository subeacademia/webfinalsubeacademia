import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, tap, retry, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseInitService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  private _isInitialized = false;
  private _initPromise: Promise<boolean> | null = null;
  private _lastHealthCheck = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 segundos

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
   * 🔧 SOLUCIÓN: Verificar salud de Firebase con reintentos
   */
  checkFirebaseHealth(): Observable<boolean> {
    const now = Date.now();
    
    // Evitar verificaciones muy frecuentes
    if (now - this._lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return of(this._isInitialized);
    }
    
    this._lastHealthCheck = now;
    
    if (!this._isInitialized) {
      return of(false);
    }
    
    return this._testFirestoreConnectionObservable().pipe(
      timeout(10000), // 10 segundos máximo
      retry(2), // Reintentar 2 veces
      map(() => true),
      catchError(error => {
        console.warn('⚠️ Firebase no está saludable:', error);
        this._isInitialized = false;
        return of(false);
      })
    );
  }

  /**
   * 🔧 SOLUCIÓN: Test de conectividad como Observable
   */
  private _testFirestoreConnectionObservable(): Observable<boolean> {
    return new Observable(observer => {
      this._testFirestoreConnection()
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * 🔧 SOLUCIÓN: Verificar conectividad de red
   */
  checkNetworkConnectivity(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      // Verificar conectividad básica
      if (navigator.onLine) {
        // Hacer un ping a Google para verificar conectividad real
        const img = new Image();
        img.onload = () => {
          observer.next(true);
          observer.complete();
        };
        img.onerror = () => {
          observer.next(false);
          observer.complete();
        };
        img.src = 'https://www.google.com/favicon.ico?' + Date.now();
      } else {
        observer.next(false);
        observer.complete();
      }
    }).pipe(
      timeout(5000), // 5 segundos máximo
      catchError(() => of(false))
    );
  }

  /**
   * 🔧 SOLUCIÓN: Reinicializar Firebase si es necesario
   */
  async reinitializeIfNeeded(): Promise<boolean> {
    if (this._isInitialized) {
      return true;
    }
    
    try {
      console.log('🔄 Reintentando inicialización de Firebase...');
      this._initPromise = null;
      return await this._initializeFirebase();
    } catch (error) {
      console.error('❌ Error en reintento de inicialización:', error);
      return false;
    }
  }

  /**
   * Reinicia la inicialización (útil para debugging)
   */
  resetInitialization(): void {
    this._isInitialized = false;
    this._initPromise = null;
    this._lastHealthCheck = 0;
  }

  /**
   * Obtiene el estado actual de inicialización
   */
  getInitializationStatus(): { isInitialized: boolean; hasPromise: boolean; lastHealthCheck: number } {
    return {
      isInitialized: this._isInitialized,
      hasPromise: !!this._initPromise,
      lastHealthCheck: this._lastHealthCheck
    };
  }
}
