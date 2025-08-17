import { Component, OnInit, OnDestroy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, switchMap, tap } from 'rxjs/operators';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService, DiagnosticAnalysisResponse } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticoFormValue, CompetencyScore } from '../../../data/diagnostic.models';
import { RadarChartComponent } from '../radar-chart.component';
import { CardComponent } from '../../../../../shared/ui-kit/card/card.component';
import { UiButtonComponent } from '../../../../../shared/ui-kit/button/button';
import { ContentService } from '../../../../../core/services/content.service';
import { PdfService } from '../../../services/pdf.service';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, RadarChartComponent, CardComponent, UiButtonComponent, MarkdownModule],
  templateUrl: './diagnostic-results.component.html',
})
export class DiagnosticResultsComponent implements OnInit, OnDestroy {
  diagnosticData: DiagnosticoFormValue | null = null;
  competencyResults: { name: string; score: number }[] = [];
  topCompetencies: { name: string; score: number; description: string }[] = [];
  lowestCompetencies: { name: string; score: number; description: string }[] = [];
  
  isLoadingAnalysis = true;
  generativeAnalysis$: Observable<DiagnosticAnalysisResponse> = of({
    titulo_informe: '',
    resumen_ejecutivo: '',
    analisis_ares: [],
    plan_de_accion: []
  });
  analysisContent: DiagnosticAnalysisResponse | null = null; // Almacenar el contenido de la IA para el PDF
  
  loadingMessage = 'Preparando tu análisis...';
  
  private destroy$ = new Subject<void>();
  private loadingInterval: any;
  private allCompetencies: any[] = [];
  private mensajesCarga = [
    'Analizando tus fortalezas y oportunidades... 🤔',
    'Consultando a nuestro coach de IA... 🧠',
    'Generando un plan de acción a tu medida... ⚡',
    'Cruzando datos para un feedback preciso... 📈',
    'Preparando una respuesta detallada... ✨',
  ];
  
  // Propiedades para el PDF
  pdfUrl: string | null = null;
  isPdfGenerating = false;
  pdfError: string | null = null;
  currentDiagnosticId: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private diagnosticStateService: DiagnosticStateService,
    private scoringService: ScoringService,
    private generativeAiService: GenerativeAiService,
    private contentService: ContentService,
    private pdfService: PdfService,
    private diagnosticsService: DiagnosticsService,
    private authService: AuthService,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {
    // Usar afterNextRender para asegurar que la vista esté lista para el PDF
    afterNextRender(() => {
      // Lógica que necesita el DOM, si la hubiera
    });
  }

  ngOnInit(): void {
    this.allCompetencies = this.contentService.getCompetencies();

    // Obtener datos del formulario del servicio
    const currentData = this.diagnosticStateService.getDiagnosticData();
    
    if (currentData && currentData.competencias && Object.keys(currentData.competencias).length > 0) {
      this.diagnosticData = currentData as DiagnosticoFormValue;
      this.calculateResults();
      this.cdr.detectChanges();
      
      // Solo llamamos a la IA si tenemos los datos necesarios
      if (this.topCompetencies.length > 0 && this.lowestCompetencies.length > 0) {
        this.fetchGenerativeAnalysis();
      }
    } else {
      console.error("Datos de diagnóstico inválidos o incompletos recibidos.");
      this.isLoadingAnalysis = false;
    }
  }

  private calculateResults(): void {
    if (!this.diagnosticData) return;

    const scores = this.scoringService.computeCompetencyScores(this.diagnosticData);
    
    const resultsWithDetails = scores.map(score => {
      const competencyData = this.allCompetencies.find(c => c.id === score.competenciaId);
      return {
        name: score.competenciaId,
        score: score.puntaje,
        description: competencyData?.description || 'Descripción no disponible'
      };
    });

    this.competencyResults = resultsWithDetails;
    this.topCompetencies = [...resultsWithDetails].sort((a, b) => b.score - a.score).slice(0, 3);
    this.lowestCompetencies = [...resultsWithDetails].sort((a, b) => a.score - b.score).slice(0, 3);
  }

  private fetchGenerativeAnalysis(): Observable<DiagnosticAnalysisResponse> {
    if (!this.diagnosticData) return of({
      titulo_informe: 'Error: Faltan datos del diagnóstico.',
      resumen_ejecutivo: 'No se pudieron obtener los datos necesarios para el análisis.',
      analisis_ares: [],
      plan_de_accion: []
    });

    this.isLoadingAnalysis = true;
    this.startLoadingMessages();

    // Preparar los datos para el nuevo método JSON
    const diagnosticData = {
      context: {
        role: 'Profesional',
        industry: this.diagnosticData.contexto?.industria || 'General',
        companySize: this.diagnosticData.contexto?.tamanoEmpresa || this.diagnosticData.contexto?.tamanoEquipo || this.diagnosticData.contexto?.numEmpleados || 'No especificado'
      },
      objective: {
        goal: this.diagnosticData.objetivo || 'No especificado'
      }
    };

    // Calcular puntajes usando el servicio de scoring
    const aresScores = this.scoringService.computeAresScore(this.diagnosticData);
    const competencyScores = this.scoringService.computeCompetencyScores(this.diagnosticData);
    
    const scores = {
      ares: aresScores,
      competencies: competencyScores
    };

    this.generativeAnalysis$ = this.generativeAiService.generateActionPlan(diagnosticData, scores).pipe(
      finalize(() => {
        this.isLoadingAnalysis = false;
        this.stopLoadingMessages();
        this.cdr.detectChanges();
        // Guardar el diagnóstico cuando se complete el análisis
        this.saveDiagnostic();
      })
    );
    
    // Suscribirse para almacenar el contenido para el PDF
    this.generativeAnalysis$.subscribe(content => {
      this.analysisContent = content;
    });
    
    return this.generativeAnalysis$;
  }

