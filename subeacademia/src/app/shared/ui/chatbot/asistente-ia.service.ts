import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, timeout, retry, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AsistenteIaService {
  private readonly apiUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';
  
  // 🔧 SOLUCIÓN: Configuración mejorada de timeouts y reintentos
  private readonly DEFAULT_TIMEOUT = 30000; // 30 segundos
  private readonly HEALTH_CHECK_TIMEOUT = 10000; // 10 segundos
  private readonly MAX_RETRIES = 3;

  private readonly asistenteAbiertoSubject = new BehaviorSubject<boolean>(false);
  readonly asistenteAbierto$ = this.asistenteAbiertoSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  setAsistenteAbierto(abierto: boolean): void {
    this.asistenteAbiertoSubject.next(abierto);
  }

  generarTextoAzure(prompt: unknown): Observable<unknown> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    console.log('🌐 Llamando a la API de Azure/Vercel...');
    
    return this.http.post(this.apiUrl, prompt, { headers }).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: 1000,
        resetOnSuccess: true
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
      console.error('❌ Error del cliente en la API de IA:', error.error.message);
    } else {
      // Error del lado del servidor
      const status = error.status;
      const statusText = error.statusText;
      
      switch (status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 404:
          errorMessage = 'El servicio de IA no está disponible en este momento.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor de IA. Intenta más tarde.';
          break;
        case 503:
          errorMessage = 'El servicio de IA está temporalmente no disponible.';
          break;
        default:
          errorMessage = `Error del servidor: ${status} ${statusText}`;
      }
      
      console.error(`❌ Error del servidor en la API de IA: ${status} ${statusText}`, error);
    }
    
    // 🔧 SOLUCIÓN: Log detallado para debugging
    console.error('🔍 Detalles del error:', {
      url: this.apiUrl,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error
    });
    
    return throwError(() => new Error(errorMessage));
  }
  
  // 🔧 SOLUCIÓN: Método de verificación de salud mejorado
  verificarSaludAPI(): Observable<boolean> {
    console.log('🔍 Verificando salud de la API de IA...');
    
    const testPayload = {
      messages: [
        { role: 'system', content: 'Responde solo con "OK"' },
        { role: 'user', content: 'Test de conectividad' }
      ],
      maxTokens: 10,
      temperature: 0.1
    };
    
    return this.http.post(this.apiUrl, testPayload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      timeout(this.HEALTH_CHECK_TIMEOUT),
      map((response: any) => {
        console.log('✅ API de IA saludable:', response);
        return true;
      }),
      catchError((error) => {
        console.warn('⚠️ API de IA no saludable:', error);
        return of(false);
      })
    );
  }
  
  // 🔧 SOLUCIÓN: Método para verificar conectividad básica
  verificarConectividad(): Observable<boolean> {
    return new Observable(observer => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        observer.next(false);
        observer.complete();
      }, 5000); // 5 segundos máximo
      
      fetch(this.apiUrl, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      }).then(() => {
        clearTimeout(timeoutId);
        observer.next(true);
        observer.complete();
      }).catch(() => {
        clearTimeout(timeoutId);
        observer.next(false);
        observer.complete();
      });
    });
  }
  
  // 🔧 SOLUCIÓN: Método para obtener estadísticas de la API
  obtenerEstadisticasAPI(): Observable<any> {
    return this.verificarSaludAPI().pipe(
      switchMap(isHealthy => {
        if (isHealthy) {
          return this.http.get(`${this.apiUrl.replace('/generate', '/health')}`).pipe(
            timeout(10000),
            catchError(() => of({ status: 'unknown', uptime: 'unknown' }))
          );
        } else {
          return of({ status: 'unhealthy', uptime: 'unknown' });
        }
      }),
      catchError(() => of({ status: 'error', uptime: 'unknown' }))
    );
  }
}


