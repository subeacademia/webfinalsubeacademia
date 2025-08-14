import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemaforoAresComponent, AresPhaseScore } from './semaforo-ares.component';
import { RadarChartComponent } from './radar-chart.component';

@Component({
	selector: 'app-diagnostic-results',
	standalone: true,
	imports: [CommonModule, SemaforoAresComponent, RadarChartComponent],
    template: `
        <div class="min-h-screen bg-gray-900 text-white p-6">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-white mb-4">Resultados del Diagnóstico</h1>
                    <p class="text-xl text-gray-300">Análisis completo de tu madurez en IA y competencias digitales</p>
                </div>

                <!-- Tarjeta Principal - Tu Nivel de Madurez General (2 columnas) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="bg-slate-800 rounded-lg p-8 shadow-xl">
                        <h3 class="text-2xl font-bold text-blue-400 mb-4">Score ARES General</h3>
                        <div class="text-5xl font-bold text-white mb-4">{{ overallAresScore() }}%</div>
                        <p class="text-gray-300 text-lg">Madurez en adopción de IA</p>
                        <div class="mt-6">
                            <div class="w-full bg-gray-700 rounded-full h-4">
                                <div class="bg-blue-500 h-4 rounded-full transition-all duration-1000" [style.width.%]="overallAresScore()"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800 rounded-lg p-8 shadow-xl">
                        <h3 class="text-2xl font-bold text-green-400 mb-4">Competencias Promedio</h3>
                        <div class="text-5xl font-bold text-white mb-4">{{ averageCompetencyScore() }}/5</div>
                        <p class="text-gray-300 text-lg">Nivel de competencias digitales</p>
                        <div class="mt-6">
                            <div class="w-full bg-gray-700 rounded-full h-4">
                                <div class="bg-green-500 h-4 rounded-full transition-all duration-1000" [style.width.%]="competencyProgress()"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráficos principales -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <!-- Radar de competencias -->
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <app-radar-chart 
                            [labels]="competencyLabels()"
                            [data]="competencyScores()">
                        </app-radar-chart>
                    </div>

                    <!-- Semaforo ARES -->
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <app-semaforo-ares 
                            [aresByPhase]="aresByPhase()">
                        </app-semaforo-ares>
                    </div>
                </div>

                <!-- Fortalezas y Oportunidades (1 columna cada una) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="bg-slate-800 rounded-lg p-8 shadow-xl">
                        <h3 class="text-2xl font-bold text-green-400 mb-6">Fortalezas Principales</h3>
                        <div class="space-y-4">
                            <div *ngFor="let strength of topStrengths()" class="flex items-center gap-3">
                                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span class="text-gray-200">{{ strength }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800 rounded-lg p-8 shadow-xl">
                        <h3 class="text-2xl font-bold text-orange-400 mb-6">Oportunidades de Mejora</h3>
                        <div class="space-y-4">
                            <div *ngFor="let opportunity of topOpportunities()" class="flex items-center gap-3">
                                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span class="text-gray-200">{{ opportunity }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Plan de Inicio (3 columnas) -->
                <div class="bg-slate-800 rounded-lg p-8 shadow-xl mb-12">
                    <h3 class="text-2xl font-bold text-white mb-6 text-center">Plan de Inicio Recomendado</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
                            <h4 class="font-semibold text-gray-200 mb-2">Inmediato (0-30 días)</h4>
                            <p class="text-sm text-gray-400">Implementar controles básicos de seguridad y ética</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
                            <h4 class="font-semibold text-gray-200 mb-2">Corto Plazo (1-3 meses)</h4>
                            <p class="text-sm text-gray-400">Desarrollar framework de gobernanza y políticas</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
                            <h4 class="font-semibold text-gray-200 mb-2">Mediano Plazo (3-6 meses)</h4>
                            <p class="text-sm text-gray-400">Capacitación del equipo y pilotos de IA</p>
                        </div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="text-center">
                    <button class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors duration-200 mr-4">
                        Descargar Reporte PDF
                    </button>
                    <button class="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition-colors duration-200">
                        Agendar Consultoría
                    </button>
                </div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticResultsComponent {
    // Datos de ejemplo para demostración
    readonly aresByPhase = computed(() => ({
        'F1': { score: 15, total: 20, items: [] },
        'F2': { score: 12, total: 20, items: [] },
        'F3': { score: 18, total: 20, items: [] },
        'F4': { score: 14, total: 20, items: [] },
        'F5': { score: 10, total: 20, items: [] }
    }));

    readonly competencyScores = computed(() => [4, 3, 5, 2, 4, 3, 4, 5, 3, 4, 3, 4, 3]);
    readonly competencyLabels = computed(() => [
        'Pensamiento Crítico', 'Resolución de Problemas', 'Alfabetización de Datos',
        'Comunicación', 'Colaboración', 'Creatividad', 'Diseño Tecnológico',
        'Automatización', 'Seguridad', 'Ética', 'Sostenibilidad', 'Aprendizaje', 'Liderazgo'
    ]);

    readonly topStrengths = computed(() => [
        'Alfabetización de Datos',
        'Diseño Tecnológico',
        'Automatización',
        'Liderazgo en IA'
    ]);

    readonly topOpportunities = computed(() => [
        'Resolución de Problemas',
        'Creatividad',
        'Sostenibilidad',
        'Aprendizaje Continuo'
    ]);

    // Computed properties
    readonly overallAresScore = computed(() => {
        const totalScore = Object.values(this.aresByPhase()).reduce((sum, phase) => sum + phase.score, 0);
        const totalMax = Object.values(this.aresByPhase()).reduce((sum, phase) => sum + phase.total, 0);
        return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    });

    readonly averageCompetencyScore = computed(() => {
        if (this.competencyScores().length === 0) return 0;
        const sum = this.competencyScores().reduce((acc, score) => acc + score, 0);
        return (sum / this.competencyScores().length).toFixed(1);
    });

    readonly competencyProgress = computed(() => {
        const avg = parseFloat(this.averageCompetencyScore() as string);
        return (avg / 5) * 100;
    });
}
