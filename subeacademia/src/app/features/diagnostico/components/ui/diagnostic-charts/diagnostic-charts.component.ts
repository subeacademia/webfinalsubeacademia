import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

export interface CompetencyScore {
  name: string;
  score: number;
  category: string;
  description: string;
}

export interface AresScore {
  analisis: number;
  responsabilidad: number;
  estrategia: number;
  sistemas: number;
}

@Component({
  selector: 'app-diagnostic-charts',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <!-- 📊 COMPONENTE DE GRÁFICOS DEL DIAGNÓSTICO -->
    <div class="space-y-8">
      
      <!-- 🎯 GRÁFICO RADAR DE COMPETENCIAS -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Mapa de Competencias
        </h3>
        
        <div class="flex justify-center">
          <ngx-charts-polar-chart
            [results]="radarChartData"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="false"
            [showYAxisLabel]="false"
            [autoScale]="true"
            [scheme]="colorScheme"
            [view]="radarView"
            [gradient]="true"
            [tooltipDisabled]="false"
            [animations]="true">
          </ngx-charts-polar-chart>
        </div>
        
        <!-- Leyenda de colores -->
        <div class="flex flex-wrap justify-center gap-4 mt-6">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">Competencias Clave</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">Áreas Fuertes</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">Áreas de Mejora</span>
          </div>
        </div>
      </div>

      <!-- 📈 GRÁFICO DE BARRAS HORIZONTAL -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Ranking de Competencias
        </h3>
        
        <div class="flex justify-center">
          <ngx-charts-bar-horizontal
            [results]="barChartData"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="true"
            [showYAxisLabel]="true"
            [xAxisLabel]="'Puntaje'"
            [yAxisLabel]="'Competencia'"
            [scheme]="colorScheme"
            [view]="barView"
            [gradient]="true"
            [tooltipDisabled]="false"
            [animations]="true">
          </ngx-charts-bar-horizontal>
        </div>
      </div>

      <!-- 🎨 GRÁFICO DE DONA PARA FRAMEWORK ARES -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Framework ARES
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Gráfico de dona -->
          <div class="flex justify-center">
            <ngx-charts-pie-chart
              [results]="aresChartData"
              [scheme]="aresColorScheme"
              [view]="pieView"
              [gradient]="true"
              [tooltipDisabled]="false"
              [animations]="true"
              [doughnut]="true"
              [arcWidth]="0.6">
            </ngx-charts-pie-chart>
          </div>
          
          <!-- Métricas detalladas -->
          <div class="space-y-4">
            <div *ngFor="let item of aresChartData" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-4 h-4 rounded-full" [style.background-color]="getAresColor(item.name)"></div>
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold" [style.color]="getAresColor(item.name)">
                  {{ item.value }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">/ 100</div>
              </div>
            </div>
            
            <!-- Puntaje total -->
            <div class="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center">
              <div class="text-sm opacity-90">Puntaje Total ARES</div>
              <div class="text-3xl font-bold">{{ getTotalAresScore() }}</div>
              <div class="text-sm opacity-90">de 400 puntos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🏆 COMPETENCIAS DESTACADAS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Top 3 Competencias -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
            🏆 Top 3 Competencias
          </h3>
          
          <div class="space-y-3">
            <div *ngFor="let comp of topCompetencies; let i = index" 
                 class="flex items-center space-x-3 p-3 rounded-lg"
                 [ngClass]="getTopCompetencyClass(i)">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                   [ngClass]="getTopCompetencyBadgeClass(i)">
                {{ i + 1 }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-800 dark:text-gray-200">{{ comp.name }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ comp.description }}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold" [ngClass]="getTopCompetencyScoreClass(i)">
                  {{ comp.score }}
                </div>
                <div class="text-xs text-gray-500">/100</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Áreas de Oportunidad -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
            💡 Áreas de Oportunidad
          </h3>
          
          <div class="space-y-3">
            <div *ngFor="let comp of lowestCompetencies; let i = index" 
                 class="flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                {{ i + 1 }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-800 dark:text-gray-200">{{ comp.name }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ comp.description }}</div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-red-600 dark:text-red-400">
                  {{ comp.score }}
                </div>
                <div class="text-xs text-gray-500">/100</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Personalización de ngx-charts */
    ::ng-deep .ngx-charts {
      font-family: inherit;
    }
    
    ::ng-deep .ngx-charts .line-series .line {
      stroke-width: 3;
    }
    
    ::ng-deep .ngx-charts .bar {
      stroke-width: 0;
    }
    
    /* Animaciones personalizadas */
    .chart-container {
      transition: all 0.3s ease;
    }
    
    .chart-container:hover {
      transform: translateY(-2px);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .radarView, .barView, .pieView {
        width: 100% !important;
        height: 300px !important;
      }
    }
  `]
})
export class DiagnosticChartsComponent implements OnInit {
  @Input() competencyScores: CompetencyScore[] = [];
  @Input() aresScores: AresScore | null = null;
  
  // Configuración de gráficos
  radarView: [number, number] = [600, 400];
  barView: [number, number] = [600, 400];
  pieView: [number, number] = [400, 300];
  
  // Esquemas de colores
  colorScheme: Color = {
    name: 'competencies',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
  };
  
  aresColorScheme: Color = {
    name: 'ares',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#22c55e', '#eab308', '#ef4444']
  };
  
  // Datos computados para los gráficos
  get radarChartData(): any[] {
    return this.prepareRadarChartData();
  }
  
  get barChartData(): any[] {
    return this.prepareBarChartData();
  }
  
  get aresChartData(): any[] {
    return this.prepareAresChartData();
  }
  
  // Competencias destacadas
  get topCompetencies(): CompetencyScore[] {
    return [...this.competencyScores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }
  
  get lowestCompetencies(): CompetencyScore[] {
    return [...this.competencyScores]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }
  
  ngOnInit(): void {
    // Ajustar vistas según el tamaño de pantalla
    this.adjustChartViews();
    window.addEventListener('resize', () => this.adjustChartViews());
  }
  
  private adjustChartViews(): void {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.radarView = [350, 300];
      this.barView = [350, 300];
      this.pieView = [300, 250];
    } else {
      this.radarView = [600, 400];
      this.barView = [600, 400];
      this.pieView = [400, 300];
    }
  }
  
  private prepareRadarChartData(): any[] {
    if (!this.competencyScores.length) return [];
    
    return this.competencyScores.map(comp => ({
      name: comp.name,
      series: [{
        name: 'Puntaje',
        value: comp.score
      }]
    }));
  }
  
  private prepareBarChartData(): any[] {
    if (!this.competencyScores.length) return [];
    
    return this.competencyScores
      .sort((a, b) => b.score - a.score)
      .map(comp => ({
        name: comp.name,
        value: comp.score
      }));
  }
  
  private prepareAresChartData(): any[] {
    if (!this.aresScores) return [];
    
    return [
      { name: 'Análisis', value: this.aresScores.analisis },
      { name: 'Responsabilidad', value: this.aresScores.responsabilidad },
      { name: 'Estrategia', value: this.aresScores.estrategia },
      { name: 'Sistemas', value: this.aresScores.sistemas }
    ];
  }
  
  getTotalAresScore(): number {
    if (!this.aresScores) return 0;
    return this.aresScores.analisis + this.aresScores.responsabilidad + 
           this.aresScores.estrategia + this.aresScores.sistemas;
  }
  
  getAresColor(name: string): string {
    const colors: { [key: string]: string } = {
      'Análisis': '#3b82f6',
      'Responsabilidad': '#22c55e',
      'Estrategia': '#eab308',
      'Sistemas': '#ef4444'
    };
    return colors[name] || '#6b7280';
  }
  
  getTopCompetencyClass(index: number): string {
    const classes = [
      'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800',
      'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-200 dark:border-gray-800',
      'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800'
    ];
    return classes[index] || classes[0];
  }
  
  getTopCompetencyBadgeClass(index: number): string {
    const classes = [
      'bg-gradient-to-br from-yellow-400 to-amber-500',
      'bg-gradient-to-br from-gray-400 to-slate-500',
      'bg-gradient-to-br from-orange-400 to-red-500'
    ];
    return classes[index] || classes[0];
  }
  
  getTopCompetencyScoreClass(index: number): string {
    const classes = [
      'text-yellow-600 dark:text-yellow-400',
      'text-gray-600 dark:text-gray-400',
      'text-orange-600 dark:text-orange-400'
    ];
    return classes[index] || classes[0];
  }
}
