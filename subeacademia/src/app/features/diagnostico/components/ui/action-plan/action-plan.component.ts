import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActionPlanItem {
  objetivo: string;
  competencia: string;
  prioridad: string;
  tiempoEstimado: string;
  acciones: string[];
}

@Component({
  selector: 'app-action-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-plan-container">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center border-b border-gray-200 dark:border-gray-700 pb-4">
        Plan de Acción Personalizado
      </h2>
      
      @if (actionPlanItems().length > 0) {
        <div class="grid gap-6">
          @for (item of actionPlanItems(); track item.objetivo; let i = $index) {
            <div class="action-item bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
              <!-- Header del objetivo -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {{ i + 1 }}
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ item.objetivo }}
                  </h3>
                </div>
                <div class="flex items-center space-x-2">
                  <!-- Prioridad -->
                  <span class="px-3 py-1 rounded-full text-xs font-medium"
                        [class]="getPriorityClass(item.prioridad)">
                    {{ item.prioridad }}
                  </span>
                  <!-- Tiempo estimado -->
                  <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {{ item.tiempoEstimado }}
                  </span>
                </div>
              </div>
              
              <!-- Competencia relacionada -->
              <div class="mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  {{ item.competencia }}
                </span>
              </div>
              
              <!-- Acciones -->
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Acciones Clave Recomendadas:
                </h4>
                <ul class="space-y-2">
                  @for (accion of item.acciones; track accion) {
                    <li class="flex items-start">
                      <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="text-gray-700 dark:text-gray-300">{{ accion }}</span>
                    </li>
                  }
                </ul>
              </div>
              
              <!-- Progreso visual -->
              <div class="mt-6">
                <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progreso sugerido</span>
                  <span>0%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                       [style.width.%]="0"
                       style="width: 0%">
                  </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Marca las acciones como completadas para ver tu progreso
                </p>
              </div>
            </div>
          }
        </div>
        
        <!-- Resumen del plan -->
        <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resumen del Plan de Acción
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ actionPlanItems().length }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Objetivos Estratégicos</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ getTotalActions() }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Acciones Recomendadas</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ getEstimatedTime() }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Tiempo Estimado</div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay plan de acción disponible
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Completa el diagnóstico para generar tu plan de acción personalizado.
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .action-plan-container {
      @apply max-w-4xl mx-auto;
    }
    
    .action-item {
      @apply transition-all duration-300;
    }
    
    .action-item:hover {
      @apply transform -translate-y-1;
    }
  `]
})
export class ActionPlanComponent {
  @Input() set actionPlan(value: ActionPlanItem[]) {
    this.actionPlanItems.set(value || []);
  }
  
  actionPlanItems = signal<ActionPlanItem[]>([]);
  
  getPriorityClass(prioridad: string): string {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'Media':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'Baja':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  }
  
  getTotalActions(): number {
    return this.actionPlanItems().reduce((total, item) => total + item.acciones.length, 0);
  }
  
  getEstimatedTime(): string {
    const items = this.actionPlanItems();
    if (items.length === 0) return '0 meses';
    
    // Extraer números de tiempo estimado
    const times = items.map(item => {
      const match = item.tiempoEstimado.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maxTime = Math.max(...times);
    return `${maxTime} meses`;
  }
}