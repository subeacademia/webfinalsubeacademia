import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';

interface CompetencyScore {
  name: string;
  score: number;
}

interface AresPhaseScore {
  phase: string;
  score: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

@Component({
	selector: 'app-radar-chart',
    standalone: true,
    imports: [CommonModule, I18nTranslatePipe],
    template: `
        <div id="radarChart" class="bg-[var(--card)] rounded-lg p-6 shadow-xl border border-[var(--border)]">
            <h3 class="text-lg font-semibold text-center text-[var(--fg)] mb-4">{{ 'diagnostico.radar.title' | i18nTranslate }}</h3>
            
            <!-- Gráfico de barras simple como fallback -->
            <div class="space-y-3">
                <div *ngFor="let item of data" class="flex items-center space-x-3 group">
                    <div class="w-24 text-sm text-[var(--muted)] truncate" [title]="item.name">{{ item.name }}</div>
                    <div class="flex-1 bg-[var(--border)] rounded-full h-3 relative">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                             [style.width.%]="item.score"></div>
                        <div class="absolute right-1 -top-8 px-2 py-1 text-xs bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {{ item.score }}%
                        </div>
                    </div>
                    <div class="w-12 text-right text-sm font-semibold text-[var(--fg)]/80">{{ item.score }}</div>
                </div>
            </div>

            <!-- Estado vacío -->
            <div *ngIf="!data || data.length === 0" class="text-center text-[var(--muted)] text-sm mt-8">
                <svg class="mx-auto h-12 w-12 text-[color-mix(in_srgb,_var(--fg),_transparent_50%)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p>{{ 'diagnostico.radar.no_data' | i18nTranslate }}</p>
                <p class="text-xs mt-2">{{ 'diagnostico.radar.complete_prompt' | i18nTranslate }}</p>
            </div>

            <!-- Debug info -->
            <div *ngIf="data && data.length > 0" class="mt-6 p-3 bg-[var(--panel)] rounded text-xs text-[var(--muted)] border border-[var(--border)]">
                <div class="font-semibold mb-2">{{ 'diagnostico.radar.debug' | i18nTranslate }}</div>
                <div>{{ 'diagnostico.radar.total' | i18nTranslate }}: {{ data.length }}</div>
                <div>{{ 'diagnostico.radar.avg' | i18nTranslate }}: {{ getAverageScore() | number:'1.0-0' }}</div>
                <div>{{ 'diagnostico.radar.max' | i18nTranslate }}: {{ getMaxScore() }}</div>
                <div>{{ 'diagnostico.radar.min' | i18nTranslate }}: {{ getMinScore() }}</div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent implements OnChanges, OnInit, AfterViewInit {
    @Input() data: CompetencyScore[] = [];

    ngOnInit(): void {
        console.log('🚀 RadarChartComponent.ngOnInit() - data:', this.data);
    }

    ngAfterViewInit(): void {
        console.log('🎯 RadarChartComponent.ngAfterViewInit() - data:', this.data);
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('🔄 RadarChartComponent.ngOnChanges() - changes:', changes);
        if (changes['data']) {
            console.log('📊 Datos cambiaron:', this.data);
        }
    }

    getAverageScore(): number {
        if (!this.data || this.data.length === 0) return 0;
        const sum = this.data.reduce((acc, item) => acc + item.score, 0);
        return sum / this.data.length;
    }

    getMaxScore(): number {
        if (!this.data || this.data.length === 0) return 0;
        return Math.max(...this.data.map(item => item.score));
    }

    getMinScore(): number {
        if (!this.data || this.data.length === 0) return 0;
        return Math.min(...this.data.map(item => item.score));
    }
}

// Componente especializado para el gráfico de radar de fases ARES
@Component({
    selector: 'app-ares-radar-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="bg-gradient-to-r from-slate-900/50 to-gray-900/50 border border-slate-600/30 rounded-xl p-6 shadow-xl">
            <h3 class="text-xl font-bold text-slate-200 mb-6 text-center">🔄 Radar de Fases ARES-AI</h3>
            
            <!-- Gráfico de radar visual -->
            <div class="flex justify-center mb-6">
                <div class="relative w-80 h-80">
                    <!-- Círculos concéntricos -->
                    <div class="absolute inset-0 border-2 border-slate-600/30 rounded-full"></div>
                    <div class="absolute inset-4 border-2 border-slate-600/20 rounded-full"></div>
                    <div class="absolute inset-8 border-2 border-slate-600/10 rounded-full"></div>
                    <div class="absolute inset-12 border-2 border-slate-600/5 rounded-full"></div>
                    
                    <!-- Líneas de ejes -->
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-0.5 bg-slate-600/20 transform rotate-0"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-0.5 bg-slate-600/20 transform rotate-72"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-0.5 bg-slate-600/20 transform rotate-144"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-0.5 bg-slate-600/20 transform rotate-216"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-full h-0.5 bg-slate-600/20 transform rotate-288"></div>
                    </div>
                    
                    <!-- Puntos de datos -->
                    <div *ngFor="let item of aresData; let i = index" 
                         class="absolute w-4 h-4 rounded-full transition-all duration-1000 transform -translate-x-2 -translate-y-2"
                         [ngClass]="getDataPointClass(item.riskLevel)"
                         [style.left.%]="getDataPointPosition(i, item.score).x"
                         [style.top.%]="getDataPointPosition(i, item.score).y">
                        <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div class="text-xs font-medium text-slate-200">{{ item.phase }}</div>
                            <div class="text-xs text-slate-400">{{ item.score }}%</div>
                        </div>
                    </div>
                    
                    <!-- Área del radar -->
                    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <polygon 
                            [attr.points]="getPolygonPoints()"
                            fill="url(#gradient)"
                            fill-opacity="0.3"
                            stroke="url(#gradient)"
                            stroke-width="2"
                            class="transition-all duration-1000">
                        </polygon>
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            
            <!-- Leyenda de fases -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div *ngFor="let item of aresData; let i = index" 
                     class="text-center p-3 rounded-lg transition-all duration-300"
                     [ngClass]="getLegendItemClass(item.riskLevel)">
                    <div class="text-lg font-bold mb-1" [ngClass]="getLegendTextClass(item.riskLevel)">
                        {{ item.phase }}
                    </div>
                    <div class="text-sm opacity-80" [ngClass]="getLegendTextClass(item.riskLevel)">
                        {{ item.score }}%
                    </div>
                    <div class="text-xs opacity-60 mt-1" [ngClass]="getLegendTextClass(item.riskLevel)">
                        {{ item.description }}
                    </div>
                </div>
            </div>
            
            <!-- Resumen de madurez -->
            <div class="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <div class="text-center">
                    <div class="text-2xl font-bold text-slate-200 mb-2">
                        Madurez ARES: {{ getMaturityLevel() }}
                    </div>
                    <div class="text-sm text-slate-400">
                        {{ getMaturityDescription() }}
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AresRadarChartComponent implements OnInit {
    @Input() aresData: AresPhaseScore[] = [];

    ngOnInit(): void {
        console.log('🚀 AresRadarChartComponent.ngOnInit() - aresData:', this.aresData);
    }

    getDataPointPosition(index: number, score: number): { x: number; y: number } {
        // Calcular posición en el radar (5 ejes)
        const angle = (index * 72 - 90) * (Math.PI / 180); // -90 para alinear con el eje superior
        const radius = (score / 100) * 35; // 35% del radio máximo
        
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        
        return { x, y };
    }

    getPolygonPoints(): string {
        if (!this.aresData || this.aresData.length === 0) return '';
        
        const points = this.aresData.map((item, index) => {
            const pos = this.getDataPointPosition(index, item.score);
            return `${pos.x},${pos.y}`;
        });
        
        return points.join(' ');
    }

    getDataPointClass(riskLevel: string): string {
        const classes = {
            low: 'bg-green-500 shadow-lg shadow-green-500/50',
            medium: 'bg-blue-500 shadow-lg shadow-blue-500/50',
            high: 'bg-yellow-500 shadow-lg shadow-yellow-500/50',
            critical: 'bg-red-500 shadow-lg shadow-red-500/50'
        };
        return classes[riskLevel as keyof typeof classes] || classes.medium;
    }

    getLegendItemClass(riskLevel: string): string {
        const classes = {
            low: 'bg-green-900/20 border border-green-600/30',
            medium: 'bg-blue-900/20 border border-blue-600/30',
            high: 'bg-yellow-900/20 border border-yellow-600/30',
            critical: 'bg-red-900/20 border border-red-600/30'
        };
        return classes[riskLevel as keyof typeof classes] || classes.medium;
    }

    getLegendTextClass(riskLevel: string): string {
        const classes = {
            low: 'text-green-200',
            medium: 'text-blue-200',
            high: 'text-yellow-200',
            critical: 'text-red-200'
        };
        return classes[riskLevel as keyof typeof classes] || classes.medium;
    }

    getMaturityLevel(): string {
        if (!this.aresData || this.aresData.length === 0) return 'No disponible';
        
        const avgScore = this.aresData.reduce((sum, item) => sum + item.score, 0) / this.aresData.length;
        
        if (avgScore >= 80) return 'Líder';
        if (avgScore >= 60) return 'Avanzado';
        if (avgScore >= 40) return 'Intermedio';
        if (avgScore >= 20) return 'Básico';
        return 'Incipiente';
    }

    getMaturityDescription(): string {
        const level = this.getMaturityLevel();
        const descriptions = {
            'Líder': 'Excelencia operativa en implementación de IA responsable',
            'Avanzado': 'Implementación sólida con áreas de mejora específicas',
            'Intermedio': 'Base aceptable, prioriza mejoras incrementales',
            'Básico': 'Implementación inicial, requiere fundamentos sólidos',
            'Incipiente': 'Sin implementación, acción inmediata requerida'
        };
        return descriptions[level as keyof typeof descriptions] || 'Descripción no disponible';
    }
}


