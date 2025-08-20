import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

export interface CompetencyScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-competency-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="competency-chart-container">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Análisis de Competencias
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Puntaje por competencia (0-100)
        </p>
      </div>
      
      <div class="chart-wrapper">
        <canvas baseChart
                [data]="barChartData"
                [type]="'bar'"
                [options]="barChartOptions"
                [plugins]="barChartPlugins"
                class="competency-chart">
        </canvas>
      </div>
      
      <!-- Leyenda de colores -->
      <div class="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400">Excelente (80-100)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400">Bueno (60-79)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400">Regular (40-59)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-orange-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400">Bajo (20-39)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400">Crítico (0-19)</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .competency-chart-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .chart-wrapper {
      position: relative;
      height: 400px;
      width: 100%;
    }
    
    .competency-chart {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class CompetencyBarChartComponent implements OnChanges, AfterViewInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @Input() competencyScores: CompetencyScore[] = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Puntaje de Competencias',
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Puntaje: ${context.parsed.x}/100`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB'
        }
      },
      y: {
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  public barChartPlugins = [];

  ngAfterViewInit(): void {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['competencyScores'] && this.competencyScores) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    console.log('📊 Actualizando datos del gráfico de barras:', this.competencyScores);
    
    if (!this.competencyScores || this.competencyScores.length === 0) {
      console.warn('⚠️ No hay datos de competencias, usando competencias por defecto');
      // Si no hay datos, mostrar competencias por defecto con puntaje 0
      this.competencyScores = this.getDefaultCompetencies();
    }

    // Ordenar por puntaje descendente
    const sortedScores = [...this.competencyScores].sort((a, b) => b.score - a.score);
    
    console.log('📊 Scores ordenados para el gráfico:', sortedScores);
    
    this.barChartData.labels = sortedScores.map(comp => comp.name);
    this.barChartData.datasets[0].data = sortedScores.map(comp => comp.score);
    
    // Generar colores basados en el puntaje
    this.barChartData.datasets[0].backgroundColor = sortedScores.map(comp => this.getScoreColor(comp.score));
    this.barChartData.datasets[0].borderColor = sortedScores.map(comp => this.getScoreColor(comp.score));

    console.log('📊 Datos del gráfico preparados:', this.barChartData);

    // Forzar actualización del gráfico
    if (this.chart) {
      this.chart.update();
    }
  }

  private getDefaultCompetencies(): CompetencyScore[] {
    return [
      { name: 'Pensamiento Crítico', score: 0 },
      { name: 'Resolución de Problemas', score: 0 },
      { name: 'Alfabetización de Datos', score: 0 },
      { name: 'Comunicación', score: 0 },
      { name: 'Colaboración', score: 0 },
      { name: 'Creatividad', score: 0 },
      { name: 'Diseño Tecnológico', score: 0 },
      { name: 'Automatización y Agentes', score: 0 },
      { name: 'Seguridad y Privacidad', score: 0 },
      { name: 'Ética y Responsabilidad', score: 0 },
      { name: 'Sostenibilidad', score: 0 },
      { name: 'Aprendizaje Continuo', score: 0 },
      { name: 'Liderazgo en IA', score: 0 }
    ];
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return 'rgba(34, 197, 94, 0.8)';      // Verde
    if (score >= 60) return 'rgba(59, 130, 246, 0.8)';      // Azul
    if (score >= 40) return 'rgba(234, 179, 8, 0.8)';       // Amarillo
    if (score >= 20) return 'rgba(249, 115, 22, 0.8)';      // Naranja
    return 'rgba(239, 68, 68, 0.8)';                         // Rojo
  }
}
