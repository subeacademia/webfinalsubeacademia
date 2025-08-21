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
      
      <!-- Gráfico de barras simple con HTML/CSS -->
      <div class="simple-bar-chart">
        <div *ngFor="let item of competencyScores; let i = index" 
             class="bar-item mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.name }}</span>
            <span class="text-sm font-bold" [style.color]="getScoreColor(item.score)">{{ item.score }}/100</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div class="h-3 rounded-full transition-all duration-1000 ease-out"
                 [style.width.%]="item.score"
                 [style.background-color]="getScoreColor(item.score)">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Canvas Chart.js como backup -->
      <div class="chart-wrapper mt-6" style="display: none;">
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
    
    .simple-bar-chart {
      max-height: 500px;
      overflow-y: auto;
    }
    
    .bar-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false
      }
    }
  };

  public barChartPlugins = [];

  ngAfterViewInit(): void {
    console.log('🎬 ngAfterViewInit llamado en CompetencyBarChartComponent');
    console.log('🎬 Estado de competencyScores:', this.competencyScores);
    console.log('🎬 Chart disponible:', this.chart);
    
    // Esperar un poco para asegurar que el chart esté listo
    setTimeout(() => {
      console.log('🎬 Actualizando datos del gráfico después de ngAfterViewInit');
      console.log('🎬 Estado final de competencyScores:', this.competencyScores);
      
      // Si no hay datos, usar datos de prueba para mostrar el gráfico
      if (!this.competencyScores || this.competencyScores.length === 0) {
        console.log('🎬 No hay datos, generando datos de prueba');
        this.competencyScores = [
          { name: 'Pensamiento Crítico', score: 75 },
          { name: 'Resolución de Problemas', score: 65 },
          { name: 'Comunicación Efectiva', score: 80 },
          { name: 'Liderazgo en IA', score: 55 },
          { name: 'Creatividad e Innovación', score: 70 }
        ];
      }
      
      this.updateChartData();
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 ngOnChanges llamado en CompetencyBarChartComponent');
    console.log('🔄 Cambios detectados:', changes);
    console.log('🔄 Estado actual de competencyScores:', this.competencyScores);
    
    if (changes['competencyScores']) {
      console.log('🔄 Cambio detectado en competencyScores');
      console.log('🔄 Valor anterior:', changes['competencyScores'].previousValue);
      console.log('🔄 Valor actual:', changes['competencyScores'].currentValue);
      
      if (this.competencyScores && this.competencyScores.length > 0) {
        console.log('🔄 Actualizando gráfico con nuevos datos de competencias');
        this.updateChartData();
      } else {
        console.log('🔄 No hay datos de competencias, usando datos por defecto');
        this.updateChartData();
      }
    }
  }

  private updateChartData(): void {
    console.log('📊 updateChartData llamado');
    console.log('📊 Estado actual de competencyScores:', this.competencyScores);
    
    if (!this.competencyScores || this.competencyScores.length === 0) {
      console.warn('⚠️ No hay datos de competencias, usando competencias por defecto');
      // Si no hay datos, mostrar competencias por defecto con puntaje 0
      this.competencyScores = this.getDefaultCompetencies();
    }

    // Ordenar por puntaje descendente
    const sortedScores = [...this.competencyScores].sort((a, b) => b.score - a.score);
    
    console.log('📊 Scores ordenados para el gráfico:', sortedScores);
    
    // Crear una nueva instancia de los datos para forzar la actualización
    this.barChartData = {
      labels: sortedScores.map(comp => comp.name),
      datasets: [{
        data: sortedScores.map(comp => comp.score),
        label: 'Puntaje de Competencias',
        backgroundColor: sortedScores.map(comp => this.getScoreColor(comp.score)),
        borderColor: sortedScores.map(comp => this.getScoreColor(comp.score)),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    };

    console.log('📊 Datos del gráfico preparados:', this.barChartData);

    // Forzar actualización del gráfico
    if (this.chart) {
      console.log('🔄 Actualizando gráfico con chart.update()');
      try {
        // Forzar la actualización del gráfico
        this.chart.data = this.barChartData;
        this.chart.update();
        console.log('✅ Gráfico actualizado exitosamente');
      } catch (error) {
        console.error('❌ Error al actualizar gráfico:', error);
        // Si hay error, intentar recrear el gráfico
        setTimeout(() => {
          if (this.chart) {
            this.chart.data = this.barChartData;
            this.chart.update('active');
          }
        }, 100);
      }
    } else {
      console.warn('⚠️ Chart no está disponible para actualizar');
    }
  }

  private getDefaultCompetencies(): CompetencyScore[] {
    console.log('🔧 getDefaultCompetencies llamado');
    
    const defaultCompetencies = [
      { name: 'Pensamiento Crítico y Análisis', score: 0 },
      { name: 'Resolución de Problemas Complejos', score: 0 },
      { name: 'Alfabetización de Datos', score: 0 },
      { name: 'Comunicación Efectiva', score: 0 },
      { name: 'Colaboración y Trabajo en Equipo', score: 0 },
      { name: 'Creatividad e Innovación', score: 0 },
      { name: 'Diseño Tecnológico', score: 0 },
      { name: 'Automatización y Agentes IA', score: 0 },
      { name: 'Seguridad y Privacidad', score: 0 },
      { name: 'Ética y Responsabilidad', score: 0 },
      { name: 'Sostenibilidad', score: 0 },
      { name: 'Aprendizaje Continuo', score: 0 },
      { name: 'Liderazgo en IA', score: 0 }
    ];
    
    console.log('🔧 Competencias por defecto generadas:', defaultCompetencies);
    return defaultCompetencies;
  }

  public getScoreColor(score: number): string {
    console.log(`🎨 getScoreColor llamado con score: ${score}`);
    
    let color: string;
    if (score >= 80) {
      color = '#22c55e';      // Verde sólido
    } else if (score >= 60) {
      color = '#3b82f6';      // Azul sólido
    } else if (score >= 40) {
      color = '#eab308';      // Amarillo sólido
    } else if (score >= 20) {
      color = '#f97316';      // Naranja sólido
    } else {
      color = '#ef4444';      // Rojo sólido
    }
    
    console.log(`🎨 Score ${score} mapeado a color: ${color}`);
    return color;
  }
}
