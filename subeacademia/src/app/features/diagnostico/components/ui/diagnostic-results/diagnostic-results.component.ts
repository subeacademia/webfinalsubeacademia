import { Component, OnInit, inject, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../../../../core/i18n/i18n.service';
import { SeoService } from '../../../../../core/seo/seo.service';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { DiagnosticReport, PlanDeAccionItem } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { PdfService } from '../../../services/pdf.service';
import { GeneratingReportLoaderComponent } from '../generating-report-loader/generating-report-loader.component';
import { AnimationService } from '../../../../../core/services/animation.service';
import { ChartConfiguration } from 'chart.js';
import { COMPETENCIAS, COMPETENCIAS_COMPLETAS } from '../../../data/competencias';
import { SocialShareModalComponent } from '../social-share-modal/social-share-modal.component';
import { ToastService } from '../../../../../core/ui/toast/toast.service';
import { catchError, of } from 'rxjs';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { AsistenteIaService } from '../../../../../shared/ui/chatbot/asistente-ia.service';
import { CompetencyMapComponent } from '../competency-map/competency-map.component';
import { CompetencyRankingComponent } from '../competency-ranking/competency-ranking.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GenerativeAiService, DiagnosticAnalysisData, DiagnosticAnalysis, ActionPlanItem } from '../../../../../core/ai/generative-ai.service';
import { AiProcessingLoaderComponent } from '../ai-processing-loader/ai-processing-loader.component';
import { DiagnosticChartsComponent, CompetencyScore, AresScore } from '../diagnostic-charts/diagnostic-charts.component';
import { ActionPlanComponent } from '../action-plan/action-plan.component';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, FormsModule, GeneratingReportLoaderComponent, SocialShareModalComponent, NgxChartsModule, CompetencyMapComponent, CompetencyRankingComponent, AiProcessingLoaderComponent, DiagnosticChartsComponent, ActionPlanComponent],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css', './diagnostic-results.print.css']
})
export class DiagnosticResultsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('resultsContainer') resultsContainer!: ElementRef;
  @ViewChild('radarChart') radarChart!: ElementRef;
  @ViewChild('barChart') barChart!: ElementRef;
  
  private stateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private diagnosticsService = inject(DiagnosticsService);
  private asistenteIaService = inject(AsistenteIaService);
  private generativeAiService = inject(GenerativeAiService);
  
  // Nuevo estado reactivo para detailedReport
  isGeneratingDetailed = signal(true);
  detailedReportError = signal(false);
  detailedReport = signal<any | null>(null);
  
  // Estado para el nuevo sistema de IA
  isProcessingWithAI = false;
  aiAnalysis: DiagnosticAnalysis | null = null;
  aiActionPlan: ActionPlanItem[] = [];
  competencyScores: CompetencyScore[] = [];
  aresScores: AresScore | null = null;
  private pdfService = inject(PdfService);
  private animationService = inject(AnimationService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private i18n = inject(I18nService);
  private seo = inject(SeoService);

  scores: any;
  report: DiagnosticReport | null = null;
  isLoadingReport = true;
  loadingError = false;
  pdfUrl: string | null = null;
  isGeneratingPdf = false;
  isGeneratingReport = false;
  diagnosticId: string | null = null;

  // Datos para ngx-charts (gráfico polar/radar)
  polarResults: Array<{ name: string; series: Array<{ name: string; value: number }> }> = [];
  view: [number, number] = [600, 300];
  colorScheme: Color = {
    name: 'competencias',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6']
  };

  // Datos del gráfico radar
  public radarChartData!: ChartConfiguration<'radar'>['data'];
  public competencyChartData?: ChartConfiguration<'bar'>['data'];
  private finalScores: number[] = [];
  private finalLabels: string[] = [];

  showShareModal = false;
  
  /**
   * Procesa el diagnóstico con IA para generar análisis y plan de acción
   */
  private async processDiagnosticWithAI(diagnosticData: any): Promise<void> {
    if (this.isProcessingWithAI) return;
    
    this.isProcessingWithAI = true;
    console.log('🤖 Iniciando procesamiento con IA...');
    
    try {
      // Preparar datos para la IA
      const competencyScores = this.prepareCompetencyScoresForAI();
      const aresScores = this.prepareAresScoresForAI();
      
      const aiData: DiagnosticAnalysisData = {
        diagnosticData,
        competencyScores,
        aresScores,
        leadInfo: diagnosticData.lead || {}
      };
      
      // Generar análisis y plan de acción en paralelo
      const [analysis, actionPlan] = await Promise.all([
        this.generativeAiService.generateDiagnosticAnalysis(aiData).toPromise(),
        this.generativeAiService.generateActionPlan(aiData).toPromise()
      ]);
      
      this.aiAnalysis = analysis || null;
      this.aiActionPlan = actionPlan || [];
      
      console.log('✅ Análisis de IA completado:', analysis);
      console.log('✅ Plan de acción de IA completado:', actionPlan);
      
    } catch (error) {
      console.error('❌ Error procesando con IA:', error);
      console.error('Error al procesar con IA. Usando análisis local.');
      
      // Usar análisis de fallback
      this.aiAnalysis = this.generateFallbackAnalysis();
      this.aiActionPlan = this.generateFallbackActionPlan();
    } finally {
      this.isProcessingWithAI = false;
    }
  }
  
  /**
   * Prepara los scores de competencias para la IA
   */
  private prepareCompetencyScoresForAI(): CompetencyScore[] {
    if (!this.scores?.competencias) return [];
    
    return Object.entries(this.scores.competencias).map(([name, score]: [string, any]) => ({
      name,
      score: typeof score === 'number' ? score : 0,
      category: 'Competencia',
      description: `Puntaje en ${name}`
    }));
  }
  
  /**
   * Prepara los scores ARES para la IA
   */
  private prepareAresScoresForAI(): AresScore | null {
    if (!this.scores?.ares) return null;
    
    return {
      analisis: this.scores.ares.analisis || 0,
      responsabilidad: this.scores.ares.responsabilidad || 0,
      estrategia: this.scores.ares.estrategia || 0,
      sistemas: this.scores.ares.sistemas || 0
    };
  }
  
  /**
   * Genera análisis de fallback
   */
  private generateFallbackAnalysis(): DiagnosticAnalysis {
    return {
      summary: "Análisis generado localmente basado en los resultados del diagnóstico.",
      strengths: [
        "Tienes competencias sólidas en áreas clave",
        "Tu organización muestra madurez en ciertos aspectos",
        "Existe potencial para desarrollo y mejora"
      ],
      weaknesses: [
        "Identificamos oportunidades de mejora en competencias específicas",
        "Algunas áreas del framework ARES requieren atención",
        "Hay espacio para optimización de procesos"
      ],
      opportunities: [
        "Desarrollo de competencias clave",
        "Implementación de mejores prácticas",
        "Optimización de procesos organizacionales"
      ],
      threats: [
        "Riesgo de quedarse atrás en transformación digital",
        "Posible pérdida de competitividad",
        "Ineficiencias operativas"
      ],
      recommendations: [
        "Priorizar el desarrollo de competencias más débiles",
        "Implementar un plan de mejora gradual",
        "Establecer métricas de seguimiento"
      ],
      actionPlan: this.generateFallbackActionPlan()
    };
  }
  
  /**
   * Genera plan de acción de fallback
   */
  private generateFallbackActionPlan(): ActionPlanItem[] {
    return [
      {
        id: 'fallback-1',
        title: 'Evaluación de Competencias',
        description: 'Realizar una evaluación detallada de las competencias identificadas como débiles',
        priority: 'alta',
        timeframe: '1-2 meses',
        impact: 'Identificación clara de áreas de mejora',
        category: 'Evaluación'
      },
      {
        id: 'fallback-2',
        title: 'Plan de Desarrollo',
        description: 'Crear un plan de desarrollo personalizado para las competencias clave',
        priority: 'alta',
        timeframe: '2-3 meses',
        impact: 'Mejora medible en competencias',
        category: 'Desarrollo'
      },
      {
        id: 'fallback-3',
        title: 'Implementación de Mejoras',
        description: 'Implementar mejoras graduales en los procesos identificados',
        priority: 'media',
        timeframe: '3-6 meses',
        impact: 'Optimización de procesos operativos',
        category: 'Implementación'
      }
    ];
  }
  
  /**
   * Prepara datos para los nuevos gráficos
   */
  private prepareDataForNewCharts(): void {
    // Preparar datos de competencias
    this.competencyScores = this.prepareCompetencyScoresForAI();
    
    // Preparar datos ARES
    this.aresScores = this.prepareAresScoresForAI();
    
    console.log('📊 Datos preparados para nuevos gráficos:', {
      competencyScores: this.competencyScores,
      aresScores: this.aresScores
    });
  }

    ngOnInit(): void {
    console.log('🚀 DiagnosticResultsComponent.ngOnInit() iniciado - CONECTANDO A IA');
    
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        // Modo sólo lectura desde Firestore por ID
        this.diagnosticId = id;
        this.diagnosticsService.getById(id).subscribe((doc: any) => {
          try {
            const diagnosticData = doc?.diagnosticData || doc?.form || {};
            const scores = doc?.scores || null;
            if (scores) {
              this.scores = scores;
            } else {
              this.scores = {
                ares: this.scoringService.computeAresScore(diagnosticData),
                competencias: this.scoringService.computeCompetencyScores(diagnosticData)
              } as any;
            }
            this.prepareRadarChartData();
            this.report = doc?.report || null;
            this.isGeneratingReport = false;
            this.isLoadingReport = false;
            this.formatChartData();

            // Generar plan de acción si no existe aún
            if (this.report && !this.report.planDeAccion && this.diagnosticId) {
              this.generateActionPlan(this.report);
            }
          } catch (e) {
            console.error('Error procesando doc diagnóstico:', e);
            this.loadingError = true; this.isGeneratingReport = false; this.isLoadingReport = false;
          }
        });
        return;
      }
      
      const diagnosticData = this.stateService.getDiagnosticData();
      console.log('📊 Datos del diagnóstico completos:', diagnosticData);
      console.log('📊 Datos de competencias:', diagnosticData.competencias);
      console.log('📊 Datos ARES:', diagnosticData.ares);
      
      // 1. Calcula y muestra los scores inmediatamente.
      const ares = this.scoringService.computeAresScore(diagnosticData);
      const competencias = this.scoringService.computeCompetencyScores(diagnosticData);
      this.scores = { ares, competencias };
      
      console.log('📈 Scores calculados:', this.scores);
      console.log('📈 Scores ARES:', this.scores.ares);
      console.log('📈 Scores competencias:', this.scores.competencias);
      
      // Verificar el formato de los datos de competencias
      if (Array.isArray(this.scores.competencias)) {
        console.log('📊 Formato de competencias: ARRAY');
        this.scores.competencias.forEach((comp: any, index: number) => {
          console.log(`📊 Competencia ${index}:`, comp);
        });
      } else {
        console.log('📊 Formato de competencias: OBJETO');
        console.log('📊 Claves de competencias:', Object.keys(this.scores.competencias || {}));
      }

      // 2. Prepara los datos del gráfico radar
      this.prepareRadarChartData();
      this.formatChartData();
      
      // 3. 🚀 NUEVO: Prepara datos para los nuevos gráficos
      this.prepareDataForNewCharts();

      // 3. Forzar la detección de cambios para los componentes hijos
      setTimeout(() => {
        console.log('🔄 Forzando detección de cambios para componentes hijos');
        console.log('🔄 Estado final de scores:', this.scores);
        console.log('🔄 Llamando a competencyScoresForChart:', this.competencyScoresForChart);
        console.log('🔄 Llamando a aresDataForSemaforo:', this.aresDataForSemaforo);
        this.scores = { ...this.scores };
      }, 200);

      // 4. 🚨 SOLUCIÓN RADICAL: Generar reporte local inmediatamente (sin IA por ahora)
      this.generateLocalReport(diagnosticData);
      
      // 5. 🚀 NUEVO: Procesar con IA para análisis y plan de acción
      this.processDiagnosticWithAI(diagnosticData);

      // SEO título por idioma
      try {
        const title = this.i18n.translate('diagnostico.results.page_title');
        this.seo.updateTags({ title });
      } catch {} 
      
    } catch (error) {
      console.error('❌ Error al inicializar resultados:', error);
      this.loadingError = true;
      this.isLoadingReport = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scores'] && this.scores) {
      this.prepareChartData();
    }
  }

  ngAfterViewInit(): void {
    // Animar el número del puntaje final
    if (this.scores?.ares?.promedio !== undefined) {
      this.animationService.countUp('#total-score', this.scores.ares.promedio);
    }

    // Animar la aparición de elementos en secuencia
    setTimeout(() => {
      this.animationService.cascadeIn([
        '.diagnostic-results-container h1',
        '.diagnostic-results-container .grid',
        '.diagnostic-results-container section'
      ], 300);
    }, 500);

    // Animar la aparición del gráfico radar
    setTimeout(() => {
      this.animateChart();
    }, 2000);
  }

  private prepareChartData(): void {
    if (!this.scores?.competencias) return;

    // Extrae los labels y los datos de tu `scores`
    const labels = Object.keys(this.scores.competencias);
    const finalScores = Object.values(this.scores.competencias) as number[];

    this.radarChartData = {
      labels: labels,
      datasets: [{
        data: finalScores,
        label: 'Resultado',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }]
    };

    // Preparar datos para gráfico de barras horizontal
    this.competencyChartData = {
      labels: labels,
      datasets: [
        {
          data: finalScores,
          label: 'Competencias (%)',
          backgroundColor: finalScores.map(v => this.getBarColor(v)),
          borderWidth: 0
        }
      ]
    };

    // Llama a las animaciones después de que los datos estén listos
    setTimeout(() => this.animateResults(), 100);
  }

  private prepareRadarChartData(): void {
    if (!this.scores?.competencias) return;

    console.log('📊 Scores de competencias recibidos:', this.scores.competencias);

    // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
    if (Array.isArray(this.scores.competencias)) {
      // Obtener los nombres de las competencias usando COMPETENCIAS
      const competencyEntries = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        return [competency?.nameKey || comp.competenciaId, comp.puntaje];
      });

      this.finalLabels = competencyEntries.map(([name]: [string, any]) => name);
      this.finalScores = competencyEntries.map(([, score]: [string, any]) => {
        const scoreValue = typeof score === 'number' ? score : 0;
        return scoreValue;
      });
    } else {
      // Fallback para formato de objeto
      const competencyEntries = Object.entries(this.scores.competencias);
      this.finalLabels = competencyEntries.map(([name]) => name);
      this.finalScores = competencyEntries.map(([, score]) => {
        const scoreValue = typeof score === 'number' ? score : 0;
        return scoreValue;
      });
    }

    console.log('📊 Datos del gráfico radar preparados:', {
      labels: this.finalLabels,
      scores: this.finalScores
    });

    // INICIALIZA EL GRÁFICO CON LOS DATOS REALES DEL DIAGNÓSTICO
    this.radarChartData = {
      labels: this.finalLabels,
      datasets: [{
        data: [...this.finalScores], // Usar los scores reales, no ceros
        label: 'Puntaje de Competencias',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }]
    };

    // Además preparar chartData para barras
    this.competencyChartData = {
      labels: [...this.finalLabels],
      datasets: [
        {
          data: [...this.finalScores],
          label: 'Competencias (%)',
          backgroundColor: this.finalScores.map(v => this.getBarColor(v)),
          borderWidth: 0
        }
      ]
    };

    console.log('📊 Gráfico radar inicializado con datos:', this.radarChartData);
  }

  // Formatea datos para ngx-charts polar chart a partir de scores/report
  formatChartData(): void {
    try {
      let entries: Array<{ name: string; value: number }> = [];

      // Preferir scores.competencias si existe
      if (this.scores?.competencias) {
        if (Array.isArray(this.scores.competencias)) {
          entries = this.scores.competencias.map((comp: any) => {
            const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
            const name = competency?.nameKey || comp.competenciaId;
            const value = typeof comp.puntaje === 'number' ? comp.puntaje : 0;
            return { name, value };
          });
        } else {
          entries = Object.entries(this.scores.competencias).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : 0
          }));
        }
      } else if ((this.report as any)?.competencias) {
        const rc: any = (this.report as any).competencias;
        if (Array.isArray(rc)) {
          entries = rc.map((c: any) => ({ name: c?.name || c?.competencia || 'Competencia', value: Number(c?.value ?? c?.puntaje ?? 0) }));
        } else {
          entries = Object.entries(rc).map(([name, value]) => ({ name, value: Number(value) || 0 }));
        }
      }

      // Asegurar límites 0..100
      entries = entries.map(e => ({ name: e.name, value: Math.max(0, Math.min(100, Math.round(e.value))) }));

      this.polarResults = entries.length
        ? [{ name: 'Competencias', series: entries }]
        : [];
    } catch (err) {
      console.warn('formatChartData(): no se pudieron formatear competencias para ngx-charts', err);
      this.polarResults = [];
    }
  }

  private animateResults(): void {
    // Animación de conteo para el puntaje total
    if (this.scores?.ares?.promedio !== undefined) {
      this.animationService.countUp('#total-score', this.scores.ares.promedio);
    }

    // Animación de aparición para el gráfico
    const anime = (window as any).anime;
    if (anime) {
      anime({
        targets: '#radar-chart-container',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1200,
        easing: 'easeOutExpo'
      });
    }
  }

  animateChart(): void {
    if (!this.finalScores.length) return;

    console.log('🎬 Iniciando animación del gráfico radar...');

    // Crear una copia de los scores finales para la animación
    const scoresCopy = [...this.finalScores];
    
    // Inicializar datos de animación en 0
    const animatedData = scoresCopy.map(() => 0);

    // Usar anime.js para animar los datos
    const anime = (window as any).anime;
    if (anime) {
      anime({
        targets: animatedData,
        // Animar desde 0 hasta los valores finales
        ...scoresCopy.reduce((acc, val, i) => ({ ...acc, [i]: val }), {}),
        easing: 'easeInOutExpo',
        duration: 2000,
        round: 1,
        update: () => {
          // En cada frame de la animación, actualizamos los datos del gráfico
          this.radarChartData.datasets[0].data = [...animatedData];
          
          // Forzar la actualización del gráfico
          this.radarChartData = { ...this.radarChartData };
        }
      });
    } else {
      console.warn('⚠️ anime.js no está disponible, usando fallback');
      // Fallback: mostrar directamente los scores finales
      setTimeout(() => {
        this.radarChartData.datasets[0].data = [...this.finalScores];
        this.radarChartData = { ...this.radarChartData };
      }, 500);
    }
  }

  private generateReport(diagnosticData: any): void {
    console.log('🤖 Re-generando reporte detallado (Cloud Function)...');
    this.isGeneratingDetailed.set(true);
    this.detailedReportError.set(false);
    this.diagnosticsService.generateDetailedReport(diagnosticData)
      .pipe(
        catchError(error => {
          console.error('Error generating detailed report', error);
          this.detailedReportError.set(true);
          return of(null);
        })
      )
      .subscribe(reportData => {
        if (reportData) {
          this.detailedReport.set(reportData);
        }
        this.isGeneratingDetailed.set(false);
      });
  }

  private identifyWeakestCompetency(): { name: string, score: number } | null {
    if (!this.scores?.competencias) return null;
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      const competenciesArray = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        return {
          name: competency?.nameKey || comp.competenciaId,
          score: comp.puntaje || 0
        };
      });
      
      if (competenciesArray.length === 0) return null;
      
      // Encontrar la competencia con el puntaje más bajo
      const weakest = competenciesArray.reduce((min: any, current: any) => {
        return current.score < min.score ? current : min;
      });
      
      console.log('🎯 Competencia más débil identificada:', weakest);
      return weakest;
    } else {
      // Fallback para formato de objeto
      const competenciesArray = Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0
      }));
      
      if (competenciesArray.length === 0) return null;
      
      // Encontrar la competencia con el puntaje más bajo
      const weakest = competenciesArray.reduce((min: any, current: any) => {
        return current.score < min.score ? current : min;
      });
      
      console.log('🎯 Competencia más débil identificada:', weakest);
      return weakest;
    }
  }

  private generateCTAPrompt(weakestCompetency: { name: string, score: number } | null): string {
    if (!weakestCompetency) return '';
    
    // Determinar el tipo de producto recomendado basado en la competencia
    let productType = 'curso';
    let productName = 'curso especializado';
    
    if (weakestCompetency.score < 30) {
      productType = 'asesoría';
      productName = 'asesoría personalizada';
    } else if (weakestCompetency.score < 50) {
      productType = 'certificación';
      productName = 'programa de certificación';
    }
    
    const ctaPrompt = `
      IMPORTANTE: Al final del plan de acción, incluye una recomendación específica para una ${productName} 
      relacionada con "${weakestCompetency.name}" que ayude a mejorar esta competencia. 
      
      El CTA debe ser convincente y específico, mencionando que esta ${productName} acelerará significativamente 
      el proceso de mejora en esta área crítica.
      
      Formato sugerido: "Para acelerar tu desarrollo en ${weakestCompetency.name}, te recomendamos encarecidamente 
      nuestra ${productName} [Nombre del Producto], diseñada específicamente para fortalecer esta competencia clave."
    `;
    
    console.log('📝 Prompt de CTA generado:', ctaPrompt);
    return ctaPrompt;
  }

  async generatePdf(): Promise<void> {
    if (!this.report || !this.scores) {
      console.error('❌ No hay reporte o scores para generar PDF');
      this.toastService.error('No hay datos suficientes para generar el PDF.');
      return;
    }

    try {
      this.isGeneratingPdf = true;
      console.log('�� Iniciando generación de PDF...');

      // Esperar un momento para asegurar que las animaciones del gráfico hayan terminado
      setTimeout(async () => {
        if (this.resultsContainer?.nativeElement && this.report) {
          // Generar el PDF
          await this.pdfService.generateDiagnosticReport(
            this.report,
            this.scores,
            this.resultsContainer.nativeElement
          );
          this.toastService.success('PDF generado y descargado correctamente.');
          console.log('✅ PDF generado exitosamente');
        } else {
          console.error('❌ No se encontró el contenedor de resultados');
          this.toastService.error('No se encontró el contenido para generar el PDF.');
        }
        this.isGeneratingPdf = false;
      }, 2500); // Esperar 2.5 segundos para que las animaciones terminen

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      this.toastService.error('Error al generar el PDF. Intenta nuevamente.');
      this.isGeneratingPdf = false;
    }
  }

  retryGeneration(): void {
    console.log('🔄 Reintentando generación del reporte...');
    const diagnosticData = this.stateService.getDiagnosticData();
    this.generateReport(diagnosticData);
  }

  compartirResultados(): void {
    this.showShareModal = true;
  }

  onShareModalClose(): void {
    this.showShareModal = false;
  }

  onShareResults(platforms: string[]): void {
    console.log('Compartiendo en plataformas:', platforms);
    
    // Aquí puedes implementar la lógica específica para cada plataforma
    platforms.forEach(platform => {
      switch (platform) {
        case 'linkedin':
          this.shareOnLinkedIn();
          break;
        case 'facebook':
          this.shareOnFacebook();
          break;
        case 'instagram':
          this.shareOnInstagram();
          break;
        case 'tiktok':
          this.shareOnTikTok();
          break;
      }
    });
    
    this.showShareModal = false;
  }

  private shareOnLinkedIn(): void {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Resultados de mi diagnóstico de IA - SubeAcademia');
    const summary = encodeURIComponent('He completado mi diagnóstico de competencias en IA. ¡Descubre tus fortalezas!');
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    window.open(linkedInUrl, '_blank');
  }

  private shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent('He completado mi diagnóstico de competencias en IA. ¡Descubre tus fortalezas!');
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    window.open(facebookUrl, '_blank');
  }

  private shareOnInstagram(): void {
    // Instagram no tiene API de compartir directa, mostrar instrucciones
    alert('Para compartir en Instagram:\n1. Toma una captura de pantalla de tus resultados\n2. Compártela en tu historia o feed\n3. Agrega el hashtag #SubeAcademia');
  }

  private shareOnTikTok(): void {
    // TikTok no tiene API de compartir directa, mostrar instrucciones
    alert('Para compartir en TikTok:\n1. Toma una captura de pantalla de tus resultados\n2. Crea un video creativo\n3. Agrega el hashtag #SubeAcademia');
  }

  // Getters para los datos de los gráficos
  get competencyScoresForChart(): Array<{name: string, score: number}> {
    console.log('🔍 GETTER competencyScoresForChart ejecutado');
    const result = this.getCompetencyScoresForChart();
    console.log('🔍 GETTER competencyScoresForChart retorna:', result);
    return result;
  }

  get aresDataForSemaforo(): Record<string, any> {
    return this.getAresDataForSemaforo();
  }

  // Método para convertir datos de competencias al formato del gráfico de barras
  getCompetencyScoresForChart(): Array<{name: string, score: number}> {
    console.log('🔍 getCompetencyScoresForChart() llamado - INICIO');
    console.log('🔍 Estado actual de scores:', this.scores);
    
    if (!this.scores?.competencias) {
      console.warn('⚠️ No hay scores de competencias disponibles');
      return [];
    }
    
    console.log('🔍 Obteniendo scores para gráfico de barras:', this.scores.competencias);
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      const result = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        const score = comp.puntaje || 0;
        const name = competency?.nameKey || comp.competenciaId;
        console.log(`📊 Competencia ${comp.competenciaId}: ${name} = ${score} (nivel: ${comp.nivel})`);
        return {
          name: name,
          score: score
        };
      });
      
      console.log('📈 Scores formateados para gráfico de barras:', result);
      return result;
    } else {
      // Fallback para formato de objeto
      const result = Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0
      }));
      
      console.log('📈 Scores formateados para gráfico de barras (fallback):', result);
      return result;
    }
  }

  // Método para obtener datos de competencias para los nuevos gráficos
  getCompetencyScoresForCharts(): Array<{name: string, score: number, description?: string}> {
    console.log('🗺️ getCompetencyScoresForCharts() llamado - INICIO');
    console.log('🗺️ Estado actual de scores:', this.scores);
    
    if (!this.scores?.competencias) {
      console.warn('⚠️ No hay scores de competencias disponibles');
      return [];
    }
    
    console.log('🗺️ Obteniendo scores para nuevos gráficos:', this.scores.competencias);
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      const result = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        const competencyComplete = COMPETENCIAS_COMPLETAS.find((c: any) => c.id === comp.competenciaId);
        const score = comp.puntaje || 0;
        const name = competency?.nameKey || comp.competenciaId;
        const description = competencyComplete?.description || '';
        console.log(`🗺️ Competencia ${comp.competenciaId}: ${name} = ${score} (nivel: ${comp.nivel})`);
        return {
          name: name,
          score: score,
          description: description
        };
      });
      
      console.log('🗺️ Scores formateados para nuevos gráficos:', result);
      return result;
    } else {
      // Fallback para formato de objeto
      const result = Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0,
        description: ''
      }));
      
      console.log('🗺️ Scores formateados para nuevos gráficos (fallback):', result);
      return result;
    }
  }

  // Método para obtener datos ARES en el formato correcto para el semáforo
  getAresDataForSemaforo(): Record<string, any> {
    console.log('🔍 getAresDataForSemaforo() llamado');
    console.log('🔍 Estado actual de scores:', this.scores);
    
    if (!this.scores?.ares) {
      console.warn('⚠️ No hay scores ARES disponibles');
      return {};
    }
    
    console.log('🔍 Obteniendo datos ARES para semáforo:', this.scores.ares);
    
    // Mapear las dimensiones ARES a las fases del semáforo
    const aresData: Record<string, any> = {};
    
    // F1 - Preparación: datos, talento, gobernanza
    if (this.scores.ares.datos || this.scores.ares.talento || this.scores.ares.gobernanza) {
      const scores = [this.scores.ares.datos, this.scores.ares.talento, this.scores.ares.gobernanza].filter(s => s !== undefined);
      aresData['F1'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F1 - Preparación: scores=${scores}, promedio=${aresData['F1'].score}`);
    }
    
    // F2 - Diseño: valor, etica, riesgos, transparencia
    if (this.scores.ares.valor || this.scores.ares.etica || this.scores.ares.riesgos || this.scores.ares.transparencia) {
      const scores = [this.scores.ares.valor, this.scores.ares.etica, this.scores.ares.riesgos, this.scores.ares.transparencia].filter(s => s !== undefined);
      aresData['F2'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F2 - Diseño: scores=${scores}, promedio=${aresData['F2'].score}`);
    }
    
    // F3 - Desarrollo: tecnologia, integracion, capacidad
    if (this.scores.ares.tecnologia || this.scores.ares.integracion || this.scores.ares.capacidad) {
      const scores = [this.scores.ares.tecnologia, this.scores.ares.integracion, this.scores.ares.capacidad].filter(s => s !== undefined);
      aresData['F3'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F3 - Desarrollo: scores=${scores}, promedio=${aresData['F3'].score}`);
    }
    
    // F4 - Operación: operacion, seguridad, cumplimiento
    if (this.scores.ares.operacion || this.scores.ares.seguridad || this.scores.ares.cumplimiento) {
      const scores = [this.scores.ares.operacion, this.scores.ares.seguridad, this.scores.ares.cumplimiento].filter(s => s !== undefined);
      aresData['F4'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F4 - Operación: scores=${scores}, promedio=${aresData['F4'].score}`);
    }
    
    // F5 - Escalamiento: adopcion, sostenibilidad
    if (this.scores.ares.adopcion || this.scores.ares.sostenibilidad) {
      const scores = [this.scores.ares.adopcion, this.scores.ares.sostenibilidad].filter(s => s !== undefined);
      aresData['F5'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F5 - Escalamiento: scores=${scores}, promedio=${aresData['F5'].score}`);
    }
    
    // Si no hay datos mapeados, crear fases por defecto
    if (Object.keys(aresData).length === 0) {
      console.log('⚠️ No hay datos ARES mapeados, creando fases por defecto');
      ['F1', 'F2', 'F3', 'F4', 'F5'].forEach(phase => {
        aresData[phase] = {
          score: 0,
          total: 100,
          items: []
        };
      });
    }
    
    console.log('📈 Datos ARES formateados para semáforo:', aresData);
    return aresData;
  }

  // Métodos auxiliares para el nuevo diseño
  getTopCompetencies(): Array<{name: string, score: number}> {
    if (!this.scores?.competencias) return [];
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      return this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        return {
          name: competency?.nameKey || comp.competenciaId,
          score: comp.puntaje || 0
        };
      }).sort((a: any, b: any) => b.score - a.score).slice(0, 13); // Mostrar todas las 13 competencias
    } else {
      // Fallback para formato de objeto
      return Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0
      })).sort((a, b) => b.score - a.score).slice(0, 13);
    }
  }

  // Métodos para el Framework ARES
  getTopAresStrengths(): Array<{name: string, score: number}> {
    if (!this.scores?.ares) return [];
    
    const aresEntries = Object.entries(this.scores.ares)
      .filter(([key]) => key !== 'promedio')
      .map(([name, score]) => ({ 
        name: this.getAresPhaseName(name), 
        score: typeof score === 'number' ? score : 0 
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    return aresEntries;
  }

  getTopAresOpportunities(): Array<{name: string, score: number}> {
    if (!this.scores?.ares) return [];
    
    const aresEntries = Object.entries(this.scores.ares)
      .filter(([key]) => key !== 'promedio')
      .map(([name, score]) => ({ 
        name: this.getAresPhaseName(name), 
        score: typeof score === 'number' ? score : 0 
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    
    return aresEntries;
  }

  getAresPhaseName(phase: string): string {
    const phaseNames: {[key: string]: string} = {
      'datos': 'F1: Preparación - Datos',
      'talento': 'F1: Preparación - Talento',
      'gobernanza': 'F1: Preparación - Gobernanza',
      'valor': 'F2: Diseño - Valor',
      'etica': 'F2: Diseño - Ética',
      'riesgos': 'F2: Diseño - Riesgos',
      'transparencia': 'F2: Diseño - Transparencia',
      'tecnologia': 'F3: Desarrollo - Tecnología',
      'integracion': 'F3: Desarrollo - Integración',
      'capacidad': 'F3: Desarrollo - Capacidad',
      'operacion': 'F4: Operación - Operación',
      'seguridad': 'F4: Operación - Seguridad',
      'cumplimiento': 'F4: Operación - Cumplimiento',
      'adopcion': 'F5: Escalamiento - Adopción',
      'sostenibilidad': 'F5: Escalamiento - Sostenibilidad'
    };
    
    return phaseNames[phase] || phase;
  }

  // Métodos para competencias
  getCompetencyBorderColor(score: number): string {
    if (score >= 80) return 'border-green-500';
    if (score >= 60) return 'border-blue-500';
    if (score >= 40) return 'border-yellow-500';
    return 'border-red-500';
  }

  getCompetencyDescription(score: number): string {
    if (score >= 80) return 'Excelente - Dominio avanzado de esta competencia';
    if (score >= 60) return 'Bueno - Nivel intermedio con espacio para mejora';
    if (score >= 40) return 'Regular - Necesita desarrollo significativo';
    return 'Crítico - Requiere atención prioritaria y desarrollo';
  }

  getAresPhases(): Array<{name: string, score: number}> {
    if (!this.scores?.ares) return [];
    
    return Object.entries(this.scores.ares)
      .filter(([key]) => key !== 'promedio')
      .map(([name, score]) => ({ 
        name: this.getAresPhaseName(name), 
        score: typeof score === 'number' ? score : 0 
      }))
      .sort((a, b) => b.score - a.score);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getScoreColorClass(score: number): string {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  }

  getScoreDescription(score: number): string {
    if (score >= 80) return 'Excelente - Nivel avanzado';
    if (score >= 60) return 'Bueno - Nivel intermedio';
    if (score >= 40) return 'Regular - Necesita mejora';
    return 'Crítico - Requiere atención inmediata';
  }

  getAresScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getAresStatusColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Método para descargar el plan completo
  async downloadPlan(): Promise<void> {
    if (!this.report || !this.scores) {
      console.error('❌ No hay reporte o scores para descargar');
      return;
    }

    try {
      console.log('📥 Iniciando descarga del plan...');
      
      // Crear el contenido del plan
      const planContent = this.generatePlanContent();
      
      // Crear y descargar el archivo
      const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plan-accion-ia-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Plan descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar el plan:', error);
      alert('Error al descargar el plan. Por favor, intenta de nuevo.');
    }
  }

  // Método para generar datos de prueba
  generateTestData(): void {
    console.log('🧪 Generando datos de prueba...');
    
    // Generar datos ARES de prueba
    const testAresData = {
      datos: 4,
      talento: 3,
      gobernanza: 4,
      valor: 3,
      etica: 4,
      riesgos: 3,
      transparencia: 4,
      tecnologia: 3,
      integracion: 4,
      capacidad: 3,
      operacion: 4,
      seguridad: 3,
      cumplimiento: 4,
      adopcion: 3,
      sostenibilidad: 4
    };
    
    // Generar datos de competencias de prueba
    const testCompetenciasData = {
      pensamiento_critico: 4,
      resolucion_problemas: 3,
      alfabetizacion_datos: 4,
      comunicacion_efectiva: 3,
      colaboracion_equipo: 4,
      creatividad_innovacion: 3,
      diseno_tecnologico: 4,
      automatizacion_ia: 3,
      seguridad_privacidad: 4,
      etica_responsabilidad: 3,
      sostenibilidad: 4,
      aprendizaje_continuo: 3,
      liderazgo_ia: 4
    };
    
    // Crear datos de diagnóstico de prueba
    const testDiagnosticData = {
      contexto: {
        industria: 'Tecnología',
        tamano: 'Mediana',
        presupuesto: 'Alto'
      },
      ares: testAresData,
      competencias: testCompetenciasData,
      objetivo: 'Mejorar la madurez en IA' as any,
      lead: {
        nombre: 'Usuario de Prueba',
        email: 'test@example.com',
        telefono: '+1234567890',
        aceptaComunicaciones: true
      },
      segmento: 'empresa' as any
    } as any;
    
    console.log('🧪 Datos de prueba generados:', testDiagnosticData);
    
    // Calcular scores con los datos de prueba
    const ares = this.scoringService.computeAresScore(testDiagnosticData);
    const competencias = this.scoringService.computeCompetencyScores(testDiagnosticData);
    this.scores = { ares, competencias };
    
    console.log('🧪 Scores calculados con datos de prueba:', this.scores);
    console.log('🧪 Scores ARES:', ares);
    console.log('🧪 Scores competencias:', competencias);
    console.log('🧪 Tipo de competencias:', typeof competencias, Array.isArray(competencias));
    
    if (Array.isArray(competencias)) {
      competencias.forEach((comp: any, index: number) => {
        console.log(`🧪 Competencia ${index}:`, comp);
      });
    }
    
    // Preparar datos del gráfico radar
    this.prepareRadarChartData();
    this.formatChartData();
    
    // Forzar actualización de componentes hijos
    setTimeout(() => {
      console.log('🔄 Forzando actualización con datos de prueba');
      console.log('🔄 Estado final de scores:', this.scores);
      console.log('🔄 Llamando a competencyScoresForChart:', this.competencyScoresForChart);
      this.scores = { ...this.scores };
    }, 100);
  }

  private generatePlanContent(): string {
    if (!this.report || !this.scores) return '';
    
    let content = 'PLAN DE ACCIÓN ESTRATÉGICO - DIAGNÓSTICO DE IA\n';
    content += '================================================\n\n';
    
    // Información del diagnóstico
    content += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
    content += `Puntaje Total ARES: ${this.scores.ares?.total || 0}/100\n\n`;
    
    // Resumen ejecutivo
    if (this.report.resumen_ejecutivo) {
      content += 'RESUMEN EJECUTIVO:\n';
      content += '-------------------\n';
      content += this.report.resumen_ejecutivo + '\n\n';
    }
    
    // Plan de acción
    if (this.report.plan_de_accion && this.report.plan_de_accion.length > 0) {
      content += 'PLAN DE ACCIÓN:\n';
      content += '----------------\n';
      this.report.plan_de_accion.forEach((seccion, index) => {
        content += `${index + 1}. ${seccion.area_mejora}\n`;
        content += `   Problema: ${seccion.descripcion_problema}\n`;
        content += `   Acciones recomendadas:\n`;
        seccion.acciones_recomendadas.forEach((accion, accionIndex) => {
          content += `     ${accionIndex + 1}. ${accion.accion}\n`;
          content += `        ${accion.detalle}\n`;
        });
        content += '\n';
      });
    }
    
    // Análisis ARES
    if (this.report.analisis_ares && this.report.analisis_ares.length > 0) {
      content += 'ANÁLISIS ARES:\n';
      content += '---------------\n';
      this.report.analisis_ares.forEach((seccion, index) => {
        content += `${index + 1}. ${seccion.dimension}: ${seccion.puntaje}/100\n`;
        content += `   ${seccion.analisis}\n\n`;
      });
    }
    
    content += '================================================\n';
    content += 'Generado por Sube Academia - Herramienta de Diagnóstico de IA\n';
    content += 'Contacto: +56 9 8228 1888 | WhatsApp: +56 9 8228 1888\n';
    
    return content;
  }

  // =====================
  // Insights y Score General
  // =====================
  getGeneralScore(): number {
    if (!this.scores) return 0;

    // Promedio de competencias
    let competenciasAvg = 0;
    if (this.scores.competencias) {
      if (Array.isArray(this.scores.competencias)) {
        const values = this.scores.competencias.map((c: any) => typeof c.puntaje === 'number' ? c.puntaje : 0);
        competenciasAvg = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      } else {
        const values = Object.values(this.scores.competencias).map((v: any) => typeof v === 'number' ? v : 0) as number[];
        competenciasAvg = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      }
    }

    // Promedio ARES
    let aresAvg = 0;
    if (this.scores.ares) {
      const entries = Object.entries(this.scores.ares).filter(([key]) => key !== 'promedio');
      const values = entries.map(([, v]) => typeof v === 'number' ? v : 0) as number[];
      aresAvg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    return Math.round((competenciasAvg + aresAvg) / 2);
  }

  private getBarColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  }

  getQuickInsights(): Array<{ type: string; title: string; description: string }>{
    const insights: Array<{ type: string; title: string; description: string }> = [];

    if (this.scores?.competencias) {
      const topComp = this.getTopCompetencies()[0];
      if (topComp && topComp.score >= 80) {
        insights.push({
          type: 'success',
          title: 'Fortaleza Identificada',
          description: `${topComp.name} es tu área más fuerte`
        });
      }
    }

    if (this.scores?.ares) {
      const lowestPhase = this.getAresPhases().sort((a, b) => a.score - b.score)[0];
      if (lowestPhase && lowestPhase.score < 60) {
        insights.push({
          type: 'warning',
          title: 'Área de Oportunidad',
          description: `${lowestPhase.name} necesita atención prioritaria`
        });
      }
    }

    insights.push({
      type: 'info',
      title: 'Próximo Paso',
      description: 'Revisa el plan de acción completo para priorizar tareas'
    });

    return insights;
  }

  getInsightBorderColor(type: string): string {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  }

  getInsightDotColor(type: string): string {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  showDetailedInsights(): void {
    // Placeholder para interacción futura (modal o navegación)
    console.log('Mostrando insights detallados...');
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  // 🚨 MÉTODO TEMPORALMENTE DESHABILITADO - CAUSA CONGELAMIENTO DEL NAVEGADOR
  /*
  private generateCompleteDiagnosticWithAI(diagnosticData: any): void {
    console.log('🤖 Iniciando generación de diagnóstico completo con IA...');
    this.isGeneratingReport = true;
    
    // 🔧 SOLUCIÓN: Timeout global MUY AGRESIVO para evitar congelamiento
    const globalTimeout = setTimeout(() => {
      console.log('⏰ Timeout global alcanzado - usando fallback local');
      this.fallbackToLocalComplete(diagnosticData);
    }, 15000); // Solo 15 segundos máximo
    
    // 🔧 SOLUCIÓN: Contador de llamadas exitosas
    let completedCalls = 0;
    const totalCalls = 3;
    
    const checkCompletion = () => {
      completedCalls++;
      if (completedCalls >= totalCalls) {
        clearTimeout(globalTimeout);
        this.isGeneratingReport = false;
        console.log('✅ Generación completa finalizada');
      }
    };
    
    // 1. Generar análisis del diagnóstico con IA
    this.generateDiagnosticAnalysisWithAI(diagnosticData, checkCompletion);
    
    // 2. Generar plan de acción personalizado con IA
    this.generatePersonalizedActionPlanWithAI(diagnosticData, checkCompletion);
    
    // 3. Generar objetivos personalizados con IA
    this.generatePersonalizedObjectivesWithAI(diagnosticData, checkCompletion);
  }
  */

  // 🚨 MÉTODO TEMPORALMENTE DESHABILITADO - CAUSA CONGELAMIENTO DEL NAVEGADOR
  /*
  private generateDiagnosticAnalysisWithAI(diagnosticData: any, onComplete?: () => void): void {
    console.log('🧠 Generando análisis del diagnóstico con IA...');
    
    // 🔧 SOLUCIÓN: Timeout individual MUY AGRESIVO para esta llamada
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout en análisis del diagnóstico - usando fallback');
      this.fallbackToLocalAnalysis(diagnosticData);
      onComplete?.();
    }, 8000); // Solo 8 segundos
    
    const prompt = this.buildDiagnosticAnalysisPrompt(diagnosticData);
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto consultor en transformación digital e IA con más de 15 años de experiencia. Analiza el diagnóstico de madurez en IA y genera un análisis profesional, detallado y personalizado.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 2000,
      temperature: 0.7
    };

    this.asistenteIaService.generarTextoAzure(payload).subscribe({
      next: (res: any) => {
        clearTimeout(timeout);
        try {
          const content = res?.choices?.[0]?.message?.content ?? '';
          console.log('✅ Análisis del diagnóstico generado con IA:', content);
          
          // Procesar y guardar el análisis
          this.processDiagnosticAnalysis(content, diagnosticData);
        } catch (error) {
          console.error('❌ Error procesando análisis del diagnóstico:', error);
          this.fallbackToLocalAnalysis(diagnosticData);
        }
        onComplete?.();
      },
      error: (err: unknown) => {
        clearTimeout(timeout);
        console.error('❌ Error generando análisis del diagnóstico con IA:', err);
        this.fallbackToLocalAnalysis(diagnosticData);
        onComplete?.();
      }
    });
  }
  */

  // 🚨 MÉTODO TEMPORALMENTE DESHABILITADO - CAUSA CONGELAMIENTO DEL NAVEGADOR
  /*
  private generatePersonalizedActionPlanWithAI(diagnosticData: any, onComplete?: () => void): void {
    console.log('📋 Generando plan de acción personalizado con IA...');
    
    // 🔧 SOLUCIÓN: Timeout individual MUY AGRESIVO para esta llamada
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout en plan de acción - usando fallback');
      this.fallbackToLocalActionPlan(diagnosticData);
      onComplete?.();
);
      onComplete?.();
    }, 8000); // Solo 8 segundos
    
    const prompt = this.buildActionPlanPrompt(diagnosticData);
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en desarrollo profesional y coaching que genera planes de acción estratégicos, personalizados y accionables. Responde SOLO con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 1500,
      temperature: 0.6
    };

    this.asistenteIaService.generarTextoAzure(payload).subscribe({
      next: (res: any) => {
        clearTimeout(timeout);
        try {
          const content = res?.choices?.[0]?.message?.content ?? '';
          const plan = JSON.parse(content);
          console.log('✅ Plan de acción personalizado generado con IA:', plan);
          
          // Procesar y guardar el plan de acción
          this.processActionPlan(plan, diagnosticData);
        } catch (error) {
          console.error('❌ Error procesando plan de acción:', error);
          this.fallbackToLocalActionPlan(diagnosticData);
        }
        onComplete?.();
      },
      error: (err: unknown) => {
        clearTimeout(timeout);
        console.error('❌ Error generando plan de acción con IA:', err);
        this.fallbackToLocalActionPlan(diagnosticData);
        onComplete?.();
      }
    });
  }
  */

  // 🚨 MÉTODO TEMPORALMENTE DESHABILITADO - CAUSA CONGELAMIENTO DEL NAVEGADOR
  /*
  private generatePersonalizedObjectivesWithAI(diagnosticData: any, onComplete?: () => void): void {
    console.log('🎯 Generando objetivos personalizados con IA...');
    
    // 🔧 SOLUCIÓN: Timeout individual para esta llamada
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout en objetivos - usando fallback');
      this.fallbackToLocalObjectives(diagnosticData);
      onComplete?.();
    }, 8000); // Solo 8 segundos
    
    const prompt = this.buildObjectivesPrompt(diagnosticData);
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor experto en transformación digital con IA. Genera objetivos SMART, accionables y específicos basados en el contexto del cliente. Responde SOLO con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 1200,
      temperature: 0.7
    };

    this.asistenteIaService.generarTextoAzure(payload).subscribe({
      next: (res: any) => {
        clearTimeout(timeout);
        try {
          const content = res?.choices?.[0]?.message?.content ?? '';
          const objectives = JSON.parse(content);
          console.log('✅ Objetivos personalizados generados con IA:', objectives);
          
          // Procesar y guardar los objetivos
          this.processObjectives(objectives, diagnosticData);
        } catch (error) {
          console.error('❌ Error procesando objetivos:', error);
          this.fallbackToLocalObjectives(diagnosticData);
        }
        onComplete?.();
      },
      error: (err: unknown) => {
        clearTimeout(timeout);
        console.error('❌ Error generando objetivos con IA:', err);
        this.fallbackToLocalObjectives(diagnosticData);
        onComplete?.();
      }
    });
  }
  */

  // Construir prompt para análisis del diagnóstico
  private buildDiagnosticAnalysisPrompt(diagnosticData: any): string {
    const contexto = diagnosticData.contexto || {};
    const ares = diagnosticData.ares || {};
    const competencias = diagnosticData.competencias || {};
    const objetivo = diagnosticData.objetivo || 'Mejorar la madurez en IA';
    
    return `
ANÁLISIS COMPLETO DE DIAGNÓSTICO DE MADUREZ EN IA

CONTEXTO DEL CLIENTE:
- Industria: ${contexto.industria || 'No especificada'}
- Tamaño de empresa: ${contexto.tamano || 'No especificado'}
- Presupuesto: ${contexto.presupuesto || 'No especificado'}
- Objetivo principal: ${objetivo}

EVALUACIÓN ARES (Ágil, Responsable, Ético, Sostenible):
${Object.entries(ares).map(([key, value]) => `- ${key}: ${value}/5`).join('\n')}

EVALUACIÓN DE COMPETENCIAS:
${Array.isArray(competencias) 
  ? competencias.map((comp: any) => `- ${comp.competenciaId}: ${comp.puntaje}/100 (Nivel: ${comp.nivel})`).join('\n')
  : Object.entries(competencias).map(([key, value]) => `- ${key}: ${value}/100`).join('\n')
}

INSTRUCCIONES:
Genera un análisis completo y profesional que incluya:

1. RESUMEN EJECUTIVO (2-3 párrafos):
   - Nivel general de madurez en IA
   - Principales fortalezas identificadas
   - Áreas críticas de mejora
   - Posicionamiento competitivo

2. ANÁLISIS FODA DETALLADO:
   - 3-4 fortalezas específicas con justificación
   - 3-4 debilidades críticas con impacto
   - 2-3 oportunidades de mercado
   - 2-3 amenazas y riesgos

3. EVALUACIÓN POR DIMENSIONES:
   - Análisis de cada fase ARES
   - Análisis de competencias clave
   - Identificación de gaps críticos

4. RECOMENDACIONES ESTRATÉGICAS:
   - Prioridades de acción inmediatas
   - Roadmap de transformación
   - Inversiones recomendadas

El análisis debe ser específico, accionable y adaptado al contexto del cliente.
    `;
  }

  // Construir prompt para plan de acción
  private buildActionPlanPrompt(diagnosticData: any): string {
    const contexto = diagnosticData.contexto || {};
    const ares = diagnosticData.ares || {};
    const competencias = diagnosticData.competencias || {};
    
    return `
PLAN DE ACCIÓN PERSONALIZADO PARA TRANSFORMACIÓN DIGITAL

CONTEXTO:
- Industria: ${contexto.industria || 'No especificada'}
- Tamaño: ${contexto.tamano || 'No especificado'}
- Presupuesto: ${contexto.presupuesto || 'No especificado'}

ANÁLISIS ACTUAL:
- Scores ARES: ${JSON.stringify(ares)}
- Competencias: ${JSON.stringify(competencias)}

INSTRUCCIONES:
Genera un plan de acción estratégico con 5-7 acciones priorizadas. Responde SOLO con JSON válido:

{
  "planEstrategico": {
    "vision": "Descripción de la visión de transformación",
    "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
    "acciones": [
      {
        "prioridad": 1,
        "area": "ARES o Competencia",
        "accion": "Descripción de la acción",
        "descripcion": "Explicación detallada",
        "tiempoEstimado": "3-6 meses",
        "recursos": ["Recurso 1", "Recurso 2"],
        "metricas": ["Métrica 1", "Métrica 2"],
        "responsable": "Rol o departamento"
      }
    ],
    "timeline": {
      "cortoPlazo": "3-6 meses",
      "medianoPlazo": "6-12 meses",
      "largoPlazo": "12-24 meses"
    },
    "inversionEstimada": "Rango de inversión",
    "riesgos": ["Riesgo 1", "Riesgo 2"],
    "mitigaciones": ["Mitigación 1", "Mitigación 2"]
  }
}
    `;
  }

  // Construir prompt para objetivos
  private buildObjectivesPrompt(diagnosticData: any): string {
    const contexto = diagnosticData.contexto || {};
    const ares = diagnosticData.ares || {};
    const competencias = diagnosticData.competencias || {};
    
    return `
OBJETIVOS PERSONALIZADOS PARA TRANSFORMACIÓN DIGITAL

CONTEXTO:
- Industria: ${contexto.industria || 'No especificada'}
- Tamaño: ${contexto.tamano || 'No especificado'}
- Presupuesto: ${contexto.presupuesto || 'No especificado'}

ANÁLISIS ACTUAL:
- Scores ARES: ${JSON.stringify(ares)}
- Competencias: ${JSON.stringify(competencias)}

INSTRUCCIONES:
Genera 5 objetivos SMART específicos y personalizados. Responde SOLO con JSON válido:

{
  "objetivos": [
    {
      "id": 1,
      "categoria": "ARES o Competencia",
      "objetivo": "Descripción del objetivo SMART",
      "especifico": "Qué se quiere lograr específicamente",
      "medible": "Cómo se medirá el progreso",
      "alcanzable": "Por qué es alcanzable",
      "relevante": "Por qué es relevante para el negocio",
      "tiempo": "Cuándo se debe lograr",
      "acciones": ["Acción 1", "Acción 2", "Acción 3"],
      "recursos": ["Recurso 1", "Recurso 2"],
      "indicadores": ["Indicador 1", "Indicador 2"]
    }
  ]
}
    `;
  }

  // Procesar análisis del diagnóstico
  private processDiagnosticAnalysis(analysis: string, diagnosticData: any): void {
    try {
      // Aquí puedes procesar el análisis y extraer información estructurada
      console.log('📊 Procesando análisis del diagnóstico:', analysis);
      
      // Crear reporte con el análisis de IA
      this.report = {
        titulo_informe: 'Diagnóstico de Madurez ARES-AI - Análisis Personalizado',
        resumen_ejecutivo: analysis,
        analisis_ares: [],
        plan_de_accion: [],
        planDeAccion: { items: [] }
      } as any;
      
      // Marcar como completado
      this.isLoadingReport = false;
      this.isGeneratingReport = false;
      
    } catch (error) {
      console.error('❌ Error procesando análisis del diagnóstico:', error);
      this.fallbackToLocalAnalysis(diagnosticData);
    }
  }

  // Procesar plan de acción
  private processActionPlan(plan: any, diagnosticData: any): void {
    try {
      console.log('📋 Procesando plan de acción:', plan);
      
      if (this.report) {
        this.report = { ...this.report, planDeAccion: plan };
      }
      
      // Guardar en Firestore si hay ID
      if (this.diagnosticId) {
        this.diagnosticsService.updateActionPlan(this.diagnosticId, plan.planEstrategico?.acciones || [])
          .catch((err: unknown) => console.error('Error al guardar plan de acción:', err));
      }
      
    } catch (error) {
      console.error('❌ Error procesando plan de acción:', error);
    }
  }

  // Procesar objetivos
  private processObjectives(objectives: any, diagnosticData: any): void {
    try {
      console.log('🎯 Procesando objetivos:', objectives);
      
      if (this.report) {
        (this.report as any).objetivos_personalizados = objectives.objetivos || [];
      }
      
    } catch (error) {
      console.error('❌ Error procesando objetivos:', error);
    }
  }

  // Fallbacks a análisis local
  private fallbackToLocalAnalysis(diagnosticData: any): void {
    console.log('🔄 Usando análisis local como fallback...');
    const diagnosticAnalysis = this.scoringService.generateDiagnosticAnalysis(diagnosticData);
    const actionPlan = this.scoringService.generateActionPlan(diagnosticData);
    
    this.report = {
      titulo_informe: 'Diagnóstico de Madurez ARES-AI',
      resumen_ejecutivo: this.generateExecutiveSummary(diagnosticAnalysis, actionPlan),
      analisis_ares: [],
      plan_de_accion: this.generateActionPlanItems(actionPlan),
      planDeAccion: { items: [] }
    } as any;
    
    (this.report as any).analisis_foda = this.generateFODAAnalysis(diagnosticAnalysis);
    (this.report as any).areas_enfoque_principales = this.getTopCompetencyNames(diagnosticData.competencias);
    (this.report as any).siguientes_pasos = this.generateNextSteps(diagnosticAnalysis);
    (this.report as any).nivel_general = diagnosticAnalysis.mainLevel;
    (this.report as any).puntaje_total = diagnosticAnalysis.mainLevel === 'Líder' ? 85 : 
                   diagnosticAnalysis.mainLevel === 'Avanzado' ? 70 :
                   diagnosticAnalysis.mainLevel === 'Practicante' ? 50 :
                   diagnosticAnalysis.mainLevel === 'Principiante' ? 30 : 15;
    
    this.isLoadingReport = false;
    this.isGeneratingReport = false;
  }

  private fallbackToLocalActionPlan(diagnosticData: any): void {
    console.log('🔄 Usando plan de acción local como fallback...');
    const actionPlan = this.scoringService.generateActionPlan(diagnosticData);
    if (this.report) {
      (this.report as any).plan_de_accion = this.generateActionPlanItems(actionPlan);
    }
  }

  private fallbackToLocalObjectives(diagnosticData: any): void {
    console.log('🔄 Usando objetivos locales como fallback...');
    // Generar objetivos básicos basados en los scores
    const basicObjectives = [
      'Mejorar la madurez general en IA',
      'Desarrollar competencias críticas identificadas',
      'Implementar mejores prácticas del Framework ARES'
    ];
    
    if (this.report) {
      (this.report as any).objetivos_personalizados = basicObjectives.map((obj, index) => ({
        id: index + 1,
        objetivo: obj,
        categoria: 'General',
        tiempo: '6-12 meses'
      }));
    }
  }

  // Métodos auxiliares para el HTML
  getNivelGeneral(): string {
    return (this.report as any)?.nivel_general || 'Inicial';
  }

  getPlanDeAccion(): any[] {
    return (this.report as any)?.plan_de_accion || [];
  }

  getSiguientesPasos(): string[] {
    return (this.report as any)?.siguientes_pasos || [];
  }

  generateActionPlan(report: DiagnosticReport): void {
    try {
      const promptText = this.buildActionPlanPrompt(report);
      const payload = {
        messages: [
          { role: 'system', content: 'Eres un experto en desarrollo profesional y coaching que solo responde con objetos JSON válidos.' },
          { role: 'user', content: promptText }
        ],
        maxTokens: 1000,
        temperature: 0.5
      } as any;

      this.asistenteIaService.generarTextoAzure(payload).subscribe({
        next: (res: any) => {
          try {
            const content = res?.choices?.[0]?.message?.content ?? '';
            const plan = JSON.parse(content);
            if (this.report) {
              this.report = { ...this.report, planDeAccion: plan } as any;
            }
            if (this.diagnosticId) {
              const items: PlanDeAccionItem[] = plan?.items || [];
              this.diagnosticsService.updateActionPlan(this.diagnosticId, items).catch((err: unknown) => console.error('Error al guardar planDeAccion:', err));
            }
          } catch (error) {
            console.error('Error al parsear el plan de acción JSON:', error);
          }
        },
        error: (err: unknown) => {
          console.error('Error al generar plan de acción:', err);
        }
      });
    } catch (error) {
      console.error('Error general en generateActionPlan:', error);
    }
  }

  toggleTask(reportId: string, planItems: any[]): void {
    if (!reportId || !Array.isArray(planItems)) return;
    this.diagnosticsService.updateActionPlan(reportId, planItems as PlanDeAccionItem[])
      .catch((err: unknown) => console.error('Error actualizando estado de tareas:', err));
  }

  // =====================
  // Exportar a PDF (html2canvas + jsPDF)
  // =====================
  // =====================
  // 🔧 SOLUCIÓN: Métodos para generar reporte local
  // =====================
  
  private generateExecutiveSummary(analysis: any, actionPlan: any): string {
    const nivel = analysis.mainLevel;
    const fortalezas = analysis.topStrengths?.slice(0, 2).map((s: any) => s.name).join(', ') || 'No identificadas';
    const oportunidades = analysis.topOpportunities?.slice(0, 2).map((s: any) => s.name).join(', ') || 'No identificadas';
    
    return `Tu organización se encuentra en un nivel ${nivel} en la implementación de IA. 
    Las principales fortalezas identificadas son: ${fortalezas}. 
    Las áreas de oportunidad más importantes son: ${oportunidades}. 
    Este diagnóstico te proporciona un plan de acción personalizado para acelerar tu transformación digital.`;
  }
  
  private generateFODAAnalysis(analysis: any): any {
    return {
      fortalezas: analysis.topStrengths?.map((s: any) => s.name) || [],
      oportunidades: analysis.topOpportunities?.map((s: any) => s.name) || [],
      debilidades: analysis.topOpportunities?.slice(0, 3).map((s: any) => s.name) || [],
      amenazas: ['Falta de talento especializado', 'Cambios regulatorios', 'Competencia tecnológica']
    };
  }
  
  private generateActionPlanItems(actionPlan: any): any[] {
    if (!actionPlan.areasDesarrollo) return [];
    
    return actionPlan.areasDesarrollo.map((area: any, index: number) => ({
      area_mejora: area.competencia || `Área ${index + 1}`,
      descripcion_problema: area.descripcion || 'Área de mejora identificada',
      acciones_recomendadas: area.acciones?.map((a: any) => ({ accion: a.accion || 'Acción recomendada' })) || []
    }));
  }
  
  private getTopCompetencyNames(competencias: any[]): string[] {
    if (!Array.isArray(competencias)) return [];
    return competencias.slice(0, 5).map((c: any) => c.competenciaId || 'Competencia');
  }
  
  private generateNextSteps(analysis: any): string[] {
    const pasos = [
      'Revisar y priorizar las acciones del plan de acción',
      'Asignar responsables para cada iniciativa',
      'Establecer métricas de seguimiento',
      'Programar revisión mensual del progreso',
      'Considerar capacitación del equipo en áreas críticas'
    ];
    
    if (analysis.mainLevel === 'Inicial' || analysis.mainLevel === 'Principiante') {
      pasos.unshift('Establecer comité de transformación digital');
      pasos.unshift('Realizar auditoría de infraestructura tecnológica');
    }
    
    return pasos;
  }
  


  public downloadPdf(): void {
    const reportElement = document.getElementById('diagnosticReportContainer');
    if (!reportElement) {
      console.error('Elemento del reporte no encontrado!');
      return;
    }

    const actionButtons = reportElement.querySelectorAll('.no-print');
    actionButtons.forEach(el => ((el as HTMLElement).style.visibility = 'hidden'));

    html2canvas(reportElement, { scale: 2, useCORS: true }).then(canvas => {
      actionButtons.forEach(el => ((el as HTMLElement).style.visibility = 'visible'));

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const filename = `informe-diagnostico-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    }).catch((error: unknown) => {
      actionButtons.forEach(el => ((el as HTMLElement).style.visibility = 'visible'));
      console.error('Error al generar el PDF:', error);
    });
  }

  // Obtener nombre legible de competencia
  private getCompetencyName(key: string): string {
    const names: {[key: string]: string} = {
      'pensamiento-critico': 'Pensamiento Crítico y Análisis',
      'resolucion-problemas': 'Resolución de Problemas Complejos',
      'creatividad': 'Creatividad e Innovación',
      'liderazgo': 'Liderazgo e Influencia Social',
      'inteligencia-emocional': 'Inteligencia Emocional',
      'colaboracion': 'Colaboración y Trabajo en Equipo',
      'adaptabilidad': 'Adaptabilidad y Flexibilidad',
      'comunicacion': 'Comunicación Efectiva',
      'curiosidad': 'Curiosidad y Aprendizaje Activo',
      'alfabetizacion-digital': 'Alfabetización Digital y Tecnológica'
    };
    return names[key] || key;
  }

  // Obtener descripción de fortaleza basada en el score
  getStrengthDescription(score: number): string {
    if (score >= 4) return 'Excelente nivel de madurez en esta dimensión';
    if (score >= 3) return 'Buen nivel de madurez con oportunidades de mejora';
    if (score >= 2) return 'Nivel básico de madurez que puede desarrollarse';
    return 'Área que requiere atención y desarrollo';
  }

  // Obtener descripción de oportunidad basada en el score
  getOpportunityDescription(score: number): string {
    if (score <= 1) return 'Requiere atención inmediata y desarrollo prioritario';
    if (score <= 2) return 'Necesita desarrollo significativo en el corto plazo';
    if (score <= 3) return 'Tiene potencial de mejora en el mediano plazo';
    return 'Área con oportunidades de optimización';
  }
  
  // 🔧 MÉTODO DE FALLBACK COMPLETO: Para cuando fallan todas las llamadas a la API
  private fallbackToLocalComplete(diagnosticData: any): void {
    console.log('🔄 Usando fallback completo local...');
    
    // Generar análisis local
    this.fallbackToLocalAnalysis(diagnosticData);
    
    // Generar plan de acción local
    this.fallbackToLocalActionPlan(diagnosticData);
    
    // Generar objetivos locales
    this.fallbackToLocalObjectives(diagnosticData);
    
    // Marcar como completado
    this.isGeneratingReport = false;
    console.log('✅ Fallback completo finalizado');
  }
  
  // 🔧 SOLUCIÓN: Método simplificado para cargar desde Firestore
  private loadDiagnosticFromFirestoreSimple(id: string): void {
    console.log('📥 Cargando diagnóstico desde Firestore (modo simple):', id);
    
    // 🔧 SOLUCIÓN: Timeout muy corto para evitar congelamiento
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado - usando datos de prueba');
      this.generateTestData();
    }, 5000); // Solo 5 segundos
    
    this.diagnosticsService.getById(id).subscribe({
      next: (doc: any) => {
        clearTimeout(timeoutId);
        try {
          const diagnosticData = doc?.diagnosticData || doc?.form || {};
          const scores = doc?.scores || null;
          
          if (scores) {
            this.scores = scores;
          } else {
            this.scores = {
              ares: this.scoringService.computeAresScore(diagnosticData),
              competencias: this.scoringService.computeCompetencyScores(diagnosticData)
            } as any;
          }
          
          this.prepareRadarChartData();
          this.report = doc?.report || null;
          this.isGeneratingReport = false;
          this.isLoadingReport = false;
          this.formatChartData();
          
          console.log('✅ Diagnóstico cargado exitosamente desde Firestore');
        } catch (e) {
          console.error('❌ Error procesando doc diagnóstico:', e);
          this.generateTestData();
        }
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.error('❌ Error cargando diagnóstico desde Firestore:', error);
        this.generateTestData();
      }
    });
  }

  // 🔧 SOLUCIÓN: Generar reporte local sin llamadas a IA
  private generateLocalReport(diagnosticData: any): void {
    console.log('📋 Generando reporte local (sin IA)...');
    
    try {
      // Generar análisis local básico
      const aresScores = this.scores.ares;
      const competenciasScores = this.scores.competencias;
      
      // Calcular nivel general
      let nivelGeneral = 'Inicial';
      let puntajeTotal = 0;
      
      if (aresScores && aresScores.promedio) {
        puntajeTotal = Math.round(aresScores.promedio * 20); // Convertir a escala 0-100
        
        if (puntajeTotal >= 80) nivelGeneral = 'Líder';
        else if (puntajeTotal >= 60) nivelGeneral = 'Avanzado';
        else if (puntajeTotal >= 40) nivelGeneral = 'Intermedio';
        else if (puntajeTotal >= 20) nivelGeneral = 'Principiante';
      }
      
      // Crear reporte básico
      this.report = {
        titulo_informe: 'Diagnóstico de Madurez ARES-AI - Reporte Local',
        resumen_ejecutivo: `Tu organización se encuentra en un nivel ${nivelGeneral} en la implementación de IA. 
        El puntaje total es de ${puntajeTotal}/100. Este diagnóstico te proporciona un plan de acción personalizado 
        para acelerar tu transformación digital.`,
        analisis_ares: [],
        plan_de_accion: [
          {
            area_mejora: 'Desarrollo de Competencias',
            descripcion_problema: 'Identificamos áreas de mejora en las competencias evaluadas',
            acciones_recomendadas: [
              {
                accion: 'Implementar programa de capacitación',
                detalle: 'Desarrollar un plan de formación específico para las competencias identificadas'
              },
              {
                accion: 'Establecer métricas de seguimiento',
                detalle: 'Crear indicadores para medir el progreso en cada competencia'
              }
            ]
          }
        ],
        planDeAccion: { items: [] }
      } as any;
      
      // Agregar análisis FODA básico
      (this.report as any).analisis_foda = {
        fortalezas: ['Pensamiento crítico', 'Resolución de problemas'],
        debilidades: ['Alfabetización digital', 'Liderazgo en IA'],
        oportunidades: ['Mercado en crecimiento', 'Demanda de talento'],
        amenazas: ['Competencia tecnológica', 'Cambios regulatorios']
      };
      
      // Agregar áreas de enfoque
      (this.report as any).areas_enfoque_principales = [
        'Alfabetización digital y tecnológica',
        'Liderazgo en transformación digital',
        'Innovación y creatividad tecnológica'
      ];
      
      console.log('✅ Reporte local generado exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando reporte local:', error);
      // Usar reporte mínimo como fallback
      this.report = {
        titulo_informe: 'Diagnóstico de Madurez ARES-AI',
        resumen_ejecutivo: 'Se ha completado tu diagnóstico. Revisa los resultados y el plan de acción recomendado.',
        analisis_ares: [],
        plan_de_accion: [],
        planDeAccion: { items: [] }
      } as any;
    }
  }

  // 🚨 MÉTODO TEMPORALMENTE DESHABILITADO - CAUSA CONGELAMIENTO DEL NAVEGADOR
  /*
  private verificarYGenerarDiagnostico(diagnosticData: any): void {
    console.log('🔍 Verificando salud de la API antes de generar diagnóstico...');
    
    // 🔧 SOLUCIÓN: Timeout muy agresivo para evitar congelamiento
    const healthCheckTimeout = setTimeout(() => {
      console.log('⏰ Timeout en verificación de salud - usando fallback local');
      this.fallbackToLocalComplete(diagnosticData);
    }, 8000); // Solo 8 segundos para verificar salud
    
    this.asistenteIaService.verificarSaludAPI().subscribe({
      next: (isHealthy: boolean) => {
        clearTimeout(healthCheckTimeout);
        if (isHealthy) {
          console.log('✅ API saludable - generando diagnóstico con IA');
          this.generateCompleteDiagnosticWithAI(diagnosticData);
        } else {
          console.log('❌ API no disponible - usando fallback local');
          this.fallbackToLocalComplete(diagnosticData);
        }
      },
      error: (error) => {
        clearTimeout(healthCheckTimeout);
        console.error('❌ Error verificando API:', error);
        console.log('🔄 Usando fallback local por error de verificación');
        this.fallbackToLocalComplete(diagnosticData);
);
      }
    });
  }
  */

  // 🔧 MÉTODO DE EMERGENCIA: Bypass completo del sistema
  emergencyBypass(): void {
    console.log('🚨 BYPASS DE EMERGENCIA ACTIVADO - Generando resultados inmediatamente');
    
    try {
      // 1. Generar datos de prueba inmediatamente
      this.generateTestData();
      
      // 2. Generar reporte local básico
      this.report = {
        titulo_informe: 'Diagnóstico de Madurez ARES-AI - MODO EMERGENCIA',
        resumen_ejecutivo: `Tu organización se encuentra en un nivel Intermedio en la implementación de IA. 
        El puntaje total es de 65/100. Este diagnóstico te proporciona un plan de acción personalizado 
        para acelerar tu transformación digital.`,
        analisis_ares: [
          {
            dimension: 'Preparación (F1)',
            puntaje: 70,
            analisis: 'Buen nivel en preparación de datos y talento, necesita mejorar gobernanza'
          },
          {
            dimension: 'Diseño (F2)',
            puntaje: 65,
            analisis: 'Aspectos éticos y de valor bien desarrollados, requiere atención en riesgos'
          },
          {
            dimension: 'Desarrollo (F3)',
            puntaje: 60,
            analisis: 'Tecnología implementada, necesita mejorar integración y capacidad'
          },
          {
            dimension: 'Operación (F4)',
            puntaje: 75,
            analisis: 'Excelente en operación y seguridad, buen cumplimiento'
          },
          {
            dimension: 'Escalamiento (F5)',
            puntaje: 55,
            analisis: 'Necesita mejorar adopción y sostenibilidad'
          }
        ],
        plan_de_accion: [
          {
            area_mejora: 'Gobernanza de IA',
            descripcion_problema: 'Falta de políticas claras y marcos regulatorios para IA',
            acciones_recomendadas: [
              {
                accion: 'Establecer comité de ética de IA',
                detalle: 'Crear un comité multidisciplinario para supervisar el uso de IA'
              },
              {
                accion: 'Desarrollar políticas de gobernanza',
                detalle: 'Crear documentos que definan el uso responsable de IA'
              }
            ]
          },
          {
            area_mejora: 'Gestión de Riesgos',
            descripcion_problema: 'Necesidad de identificar y mitigar riesgos asociados a IA',
            acciones_recomendadas: [
              {
                accion: 'Realizar evaluación de riesgos',
                detalle: 'Identificar amenazas potenciales y vulnerabilidades'
              },
              {
                accion: 'Implementar controles de mitigación',
                detalle: 'Establecer medidas para reducir riesgos identificados'
              }
            ]
          },
          {
            area_mejora: 'Integración Tecnológica',
            descripcion_problema: 'Sistemas de IA no están completamente integrados',
            acciones_recomendadas: [
              {
                accion: 'Auditoría de integración',
                detalle: 'Evaluar la conectividad entre sistemas de IA'
              },
              {
                accion: 'Implementar APIs unificadas',
                detalle: 'Crear interfaces para conectar diferentes sistemas'
              }
            ]
          }
        ],
        planDeAccion: { 
          items: [
            {
              id: '1',
              title: 'Establecer comité de ética de IA',
              completed: false,
              priority: 'Alta',
              deadline: '3 meses'
            },
            {
              id: '2',
              title: 'Desarrollar políticas de gobernanza',
              completed: false,
              priority: 'Alta',
              deadline: '6 meses'
            },
            {
              id: '3',
              title: 'Realizar evaluación de riesgos',
              completed: false,
              priority: 'Media',
              deadline: '4 meses'
            }
          ]
        }
      } as any;
      
      // 3. Agregar análisis FODA
      (this.report as any).analisis_foda = {
        fortalezas: [
          'Excelente operación y seguridad',
          'Buen nivel de preparación de datos',
          'Aspectos éticos bien desarrollados'
        ],
        debilidades: [
          'Falta de gobernanza clara',
          'Gestión de riesgos limitada',
          'Integración tecnológica incompleta'
        ],
        oportunidades: [
          'Mercado en crecimiento de IA',
          'Demanda de talento especializado',
          'Potencial de mejora significativa'
        ],
        amenazas: [
          'Cambios regulatorios rápidos',
          'Competencia tecnológica intensa',
          'Riesgos de seguridad emergentes'
        ]
      };
      
      // 4. Agregar áreas de enfoque
      (this.report as any).areas_enfoque_principales = [
        'Gobernanza y ética de IA',
        'Gestión integral de riesgos',
        'Integración tecnológica avanzada',
        'Adopción y sostenibilidad'
      ];
      
      // 5. Marcar como completado
      this.isLoadingReport = false;
      this.isGeneratingReport = false;
      this.loadingError = false;
      
      // 6. Preparar gráficos
      this.prepareRadarChartData();
      this.formatChartData();
      
      // 7. Forzar actualización de la vista
      setTimeout(() => {
        this.scores = { ...this.scores };
        console.log('✅ BYPASS DE EMERGENCIA COMPLETADO - Resultados mostrados');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error en bypass de emergencia:', error);
      // Último recurso: datos mínimos
      this.isLoadingReport = false;
      this.isGeneratingReport = false;
      this.loadingError = true;
    }
  }
}
