import { Component, computed, inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import 'chart.js/auto';
import { ARES_ITEMS } from '../../../data/ares-items';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">
          ¡Diagnóstico Completado!
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Has completado exitosamente el diagnóstico de madurez ARES-AI. 
          Aquí tienes tu reporte personalizado y plan de acción.
        </p>
      </div>
      
      <!-- Resumen Ejecutivo -->
      <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Resumen Ejecutivo</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-400 mb-2">{{ getOverallScore() }}%</div>
            <div class="text-gray-300">Madurez General</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">{{ getAresScore() }}%</div>
            <div class="text-gray-300">Madurez ARES</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-400 mb-2">{{ getCompetenciasScore() }}%</div>
            <div class="text-gray-300">Competencias</div>
          </div>
        </div>
      </div>

      <!-- Gráficos de Resultados -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Gráfico de Radar ARES -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-semibold text-white mb-4">Evaluación ARES por Fase</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas #aresChart width="300" height="300"></canvas>
          </div>
        </div>

        <!-- Semáforo ARES Mejorado -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-semibold text-white mb-4">Estado por Fase ARES</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 1: Fundamentos</span>
                <p class="text-xs text-gray-400">Infraestructura básica y capacidades iniciales</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F1')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F1') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 2: Estrategia</span>
                <p class="text-xs text-gray-400">Planificación y gobernanza</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F2')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F2') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 3: Capacidades</span>
                <p class="text-xs text-gray-400">Desarrollo y tecnología</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F3')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F3') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 4: Operación</span>
                <p class="text-xs text-gray-400">Monitoreo y mejora continua</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F4')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F4') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 5: Transformación</span>
                <p class="text-xs text-gray-400">Innovación y liderazgo</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F5')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F5') }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Leyenda del Semáforo -->
          <div class="mt-4 p-3 bg-gray-700/30 rounded-lg">
            <h4 class="text-sm font-medium text-gray-200 mb-2">Leyenda:</h4>
            <div class="flex items-center space-x-4 text-xs">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-gray-400">0-20% (Crítico)</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span class="text-gray-400">21-40% (Bajo)</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-gray-400">41-60% (Medio)</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-gray-400">61-100% (Alto)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fortalezas y Oportunidades -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-green-200 mb-4">Fortalezas Principales</h3>
          <ul class="space-y-2 text-green-100">
            <li *ngFor="let fortaleza of getFortalezas()" class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              {{ fortaleza }}
            </li>
          </ul>
        </div>

        <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-yellow-200 mb-4">Oportunidades de Mejora</h3>
          <ul class="space-y-2 text-yellow-100">
            <li *ngFor="let oportunidad of getOportunidades()" class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
              </svg>
              {{ oportunidad }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Plan de Acción -->
      <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h3 class="text-2xl font-bold text-white mb-4">Plan de Acción Recomendado</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-lg font-semibold text-blue-200 mb-3">Acciones Inmediatas (0-3 meses)</h4>
            <ul class="space-y-2 text-blue-100">
              <li *ngFor="let accion of getAccionesInmediatas()" class="flex items-start">
                <svg class="w-4 h-4 mr-2 mt-1 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                {{ accion }}
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-blue-200 mb-3">Acciones a Mediano Plazo (3-12 meses)</h4>
            <ul class="space-y-2 text-blue-100">
              <li *ngFor="let accion of getAccionesMedioPlazo()" class="flex items-start">
                <svg class="w-4 h-4 mr-2 mt-1 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                {{ accion }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          (click)="downloadPDF()"
          class="btn-primary flex items-center justify-center px-6 py-3 text-lg font-semibold">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Descargar PDF Completo
        </button>
        
        <button 
          (click)="scheduleConsulting()"
          class="btn-secondary flex items-center justify-center px-6 py-3 text-lg font-semibold">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Agendar Sesión de Consultoría
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .btn-primary {
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gray-700 hover:bg-gray-600 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }
  `]
})
export class DiagnosticResultsComponent implements OnInit, AfterViewInit {
  @ViewChild('aresChart', { static: false }) aresChartRef!: ElementRef<HTMLCanvasElement>;
  
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly scoringService = inject(ScoringService);
  private readonly router = inject(Router);

  private aresChart: Chart | null = null;

  ngOnInit(): void {
    // Inicialización del componente
  }

  ngAfterViewInit(): void {
    this.initializeAresChart();
  }

  private initializeAresChart(): void {
    if (!this.aresChartRef) return;

    const ctx = this.aresChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData: ChartData<'radar'> = {
      labels: ['Fundamentos', 'Estrategia', 'Capacidades', 'Operación', 'Transformación'],
      datasets: [{
        label: 'Madurez ARES',
        data: [
          this.getPhaseScore('F1'),
          this.getPhaseScore('F2'),
          this.getPhaseScore('F3'),
          this.getPhaseScore('F4'),
          this.getPhaseScore('F5')
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }]
    };

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              color: '#9CA3AF',
              backdropColor: 'transparent'
            },
            grid: {
              color: '#374151'
            },
            pointLabels: {
              color: '#E5E7EB',
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#E5E7EB'
            }
          }
        }
      }
    };

    this.aresChart = new Chart(ctx, config);
  }

  getOverallScore(): number {
    const aresScore = this.getAresScore();
    const competenciasScore = this.getCompetenciasScore();
    return Math.round((aresScore + competenciasScore) / 2);
  }

  getAresScore(): number {
    const aresData = this.diagnosticState.aresForm.value;
    if (!aresData) return 0;
    
    const totalItems = Object.keys(aresData).length;
    if (totalItems === 0) return 0;
    
    const totalScore = Object.values(aresData).reduce((sum: number, value: any) => sum + (value || 0), 0);
    return Math.round((totalScore / (totalItems * 4)) * 100); // Escala 0-4
  }

  getCompetenciasScore(): number {
    const competenciasData = this.diagnosticState.competenciasForm.value;
    if (!competenciasData) return 0;
    
    const totalItems = Object.keys(competenciasData).length;
    if (totalItems === 0) return 0;
    
    const totalScore = Object.values(competenciasData).reduce((sum: number, value: any) => sum + (value || 0), 0);
    return Math.round((totalScore / (totalItems * 4)) * 100); // Escala 0-4
  }

  getPhaseScore(phase: string): number {
    const aresData = this.diagnosticState.aresForm.value;
    if (!aresData) return 0;
    
    const phaseItems = ARES_ITEMS.filter(item => item.phase === phase);
    if (phaseItems.length === 0) return 0;
    
    const phaseScore = phaseItems.reduce((sum, item) => {
      const value = aresData[item.id];
      return sum + (value || 0);
    }, 0);
    
    return Math.round((phaseScore / (phaseItems.length * 4)) * 100); // Escala 0-4
  }

  getPhaseStatusClass(phase: string): string {
    const score = this.getPhaseScore(phase);
    if (score >= 61) return 'bg-green-500';
    if (score >= 41) return 'bg-blue-500';
    if (score >= 21) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getFortalezas(): string[] {
    const score = this.getOverallScore();
    if (score >= 80) {
      return [
        'Excelente infraestructura tecnológica',
        'Equipo altamente capacitado',
        'Procesos bien establecidos'
      ];
    } else if (score >= 60) {
      return [
        'Buenas bases tecnológicas',
        'Equipo con potencial de crecimiento',
        'Procesos en desarrollo'
      ];
    } else {
      return [
        'Compromiso con la transformación',
        'Oportunidad de mejora significativa',
        'Potencial de crecimiento alto'
      ];
    }
  }

  getOportunidades(): string[] {
    const score = this.getOverallScore();
    if (score >= 80) {
      return [
        'Optimizar procesos existentes',
        'Explorar tecnologías emergentes',
        'Compartir mejores prácticas'
      ];
    } else if (score >= 60) {
      return [
        'Fortalecer competencias del equipo',
        'Implementar mejores prácticas',
        'Invertir en infraestructura'
      ];
    } else {
      return [
        'Desarrollar competencias básicas',
        'Establecer procesos fundamentales',
        'Invertir en formación del equipo'
      ];
    }
  }

  getAccionesInmediatas(): string[] {
    const score = this.getOverallScore();
    if (score >= 60) {
      return [
        'Optimizar procesos existentes',
        'Capacitar equipo en nuevas tecnologías',
        'Implementar pilotos de mejora'
      ];
    } else {
      return [
        'Desarrollar competencias básicas del equipo',
        'Establecer procesos fundamentales',
        'Invertir en infraestructura básica'
      ];
    }
  }

  getAccionesMedioPlazo(): string[] {
    const score = this.getOverallScore();
    if (score >= 60) {
      return [
        'Escalar soluciones exitosas',
        'Implementar gobernanza avanzada',
        'Explorar tecnologías emergentes'
      ];
    } else {
      return [
        'Fortalecer competencias del equipo',
        'Implementar mejores prácticas',
        'Desarrollar capacidades de innovación'
      ];
    }
  }

  downloadPDF(): void {
    // Implementar descarga de PDF
    console.log('Descargando PDF...');
    // Aquí iría la lógica real de generación y descarga
    alert('Funcionalidad de descarga de PDF en desarrollo');
  }

  scheduleConsulting(): void {
    // Implementar agendamiento de consultoría
    console.log('Agendando consultoría...');
    // Aquí iría la lógica real de agendamiento
    alert('Funcionalidad de agendamiento en desarrollo');
  }
}
