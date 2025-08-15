import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemaforoAresComponent, AresPhaseScore } from './semaforo-ares.component';
import { RadarChartComponent } from './radar-chart.component';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { ThemeService } from '../../../../shared/theme.service';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';

@Component({
	selector: 'app-diagnostic-results',
	standalone: true,
	imports: [CommonModule, SemaforoAresComponent, RadarChartComponent, I18nTranslatePipe],
    template: `
        <div class="min-h-screen bg-gray-900 dark:bg-gray-900 text-white p-6 transition-colors duration-300">
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-white dark:text-white mb-4">Resultados del Diagnóstico</h1>
                    <p class="text-xl text-gray-300 dark:text-gray-400">Análisis completo de tu madurez en IA y competencias digitales</p>
                </div>

                <!-- Tarjeta Principal - Tu Nivel de Madurez General (2 columnas) -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700 dark:border-slate-600">
                        <h3 class="text-2xl font-bold text-blue-400 dark:text-blue-300 mb-4">Score ARES General</h3>
                        <div class="text-5xl font-bold text-white dark:text-white mb-4">{{ overallAresScore() }}%</div>
                        <p class="text-gray-300 dark:text-gray-400 text-lg">{{ getAresLevelDescription() }}</p>
                        <div class="mt-6">
                            <div class="w-full bg-gray-700 dark:bg-gray-600 rounded-full h-4">
                                <div class="bg-blue-500 dark:bg-blue-400 h-4 rounded-full transition-all duration-1000" [style.width.%]="overallAresScore()"></div>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-gray-400 dark:text-gray-500">
                            <p><strong>Fase actual:</strong> {{ getCurrentPhase() }}</p>
                            <p><strong>Próximo hito:</strong> {{ getNextMilestone() }}</p>
                        </div>
                    </div>
                    
                    <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700 dark:border-slate-600">
                        <h3 class="text-2xl font-bold text-green-400 dark:text-green-300 mb-4">Competencias Promedio</h3>
                        <div class="text-5xl font-bold text-white dark:text-white mb-4">{{ averageCompetencyScore() }}/5</div>
                        <p class="text-gray-300 dark:text-gray-400 text-lg">{{ getCompetencyLevelDescription() }}</p>
                        <div class="mt-6">
                            <div class="w-full bg-gray-700 dark:bg-gray-600 rounded-full h-4">
                                <div class="bg-green-500 dark:bg-green-400 h-4 rounded-full transition-all duration-1000" [style.width.%]="competencyProgress()"></div>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-gray-400 dark:text-gray-500">
                            <p><strong>Fortalezas:</strong> {{ getTopCompetencyStrengths() }}</p>
                            <p><strong>Áreas de mejora:</strong> {{ getTopCompetencyWeaknesses() }}</p>
                        </div>
                    </div>
                </div>

                <!-- Gráficos principales -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <!-- Radar de competencias -->
                    <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700 dark:border-slate-600">
                        <h3 class="text-xl font-semibold text-center text-gray-200 dark:text-gray-200 mb-4">Perfil de Competencias</h3>
                        <app-radar-chart 
                            [labels]="competencyLabels()"
                            [data]="competencyScores()">
                        </app-radar-chart>
                    </div>

                    <!-- Semaforo ARES -->
                    <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700 dark:border-slate-600">
                        <h3 class="text-xl font-semibold text-center text-gray-200 dark:text-gray-200 mb-4">Estado ARES por Fase</h3>
                        <app-semaforo-ares 
                            [aresByPhase]="aresByPhase()">
                        </app-semaforo-ares>
                    </div>
                </div>

                <!-- Análisis Detallado de Fortalezas -->
                <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700 dark:border-slate-600 mb-12">
                    <h3 class="text-2xl font-bold text-green-400 dark:text-green-300 mb-6 flex items-center gap-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Fortalezas Principales y Oportunidades
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Fortalezas -->
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-green-300 dark:text-green-400">Fortalezas Identificadas</h4>
                            <div class="space-y-3">
                                <div *ngFor="let strength of detailedStrengths()" class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <h5 class="font-medium text-green-200 dark:text-green-300">{{ strength.title }}</h5>
                                            <p class="text-sm text-green-100 dark:text-green-200 mt-1">{{ strength.description }}</p>
                                            <div class="mt-2 text-xs text-green-200/80 dark:text-green-300/80">
                                                <strong>Impacto:</strong> {{ strength.impact }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Oportunidades -->
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-orange-300 dark:text-orange-400">Oportunidades de Mejora</h4>
                            <div class="space-y-3">
                                <div *ngFor="let opportunity of detailedOpportunities()" class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <h5 class="font-medium text-orange-200 dark:text-orange-300">{{ opportunity.title }}</h5>
                                            <p class="text-sm text-orange-100 dark:text-orange-200 mt-1">{{ opportunity.description }}</p>
                                            <div class="mt-2 text-xs text-orange-200/80 dark:text-orange-300/80">
                                                <strong>Prioridad:</strong> {{ opportunity.priority }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Plan de Acción Detallado -->
                <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700 dark:border-slate-600 mb-12">
                    <h3 class="text-2xl font-bold text-blue-400 dark:text-blue-300 mb-6 text-center">Plan de Acción Estratégico</h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Acciones Inmediatas -->
                        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                            <div class="text-center mb-4">
                                <div class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">1</div>
                                <h4 class="font-semibold text-blue-200 dark:text-blue-300 text-lg">Acciones Inmediatas</h4>
                                <p class="text-blue-100 dark:text-blue-200 text-sm">0-3 meses</p>
                            </div>
                            <div class="space-y-3">
                                <div *ngFor="let action of immediateActions()" class="flex items-start gap-2">
                                    <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p class="text-sm text-blue-100 dark:text-blue-200 font-medium">{{ action.title }}</p>
                                        <p class="text-xs text-blue-200/80 dark:text-blue-300/80 mt-1">{{ action.description }}</p>
                                        <div class="mt-1 text-xs text-blue-200/60 dark:text-blue-300/60">
                                            <strong>Recursos:</strong> {{ action.resources }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones a Mediano Plazo -->
                        <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                            <div class="text-center mb-4">
                                <div class="w-16 h-16 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">2</div>
                                <h4 class="font-semibold text-yellow-200 dark:text-yellow-300 text-lg">Mediano Plazo</h4>
                                <p class="text-yellow-100 dark:text-yellow-200 text-sm">3-12 meses</p>
                            </div>
                            <div class="space-y-3">
                                <div *ngFor="let action of mediumTermActions()" class="flex items-start gap-2">
                                    <div class="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p class="text-sm text-yellow-100 dark:text-yellow-200 font-medium">{{ action.title }}</p>
                                        <p class="text-xs text-yellow-200/80 dark:text-yellow-300/80 mt-1">{{ action.description }}</p>
                                        <div class="mt-1 text-xs text-yellow-200/60 dark:text-yellow-300/60">
                                            <strong>Inversión:</strong> {{ action.investment }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones a Largo Plazo -->
                        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                            <div class="text-center mb-4">
                                <div class="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">3</div>
                                <h4 class="font-semibold text-green-200 dark:text-green-300 text-lg">Largo Plazo</h4>
                                <p class="text-green-100 dark:text-green-200 text-sm">12+ meses</p>
                            </div>
                            <div class="space-y-3">
                                <div *ngFor="let action of longTermActions()" class="flex items-start gap-2">
                                    <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p class="text-sm text-green-100 dark:text-green-200 font-medium">{{ action.title }}</p>
                                        <p class="text-xs text-green-200/80 dark:text-green-300/80 mt-1">{{ action.description }}</p>
                                        <div class="mt-1 text-xs text-green-200/60 dark:text-green-300/60">
                                            <strong>ROI esperado:</strong> {{ action.roi }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Análisis de Riesgos y Mitigación -->
                <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700 dark:border-slate-600 mb-12">
                    <h3 class="text-2xl font-bold text-red-400 dark:text-red-300 mb-6 flex items-center gap-3">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        Análisis de Riesgos y Mitigación
                    </h3>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-red-300 dark:text-red-400">Riesgos Identificados</h4>
                            <div class="space-y-3">
                                <div *ngFor="let risk of identifiedRisks()" class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <h5 class="font-medium text-red-200 dark:text-red-300">{{ risk.title }}</h5>
                                            <p class="text-sm text-red-100 dark:text-red-200 mt-1">{{ risk.description }}</p>
                                            <div class="mt-2 text-xs text-red-200/80 dark:text-red-300/80">
                                                <strong>Probabilidad:</strong> {{ risk.probability }} | <strong>Impacto:</strong> {{ risk.impact }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <h4 class="text-lg font-semibold text-blue-300 dark:text-blue-400">Estrategias de Mitigación</h4>
                            <div class="space-y-3">
                                <div *ngFor="let mitigation of riskMitigations()" class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                    <div class="flex items-start gap-3">
                                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <h5 class="font-medium text-blue-200 dark:text-blue-300">{{ mitigation.title }}</h5>
                                            <p class="text-sm text-blue-100 dark:text-blue-200 mt-1">{{ mitigation.description }}</p>
                                            <div class="mt-2 text-xs text-blue-200/80 dark:text-blue-300/80">
                                                <strong>Efectividad:</strong> {{ mitigation.effectiveness }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Métricas de Seguimiento -->
                <div class="bg-slate-800 dark:bg-slate-800 rounded-lg p-8 shadow-xl border border-slate-700 dark:border-slate-600 mb-12">
                    <h3 class="text-2xl font-bold text-purple-400 dark:text-purple-300 mb-6 text-center">Métricas de Seguimiento y KPIs</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div *ngFor="let metric of trackingMetrics()" class="text-center">
                            <div class="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                                {{ metric.icon }}
                            </div>
                            <h4 class="font-semibold text-purple-200 dark:text-purple-300 mb-2">{{ metric.title }}</h4>
                            <p class="text-sm text-purple-100 dark:text-purple-200">{{ metric.description }}</p>
                            <div class="mt-2 text-xs text-purple-200/80 dark:text-purple-300/80">
                                <strong>Meta:</strong> {{ metric.target }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Acciones -->
                <div class="text-center">
                    <button class="btn-primary mr-4 mb-4">
                        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Descargar Reporte PDF
                    </button>
                    <button class="btn-secondary mr-4 mb-4">
                        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Agendar Consultoría
                    </button>
                    <button class="btn-tertiary mb-4">
                        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        Ver Dashboard de Seguimiento
                    </button>
                </div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticResultsComponent {
    private readonly diagnosticState = inject(DiagnosticStateService);
    private readonly themeService = inject(ThemeService);

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

    // Métodos para obtener descripciones detalladas
    getAresLevelDescription(): string {
        const score = this.overallAresScore();
        if (score >= 80) return 'Excelencia operativa - Líder en la industria';
        if (score >= 60) return 'Implementación avanzada - Buenas prácticas establecidas';
        if (score >= 40) return 'Implementación intermedia - Proceso de mejora en curso';
        if (score >= 20) return 'Implementación básica - Fundamentos establecidos';
        return 'Implementación incipiente - Requiere desarrollo fundamental';
    }

    getCompetencyLevelDescription(): string {
        const avg = parseFloat(this.averageCompetencyScore() as string);
        if (avg >= 4.5) return 'Equipo altamente competente';
        if (avg >= 3.5) return 'Equipo competente con áreas de mejora';
        if (avg >= 2.5) return 'Equipo en desarrollo - Capacitación necesaria';
        if (avg >= 1.5) return 'Equipo básico - Desarrollo fundamental requerido';
        return 'Equipo incipiente - Capacitación intensiva necesaria';
    }

    getCurrentPhase(): string {
        const score = this.overallAresScore();
        if (score >= 80) return 'F5 - Transformación';
        if (score >= 60) return 'F4 - Operación';
        if (score >= 40) return 'F3 - Capacidades';
        if (score >= 20) return 'F2 - Estrategia';
        return 'F1 - Fundamentos';
    }

    getNextMilestone(): string {
        const score = this.overallAresScore();
        if (score >= 80) return 'Mantener liderazgo y expandir innovación';
        if (score >= 60) return 'Optimizar operaciones y escalar capacidades';
        if (score >= 40) return 'Desarrollar capacidades operativas';
        if (score >= 20) return 'Establecer estrategia y roadmap';
        return 'Definir fundamentos y políticas básicas';
    }

    getTopCompetencyStrengths(): string {
        const scores = this.competencyScores();
        const labels = this.competencyLabels();
        const strengths = scores.map((score, index) => ({ score, label: labels[index] }))
            .filter(item => item.score >= 4)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.label);
        return strengths.join(', ');
    }

    getTopCompetencyWeaknesses(): string {
        const scores = this.competencyScores();
        const labels = this.competencyLabels();
        const weaknesses = scores.map((score, index) => ({ score, label: labels[index] }))
            .filter(item => item.score <= 2)
            .sort((a, b) => a.score - b.score)
            .slice(0, 3)
            .map(item => item.label);
        return weaknesses.join(', ');
    }

    // Análisis detallado de fortalezas
    readonly detailedStrengths = computed(() => [
        {
            title: 'Compromiso con la Transformación',
            description: 'Tu organización demuestra un compromiso sólido con la adopción de IA, con liderazgo comprometido y recursos asignados.',
            impact: 'Alto - Base fundamental para el éxito'
        },
        {
            title: 'Infraestructura Tecnológica Sólida',
            description: 'Cuentas con una base tecnológica que permite la implementación de soluciones de IA de manera escalable.',
            impact: 'Medio - Acelera la implementación'
        },
        {
            title: 'Talento con Conocimientos Básicos',
            description: 'Tu equipo tiene conocimientos fundamentales en tecnologías de IA y está motivado para aprender más.',
            impact: 'Medio - Reduce la curva de aprendizaje'
        }
    ]);

    // Análisis detallado de oportunidades
    readonly detailedOpportunities = computed(() => [
        {
            title: 'Desarrollo de Competencias Avanzadas',
            description: 'Necesitas desarrollar competencias más avanzadas en tu equipo para maximizar el valor de la IA.',
            priority: 'Alta - Crítico para el éxito'
        },
        {
            title: 'Establecimiento de Procesos de Gobernanza',
            description: 'Falta un framework de gobernanza para la IA que asegure el uso ético y responsable.',
            priority: 'Alta - Requerimiento regulatorio'
        },
        {
            title: 'Implementación de Métricas de Valor',
            description: 'Necesitas definir y medir el valor generado por las iniciativas de IA.',
            priority: 'Media - Para justificar inversiones'
        }
    ]);

    // Plan de acción detallado
    readonly immediateActions = computed(() => [
        {
            title: 'Capacitación Básica del Equipo',
            description: 'Implementar programa de capacitación en fundamentos de IA para todo el equipo.',
            resources: 'Instructor interno + plataforma online'
        },
        {
            title: 'Auditoría de Seguridad',
            description: 'Realizar evaluación completa de seguridad de datos y sistemas existentes.',
            resources: 'Consultor de seguridad + herramientas'
        },
        {
            title: 'Definición de Políticas Éticas',
            description: 'Establecer principios éticos para el uso de IA en la organización.',
            resources: 'Comité ético + consultor especializado'
        }
    ]);

    readonly mediumTermActions = computed(() => [
        {
            title: 'Implementación de MLOps',
            description: 'Desarrollar capacidades de Machine Learning Operations para producción.',
            investment: '$50K - $200K USD'
        },
        {
            title: 'Pilotos de IA por Departamento',
            description: 'Lanzar proyectos piloto en áreas de alto impacto para validar conceptos.',
            investment: '$100K - $500K USD'
        },
        {
            title: 'Desarrollo de Competencias Avanzadas',
            description: 'Programa de certificación para líderes técnicos en IA.',
            investment: '$25K - $100K USD'
        }
    ]);

    readonly longTermActions = computed(() => [
        {
            title: 'Transformación Digital Completa',
            description: 'Integrar IA en todos los procesos críticos del negocio.',
            roi: '300-500% en 3-5 años'
        },
        {
            title: 'Centro de Excelencia en IA',
            description: 'Establecer un centro de excelencia para innovación en IA.',
            roi: '200-400% en 2-3 años'
        },
        {
            title: 'Expansión a Nuevos Mercados',
            description: 'Leverage de capacidades de IA para expandir a nuevos mercados.',
            roi: '400-800% en 5-7 años'
        }
    ]);

    // Análisis de riesgos
    readonly identifiedRisks = computed(() => [
        {
            title: 'Riesgo de Seguridad de Datos',
            description: 'Exposición de datos sensibles durante la implementación de IA.',
            probability: 'Media', impact: 'Alto'
        },
        {
            title: 'Resistencia al Cambio',
            description: 'Oposición del personal a la adopción de nuevas tecnologías.',
            probability: 'Alta', impact: 'Medio'
        },
        {
            title: 'Dependencia de Proveedores',
            description: 'Riesgo de quedarse atado a soluciones de terceros.',
            probability: 'Media', impact: 'Medio'
        }
    ]);

    readonly riskMitigations = computed(() => [
        {
            title: 'Implementación de Seguridad por Diseño',
            description: 'Integrar controles de seguridad desde el inicio del desarrollo.',
            effectiveness: 'Alta - Reduce riesgo de seguridad'
        },
        {
            title: 'Programa de Cambio Organizacional',
            description: 'Comunicación clara y capacitación para facilitar la adopción.',
            effectiveness: 'Alta - Reduce resistencia al cambio'
        },
        {
            title: 'Estrategia de Arquitectura Abierta',
            description: 'Diseñar sistemas que permitan migración entre proveedores.',
            effectiveness: 'Media - Reduce dependencia'
        }
    ]);

    // Métricas de seguimiento
    readonly trackingMetrics = computed(() => [
        {
            icon: '📊',
            title: 'Adopción de IA',
            description: 'Porcentaje de procesos que utilizan IA',
            target: '25% en 12 meses'
        },
        {
            icon: '💰',
            title: 'ROI de Proyectos',
            description: 'Retorno de inversión de iniciativas de IA',
            target: '200% en 18 meses'
        },
        {
            icon: '👥',
            title: 'Competencias del Equipo',
            description: 'Promedio de competencias en IA del equipo',
            target: '4.0/5 en 24 meses'
        },
        {
            icon: '🚀',
            title: 'Velocidad de Implementación',
            description: 'Tiempo promedio para implementar nuevas funcionalidades',
            target: 'Reducir 40% en 12 meses'
        }
    ]);
}
