import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { Observable, Subject, takeUntil, finalize } from 'rxjs';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService, DiagnosticAnalysisData } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticoFormValue } from '../../../data/diagnostic.models';
import { RadarChartComponent } from '../radar-chart.component';
import { SemaforoAresComponent } from '../semaforo-ares.component';
import { CardComponent } from '../../../../../shared/ui-kit/card/card.component';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, MarkdownModule, RadarChartComponent, SemaforoAresComponent, CardComponent],
  templateUrl: './diagnostic-results.component.html',
  styles: [`
    .btn-primary {
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }
    
    .btn-tertiary {
      @apply bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }
    
    .diagnostic-results {
      @apply max-w-7xl mx-auto p-6;
    }
    
    .ai-content {
      @apply text-gray-200;
    }
    
    .ai-content h1, .ai-content h2, .ai-content h3, .ai-content h4, .ai-content h5, .ai-content h6 {
      @apply text-white font-semibold mb-3;
    }
    
    .ai-content h1 { @apply text-2xl; }
    .ai-content h2 { @apply text-xl; }
    .ai-content h3 { @apply text-lg; }
    .ai-content h4 { @apply text-base; }
    
    .ai-content p {
      @apply mb-3 text-gray-200 leading-relaxed;
    }
    
    .ai-content ul, .ai-content ol {
      @apply mb-4 pl-6;
    }
    
    .ai-content li {
      @apply mb-2 text-gray-200;
    }
    
    .ai-content strong {
      @apply text-white font-semibold;
    }
    
    .ai-content em {
      @apply text-gray-300 italic;
    }
    
    .ai-content blockquote {
      @apply border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-900/20 rounded-r;
    }
    
    .ai-content code {
      @apply bg-gray-700 text-green-400 px-2 py-1 rounded text-sm;
    }
    
    .ai-content pre {
      @apply bg-gray-800 p-4 rounded-lg overflow-x-auto my-4;
    }
    
    .ai-content pre code {
      @apply bg-transparent text-green-400 p-0;
    }
    
    .ai-content table {
      @apply w-full border-collapse border border-gray-600 my-4;
    }
    
    .ai-content th, .ai-content td {
      @apply border border-gray-600 px-3 py-2 text-sm;
    }
    
    .ai-content th {
      @apply bg-gray-700 text-white font-semibold;
    }
    
    .ai-content td {
      @apply text-gray-200;
    }
  `]
})
export class DiagnosticResultsComponent implements OnInit, OnDestroy {
  diagnosticData!: DiagnosticoFormValue;
  competencyResults: { name: string; score: number }[] = [];
  topCompetencies: { name: string; score: number }[] = [];
  lowestCompetencies: { name: string; score: number }[] = [];
  
  // Estado de la IA
  isLoadingAnalysis = false;
  isLoadingActionPlan = false;
  generativeAnalysis: string | null = null;
  generativeActionPlan: string | null = null;
  loadingMessage = 'Preparando tu análisis...';
  
  // Datos del diagnóstico
  overallAresScore = 0;
  averageCompetencyScore = 0;
  competencyProgress = 0;
  
  // Datos para gráficos
  competencyScores: number[] = [];
  competencyLabels: string[] = [];
  aresByPhase: any = {};
  
  private destroy$ = new Subject<void>();
  private loadingInterval: any;
  private mensajesCarga = [
    'Analizando tus fortalezas y oportunidades... 🤔',
    'Consultando a nuestro coach de IA... 🧠',
    'Generando un plan de acción a tu medida... ⚡',
    'Cruzando datos para un feedback preciso... 📈',
    'Preparando una respuesta detallada... ✨',
    'Evaluando tu madurez en IA... 🎯',
    'Creando recomendaciones personalizadas... 💡',
    'Optimizando tu roadmap de transformación... 🚀'
  ];

  constructor(
    private diagnosticStateService: DiagnosticStateService,
    private scoringService: ScoringService,
    private generativeAiService: GenerativeAiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener datos del estado del diagnóstico
    const currentData = this.diagnosticStateService.form.value;
    if (currentData) {
      this.diagnosticData = currentData;
      this.calculateResults();
      this.setupChartData();
      // Solo llamamos a la IA si tenemos los datos necesarios
      if (this.topCompetencies.length > 0 && this.lowestCompetencies.length > 0) {
        this.fetchGenerativeAnalysis();
      }
    }
  }

  private calculateResults(): void {
    this.competencyResults = this.scoringService.calculateScores(this.diagnosticData);
    this.topCompetencies = [...this.competencyResults].sort((a, b) => b.score - a.score).slice(0, 3);
    this.lowestCompetencies = [...this.competencyResults].sort((a, b) => a.score - b.score).slice(0, 3);
    
    // Calcular métricas generales
    this.calculateGeneralMetrics();
  }

  private calculateGeneralMetrics(): void {
    // Calcular score ARES general
    const totalScore = this.competencyResults.reduce((sum, comp) => sum + comp.score, 0);
    const maxScore = this.competencyResults.length * 5;
    this.overallAresScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    // Calcular promedio de competencias
    this.averageCompetencyScore = this.competencyResults.length > 0 ? 
      parseFloat((totalScore / this.competencyResults.length).toFixed(1)) : 0;
    
    // Calcular progreso de competencias
    this.competencyProgress = (this.averageCompetencyScore / 5) * 100;
  }

