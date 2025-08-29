import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';

interface CompetencyScore {
  name: string;
  score: number;
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


