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
  selector: 'app-competency-ranking',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe],
  template: `
    <div class="competency-ranking-container bg-[var(--card)] rounded-lg p-6 shadow-xl border border-[var(--border)]">
      <div class="flex items-center mb-4">
        <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[var(--fg)]">Ranking de Competencias</h3>
      </div>
      
      <p class="text-sm text-[var(--muted)] mb-6">Comparativa de rendimiento por competencia</p>
      
      <!-- Gráfico de Barras Horizontales -->
      <div class="chart-container relative" style="height: 500px;">
        <canvas #rankingCanvas></canvas>
        
        <!-- Estado de carga -->
        <div *ngIf="!competencyScores || competencyScores.length === 0" 
             class="absolute inset-0 flex items-center justify-center bg-[var(--card)] rounded-lg">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p class="text-[var(--muted)]">Calculando ranking...</p>
          </div>
        </div>
      </div>
      
      <!-- Top 5 Competencias -->
      <div *ngIf="competencyScores && competencyScores.length > 0" class="mt-6">
        <h4 class="text-lg font-semibold text-[var(--fg)] mb-4">Top 5 Competencias</h4>
        <div class="space-y-3">
          <div *ngFor="let item of getTopCompetencies(); let i = index" 
               class="flex items-center p-3 bg-[var(--panel)] rounded-lg border border-[var(--border)]">
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold text-sm"
                 [style.background-color]="getRankingColor(i)">
              {{ i + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-[var(--fg)]">{{ item.name }}</div>
              <div class="text-xs text-[var(--muted)]">{{ item.description || 'Sin descripción' }}</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold" [style.color]="getScoreColor(item.score)">{{ item.score }}%</div>
              <div class="text-xs text-[var(--muted)]">{{ getCompetencyLevel(item.score) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Áreas de Mejora -->
      <div *ngIf="competencyScores && competencyScores.length > 0" class="mt-6">
        <h4 class="text-lg font-semibold text-[var(--fg)] mb-4">Áreas de Mejora</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div *ngFor="let item of getLowestCompetencies()" 
               class="p-3 bg-[var(--panel)] rounded-lg border border-[var(--border)]">
            <div class="flex justify-between items-start mb-2">
              <div class="font-medium text-[var(--fg)] text-sm">{{ item.name }}</div>
              <div class="text-sm font-bold text-orange-500">{{ item.score }}%</div>
            </div>
            <div class="w-full bg-[var(--border)] rounded-full h-2">
              <div class="h-2 rounded-full bg-orange-500 transition-all duration-1000"
                   [style.width.%]="item.score"></div>
            </div>
            <div class="text-xs text-[var(--muted)] mt-1">{{ getCompetencyLevel(item.score) }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .competency-ranking-container {
      min-height: 600px;
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
export class CompetencyRankingComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() competencyScores: CompetencyScore[] = [];
  @ViewChild('rankingCanvas', { static: false }) rankingCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;
  private chartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  ngOnInit(): void {
    console.log('📊 CompetencyRankingComponent.ngOnInit() - data:', this.competencyScores);
  }

  ngAfterViewInit(): void {
    console.log('🎯 CompetencyRankingComponent.ngAfterViewInit() - data:', this.competencyScores);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 CompetencyRankingComponent.ngOnChanges() - changes:', changes);
    if (changes['competencyScores'] && this.rankingCanvas) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.rankingCanvas || !this.competencyScores || this.competencyScores.length === 0) {
      return;
    }

    // Destruir gráfico existente
    if (this.chart) {
      this.chart.destroy();
    }

    // Ordenar competencias por puntuación (descendente)
    const sortedScores = [...this.competencyScores].sort((a, b) => b.score - a.score);
    
    // Preparar datos para el gráfico de barras horizontales
    const labels = sortedScores.map(item => item.name);
    const scores = sortedScores.map(item => item.score);
    const colors = sortedScores.map(item => this.getScoreColor(item.score));

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Puntuación',
          data: scores,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: this.chartData,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: 'var(--muted)',
              font: {
                size: 10
              }
            }
          },
          y: {
            grid: {
              display: false
            },
                         ticks: {
               color: 'var(--fg)',
               font: {
                 size: 11,
                 weight: 500
               },
               callback: function(value, index) {
                 const chartLabels = labels;
                 const label = chartLabels[index] || '';
                 return label.length > 20 ? label.substring(0, 20) + '...' : label;
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
                return `Puntuación: ${item.parsed.x}%`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(this.rankingCanvas.nativeElement, config);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#22c55e';      // Verde
    if (score >= 60) return '#3b82f6';      // Azul
    if (score >= 40) return '#eab308';      // Amarillo
    if (score >= 20) return '#f97316';      // Naranja
    return '#ef4444';                       // Rojo
  }

  getRankingColor(rank: number): string {
    const colors = ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#78350f'];
    return colors[rank] || '#6b7280';
  }

  getCompetencyLevel(score: number): string {
    if (score >= 80) return 'Experto';
    if (score >= 60) return 'Avanzado';
    if (score >= 40) return 'Intermedio';
    if (score >= 20) return 'Básico';
    return 'Incipiente';
  }

  getTopCompetencies(): CompetencyScore[] {
    if (!this.competencyScores || this.competencyScores.length === 0) return [];
    return [...this.competencyScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  getLowestCompetencies(): CompetencyScore[] {
    if (!this.competencyScores || this.competencyScores.length === 0) return [];
    return [...this.competencyScores]
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);
  }
}
