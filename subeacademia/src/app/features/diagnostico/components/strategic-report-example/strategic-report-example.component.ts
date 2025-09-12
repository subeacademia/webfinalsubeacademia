import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { ReportData, StrategicInitiative, ExecutiveSummary } from '../../data/report.model';

/**
 * Componente de ejemplo que demuestra cómo usar el nuevo sistema de reportes estratégicos
 * Este componente muestra cómo acceder y mostrar los datos del reporte estratégico
 */
@Component({
  selector: 'app-strategic-report-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        🚀 Reporte Estratégico ARES-AI
      </h2>

      <!-- Botón para generar reporte estratégico -->
      <div class="mb-6">
        <button 
          (click)="generarReporteEstrategico()"
          [disabled]="isGenerating()"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
          {{ isGenerating() ? 'Generando...' : 'Generar Reporte Estratégico' }}
        </button>
      </div>

      <!-- Mostrar reporte estratégico si está disponible -->
      @if (strategicReport()) {
        <div class="space-y-6">
          <!-- Resumen Ejecutivo -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              📊 Resumen Ejecutivo
            </h3>
            <div class="space-y-3">
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Nivel de Madurez:</span>
                <span class="ml-2 text-blue-600 dark:text-blue-400">{{ strategicReport()?.executiveSummary?.currentMaturity || 'No disponible' }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Desafío Principal:</span>
                <p class="mt-1 text-gray-600 dark:text-gray-400">{{ strategicReport()?.executiveSummary?.mainChallenge || 'No disponible' }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Recomendación Estratégica:</span>
                <p class="mt-1 text-gray-600 dark:text-gray-400">{{ strategicReport()?.executiveSummary?.strategicRecommendation || 'No disponible' }}</p>
              </div>
            </div>
          </div>

          <!-- Puntuaciones ARES -->
          <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              🎯 Puntuaciones ARES-AI
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              @for (dimension of getAresDimensions(); track dimension) {
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ strategicReport()?.aresScores?.[dimension] || 0 }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ dimension }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Iniciativas Estratégicas -->
          <div class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
              🎯 Iniciativas Estratégicas
            </h3>
            
            @for (iniciativa of strategicReport()?.actionPlan; track iniciativa.title) {
              <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-lg font-semibold text-gray-800 dark:text-white">
                    {{ iniciativa.title }}
                  </h4>
                  <div class="flex gap-2">
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                      {{ iniciativa.aresDimension }}
                    </span>
                    <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full">
                      {{ iniciativa.effort }}
                    </span>
                  </div>
                </div>

                <div class="space-y-3 mb-4">
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Pain Point:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ iniciativa.painPoint }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Impacto en el Negocio:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ iniciativa.businessImpact }}</p>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 dark:text-gray-300">Descripción:</span>
                    <p class="text-gray-600 dark:text-gray-400">{{ iniciativa.description }}</p>
                  </div>
                </div>

                <!-- Pasos de Acción -->
                <div class="mb-4">
                  <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Pasos de Implementación:</h5>
                  <ul class="space-y-2">
                    @for (step of iniciativa.steps; track step.title) {
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <div class="font-medium text-gray-800 dark:text-white">{{ step.title }}</div>
                          <div class="text-sm text-gray-600 dark:text-gray-400">{{ step.description }}</div>
                          <div class="text-xs text-green-600 dark:text-green-400 mt-1">
                            Resultado esperado: {{ step.expectedOutcome }}
                          </div>
                        </div>
                      </li>
                    }
                  </ul>
                </div>

                <!-- KPIs -->
                <div class="mb-4">
                  <h5 class="font-medium text-gray-700 dark:text-gray-300 mb-2">KPIs de Éxito:</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    @for (kpi of iniciativa.kpis; track kpi.name) {
                      <div class="bg-gray-100 dark:bg-gray-600 p-3 rounded">
                        <div class="font-medium text-gray-800 dark:text-white">{{ kpi.name }}</div>
                        <div class="text-sm text-blue-600 dark:text-blue-400">{{ kpi.target }}</div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Información Adicional -->
                <div class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span class="font-medium">Timeline:</span> {{ iniciativa.timeline }}
                  </div>
                  <div>
                    <span class="font-medium">Servicio Recomendado:</span> 
                    <span class="text-blue-600 dark:text-blue-400">{{ iniciativa.recommendedService.name }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Metadatos -->
          <div class="text-xs text-gray-500 dark:text-gray-400 border-t pt-4">
            <p>Generado el: {{ strategicReport()?.generatedAt | date:'medium' }}</p>
            <p>Versión: {{ strategicReport()?.version }}</p>
          </div>
        </div>
      }
    </div>
  `
})
export class StrategicReportExampleComponent {
  private diagnosticState = inject(DiagnosticStateService);
  
  // Signals para el estado del componente
  strategicReport = this.diagnosticState.generatedStrategicReport;
  isGenerating = this.diagnosticState.isGeneratingReport;

  /**
   * Genera un reporte estratégico usando el nuevo sistema
   */
  async generarReporteEstrategico() {
    try {
      await this.diagnosticState.generateStrategicReport();
      console.log('✅ Reporte estratégico generado:', this.strategicReport());
    } catch (error) {
      console.error('❌ Error al generar reporte estratégico:', error);
    }
  }

  /**
   * Obtiene las dimensiones ARES para mostrar las puntuaciones
   */
  getAresDimensions(): string[] {
    return ['Agilidad', 'Responsabilidad', 'Ética', 'Sostenibilidad'];
  }

  /**
   * Ejemplo de cómo acceder a datos específicos del reporte
   */
  getExecutiveSummary(): ExecutiveSummary | undefined {
    return this.strategicReport()?.executiveSummary;
  }

  /**
   * Ejemplo de cómo obtener iniciativas por dimensión ARES
   */
  getInitiativesByDimension(dimension: string): StrategicInitiative[] {
    return this.strategicReport()?.actionPlan.filter(
      iniciativa => iniciativa.aresDimension === dimension
    ) || [];
  }

  /**
   * Ejemplo de cómo obtener iniciativas por nivel de esfuerzo
   */
  getInitiativesByEffort(effort: 'Bajo' | 'Medio' | 'Alto'): StrategicInitiative[] {
    return this.strategicReport()?.actionPlan.filter(
      iniciativa => iniciativa.effort === effort
    ) || [];
  }
}
