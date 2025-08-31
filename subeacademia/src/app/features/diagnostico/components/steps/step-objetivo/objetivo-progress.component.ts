import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProgresoGeneracion {
  paso: string;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  mensaje: string;
  progreso: number; // 0-100
}

@Component({
  selector: 'app-objetivo-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Generando objetivos personalizados con IA
      </h3>
      
      <div class="space-y-4">
        <div *ngFor="let paso of pasosGeneracion()" class="relative">
          <!-- Indicador de estado -->
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                   [class]="getEstadoClass(paso.estado)">
                <svg *ngIf="paso.estado === 'pendiente'" class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg *ngIf="paso.estado === 'procesando'" class="w-4 h-4 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg *ngIf="paso.estado === 'completado'" class="w-4 h-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <svg *ngIf="paso.estado === 'error'" class="w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            
            <!-- Contenido del paso -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ paso.paso }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ paso.progreso }}%
                </span>
              </div>
              
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ paso.mensaje }}
              </p>
              
              <!-- Barra de progreso -->
              <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-500 ease-out"
                     [class]="getProgresoClass(paso.estado)"
                     [style.width.%]="paso.progreso">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mensaje de estado general -->
      <div class="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span class="text-sm text-blue-700 dark:text-blue-300">
            {{ mensajeEstadoGeneral() }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ObjetivoProgressComponent {
  @Input() set pasos(pasos: ProgresoGeneracion[]) {
    this._pasos.set(pasos);
  }
  
  private readonly _pasos = signal<ProgresoGeneracion[]>([]);
  readonly pasosGeneracion = this._pasos.asReadonly();
  
  // Computed properties
  readonly progresoTotal = computed(() => {
    const pasos = this.pasosGeneracion();
    if (pasos.length === 0) return 0;
    
    const total = pasos.reduce((sum, paso) => sum + paso.progreso, 0);
    return Math.round(total / pasos.length);
  });
  
  readonly estadoGeneral = computed(() => {
    const pasos = this.pasosGeneracion();
    if (pasos.length === 0) return 'pendiente';
    
    if (pasos.some(p => p.estado === 'error')) return 'error';
    if (pasos.every(p => p.estado === 'completado')) return 'completado';
    if (pasos.some(p => p.estado === 'procesando')) return 'procesando';
    
    return 'pendiente';
  });
  
  readonly mensajeEstadoGeneral = computed(() => {
    const estado = this.estadoGeneral();
    const progreso = this.progresoTotal();
    
    switch (estado) {
      case 'completado':
        return `¡Objetivos generados exitosamente! Progreso: ${progreso}%`;
      case 'procesando':
        return `Generando objetivos... Progreso: ${progreso}%`;
      case 'error':
        return 'Hubo un error en la generación. Revisando alternativas...';
      default:
        return 'Preparando generación de objetivos...';
    }
  });
  
  // Métodos de utilidad
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-400';
      case 'procesando':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'completado':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-400';
    }
  }
  
  getProgresoClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'bg-gray-300 dark:bg-gray-600';
      case 'procesando':
        return 'bg-blue-500';
      case 'completado':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  }
}
