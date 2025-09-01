import { Component, Input, OnChanges, SimpleChanges, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';

Chart.register(...registerables);

interface CompetencyScore {
  name: string;
  score: number;
  description?: string;
}

@Component({
  selector: 'app-competency-map',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe],
  template: `
    <div class="competency-map-container bg-[var(--card)] rounded-lg p-6 shadow-xl border border-[var(--border)]">
      <div class="flex items-center mb-4">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--fg)]">Mapa de Competencias</h3>
      </div>
      
      <p class="text-sm text-[var(--muted)] mb-6">Visualización de tus 13 competencias clave para el futuro</p>
      
      <!-- Gráfico de Radar -->
      <div class="chart-container relative" style="height: 400px;">
        <canvas #radarCanvas></canvas>
        
        <!-- Estado de carga -->
        <div *ngIf="!competencyScores || competencyScores.length === 0" 
             class="absolute inset-0 flex items-center justify-center bg-[var(--card)] rounded-lg">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-[var(--muted)]">Calculando competencias...</p>
          </div>
        </div>
      </div>
      
      <!-- Leyenda de niveles -->
      <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="flex items-center text-xs">
          <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span class="text-[var(--muted)]">Incipiente (0-20%)</span>
        </div>
        <div class="flex items-center text-xs">
          <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span class="text-[var(--muted)]">Básico (21-40%)</span>
        </div>
        <div class="flex items-center text-xs">
          <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span class="text-[var(--muted)]">Intermedio (41-60%)</span>
        </div>
        <div class="flex items-center text-xs">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span class="text-[var(--muted)]">Avanzado (61-100%)</span>
        </div>
      </div>
      
      <!-- Estadísticas resumidas -->
      <div *ngIf="competencyScores && competencyScores.length > 0" class="mt-6 grid grid-cols-3 gap-4 text-center">
        <div class="bg-[var(--panel)] rounded-lg p-3">
          <div class="text-2xl font-bold text-blue-500">{{ getAverageScore() | number:'1.0-0' }}%</div>
          <div class="text-xs text-[var(--muted)]">Promedio</div>
        </div>
        <div class="bg-[var(--panel)] rounded-lg p-3">
          <div class="text-2xl font-bold text-green-500">{{ getMaxScore() }}%</div>
          <div class="text-xs text-[var(--muted)]">Máximo</div>
        </div>
        <div class="bg-[var(--panel)] rounded-lg p-3">
          <div class="text-2xl font-bold text-orange-500">{{ getMinScore() }}%</div>
          <div class="text-xs text-[var(--muted)]">Mínimo</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .competency-map-container {
      min-height: 500px;
    }
    
    .chart-container {
      position: relative;
      width: 100%;
    }
    
    canvas {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class CompetencyMapComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() competencyScores: CompetencyScore[] = [];
  @ViewChild('radarCanvas', { static: false }) radarCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;
  private chartData: ChartConfiguration<'radar'>['data'] = {
    labels: [],
    datasets: []
  };

  ngOnInit(): void {
    console.log('🗺️ CompetencyMapComponent.ngOnInit() - data:', this.competencyScores);
  }

  ngAfterViewInit(): void {
    console.log('🎯 CompetencyMapComponent.ngAfterViewInit() - data:', this.competencyScores);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 CompetencyMapComponent.ngOnChanges() - changes:', changes);
    if (changes['competencyScores'] && this.radarCanvas) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.radarCanvas || !this.competencyScores || this.competencyScores.length === 0) {
      return;
    }

    // Destruir gráfico existente
    if (this.chart) {
      this.chart.destroy();
    }

    // Preparar datos para el gráfico de radar
    const labels = this.competencyScores.map(item => item.name);
    const scores = this.competencyScores.map(item => item.score);
    const colors = this.competencyScores.map(item => this.getScoreColor(item.score));

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Nivel de Competencia',
          data: scores,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: this.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            min: 0,
            ticks: {
              stepSize: 20,
              color: 'var(--muted)',
              font: {
                size: 10
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
                         pointLabels: {
               color: 'var(--fg)',
               font: {
                 size: 11,
                 weight: 500
               },
               callback: function(value, index) {
                 const chartLabels = labels;
                 const label = chartLabels[index] || '';
                 return label.length > 15 ? label.substring(0, 15) + '...' : label;
               }
             }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              title: (items) => {
                return items[0].label;
              },
              label: (item) => {
                return `Nivel: ${item.parsed.r}%`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(this.radarCanvas.nativeElement, config);
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';      // Verde
    if (score >= 60) return '#3b82f6';      // Azul
    if (score >= 40) return '#eab308';      // Amarillo
    if (score >= 20) return '#f97316';      // Naranja
    return '#ef4444';                       // Rojo
  }

  getAverageScore(): number {
    if (!this.competencyScores || this.competencyScores.length === 0) return 0;
    const sum = this.competencyScores.reduce((acc, item) => acc + item.score, 0);
    return Math.round(sum / this.competencyScores.length);
  }

  getMaxScore(): number {
    if (!this.competencyScores || this.competencyScores.length === 0) return 0;
    return Math.max(...this.competencyScores.map(item => item.score));
  }

  getMinScore(): number {
    if (!this.competencyScores || this.competencyScores.length === 0) return 0;
    return Math.min(...this.competencyScores.map(item => item.score));
  }
}
