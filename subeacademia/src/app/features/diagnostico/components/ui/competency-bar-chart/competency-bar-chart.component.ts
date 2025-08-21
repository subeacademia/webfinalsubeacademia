import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CompetencyScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-competency-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="competency-chart-container">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Análisis de Competencias
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Porcentaje de competencia por área
        </p>
        <!-- Debug info -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Datos recibidos: {{ competencyScores.length || 0 }} competencias
        </p>
      </div>
      
      <!-- Gráfico de barras simple con HTML/CSS -->
      <div class="simple-bar-chart">
        <div *ngIf="!competencyScores || competencyScores.length === 0" class="text-center py-8 text-gray-500">
          <p>Cargando competencias...</p>
        </div>
        
        <!-- Barras de competencias -->
        <div *ngFor="let item of competencyScores; let i = index" 
             class="bar-item mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.name }}</span>
            <span class="text-sm font-bold" [style.color]="getScoreColor(item.score)">{{ item.score }}%</span>
          </div>
          
          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 relative">
            <div class="h-4 rounded-full transition-all duration-1000 ease-out"
                 [style.width.%]="item.score"
                 [style.background-color]="getScoreColor(item.score)">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Leyenda de colores -->
      <div class="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400 font-medium">Excelente (80-100)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400 font-medium">Bueno (60-79)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400 font-medium">Regular (40-59)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-orange-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400 font-medium">Bajo (20-39)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span class="text-gray-600 dark:text-gray-400 font-medium">Crítico (0-19)</span>
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
    
    .bar-item {
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .bar-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    /* Asegurar que las barras sean visibles */
    .bar-item .h-4 {
      min-height: 16px;
      background-color: #e5e7eb;
      border-radius: 9999px;
    }
    
    .bar-item .h-4 > div {
      min-height: 16px;
      border-radius: 9999px;
      transition: width 1s ease-out;
    }
  `]
})
export class CompetencyBarChartComponent implements OnChanges {
  @Input() competencyScores: CompetencyScore[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 ngOnChanges llamado en CompetencyBarChartComponent');
    console.log('🔄 Cambios detectados:', changes);
    console.log('🔄 Estado actual de competencyScores:', this.competencyScores);
    console.log('🔄 Tipo de competencyScores:', typeof this.competencyScores);
    console.log('🔄 Es array?', Array.isArray(this.competencyScores));
    
    if (changes['competencyScores']) {
      console.log('🔄 Cambio detectado en competencyScores');
      console.log('🔄 Valor anterior:', changes['competencyScores'].previousValue);
      console.log('🔄 Valor actual:', changes['competencyScores'].currentValue);
      
      if (this.competencyScores && this.competencyScores.length > 0) {
        console.log('🔄 Actualizando gráfico con nuevos datos de competencias');
        console.log('🔄 Primera competencia:', this.competencyScores[0]);
        console.log('🔄 Última competencia:', this.competencyScores[this.competencyScores.length - 1]);
      } else {
        console.log('🔄 No hay datos de competencias');
      }
    }
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
