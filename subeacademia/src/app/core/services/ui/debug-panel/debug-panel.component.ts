import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticFlowLoggerService } from '../../../services/diagnostic-flow-logger.service';
import { BesselAiService } from '../../../ai/bessel-ai.service';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50">
      <!-- Botón flotante para abrir/cerrar el panel -->
      <button 
        (click)="togglePanel()"
        class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200"
        [class.rotate-180]="isOpen()"
        title="Panel de Debug">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <!-- Panel de debugging -->
      @if (isOpen()) {
        <div class="absolute bottom-16 right-0 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Header del panel -->
          <div class="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                🔍 Panel de Debug
              </h3>
              <button 
                (click)="closePanel()"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Session ID: {{ sessionId() }}
            </p>
          </div>

          <!-- Contenido del panel -->
          <div class="p-4 space-y-4 max-h-80 overflow-y-auto">
            <!-- Estado del flujo -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Estado del Flujo</h4>
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span>Total de pasos:</span>
                  <span class="font-mono">{{ flowLog()?.totalSteps || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Completados:</span>
                  <span class="font-mono text-green-600">{{ flowLog()?.completedSteps || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Fallidos:</span>
                  <span class="font-mono text-red-600">{{ flowLog()?.failedSteps || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Estado:</span>
                  <span class="font-mono" [class]="getStatusClass(flowLog()?.finalStatus)">
                    {{ flowLog()?.finalStatus || 'en progreso' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Timeline de pasos -->
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Timeline de Pasos</h4>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                @for (step of flowLog()?.steps || []; track step.step) {
                  <div class="flex items-center space-x-2 text-sm">
                    <div class="w-2 h-2 rounded-full" [class]="getStepStatusClass(step.completionStatus)"></div>
                    <span class="font-mono text-xs">{{ step.step }}</span>
                    <span class="text-gray-500 text-xs">{{ formatTime(step.timestamp) }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Errores recientes -->
            @if (getRecentErrors().length > 0) {
              <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <h4 class="font-medium text-red-800 dark:text-red-200 mb-2">Errores Recientes</h4>
                <div class="space-y-2 max-h-24 overflow-y-auto">
                  @for (error of getRecentErrors(); track error.step) {
                    <div class="text-sm">
                      <div class="font-medium text-red-700 dark:text-red-300">{{ error.step }}</div>
                      <div class="text-red-600 dark:text-red-400 text-xs">{{ error.errors?.join(', ') }}</div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Acciones de debug -->
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Acciones</h4>
              <div class="space-y-2">
                <button 
                  (click)="exportLogs()"
                  class="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded transition-colors">
                  📥 Exportar Logs
                </button>
                <button 
                  (click)="diagnoseService()"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition-colors">
                  🔧 Diagnosticar Servicio
                </button>
                <button 
                  (click)="resetSession()"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-2 rounded transition-colors">
                  🔄 Nueva Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .max-h-80 {
      max-height: 20rem;
    }
    .max-h-32 {
      max-height: 8rem;
    }
    .max-h-24 {
      max-height: 6rem;
    }
  `]
})
export class DebugPanelComponent implements OnInit, OnDestroy {
  private flowLogger = inject(DiagnosticFlowLoggerService);
  private besselAiService = inject(BesselAiService);
  
  isOpen = signal(false);
  sessionId = signal('');
  flowLog = signal<any>(null);
  
  private updateInterval: any;

  ngOnInit(): void {
    this.sessionId.set(this.flowLogger.getSessionId());
    this.updateFlowLog();
    
    // Actualizar logs cada 2 segundos
    this.updateInterval = setInterval(() => {
      this.updateFlowLog();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  togglePanel(): void {
    this.isOpen.set(!this.isOpen());
  }

  closePanel(): void {
    this.isOpen.set(false);
  }

  updateFlowLog(): void {
    this.flowLog.set(this.flowLogger.getCurrentFlowLog());
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  }

  getStepStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getRecentErrors(): any[] {
    const steps = this.flowLog()?.steps || [];
    return steps
      .filter((step: any) => step.errors && step.errors.length > 0)
      .slice(-3); // Solo los últimos 3 errores
  }

  exportLogs(): void {
    const flowLog = this.flowLogger.exportFlowLog();
    const blob = new Blob([flowLog], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-debug-${this.sessionId()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('🔍 DebugPanel: Logs exportados', {
      sessionId: this.sessionId(),
      timestamp: new Date().toISOString()
    });
  }

  diagnoseService(): void {
    console.log('🔍 DebugPanel: Iniciando diagnóstico del servicio...');
    // this.besselAiService.diagnoseService(); // Comentado hasta que se implemente el método
    
    // También mostrar estado del flujo logger
    console.log('🔍 DebugPanel: Estado del flujo logger', {
      sessionId: this.sessionId(),
      currentFlowLog: this.flowLog(),
      timestamp: new Date().toISOString()
    });
  }

  resetSession(): void {
    console.log('🔍 DebugPanel: Reseteando sesión...');
    this.flowLogger.resetSession();
    this.sessionId.set(this.flowLogger.getSessionId());
    this.updateFlowLog();
    
    console.log('🔍 DebugPanel: Nueva sesión iniciada', {
      newSessionId: this.sessionId(),
      timestamp: new Date().toISOString()
    });
  }
}
