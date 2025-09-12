import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StrategicInitiative } from '../../../data/report.model';

@Component({
  selector: 'app-action-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strategic-roadmap-container">
      <!-- Header Principal -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Hoja de Ruta Estratégica
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Tu plan de transformación digital personalizado, diseñado para maximizar el impacto en tu organización
        </p>
      </div>
      
      @if (strategicInitiatives().length > 0) {
        <!-- Acordeón de Iniciativas Estratégicas -->
        <div class="space-y-4">
          @for (initiative of strategicInitiatives(); track initiative.title; let i = $index) {
            <div class="strategic-initiative-card">
              <!-- Header del Acordeón -->
              <button 
                (click)="toggleInitiative(i)"
                class="w-full text-left p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
                [class]="isExpanded(i) ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <!-- Número de Iniciativa -->
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {{ i + 1 }}
                    </div>
                    
                    <!-- Título y Descripción -->
                    <div class="flex-1">
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {{ initiative.title }}
                      </h3>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        {{ initiative.description }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Badges y Botón de Expansión -->
                  <div class="flex items-center space-x-3">
                    <!-- Badge de Esfuerzo -->
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                          [class]="getEffortBadgeClass(initiative.effort)">
                      💪 {{ initiative.effort }}
                    </span>
                    
                    <!-- Badge de Timeline -->
                    <span class="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-xs font-semibold">
                      ⏳ {{ initiative.timeline }}
                    </span>
                    
                    <!-- Botón de Expansión -->
                    <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center transition-transform duration-300"
                         [class.rotate-180]="isExpanded(i)">
                      <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
              
              <!-- Contenido Expandido -->
              @if (isExpanded(i)) {
                <div class="px-6 pb-6 space-y-6">
                  
                  <!-- Sección de Contexto -->
                  <div class="grid md:grid-cols-2 gap-6">
                    <!-- Punto de Dolor -->
                    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
                      <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-red-600 text-lg">⚠️</span>
                        </div>
                        <div>
                          <h4 class="font-semibold text-red-800 dark:text-red-200 mb-2">Punto de Dolor Identificado</h4>
                          <p class="text-red-700 dark:text-red-300 text-sm">{{ initiative.painPoint }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Impacto en el Negocio -->
                    <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
                      <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-orange-600 text-lg">💥</span>
                        </div>
                        <div>
                          <h4 class="font-semibold text-orange-800 dark:text-orange-200 mb-2">Impacto en el Negocio</h4>
                          <p class="text-orange-700 dark:text-orange-300 text-sm">{{ initiative.businessImpact }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Sección de Hoja de Ruta -->
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                        <span class="text-blue-600 text-lg">🗺️</span>
                      </span>
                      Hoja de Ruta de Implementación
                    </h4>
                    
                    <div class="space-y-4">
                      @for (step of initiative.steps; track step.title; let stepIndex = $index) {
                        <div class="flex items-start space-x-4">
                          <!-- Número del Paso -->
                          <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {{ stepIndex + 1 }}
                          </div>
                          
                          <!-- Contenido del Paso -->
                          <div class="flex-1">
                            <h5 class="font-semibold text-gray-900 dark:text-white mb-1">{{ step.title }}</h5>
                            <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ step.description }}</p>
                            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <p class="text-sm text-gray-700 dark:text-gray-300">
                                <span class="font-medium text-green-600 dark:text-green-400">Resultado Esperado:</span> 
                                {{ step.expectedOutcome }}
                              </p>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                  
                  <!-- Sección de Métricas y Esfuerzo -->
                  <div class="grid md:grid-cols-2 gap-6">
                    <!-- KPIs -->
                    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                      <h4 class="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                        <span class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                          <span class="text-green-600 text-sm">🎯</span>
                        </span>
                        KPIs de Éxito
                      </h4>
                      <div class="space-y-2">
                        @for (kpi of initiative.kpis; track kpi.name) {
                          <div class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ kpi.name }}</span>
                            <span class="text-sm font-bold text-green-600 dark:text-green-400">{{ kpi.target }}</span>
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Información de Esfuerzo -->
                    <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
                      <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                        <span class="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-2">
                          <span class="text-purple-600 text-sm">📊</span>
                        </span>
                        Información del Proyecto
                      </h4>
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-600 dark:text-gray-400">Competencia Principal:</span>
                          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ initiative.primaryCompetency }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-600 dark:text-gray-400">Dimensión ARES:</span>
                          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ initiative.aresDimension }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-600 dark:text-gray-400">Nivel de Esfuerzo:</span>
                          <span class="px-2 py-1 rounded-full text-xs font-semibold"
                                [class]="getEffortBadgeClass(initiative.effort)">
                            {{ initiative.effort }}
                          </span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-sm text-gray-600 dark:text-gray-400">Timeline:</span>
                          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ initiative.timeline }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- SECCIÓN DE CONVERSIÓN (LA MÁS IMPORTANTE) -->
                  <div class="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-xl p-6 shadow-lg">
                    <div class="text-center">
                      <div class="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-white text-2xl">🚀</span>
                      </div>
                      
                      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Solución Recomendada por Sube Academia
                      </h3>
                      
                      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
                        <div class="flex items-center justify-center space-x-4">
                          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span class="text-blue-600 text-xl">
                              {{ initiative.recommendedService.type === 'Curso' ? '📚' : '🎓' }}
                            </span>
                          </div>
                          <div class="text-left">
                            <h4 class="text-lg font-bold text-gray-900 dark:text-white">{{ initiative.recommendedService.name }}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              {{ initiative.recommendedService.type === 'Curso' ? 'Curso Especializado' : 'Asesoría Personalizada' }}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
                          <span>{{ initiative.recommendedService.type === 'Curso' ? 'Ver Curso Relacionado' : 'Más Información sobre Asesoría' }}</span>
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                          </svg>
                        </button>
                        
                        <button class="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 flex items-center justify-center space-x-2">
                          <span>Agendar Consulta</span>
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        💡 <strong>Incluye:</strong> Acceso a expertos, materiales exclusivos, seguimiento personalizado y certificación
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
        
        <!-- Resumen Ejecutivo -->
        <div class="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-700 shadow-xl">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Resumen Ejecutivo de tu Hoja de Ruta
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-white text-2xl font-bold">{{ strategicInitiatives().length }}</span>
              </div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">Iniciativas Estratégicas</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Plan de transformación</div>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-white text-2xl font-bold">{{ getTotalSteps() }}</span>
              </div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">Pasos de Implementación</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Acciones concretas</div>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-white text-2xl font-bold">{{ getTotalKPIs() }}</span>
              </div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">KPIs de Seguimiento</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Métricas de éxito</div>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span class="text-white text-2xl font-bold">{{ getAverageTimeline() }}</span>
              </div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">Timeline Promedio</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Duración estimada</div>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-16">
          <div class="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Generando tu Hoja de Ruta Estratégica
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Nuestro equipo de expertos está creando un plan personalizado basado en tu diagnóstico.
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .strategic-roadmap-container {
      @apply max-w-6xl mx-auto;
    }
    
    .strategic-initiative-card {
      @apply bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .strategic-initiative-card:hover {
      @apply shadow-xl transform -translate-y-1;
    }
    
    /* Animaciones de expansión */
    .strategic-initiative-card .expanded-content {
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Efectos de hover para botones */
    .conversion-button {
      position: relative;
      overflow: hidden;
    }
    
    .conversion-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .conversion-button:hover::before {
      left: 100%;
    }
    
    /* Gradientes personalizados */
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .strategic-roadmap-container {
        @apply px-4;
      }
      
      .strategic-initiative-card {
        @apply mx-2;
      }
    }
    
    /* Efectos de scroll suaves */
    html {
      scroll-behavior: smooth;
    }
    
    /* Mejoras de accesibilidad */
    @media (prefers-reduced-motion: reduce) {
      .strategic-initiative-card,
      .conversion-button {
        animation: none;
        transition: none;
      }
    }
  `]
})
export class ActionPlanComponent {
  @Input() set actionPlan(value: StrategicInitiative[]) {
    this.strategicInitiatives.set(value || []);
  }
  
  strategicInitiatives = signal<StrategicInitiative[]>([]);
  expandedInitiatives = signal<Set<number>>(new Set());
  
  /**
   * Alterna la expansión de una iniciativa
   */
  toggleInitiative(index: number): void {
    const expanded = new Set(this.expandedInitiatives());
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    this.expandedInitiatives.set(expanded);
  }
  
  /**
   * Verifica si una iniciativa está expandida
   */
  isExpanded(index: number): boolean {
    return this.expandedInitiatives().has(index);
  }
  
  /**
   * Obtiene la clase CSS para el badge de esfuerzo
   */
  getEffortBadgeClass(effort: 'Bajo' | 'Medio' | 'Alto'): string {
    switch (effort) {
      case 'Bajo':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'Medio':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'Alto':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  }
  
  /**
   * Calcula el total de pasos de implementación
   */
  getTotalSteps(): number {
    return this.strategicInitiatives().reduce((total, initiative) => total + initiative.steps.length, 0);
  }
  
  /**
   * Calcula el total de KPIs
   */
  getTotalKPIs(): number {
    return this.strategicInitiatives().reduce((total, initiative) => total + initiative.kpis.length, 0);
  }
  
  /**
   * Calcula el timeline promedio
   */
  getAverageTimeline(): string {
    const initiatives = this.strategicInitiatives();
    if (initiatives.length === 0) return '0 meses';
    
    // Extraer números de timeline
    const timelines = initiatives.map(initiative => {
      const match = initiative.timeline.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const averageTime = timelines.reduce((sum, time) => sum + time, 0) / timelines.length;
    return `${Math.round(averageTime)} meses`;
  }
}