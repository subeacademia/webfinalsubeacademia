import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ToastService } from '../../../../../core/services/ui/toast/toast.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Tu Diagnóstico de Madurez en IA
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Análisis personalizado basado en tus respuestas
          </p>
        </div>

        @if (isLoading()) {
          <!-- Loading State -->
          <div class="flex justify-center items-center py-20">
            <div class="text-center">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-300">Cargando tu diagnóstico...</p>
            </div>
          </div>
        } @else if (report()) {
          <!-- Results Content -->
          <div class="space-y-8">
            
            <!-- Executive Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                📊 Resumen Ejecutivo
              </h2>
              <div class="prose prose-lg max-w-none dark:prose-invert">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ report()?.executiveSummary || 'Tu diagnóstico está siendo procesado...' }}
                </p>
              </div>
            </div>

            <!-- AI Maturity Level -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <h2 class="text-2xl font-bold mb-4 flex items-center">
                🚀 Nivel de Madurez en IA
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">{{ report()?.aiMaturity?.currentLevel || 'N/A' }}</div>
                  <div class="text-blue-100">Nivel Actual</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">{{ report()?.aiMaturity?.targetLevel || 'N/A' }}</div>
                  <div class="text-blue-100">Nivel Objetivo</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold mb-2">{{ report()?.aiMaturity?.gap || 'N/A' }}</div>
                  <div class="text-blue-100">Brecha</div>
                </div>
              </div>
            </div>

            <!-- Competency Analysis -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                🎯 Análisis de Competencias
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (competency of report()?.competencyAnalysis || []; track competency.competency) {
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                      {{ competency.competency }}
                    </h3>
                    <div class="flex items-center mb-2">
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          [style.width.%]="competency.score * 10">
                        </div>
                      </div>
                      <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {{ competency.score }}/10
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      {{ competency.description }}
                    </p>
                  </div>
                }
              </div>
            </div>

            <!-- Action Plan -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                📋 Plan de Acción Estratégico
              </h2>
              <div class="space-y-6">
                @for (area of report()?.actionPlan || []; track area.area) {
                  <div class="border-l-4 border-blue-500 pl-6">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {{ area.area }}
                    </h3>
                    <div class="space-y-4">
                      @for (action of area.actions; track action.accion) {
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                            {{ action.accion }}
                          </h4>
                          <p class="text-gray-600 dark:text-gray-300 mb-3">
                            {{ action.descripcion }}
                          </p>
                          @if (action.recursos && action.recursos.length > 0) {
                            <div class="flex flex-wrap gap-2">
                              @for (recurso of action.recursos; track recurso) {
                                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                  {{ recurso }}
                                </span>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Recommendations -->
            <div class="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
              <h2 class="text-2xl font-bold mb-4 flex items-center">
                💡 Recomendaciones Generales
              </h2>
              <div class="prose prose-lg max-w-none prose-invert">
                <p class="leading-relaxed">
                  {{ report()?.generalRecommendations || 'Tus recomendaciones están siendo generadas...' }}
                </p>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                🚀 Próximos Pasos
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="text-4xl mb-4">📚</div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Explora Nuestros Cursos
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Accede a formación especializada en IA y transformación digital
                  </p>
                  <button 
                    (click)="navigateToCourses()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Cursos
                  </button>
                </div>
                
                <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="text-4xl mb-4">🤝</div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Consultoría Personalizada
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Obtén asesoramiento estratégico para tu organización
                  </p>
                  <button 
                    (click)="navigateToContact()"
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Contactar
                  </button>
                </div>
              </div>
            </div>

            <!-- Download Report -->
            <div class="text-center">
              <button 
                (click)="downloadReport()"
                class="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg">
                📄 Descargar Reporte Completo
              </button>
            </div>

          </div>
        } @else {
          <!-- No Results State -->
          <div class="text-center py-20">
            <div class="text-6xl mb-4">😔</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No se encontró el diagnóstico
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-8">
              Parece que no hay un diagnóstico disponible. Intenta completar el proceso nuevamente.
            </p>
            <button 
              (click)="startNewDiagnostic()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Iniciar Nuevo Diagnóstico
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class DiagnosticResultsComponent implements OnInit {
  private router = inject(Router);
  private diagnosticsService = inject(DiagnosticsService);
  private diagnosticStateService = inject(DiagnosticStateService);
  private toastService = inject(ToastService);

  report = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadReport();
  }

  private loadReport(): void {
    this.isLoading.set(true);
    
    // Simular carga de datos
    setTimeout(() => {
    const currentReport = this.diagnosticsService.getCurrentReport();
      if (currentReport) {
        this.report.set(currentReport);
      } else {
        // Generar reporte de ejemplo si no hay uno real
        this.report.set(this.generateSampleReport());
      }
      this.isLoading.set(false);
    }, 2000);
  }

  private generateSampleReport(): any {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const currentMonth = new Date().getMonth() + 1;
    
    // Calcular trimestres actuales
    const getCurrentQuarter = (month: number) => {
      if (month <= 3) return `Q1 de ${currentYear}`;
      if (month <= 6) return `Q2 de ${currentYear}`;
      if (month <= 9) return `Q3 de ${currentYear}`;
      return `Q4 de ${currentYear}`;
    };
    
    const currentQuarter = getCurrentQuarter(currentMonth);
    const nextQuarter = currentMonth <= 9 ? getCurrentQuarter(currentMonth + 3) : `Q1 de ${nextYear}`;
    
    return {
      executiveSummary: "Basado en tu perfil profesional y respuestas, has demostrado un nivel intermedio de madurez en IA. Tienes una base sólida en conceptos fundamentales, pero hay oportunidades significativas para avanzar en la implementación práctica y estratégica de soluciones de IA en tu organización.",
      aiMaturity: {
        currentLevel: 6,
        targetLevel: 9,
        gap: 3
      },
      competencyAnalysis: [
        {
          competency: "Conocimiento Técnico",
          score: 7,
          description: "Tienes un buen entendimiento de los conceptos básicos de IA"
        },
        {
          competency: "Implementación Práctica",
          score: 5,
          description: "Necesitas más experiencia en la aplicación real de IA"
        },
        {
          competency: "Estrategia de IA",
          score: 6,
          description: "Tienes una visión clara pero necesitas profundizar en la planificación"
        }
      ],
      actionPlan: [
        {
          area: "Formación Técnica",
          actions: [
            {
              accion: "Completar curso de Machine Learning Avanzado",
              descripcion: `Profundizar en algoritmos y técnicas de ML para aplicaciones empresariales antes de ${nextQuarter}`,
              recursos: ["Curso ML Avanzado", "Laboratorios prácticos", "Certificación"]
            },
            {
              accion: "Implementar proyecto piloto de IA",
              descripcion: `Desarrollar una solución de IA real en tu organización para ${currentQuarter}`,
              recursos: ["Mentoría técnica", "Herramientas de desarrollo", "Soporte continuo"]
            }
          ]
        },
        {
          area: "Estrategia Organizacional",
          actions: [
            {
              accion: "Desarrollar roadmap de IA",
              descripcion: `Crear un plan estratégico para la adopción de IA en tu empresa para ${nextYear}`,
              recursos: ["Plantillas estratégicas", "Consultoría especializada", "Benchmarking"]
            }
          ]
        }
      ],
      generalRecommendations: `Te recomendamos enfocarte en la implementación práctica de soluciones de IA, comenzando con proyectos piloto de bajo riesgo para ${currentQuarter}. Además, es crucial desarrollar una estrategia clara de adopción de IA que esté alineada con los objetivos de tu organización para ${nextYear}. Considera invertir en formación continua y en la creación de un equipo multidisciplinario que pueda apoyar la transformación digital.`
    };
  }

  navigateToCourses(): void {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/productos`]);
  }

  navigateToContact(): void {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/contacto`]);
  }

  downloadReport(): void {
    this.toastService.show('info', 'Función de descarga próximamente disponible');
  }

  startNewDiagnostic(): void {
    this.diagnosticStateService.reset();
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico`]);
  }
}