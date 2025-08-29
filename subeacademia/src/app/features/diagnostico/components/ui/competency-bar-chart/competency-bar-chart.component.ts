import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';

export interface CompetencyScore {
  name: string;
  score: number;
}

@Component({
  selector: 'app-competency-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, I18nTranslatePipe],
  template: `
    <div class="competency-chart-container">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-[var(--fg)] mb-2">
          {{ 'diagnostico.results.section_competencies' | i18nTranslate }}
        </h3>
        <p class="text-sm text-[var(--muted)]">
          {{ 'diagnostico.competency_chart.subtitle' | i18nTranslate }}
        </p>
        <!-- Debug info -->
        <p class="text-xs text-[var(--muted)] mt-1">
          {{ 'diagnostico.competency_chart.data_received' | i18nTranslate }}: {{ (chartData?.labels?.length || competencyScores.length || 0) }}
        </p>
      </div>
      
      <!-- Gráfico de barras con ng2-charts si hay chartData; si no, fallback HTML/CSS -->
      <ng-container *ngIf="chartData; else fallbackBars">
        <div class="bg-[var(--card)] rounded-lg p-4 shadow border border-[var(--border)]">
          <canvas baseChart
                  [data]="chartData"
                  [type]="'bar'"
                  [options]="barOptions"
                  class="max-h-[520px]">
          </canvas>
        </div>
      </ng-container>
      <ng-template #fallbackBars>
        <div class="simple-bar-chart">
          <div *ngIf="!competencyScores || competencyScores.length === 0" class="text-center py-8 text-[var(--muted)]">
            <p>{{ 'diagnostico.competency_chart.loading' | i18nTranslate }}</p>
          </div>
          <!-- Barras de competencias -->
          <div *ngFor="let item of competencyScores; let i = index" 
               class="bar-item mb-3 p-3 bg-[var(--card)] rounded-lg shadow border border-[var(--border)]">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-[var(--fg)]/80">{{ item.name }}</span>
              <span class="text-sm font-bold" [style.color]="getScoreColor(item.score)">{{ item.score }}%</span>
            </div>
            <!-- Barra de progreso -->
            <div class="w-full bg-[var(--border)] rounded-full h-4 relative">
              <div class="h-4 rounded-full transition-all duration-1000 ease-out"
                   [style.width.%]="item.score"
                   [style.background-color]="getScoreColor(item.score)">
              </div>
            </div>
          </div>
        </div>
      </ng-template>
      
      <!-- Leyenda de colores -->
      <div class="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span class="text-[var(--muted)] font-medium">{{ 'diagnostico.competency_chart.legend.excellent' | i18nTranslate }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-[var(--muted)] font-medium">{{ 'diagnostico.competency_chart.legend.good' | i18nTranslate }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span class="text-[var(--muted)] font-medium">{{ 'diagnostico.competency_chart.legend.fair' | i18nTranslate }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-orange-500 rounded mr-2"></div>
          <span class="text-[var(--muted)] font-medium">{{ 'diagnostico.competency_chart.legend.low' | i18nTranslate }}</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span class="text-[var(--muted)] font-medium">{{ 'diagnostico.competency_chart.legend.critical' | i18nTranslate }}</span>
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
  @Input() chartData?: ChartConfiguration<'bar'>['data'];

  public barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { display: false }
      },
      y: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (items: any) => {
            return items?.[0]?.label || '';
          },
          label: (item: any) => {
            const value = item?.parsed?.x ?? item?.parsed;
            return ` ${value}%`;
          }
        }
      }
    }
  };

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
