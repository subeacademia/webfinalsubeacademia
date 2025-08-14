import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
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

                <!-- Resumen ejecutivo -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <h3 class="text-lg font-semibold text-blue-400 mb-2">Score ARES General</h3>
                        <div class="text-3xl font-bold text-white">{{ overallAresScore() }}%</div>
                        <p class="text-gray-400 text-sm mt-2">Madurez en adopción de IA</p>
                    </div>
                    
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <h3 class="text-lg font-semibold text-green-400 mb-2">Competencias Promedio</h3>
                        <div class="text-3xl font-bold text-white">{{ averageCompetencyScore() }}/5</div>
                        <p class="text-gray-400 text-sm mt-2">Nivel de competencias digitales</p>
                    </div>
                    
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <h3 class="text-lg font-semibold text-purple-400 mb-2">Segmento</h3>
                        <div class="text-xl font-semibold text-white">{{ segmentLabel() }}</div>
                        <p class="text-gray-400 text-sm mt-2">Tipo de organización</p>
                    </div>
                </div>

                <!-- Gráficos principales -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <!-- Radar de competencias -->
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <app-radar-chart 
                            [labels]="competencyLabels"
                            [data]="competencyScores">
                        </app-radar-chart>
                    </div>

                    <!-- Semaforo ARES -->
                    <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
                        <app-semaforo-ares 
                            [aresByPhase]="aresByPhase">
                        </app-semaforo-ares>
                    </div>
                </div>

                <!-- Detalle por dimensiones ARES -->
                <div class="bg-slate-800 rounded-lg p-6 shadow-xl mb-12">
                    <h3 class="text-2xl font-bold text-white mb-6 text-center">Análisis por Dimensiones ARES</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div *ngFor="let dimension of aresDimensions" class="text-center">
                            <div class="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                 [ngClass]="getDimensionColor(dimension.score)">
                                {{ dimension.score }}%
                            </div>
                            <h4 class="font-semibold text-gray-200 mb-2">{{ dimension.name }}</h4>
                            <p class="text-sm text-gray-400">{{ dimension.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- Recomendaciones -->
                <div class="bg-slate-800 rounded-lg p-6 shadow-xl mb-12">
                    <h3 class="text-2xl font-bold text-white mb-6 text-center">Recomendaciones Prioritarias</h3>
                    <div class="space-y-4">
                        <div *ngFor="let rec of topRecommendations; let i = index" 
                             class="flex items-start gap-4 p-4 bg-slate-700 rounded-lg">
                            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {{ i + 1 }}
                            </div>
                            <div>
                                <h4 class="font-semibold text-white mb-1">{{ rec.title }}</h4>
                                <p class="text-gray-300 text-sm">{{ rec.description }}</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-xs px-2 py-1 rounded-full" 
                                          [ngClass]="getPriorityClass(rec.priority)">
                                        {{ rec.priority }}
                                    </span>
                                    <span class="text-xs text-gray-400">{{ rec.impact }}</span>
                                </div>
                            </div>
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
    @Input() aresByPhase: Record<string, AresPhaseScore> = {};
    @Input() competencyScores: number[] = [];
    @Input() competencyLabels: string[] = [];
    @Input() segment: string = '';

    // Datos de ejemplo para las dimensiones ARES
    readonly aresDimensions = [
        { name: 'Adopción', score: 65, description: 'Estrategia y roadmap de IA' },
        { name: 'Riesgos', score: 45, description: 'Gestión de riesgos y controles' },
        { name: 'Ética', score: 70, description: 'Principios éticos y sesgos' },
        { name: 'Seguridad', score: 55, description: 'Privacidad y protección de datos' },
        { name: 'Capacidad', score: 60, description: 'Desarrollo y operación de IA' },
        { name: 'Datos', score: 75, description: 'Calidad y gobierno de datos' }
    ];

    // Recomendaciones de ejemplo
    readonly topRecommendations = [
        {
            title: 'Implementar Framework de Gobernanza',
            description: 'Establecer roles claros y políticas para la toma de decisiones en IA',
            priority: 'Alta',
            impact: 'Impacto Alto'
        },
        {
            title: 'Capacitación en Ética de IA',
            description: 'Desarrollar programas de formación sobre principios éticos y sesgos',
            priority: 'Media',
            impact: 'Impacto Medio'
        },
        {
            title: 'Mejorar Seguridad de Datos',
            description: 'Implementar controles de privacidad y acceso a datos',
            priority: 'Alta',
            impact: 'Impacto Alto'
        }
    ];

    // Computed properties
    readonly overallAresScore = computed(() => {
        const totalScore = Object.values(this.aresByPhase).reduce((sum, phase) => sum + phase.score, 0);
        const totalMax = Object.values(this.aresByPhase).reduce((sum, phase) => sum + phase.total, 0);
        return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    });

    readonly averageCompetencyScore = computed(() => {
        if (this.competencyScores.length === 0) return 0;
        const sum = this.competencyScores.reduce((acc, score) => acc + score, 0);
        return (sum / this.competencyScores.length).toFixed(1);
    });

    readonly segmentLabel = computed(() => {
        const segmentMap: Record<string, string> = {
            'empresa': 'Empresa Privada',
            'educacion_superior': 'Educación Superior',
            'educacion_escolar': 'Educación Escolar',
            'profesional_independiente': 'Profesional Independiente'
        };
        return segmentMap[this.segment] || this.segment;
    });

    getDimensionColor(score: number): string {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-yellow-500';
        if (score >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    }

    getPriorityClass(priority: string): string {
        const classes = {
            'Alta': 'bg-red-600 text-white',
            'Media': 'bg-yellow-600 text-white',
            'Baja': 'bg-green-600 text-white'
        };
        return classes[priority as keyof typeof classes] || 'bg-gray-600 text-white';
    }
}
