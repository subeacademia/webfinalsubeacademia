import { Component, OnInit, OnDestroy, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService, DiagnosticAnalysisData } from '../../../../../core/ai/generative-ai.service';
import { Competency, DiagnosticData } from '../../../data/diagnostic.models';
import { RadarChartComponent } from '../radar-chart.component';
import { CardComponent } from '../../../../../shared/ui-kit/card/card.component';
import { UiButtonComponent } from '../../../../../shared/ui-kit/button/button';
import { ContentService } from '../../../../../core/services/content.service';
import { PdfService } from '../../../services/pdf.service';
import { ToastService } from '../../../../../core/ui/toast/toast.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, RadarChartComponent, CardComponent, UiButtonComponent, MarkdownModule],
  templateUrl: './diagnostic-results.component.html',
})
export class DiagnosticResultsComponent implements OnInit, OnDestroy {
  diagnosticData: DiagnosticData | null = null;
  competencyResults: { name: string; score: number }[] = [];
  topCompetencies: { name: string; score: number; description: string }[] = [];
  lowestCompetencies: { name: string; score: number; description: string }[] = [];
  
  isLoadingAnalysis = true;
  generativeAnalysis$: Observable<string> = of('');
  loadingMessage = 'Preparando tu análisis...';
  
  private destroy$ = new Subject<void>();
  private loadingInterval: any;
  private allCompetencies: Competency[] = [];
  private mensajesCarga = [
    'Analizando tus fortalezas y oportunidades... 🤔',
    'Consultando a nuestro coach de IA... 🧠',
    'Generando un plan de acción a tu medida... ⚡',
    'Cruzando datos para un feedback preciso... 📈',
    'Preparando una respuesta detallada... ✨',
  ];

  constructor(
    private diagnosticStateService: DiagnosticStateService,
    private scoringService: ScoringService,
    private generativeAiService: GenerativeAiService,
    private contentService: ContentService,
    private pdfService: PdfService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    // Usar afterNextRender para asegurar que la vista esté lista para el PDF
    afterNextRender(() => {
      // Lógica que necesita el DOM, si la hubiera
    });
  }

  ngOnInit(): void {
    this.allCompetencies = this.contentService.getCompetencies();

    this.diagnosticStateService.currentData$
      .pipe(
        takeUntil(this.destroy$),
        tap(data => {
          if (!data || !data.competencyAnswers || data.competencyAnswers.length === 0) {
            console.error("Datos de diagnóstico inválidos o incompletos recibidos.");
            this.isLoadingAnalysis = false;
            // Opcional: manejar el error en la UI, ej. mostrando un mensaje.
            return;
          }
          this.diagnosticData = data;
          this.calculateResults();
          this.cdr.detectChanges(); // Actualizar la vista con los resultados numéricos
        }),
        switchMap(data => {
          if (this.topCompetencies.length > 0 && this.lowestCompetencies.length > 0) {
            return this.fetchGenerativeAnalysis();
          }
          return of('No se pudo generar el análisis por falta de datos.');
        })
      )
      .subscribe();
  }

  private calculateResults(): void {
    if (!this.diagnosticData) return;
    
    const scores = this.scoringService.calculateScores(this.diagnosticData);
    
    const resultsWithDetails = scores.map(score => {
      const competencyData = this.allCompetencies.find(c => c.name === score.name);
      return {
        ...score,
        description: competencyData?.description || 'Descripción no disponible'
      };
    });

    this.competencyResults = scores;
    this.topCompetencies = [...resultsWithDetails].sort((a, b) => b.score - a.score).slice(0, 3);
    this.lowestCompetencies = [...resultsWithDetails].sort((a, b) => a.score - b.score).slice(0, 3);
  }

  private fetchGenerativeAnalysis(): Observable<string> {
    if (!this.diagnosticData) return of('Error: Faltan datos del diagnóstico.');

    this.isLoadingAnalysis = true;
    this.startLoadingMessages();

    const analysisData: DiagnosticAnalysisData = {
      userName: this.diagnosticData.lead.name,
      userRole: this.diagnosticData.context.role,
      userIndustry: this.diagnosticData.context.industry,
      topCompetencies: this.topCompetencies,
      lowestCompetencies: this.lowestCompetencies,
    };

    this.generativeAnalysis$ = this.generativeAiService.generateDiagnosticAnalysis(analysisData).pipe(
      finalize(() => {
        this.isLoadingAnalysis = false;
        this.stopLoadingMessages();
        this.cdr.detectChanges();
      })
    );
    return this.generativeAnalysis$;
  }

  generateAndDownloadPdf(): void {
    const element = document.getElementById('pdf-content');
    if (element && this.diagnosticData) {
      this.pdfService.generatePdf(element, this.diagnosticData, this.competencyResults, '');
    } else {
      console.error('No se encontró el elemento #pdf-content o faltan datos para generar el PDF.');
    }
  }

  guardarPlan(): void {
    // Generar y descargar el PDF del plan
    this.generateAndDownloadPdf();
    
    // Mostrar mensaje de confirmación
    this.toastService.success('Plan guardado exitosamente');
  }

  compartirResultados(): void {
    // Implementar lógica para compartir resultados
    if (navigator.share && this.diagnosticData) {
      const shareData = {
        title: 'Mis Resultados del Diagnóstico de IA',
        text: `He completado mi diagnóstico de competencias en IA. Mi puntuación general es ${this.calculateAverageScore()}%. ¡Descubre tus competencias también!`,
        url: window.location.href
      };
      
      navigator.share(shareData).catch((error) => {
        console.log('Error al compartir:', error);
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }

  private fallbackShare(): void {
    // Fallback para navegadores que no soportan Web Share API
    const url = window.location.href;
    const text = `He completado mi diagnóstico de competencias en IA. ¡Descubre las tuyas en: ${url}`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.success('Enlace copiado al portapapeles. ¡Compártelo con tu equipo!');
    }).catch(() => {
      // Fallback adicional
      const copied = prompt('Copia este enlace para compartir:', url);
      if (copied) {
        this.toastService.info('Enlace copiado manualmente');
      }
    });
  }

  contactarWhatsApp(): void {
    const phoneNumber = '+56912345678'; // Número de WhatsApp (ajustar según necesidad)
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre el plan de acción de mi diagnóstico de IA.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    this.toastService.info('Abriendo WhatsApp...');
  }

  contactoDirecto(): void {
    // Navegar a la página de contacto
    this.router.navigate(['/contacto']);
    this.toastService.info('Redirigiendo al formulario de contacto...');
  }

  private calculateAverageScore(): number {
    if (this.competencyResults.length === 0) return 0;
    const total = this.competencyResults.reduce((sum, comp) => sum + comp.score, 0);
    return Math.round(total / this.competencyResults.length);
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