  private async saveDiagnostic(): Promise<void> {
    if (!this.diagnosticData) return;

    try {
      // Obtener el usuario actual si está autenticado
      let userId: string | undefined;
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          userId = user.uid;
        }
      }).unsubscribe(); // Desuscribirse inmediatamente para evitar memory leaks

      // Preparar los datos para guardar
      const payload = {
        version: 1,
        lang: 'es' as const,
        createdAt: Date.now(),
        form: this.diagnosticData,
        scores: {
          ares: this.scoringService.computeAresScore(this.diagnosticData),
          competencias: this.competencyResults.map(result => ({
            competenciaId: result.name,
            puntaje: result.score,
            nivel: 'intermedio' as const // Valor por defecto
          }))
        },
        userId,
        fecha: new Date(),
        puntajeGeneral: this.calculateOverallScore(),
        objetivo: this.diagnosticData.objetivo || undefined,
        industria: this.diagnosticData.contexto?.industria || undefined,
        analysisContent: this.analysisContent
      };

      if (userId) {
        // Guardar en la colección del usuario
        const diagnosticId = await this.diagnosticsService.saveDiagnostic(payload, userId);
        console.log('Diagnóstico guardado para usuario:', userId, 'ID:', diagnosticId);
        
        // Guardar IDs para escuchar cambios
        this.currentUserId = userId;
        this.currentDiagnosticId = diagnosticId;
        
        // Iniciar escucha del documento para el PDF
        this.listenForPdfGeneration();
      } else {
        // Guardar en la colección global (compatibilidad)
        await this.diagnosticsService.saveAndRequestEmail(payload);
        console.log('Diagnóstico guardado globalmente');
      }
    } catch (error) {
      console.error('Error guardando diagnóstico:', error);
    }
  }

  private calculateOverallScore(): number {
    if (this.competencyResults.length === 0) return 0;
    const totalScore = this.competencyResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / this.competencyResults.length);
  }

  generateAndDownloadPdf(): void {
    const element = document.getElementById('pdf-content');
    if (element && this.diagnosticData && this.analysisContent) {
      // Convertir los resultados para que coincidan con el tipo esperado por el PDF service
      const pdfCompetencyResults = this.competencyResults.map(result => ({
        name: result.name,
        score: result.score
      }));
      
      // Convertir el análisis JSON a string para el PDF
      const analysisContentString = JSON.stringify(this.analysisContent, null, 2);
      
      this.pdfService.generatePdf(element, this.diagnosticData, pdfCompetencyResults, analysisContentString);
    } else {
      console.error('No se encontró el elemento #pdf-content o faltan datos para generar el PDF.');
    }
  }

  // Método para escuchar la generación del PDF
  private listenForPdfGeneration(): void {
    if (!this.currentUserId || !this.currentDiagnosticId) {
      console.error('No se pueden escuchar cambios: faltan userId o diagnosticId');
      return;
    }

    console.log('Iniciando escucha para PDF del diagnóstico:', this.currentDiagnosticId);
    
    const diagnosticRef = doc(this.firestore, `users/${this.currentUserId}/diagnostics/${this.currentDiagnosticId}`);
    
    const unsubscribe = onSnapshot(diagnosticRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        
        // Verificar si el PDF está listo
        if (data['pdfUrl']) {
          this.pdfUrl = data['pdfUrl'];
          this.isPdfGenerating = false;
          this.pdfError = null;
          console.log('PDF generado exitosamente:', this.pdfUrl);
          this.cdr.detectChanges();
          
          // Desuscribirse una vez que el PDF esté listo
          unsubscribe();
        }
        
        // Verificar si hay error en la generación del PDF
        if (data['pdfError']) {
          this.pdfError = data['pdfError'];
          this.isPdfGenerating = false;
          console.error('Error generando PDF:', this.pdfError);
          this.cdr.detectChanges();
          
          // Desuscribirse una vez que haya error
          unsubscribe();
        }
        
        // Si no hay PDF ni error, está en proceso
        if (!data['pdfUrl'] && !data['pdfError']) {
          this.isPdfGenerating = true;
          this.cdr.detectChanges();
        }
      }
    }, (error) => {
      console.error('Error escuchando cambios del diagnóstico:', error);
      this.pdfError = 'Error al monitorear la generación del PDF';
      this.isPdfGenerating = false;
      this.cdr.detectChanges();
    });

    // Agregar la función de desuscripción al destroy$
    this.destroy$.subscribe(() => {
      unsubscribe();
    });
  }

  // Método para descargar el PDF generado
  downloadPdf(): void {
    if (this.pdfUrl) {
      const link = document.createElement('a');
      link.href = this.pdfUrl;
      link.download = `diagnostico-${this.currentDiagnosticId || 'reporte'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopLoadingMessages();
  }
}
