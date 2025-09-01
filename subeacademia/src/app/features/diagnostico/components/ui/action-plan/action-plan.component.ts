import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionPlanItem } from '../../../../../core/ai/generative-ai.service';

@Component({
  selector: 'app-action-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 🚀 PLAN DE ACCIÓN GENERADO POR IA -->
    <div class="space-y-6">
      
      <!-- Header del Plan de Acción -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          Plan de Acción Personalizado
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Generado por nuestra IA basado en tu diagnóstico. Cada acción está diseñada para maximizar tu transformación digital.
        </p>
      </div>

      <!-- Filtros de Prioridad -->
      <div class="flex flex-wrap justify-center gap-2 mb-6">
        <button 
          *ngFor="let priority of priorities" 
          (click)="filterByPriority(priority)"
          [class]="'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ' + getPriorityButtonClass(priority, selectedPriority)"
          [class.ring-2]="selectedPriority === priority"
          [class.ring-offset-2]="selectedPriority === priority">
          {{ getPriorityLabel(priority) }}
        </button>
      </div>

      <!-- Lista de Acciones -->
      <div class="space-y-4">
        <div *ngFor="let action of filteredActions; let i = index" 
             class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          
          <!-- Header de la acción -->
          <div class="p-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                       [ngClass]="getPriorityBadgeClass(action.priority)">
                    {{ i + 1 }}
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{ action.title }}
                  </h3>
                </div>
                
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ action.description }}
                </p>
              </div>
              
              <!-- Badge de prioridad -->
              <div class="ml-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      [ngClass]="getPriorityBadgeClass(action.priority)">
                  {{ getPriorityLabel(action.priority) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Detalles de la acción -->
          <div class="p-6 bg-gray-50 dark:bg-gray-700/50">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <!-- Categoría -->
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 text-gray-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Categoría</div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">{{ action.category }}</div>
                </div>
              </div>
              
              <!-- Timeframe -->
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 text-gray-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tiempo</div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">{{ action.timeframe }}</div>
                </div>
              </div>
              
              <!-- Impacto -->
              <div class="flex items-center space-x-2">
                <div class="w-5 h-5 text-gray-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Impacto</div>
                  <div class="font-medium text-gray-700 dark:text-gray-300">{{ action.impact }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Acciones -->
          <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <button class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  Editar
                </button>
                <button class="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Completar
                </button>
              </div>
              
              <button class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                </svg>
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay acciones -->
      <div *ngIf="filteredActions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No hay acciones disponibles
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          No se encontraron acciones con la prioridad seleccionada.
        </p>
      </div>

      <!-- Resumen del Plan -->
      <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <div class="text-center">
          <h3 class="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Resumen del Plan de Acción
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ actions.length }}</div>
              <div class="text-sm text-blue-700 dark:text-blue-300">Total de Acciones</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ getActionsByPriority('alta').length }}</div>
              <div class="text-sm text-red-700 dark:text-red-300">Prioridad Alta</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ getActionsByPriority('media').length }}</div>
              <div class="text-sm text-yellow-700 dark:text-yellow-300">Prioridad Media</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ getActionsByPriority('baja').length }}</div>
              <div class="text-sm text-green-700 dark:text-green-300">Prioridad Baja</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Animaciones personalizadas */
    .group:hover .group-hover\\:text-blue-600 {
      color: #2563eb;
    }
    
    .group:hover .group-hover\\:text-blue-400 {
      color: #60a5fa;
    }
    
    /* Transiciones suaves */
    .transition-all {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Efectos de hover */
    .hover\\:-translate-y-1:hover {
      transform: translateY(-0.25rem);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .grid-cols-1.md\\:grid-cols-3 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      
      .grid-cols-1.md\\:grid-cols-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `]
})
export class ActionPlanComponent {
  @Input() actions: ActionPlanItem[] = [];
  
  selectedPriority: 'alta' | 'media' | 'baja' | 'todas' = 'todas';
  
  readonly priorities: ('alta' | 'media' | 'baja' | 'todas')[] = ['todas', 'alta', 'media', 'baja'];
  
  get filteredActions(): ActionPlanItem[] {
    if (this.selectedPriority === 'todas') {
      return this.actions;
    }
    return this.actions.filter(action => action.priority === this.selectedPriority);
  }
  
  filterByPriority(priority: string): void {
    if (priority === 'alta' || priority === 'media' || priority === 'baja' || priority === 'todas') {
      this.selectedPriority = priority as 'alta' | 'media' | 'baja' | 'todas';
    }
  }
  
  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'alta': 'Alta Prioridad',
      'media': 'Media Prioridad',
      'baja': 'Baja Prioridad',
      'todas': 'Todas'
    };
    return labels[priority] || priority;
  }
  
  getPriorityButtonClass(priority: string, selected: string): string {
    const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200';
    
    if (priority === selected) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2`;
    }
    
    const priorityClasses: { [key: string]: string } = {
      'alta': 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
      'media': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30',
      'baja': 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30',
      'todas': 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
    };
    
    return `${baseClasses} ${priorityClasses[priority] || priorityClasses['todas']}`;
  }
  
  getPriorityBadgeClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'alta': 'bg-gradient-to-br from-red-500 to-red-600',
      'media': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'baja': 'bg-gradient-to-br from-green-500 to-green-600'
    };
    return classes[priority] || classes['media'];
  }
  
  getActionsByPriority(priority: 'alta' | 'media' | 'baja'): ActionPlanItem[] {
    return this.actions.filter(action => action.priority === priority);
  }
}