  private setupChartData(): void {
    // Configurar datos para el gráfico de radar
    this.competencyScores = this.competencyResults.map(comp => comp.score);
    this.competencyLabels = this.competencyResults.map(comp => comp.name);
    
    // Configurar datos para el semáforo ARES
    this.aresByPhase = {
      'F1': { score: Math.min(20, Math.floor(this.overallAresScore * 0.2)), total: 20, items: [] },
      'F2': { score: Math.min(20, Math.floor(this.overallAresScore * 0.2)), total: 20, items: [] },
      'F3': { score: Math.min(20, Math.floor(this.overallAresScore * 0.2)), total: 20, items: [] },
      'F4': { score: Math.min(20, Math.floor(this.overallAresScore * 0.2)), total: 20, items: [] },
      'F5': { score: Math.min(20, Math.floor(this.overallAresScore * 0.2)), total: 20, items: [] }
    };
  }

  fetchGenerativeAnalysis(): void {
    this.isLoadingAnalysis = true;
    this.startLoadingMessages();

    const analysisData: DiagnosticAnalysisData = {
      userName: this.diagnosticData.lead?.nombre || 'Usuario',
      userRole: 'Profesional',
      userIndustry: this.diagnosticData.contexto?.industria || 'General',
      topCompetencies: this.topCompetencies,
      lowestCompetencies: this.lowestCompetencies,
    };

    this.generativeAiService.generateDiagnosticAnalysis(analysisData).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoadingAnalysis = false;
        this.stopLoadingMessages();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (analysis) => {
        console.log('✅ Análisis de IA recibido:', analysis);
        this.generativeAnalysis = analysis;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error en análisis de IA:', error);
        this.generativeAnalysis = `Error generando análisis: ${error.message}. Por favor, inténtalo de nuevo.`;
        this.cdr.detectChanges();
      }
    });
  }

  generateActionPlan(): void {
    if (this.isLoadingActionPlan) return;
    
    this.isLoadingActionPlan = true;
    this.startLoadingMessages();

    const analysisData: DiagnosticAnalysisData = {
      userName: this.diagnosticData.lead?.nombre || 'Usuario',
      userRole: 'Profesional',
      userIndustry: this.diagnosticData.contexto?.industria || 'General',
      topCompetencies: this.topCompetencies,
      lowestCompetencies: this.lowestCompetencies,
    };

    this.generativeAiService.generateDiagnosticAnalysis(analysisData).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoadingActionPlan = false;
        this.stopLoadingMessages();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (actionPlan) => {
        console.log('✅ Plan de acción de IA recibido:', actionPlan);
        this.generativeActionPlan = actionPlan;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error en plan de acción de IA:', error);
        this.generativeActionPlan = `Error generando plan de acción: ${error.message}. Por favor, inténtalo de nuevo.`;
        this.cdr.detectChanges();
      }
    });
  }

  private startLoadingMessages(): void {
    this.loadingMessage = this.mensajesCarga[0];
    this.loadingInterval = setInterval(() => {
      this.loadingMessage = this.mensajesCarga[Math.floor(Math.random() * this.mensajesCarga.length)];
      this.cdr.detectChanges();
    }, 2500);
  }

  private stopLoadingMessages(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
  }

  // Métodos para obtener descripciones
  getAresLevelDescription(): string {
    if (this.overallAresScore >= 80) return 'Excelencia operativa - Líder en la industria';
    if (this.overallAresScore >= 60) return 'Implementación avanzada - Buenas prácticas establecidas';
    if (this.overallAresScore >= 40) return 'Implementación intermedia - Proceso de mejora en curso';
    if (this.overallAresScore >= 20) return 'Implementación básica - Fundamentos establecidos';
    return 'Implementación incipiente - Requiere desarrollo fundamental';
  }

  getCompetencyLevelDescription(): string {
    if (this.averageCompetencyScore >= 4.5) return 'Equipo altamente competente';
    if (this.averageCompetencyScore >= 3.5) return 'Equipo competente con áreas de mejora';
    if (this.averageCompetencyScore >= 2.5) return 'Equipo en desarrollo - Capacitación necesaria';
    if (this.averageCompetencyScore >= 1.5) return 'Equipo básico - Desarrollo fundamental requerido';
    return 'Equipo incipiente - Capacitación intensiva necesaria';
  }

  getCurrentPhase(): string {
    if (this.overallAresScore >= 80) return 'F5 - Transformación';
    if (this.overallAresScore >= 60) return 'F4 - Operación';
    if (this.overallAresScore >= 40) return 'F3 - Capacidades';
    if (this.overallAresScore >= 20) return 'F2 - Estrategia';
    return 'F1 - Fundamentos';
  }

  getNextMilestone(): string {
    if (this.overallAresScore >= 80) return 'Mantener liderazgo y expandir innovación';
    if (this.overallAresScore >= 60) return 'Optimizar operaciones y escalar capacidades';
    if (this.overallAresScore >= 40) return 'Desarrollar capacidades operativas';
    if (this.overallAresScore >= 20) return 'Establecer estrategia y roadmap';
    return 'Definir fundamentos y políticas básicas';
  }

  getTopCompetencyStrengths(): string {
    return this.topCompetencies.map(comp => comp.name).join(', ');
  }

  getTopCompetencyWeaknesses(): string {
    return this.lowestCompetencies.map(comp => comp.name).join(', ');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopLoadingMessages();
  }

  printResults(): void {
    window.print();
  }
}
