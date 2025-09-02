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

    if (!this._initPromise) {
      this._initPromise = this._initializeFirebase();
    }

    return new Observable(observer => {
      this._initPromise!.then(ready => {
        observer.next(ready);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
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

      // Hacer una verificación de conectividad
      const isConnected = await this._testConnectivity();
      if (!isConnected) {
        throw new Error('Sin conectividad a Firebase');
      }

      this._isInitialized = true;
      console.log('✅ Firebase inicializado correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error);
      this._isInitialized = false;
      throw error;
    }
  }

  /**
   * 🔧 SOLUCIÓN: Verificar salud de Firebase con reintentos
   */
  checkFirebaseHealth(): Observable<boolean> {
    const now = Date.now();
    
    // Si ya hicimos un health check recientemente, devolver el resultado cacheado
    if (now - this._lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return of(this._isInitialized);
    }

    this._lastHealthCheck = now;

    return this.isFirebaseReady().pipe(
      switchMap(ready => {
        if (!ready) {
          return throwError(() => new Error('Firebase no está listo'));
        }

        // Hacer un ping a Firebase para verificar conectividad real
        return this._pingFirebase();
      }),
      timeout(10000), // 10 segundos timeout
      retry(2), // Reintentar 2 veces
      catchError(error => {
        console.warn('⚠️ Firebase no está saludable:', error);
        return of(false);
      })
    );
  }

  /**
   * Hace un ping a Firebase para verificar conectividad
   */
  private _pingFirebase(): Observable<boolean> {
    return new Observable(observer => {
      // Hacer un ping a Google para verificar conectividad real
      const img = new Image();
      img.onload = () => {
        observer.next(true);
        observer.complete();
      };
      img.onerror = () => {
        observer.error(new Error('Sin conectividad a Google/Firebase'));
      };
      img.src = 'https://www.google.com/favicon.ico?' + Date.now();
    });
  }

  /**
   * 🔧 SOLUCIÓN: Reinicializar Firebase si es necesario
   */
  async resetInitialization(): Promise<boolean> {
    console.log('🔄 Reinicializando Firebase...');
    this._isInitialized = false;
    this._initPromise = null;
    this._lastHealthCheck = 0;
    
    try {
      console.log('🔄 Reintentando inicialización de Firebase...');
      this._initPromise = this._initializeFirebase();
      return await this._initializeFirebase();
    } catch (error) {
      console.error('❌ Error en reinicialización:', error);
      return false;
    }
  }

  /**
   * Verifica conectividad básica
   */
  private async _testConnectivity(): Promise<boolean> {
    try {
      // Hacer una petición simple para verificar conectividad
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Sin conectividad a internet:', error);
      return false;
    }
  }
}