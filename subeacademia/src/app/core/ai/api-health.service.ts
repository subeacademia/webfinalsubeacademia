import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap, takeWhile, timeout } from 'rxjs/operators';

export interface ApiProgressStatus {
  isConnected: boolean;
  progress: number; // 0-100
  status: 'connecting' | 'processing' | 'completed' | 'error' | 'timeout' | 'disconnected';
  message: string;
  responseTime?: number;
  lastUpdate: Date;
  errorDetails?: string;
}

export interface ApiRequestProgress {
  requestId: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startTime: Date;
  lastUpdate: Date;
  estimatedTime?: number;
  responseChunks?: string[];
  responseTime?: number;
  errorDetails?: string;
  apiResponse?: any; // Respuesta real de la API
}

@Injectable({
  providedIn: 'root'
})
export class ApiHealthService {
  private readonly apiUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';
  
  private readonly progressSubject = new BehaviorSubject<ApiProgressStatus>({
    isConnected: false,
    progress: 0,
    status: 'connecting',
    message: 'Verificando conexión con API...',
    lastUpdate: new Date()
  });

  private readonly requestProgressSubject = new BehaviorSubject<Map<string, ApiRequestProgress>>(new Map());
  
  readonly progress$ = this.progressSubject.asObservable();
  readonly requestProgress$ = this.requestProgressSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar estado inicial de la API
    this.checkApiHealth().subscribe();
  }

  // Verificar estado real de la API con ping
  checkApiHealth(): Observable<boolean> {
    console.log('🔍 Verificando estado real de la API...');
    
    const testPayload = {
      messages: [{ role: 'system', content: 'Test connection' }],
      maxTokens: 10,
      temperature: 0.1
    };

    // Actualizar estado a "conectando"
    this.updateProgress({
      isConnected: false,
      progress: 0,
      status: 'connecting',
      message: 'Verificando conexión...',
      lastUpdate: new Date()
    });

    return this.http.post(this.apiUrl, testPayload, { 
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    }).pipe(
      timeout(10000), // 10 segundos máximo para test de conexión
      map((response) => {
        console.log('✅ API responde correctamente:', response);
        this.updateProgress({
          isConnected: true,
          progress: 100,
          status: 'completed',
          message: 'API conectada exitosamente',
          responseTime: 0,
          lastUpdate: new Date()
        });
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error de conexión con API:', error);
        
        let errorMessage = 'API no disponible';
        let status: 'error' | 'disconnected' = 'error';
        
        if (error.name === 'TimeoutError') {
          errorMessage = 'API no responde (timeout)';
          status = 'disconnected';
        } else if (error.status === 0) {
          errorMessage = 'No se puede conectar con la API';
          status = 'disconnected';
        } else if (error.status >= 500) {
          errorMessage = 'Error del servidor de la API';
          status = 'error';
        } else if (error.status >= 400) {
          errorMessage = 'Error en la solicitud a la API';
          status = 'error';
        }
        
        this.updateProgress({
          isConnected: false,
          progress: 0,
          status: status,
          message: errorMessage,
          errorDetails: error.toString(),
          lastUpdate: new Date()
        });
        return [false];
      })
    );
  }

  // Monitorear progreso de una solicitud específica
  monitorRequestProgress(requestId: string, payload: any): Observable<ApiRequestProgress> {
    const startTime = new Date();
    let progress = 0;
    
    // Crear entrada de progreso
    const requestProgress: ApiRequestProgress = {
      requestId,
      progress: 0,
      status: 'pending',
      startTime,
      lastUpdate: new Date(),
      responseChunks: []
    };

    this.updateRequestProgress(requestId, requestProgress);

    // Verificar si la API está realmente conectada antes de hacer la solicitud
    if (!this.progressSubject.value.isConnected) {
      console.warn('⚠️ API no está conectada, usando fallback local');
      requestProgress.status = 'error';
      requestProgress.errorDetails = 'API no conectada';
      this.updateRequestProgress(requestId, requestProgress);
      return new Observable(observer => {
        observer.error(new Error('API no conectada'));
        observer.complete();
      });
    }

    // Simular progreso incremental
    const progressInterval = interval(500).pipe(
      takeWhile(() => progress < 90 && requestProgress.status === 'processing')
    );

    // Iniciar solicitud real
    const apiRequest = this.http.post(this.apiUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    }).pipe(
      timeout(45000), // 45 segundos para respuestas detalladas
      map((response: any) => {
        progress = 100;
        requestProgress.status = 'completed';
        requestProgress.progress = 100;
        requestProgress.lastUpdate = new Date();
        requestProgress.responseTime = Date.now() - startTime.getTime();
        
        // Guardar la respuesta real en el progreso
        requestProgress.responseChunks = [response];
        requestProgress.apiResponse = response; // Guardar la respuesta real de la API
        
        this.updateRequestProgress(requestId, requestProgress);
        return requestProgress;
      }),
      catchError((error) => {
        console.error(`❌ Error en solicitud ${requestId}:`, error);
        requestProgress.status = 'error';
        requestProgress.progress = 0;
        requestProgress.lastUpdate = new Date();
        requestProgress.errorDetails = error.message || 'Error desconocido';
        
        this.updateRequestProgress(requestId, requestProgress);
        throw error;
      })
    );

    // Simular progreso mientras se procesa
    progressInterval.subscribe(() => {
      if (requestProgress.status === 'pending') {
        requestProgress.status = 'processing';
        requestProgress.progress = Math.min(progress + Math.random() * 15, 90);
        requestProgress.lastUpdate = new Date();
        this.updateRequestProgress(requestId, requestProgress);
      }
    });

    return apiRequest;
  }

  // Enviar solicitud con monitoreo completo
  sendRequestWithProgress(payload: any): Observable<{ response: any; progress: ApiRequestProgress }> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🚀 Iniciando solicitud con monitoreo:', requestId);
    console.log('📤 Payload enviado:', payload);

    // Verificar estado de la API antes de enviar
    if (!this.progressSubject.value.isConnected) {
      console.warn('⚠️ API no conectada, verificando estado...');
      return this.checkApiHealth().pipe(
        switchMap((isConnected) => {
          if (!isConnected) {
            throw new Error('API no disponible después de verificación');
          }
          return this.monitorRequestProgress(requestId, payload);
        }),
        map((progress) => {
          console.log('✅ Solicitud completada:', progress);
          // La respuesta real está en progress.apiResponse
          return { response: progress.apiResponse, progress };
        })
      );
    }

    return this.monitorRequestProgress(requestId, payload).pipe(
      map((progress) => {
        console.log('✅ Solicitud completada:', progress);
        // La respuesta real está en progress.apiResponse
        return { response: progress.apiResponse, progress };
      })
    );
  }

  // Actualizar progreso general
  private updateProgress(status: Partial<ApiProgressStatus>): void {
    const current = this.progressSubject.value;
    const updated = { ...current, ...status };
    this.progressSubject.next(updated);
    
    console.log('📊 Estado de API actualizado:', updated);
  }

  // Actualizar progreso de solicitud específica
  private updateRequestProgress(requestId: string, progress: ApiRequestProgress): void {
    const current = this.requestProgressSubject.value;
    current.set(requestId, progress);
    this.requestProgressSubject.next(new Map(current));
    
    console.log(`📈 Progreso de solicitud ${requestId}:`, progress);
  }

  // Obtener progreso de una solicitud específica
  getRequestProgress(requestId: string): ApiRequestProgress | undefined {
    return this.requestProgressSubject.value.get(requestId);
  }

  // Limpiar progreso de solicitudes completadas
  cleanupCompletedRequests(): void {
    const current = this.requestProgressSubject.value;
    const active = new Map();
    
    current.forEach((progress, requestId) => {
      if (progress.status !== 'completed' && progress.status !== 'error') {
        active.set(requestId, progress);
      }
    });
    
    this.requestProgressSubject.next(active);
  }

  // Resetear estado
  reset(): void {
    this.progressSubject.next({
      isConnected: false,
      progress: 0,
      status: 'connecting',
      message: 'Estado reseteado',
      lastUpdate: new Date()
    });
    
    this.requestProgressSubject.next(new Map());
  }

  // Forzar verificación de estado
  forceHealthCheck(): Observable<boolean> {
    console.log('🔄 Forzando verificación de salud de la API...');
    return this.checkApiHealth();
  }
}
