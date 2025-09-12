import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

export interface CompetencyGapData {
  competency: string;
  userScore: number;
  industryBenchmark: number;
  description: string;
  category: string;
}

@Component({
  selector: 'app-gap-analysis-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gap-analysis-container">
      <!-- Header del Componente -->
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">Análisis de Brechas</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Comparación con benchmarks de la industria</p>
        </div>
      </div>

      <!-- Controles del Gráfico -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">Tu Puntaje</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-orange-500 rounded"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">Benchmark Industria</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 rounded"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">Por encima del benchmark</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-red-500 rounded"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">Por debajo del benchmark</span>
        </div>
      </div>

      <!-- Canvas del Gráfico -->
      <div class="relative">
        <canvas #gapChartCanvas class="w-full h-96"></canvas>
        
        <!-- Tooltip personalizado -->
        <div #customTooltip 
             class="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
                    rounded-lg shadow-lg p-4 pointer-events-none opacity-0 transition-opacity duration-200
                    z-10 min-w-64 max-w-80"
             [style.left.px]="tooltipX"
             [style.top.px]="tooltipY">
          <div class="space-y-2">
            <h4 class="font-semibold text-gray-800 dark:text-white">{{ tooltipData.competency }}</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Tu Puntaje:</span>
                <span class="font-medium" [ngClass]="getScoreColor(tooltipData.userScore, tooltipData.industryBenchmark)">
                  {{ tooltipData.userScore }}/5
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Benchmark:</span>
                <span class="font-medium text-orange-600">{{ tooltipData.industryBenchmark }}/5</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Diferencia:</span>
                <span class="font-medium" [ngClass]="getGapColor(tooltipData.userScore - tooltipData.industryBenchmark)">
                  {{ getGapText(tooltipData.userScore - tooltipData.industryBenchmark) }}
                </span>
              </div>
            </div>
            <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ tooltipData.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen Estadístico -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="font-semibold text-green-800 dark:text-green-300">Fortalezas</span>
          </div>
          <div class="text-2xl font-bold text-green-600">{{ getStrengthsCount() }}</div>
          <div class="text-sm text-green-600">competencias por encima del benchmark</div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="font-semibold text-orange-800 dark:text-orange-300">Oportunidades</span>
          </div>
          <div class="text-2xl font-bold text-orange-600">{{ getOpportunitiesCount() }}</div>
          <div class="text-sm text-orange-600">competencias por debajo del benchmark</div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="font-semibold text-blue-800 dark:text-blue-300">Promedio</span>
          </div>
          <div class="text-2xl font-bold text-blue-600">{{ getAverageGap() }}</div>
          <div class="text-sm text-blue-600">diferencia promedio vs benchmark</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gap-analysis-container {
      @apply w-full;
    }

    /* Animaciones para el tooltip */
    .custom-tooltip {
      transition: all 0.2s ease-in-out;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .gap-analysis-container {
        @apply px-2;
      }
    }
  `]
})
export class GapAnalysisChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() competencyScores: Record<string, number> = {};
  
  @ViewChild('gapChartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('customTooltip', { static: true }) customTooltip!: ElementRef<HTMLDivElement>;
  
  private chart: Chart | null = null;
  tooltipX = 0;
  tooltipY = 0;
  tooltipData: CompetencyGapData = {
    competency: '',
    userScore: 0,
    industryBenchmark: 0,
    description: '',
    category: ''
  };

  // Datos de competencias con benchmarks de la industria
  private competencyData: CompetencyGapData[] = [
    {
      competency: 'Pensamiento Crítico',
      userScore: 0,
      industryBenchmark: 3.8,
      description: 'Capacidad para analizar información de manera objetiva y tomar decisiones lógicas.',
      category: 'Cognitivo-Analítico'
    },
    {
      competency: 'Resolución de Problemas',
      userScore: 0,
      industryBenchmark: 3.6,
      description: 'Habilidad para abordar desafíos complejos y encontrar soluciones efectivas.',
      category: 'Cognitivo-Analítico'
    },
    {
      competency: 'Alfabetización de Datos',
      userScore: 0,
      industryBenchmark: 3.2,
      description: 'Capacidad para interpretar, analizar y comunicar información basada en datos.',
      category: 'Cognitivo-Analítico'
    },
    {
      competency: 'Comunicación Efectiva',
      userScore: 0,
      industryBenchmark: 4.1,
      description: 'Habilidad para transmitir ideas de manera clara y persuasiva.',
      category: 'Interpersonal-Social'
    },
    {
      competency: 'Colaboración y Trabajo en Equipo',
      userScore: 0,
      industryBenchmark: 3.9,
      description: 'Capacidad para trabajar efectivamente en equipos diversos.',
      category: 'Interpersonal-Social'
    },
    {
      competency: 'Creatividad e Innovación',
      userScore: 0,
      industryBenchmark: 3.4,
      description: 'Generar ideas originales y soluciones innovadoras.',
      category: 'Creativo-Innovador'
    },
    {
      competency: 'Diseño Tecnológico',
      userScore: 0,
      industryBenchmark: 3.1,
      description: 'Crear soluciones tecnológicas centradas en el usuario.',
      category: 'Técnico-Digital'
    },
    {
      competency: 'Automatización y Agentes IA',
      userScore: 0,
      industryBenchmark: 2.8,
      description: 'Implementar y gestionar sistemas automatizados.',
      category: 'Técnico-Digital'
    },
    {
      competency: 'Adaptabilidad y Flexibilidad',
      userScore: 0,
      industryBenchmark: 3.7,
      description: 'Ajustarse a cambios y nuevas situaciones.',
      category: 'Adaptativo-Emocional'
    },
    {
      competency: 'Ética y Responsabilidad',
      userScore: 0,
      industryBenchmark: 4.0,
      description: 'Actuar con integridad y responsabilidad social.',
      category: 'Ético-Responsable'
    },
    {
      competency: 'Sostenibilidad',
      userScore: 0,
      industryBenchmark: 3.3,
      description: 'Considerar el impacto ambiental y social a largo plazo.',
      category: 'Ético-Responsable'
    },
    {
      competency: 'Aprendizaje Continuo',
      userScore: 0,
      industryBenchmark: 3.5,
      description: 'Desarrollar habilidades constantemente.',
      category: 'Adaptativo-Emocional'
    },
    {
      competency: 'Liderazgo en IA',
      userScore: 0,
      industryBenchmark: 3.0,
      description: 'Guiar equipos en la transformación digital.',
      category: 'Liderazgo-Estratégico'
    }
  ];

  ngOnInit(): void {
    this.updateCompetencyScores();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private updateCompetencyScores(): void {
    // Mapear los scores del input a los datos de competencias
    Object.entries(this.competencyScores).forEach(([key, score]) => {
      const competency = this.competencyData.find(c => 
        c.competency.toLowerCase().replace(/\s+/g, '_') === key ||
        key.includes(c.competency.toLowerCase().replace(/\s+/g, '_'))
      );
      if (competency) {
        competency.userScore = score;
      }
    });

    // Si no hay datos, generar datos de ejemplo
    if (Object.keys(this.competencyScores).length === 0) {
      this.competencyData.forEach(comp => {
        comp.userScore = Math.random() * 2 + 2; // Entre 2 y 4
      });
    }
  }

  private createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.competencyData
      .filter(comp => comp.userScore > 0)
      .sort((a, b) => b.userScore - a.userScore);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(comp => comp.competency),
        datasets: [
          {
            label: 'Tu Puntaje',
            data: data.map(comp => comp.userScore),
            backgroundColor: data.map(comp => 
              comp.userScore >= comp.industryBenchmark ? '#10b981' : '#ef4444'
            ),
            borderColor: data.map(comp => 
              comp.userScore >= comp.industryBenchmark ? '#059669' : '#dc2626'
            ),
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Benchmark Industria',
            data: data.map(comp => comp.industryBenchmark),
            type: 'line',
            borderColor: '#f97316',
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointBackgroundColor: '#f97316',
            pointBorderColor: '#f97316',
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: false,
            tension: 0.1,
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
            external: (context) => this.showCustomTooltip(context, data)
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value + '/5';
              }
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        onHover: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.showTooltip(event, data[index]);
          } else {
            this.hideTooltip();
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private showCustomTooltip(context: any, data: CompetencyGapData[]): void {
    // Esta función se llama desde Chart.js pero no la usamos
    // porque manejamos el tooltip manualmente
  }

  private showTooltip(event: any, data: CompetencyGapData): void {
    this.tooltipData = data;
    this.tooltipX = event.offsetX + 10;
    this.tooltipY = event.offsetY - 10;
    
    const tooltip = this.customTooltip.nativeElement;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(-50%)';
  }

  private hideTooltip(): void {
    const tooltip = this.customTooltip.nativeElement;
    tooltip.style.opacity = '0';
  }

  getScoreColor(userScore: number, benchmark: number): string {
    if (userScore >= benchmark) {
      return 'text-green-600 dark:text-green-400';
    } else if (userScore >= benchmark - 0.5) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  }

  getGapColor(gap: number): string {
    if (gap > 0) {
      return 'text-green-600 dark:text-green-400';
    } else if (gap > -0.5) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  }

  getGapText(gap: number): string {
    if (gap > 0) {
      return `+${gap.toFixed(1)} por encima`;
    } else if (gap < 0) {
      return `${gap.toFixed(1)} por debajo`;
    } else {
      return 'Igual al benchmark';
    }
  }

  getStrengthsCount(): number {
    return this.competencyData.filter(comp => 
      comp.userScore > 0 && comp.userScore >= comp.industryBenchmark
    ).length;
  }

  getOpportunitiesCount(): number {
    return this.competencyData.filter(comp => 
      comp.userScore > 0 && comp.userScore < comp.industryBenchmark
    ).length;
  }

  getAverageGap(): string {
    const validData = this.competencyData.filter(comp => comp.userScore > 0);
    if (validData.length === 0) return '0.0';
    
    const totalGap = validData.reduce((sum, comp) => 
      sum + (comp.userScore - comp.industryBenchmark), 0
    );
    
    return (totalGap / validData.length).toFixed(1);
  }
}
