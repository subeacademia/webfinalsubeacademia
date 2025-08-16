import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiHealthService, ApiProgressStatus, ApiRequestProgress } from '../../../../../core/ai/api-health.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-api-progress-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="api-progress-container">
      <!-- Estado General de la API -->
      <div class="api-status-section mb-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-lg font-semibold text-white">Estado de la API de IA</h4>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full" 
                 [class]="getStatusColor(apiStatus.status)"></div>
            <span class="text-sm" [class]="getStatusTextColor(apiStatus.status)">
              {{ apiStatus.message }}
            </span>
          </div>
        </div>
        
        <!-- Barra de Progreso General -->
        <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div class="h-3 rounded-full transition-all duration-500 ease-out"
               [class]="getProgressBarColor(apiStatus.status)"
               [style.width.%]="apiStatus.progress"></div>
        </div>
        
        <div class="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>{{ apiStatus.progress }}%</span>
          <span>100%</span>
        </div>
      </div>

      <!-- Progreso de Solicitudes Activas -->
      <div class="active-requests-section" *ngIf="activeRequests.length > 0">
        <h5 class="text-md font-medium text-white mb-3">Solicitudes Activas</h5>
        <div class="space-y-3">
          <div *ngFor="let request of activeRequests" 
               class="request-progress-item bg-gray-800/50 rounded-lg p-3">
            
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-300 font-medium">
                {{ getRequestType(request.requestId) }}
              </span>
              <span class="text-xs text-gray-400">
                {{ getElapsedTime(request.startTime) }}
              </span>
            </div>
            
            <!-- Barra de Progreso de Solicitud -->
            <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div class="h-2 rounded-full transition-all duration-300 ease-out"
                   [class]="getRequestProgressColor(request.status)"
                   [style.width.%]="request.progress"></div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400">
                {{ request.progress }}% - {{ getStatusText(request.status) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ getEstimatedTime(request) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de Tiempo de Respuesta -->
      <div class="response-time-info mt-4 p-3 bg-gray-800/30 rounded-lg" 
           *ngIf="apiStatus.responseTime !== undefined">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-300">Tiempo de Respuesta:</span>
          <span class="text-green-400 font-medium">
            {{ apiStatus.responseTime }}ms
          </span>
        </div>
      </div>

      <!-- Botón de Reconexión -->
      <div class="reconnection-section mt-4" *ngIf="apiStatus.status === 'error' || apiStatus.status === 'disconnected'">
        <button (click)="reconnect()" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          🔄 Reintentar Conexión
        </button>
      </div>

      <!-- Botón de Verificación Manual -->
      <div class="manual-check-section mt-4">
        <button (click)="forceHealthCheck()" 
                class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
          🔍 Verificar Estado de la API
        </button>
      </div>
    </div>
  `,
  styles: [`
    .api-progress-container {
      @apply bg-gray-900/50 border border-gray-700 rounded-lg p-4;
    }
    
    .getStatusColor {
      @apply transition-colors duration-300;
    }
    
    .getStatusTextColor {
      @apply transition-colors duration-300;
    }
    
    .getProgressBarColor {
      @apply transition-all duration-500 ease-out;
    }
    
    .getRequestProgressColor {
      @apply transition-all duration-300 ease-out;
    }
  `]
})
export class ApiProgressBarComponent implements OnInit, OnDestroy {
  @Input() requestId?: string;
  
  apiStatus: ApiProgressStatus = {
    isConnected: false,
    progress: 0,
    status: 'connecting',
    message: 'Verificando conexión...',
    lastUpdate: new Date()
  };
  
  activeRequests: ApiRequestProgress[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private apiHealthService: ApiHealthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Suscribirse al progreso general de la API
    this.subscriptions.push(
      this.apiHealthService.progress$.subscribe(status => {
        this.apiStatus = { ...status };
        this.cdr.markForCheck();
      })
    );

    // Suscribirse al progreso de solicitudes específicas
    this.subscriptions.push(
      this.apiHealthService.requestProgress$.subscribe(requestsMap => {
        this.activeRequests = Array.from(requestsMap.values());
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Métodos para colores y estilos
  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'disconnected':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-blue-400';
      case 'connecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'disconnected':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  }

  getProgressBarColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getRequestProgressColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Métodos de utilidad
  getRequestType(requestId: string): string {
    if (requestId.includes('analysis')) return 'Solicitud de IA';
    if (requestId.includes('action')) return 'Plan de Acción';
    if (requestId.includes('req_')) return 'Solicitud General';
    return 'Solicitud de IA';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  }

  getElapsedTime(startTime: Date): string {
    const elapsed = Date.now() - startTime.getTime();
    const seconds = Math.floor(elapsed / 1000);
    return `${seconds}s`;
  }

  getEstimatedTime(request: ApiRequestProgress): string {
    if (request.status === 'completed') {
      return 'Completado';
    }
    if (request.status === 'error') {
      return 'Error';
    }
    if (request.estimatedTime) {
      return `${Math.ceil(request.estimatedTime / 1000)}s restantes`;
    }
    return 'Calculando...';
  }

  // Acciones del usuario
  reconnect(): void {
    console.log('🔄 Usuario solicitó reconexión...');
    this.apiHealthService.forceHealthCheck().subscribe();
  }

  forceHealthCheck(): void {
    console.log('🔍 Usuario solicitó verificación manual...');
    this.apiHealthService.forceHealthCheck().subscribe();
  }
}
