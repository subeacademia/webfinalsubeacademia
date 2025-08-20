import { Component, OnInit, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticReport } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { PdfService } from '../../../services/pdf.service';
import { SemaforoAresComponent } from '../semaforo-ares.component';
import { AnimationService } from '../../../../../core/services/animation.service';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, SemaforoAresComponent, BaseChartDirective],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css']
})
export class DiagnosticResultsComponent implements OnInit, AfterViewInit {
  @ViewChild('resultsContainer') resultsContainer!: ElementRef;
  
  private stateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private generativeAiService = inject(GenerativeAiService);
  private diagnosticsService = inject(DiagnosticsService);
  private pdfService = inject(PdfService);
  private animationService = inject(AnimationService);

  scores: any;
  report: DiagnosticReport | null = null;
  isLoadingReport = true;
  loadingError = false;
  pdfUrl: string | null = null;
  isGeneratingPdf = false;

  // Datos del gráfico radar
  public radarChartData!: ChartConfiguration<'radar'>['data'];
  private finalScores: number[] = [];
  private finalLabels: string[] = [];

  ngOnInit(): void {
    console.log('🚀 DiagnosticResultsComponent.ngOnInit() iniciado');
    
    try {
      const diagnosticData = this.stateService.getDiagnosticData();
      console.log('📊 Datos del diagnóstico:', diagnosticData);
      
      // 1. Calcula y muestra los scores inmediatamente.
      const ares = this.scoringService.computeAresScore(diagnosticData);
      const competencias = this.scoringService.calculateScores(diagnosticData);
      this.scores = { ares, competencias };
      
      console.log('📈 Scores calculados:', this.scores);

      // 2. Prepara los datos del gráfico radar
      this.prepareRadarChartData();

      // 3. Llama a la IA para generar el reporte detallado.
      this.generateReport(diagnosticData);
      
    } catch (error) {
      console.error('❌ Error al inicializar resultados:', error);
      this.loadingError = true;
      this.isLoadingReport = false;
    }
  }

  ngAfterViewInit(): void {
    // Animar el número del puntaje final
    if (this.scores?.ares?.total) {
      this.animationService.countUp('#score-final', this.scores.ares.total);
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

  private prepareRadarChartData(): void {
    if (!this.scores?.competencias) return;

    // Convertir los datos de competencias al formato esperado por ng2-charts
    const competencyEntries = Object.entries(this.scores.competencias);
    this.finalLabels = competencyEntries.map(([name]) => name);
    this.finalScores = competencyEntries.map(([, score]) => score as number);

    console.log('📊 Datos del gráfico radar preparados:', {
      labels: this.finalLabels,
      scores: this.finalScores
    });

    // INICIALIZA EL GRÁFICO CON DATOS EN CERO
    this.radarChartData = {
      labels: this.finalLabels,
      datasets: [{
        data: new Array(this.finalScores.length).fill(0), // Empieza en cero
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
  }

  animateChart(): void {
    if (!this.finalScores.length) return;

    console.log('🎬 Iniciando animación del gráfico radar...');

    const animatedData = {
      // Usamos un objeto proxy para que anime.js pueda modificar cada valor
      ...this.finalScores.reduce((acc, val, i) => ({ ...acc, [`score${i}`]: 0 }), {})
    };

    // Usar anime.js para animar los datos
    const anime = (window as any).anime;
    if (anime) {
      anime({
        targets: animatedData,
        // Mapeamos cada score final a su propiedad correspondiente en el objeto
        ...this.finalScores.reduce((acc, val, i) => ({ ...acc, [`score${i}`]: val }), {}),
        easing: 'easeInOutExpo',
        duration: 2000,
        round: 1,
        update: () => {
          // En cada frame de la animación, actualizamos los datos del gráfico
          const newData = Object.values(animatedData) as number[];
          this.radarChartData.datasets[0].data = newData;
          
          // Forzar la actualización del gráfico
          this.radarChartData = { ...this.radarChartData };
        }
      });
    } else {
      console.warn('⚠️ anime.js no está disponible, usando fallback');
      // Fallback: actualizar directamente
      setTimeout(() => {
        this.radarChartData.datasets[0].data = [...this.finalScores];
        this.radarChartData = { ...this.radarChartData };
      }, 500);
    }
  }

  private generateReport(diagnosticData: any): void {
    console.log('🤖 Iniciando generación del reporte con Gemini...');
    this.isLoadingReport = true;
    this.loadingError = false;
    
    this.generativeAiService.generateActionPlan(diagnosticData, this.scores)
      .subscribe({
        next: (report) => {
          console.log('✅ Reporte generado con Gemini:', report);
          if (report) {
            this.report = report;
            // 3. Guarda el reporte en Firestore.
            this.diagnosticsService.saveDiagnosticWithReport(report, this.scores, diagnosticData).then(docRef => {
              console.log('💾 Reporte guardado en Firestore:', docRef);
            }).catch(error => {
              console.warn('⚠️ No se pudo guardar en Firestore:', error);
            });
          } else {
            console.error('❌ No se pudo generar el reporte con Gemini');
            this.loadingError = true;
          }
          this.isLoadingReport = false;
        },
        error: (error) => {
          console.error('❌ Error al generar reporte con Gemini:', error);
          this.loadingError = true;
          this.isLoadingReport = false;
        }
      });
  }

  async generatePdf(): Promise<void> {
    if (!this.report || !this.scores) {
      console.error('❌ No hay reporte o scores para generar PDF');
      return;
    }

    try {
      this.isGeneratingPdf = true;
      console.log('🚀 Iniciando generación de PDF...');

      // Esperar un momento para asegurar que las animaciones del gráfico hayan terminado
      setTimeout(async () => {
        if (this.resultsContainer?.nativeElement && this.report) {
          // Generar el PDF
          await this.pdfService.generateDiagnosticReport(
            this.report,
            this.scores,
            this.resultsContainer.nativeElement
          );

          console.log('✅ PDF generado exitosamente');
        } else {
          console.error('❌ No se encontró el contenedor de resultados');
          alert('Error: No se pudo encontrar el contenido para generar el PDF');
        }
        this.isGeneratingPdf = false;
      }, 2500); // Esperar 2.5 segundos para que las animaciones terminen

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
      this.isGeneratingPdf = false;
    }
  }

  retryGeneration(): void {
    console.log('🔄 Reintentando generación del reporte...');
    const diagnosticData = this.stateService.getDiagnosticData();
    this.generateReport(diagnosticData);
  }

  // Métodos auxiliares para el nuevo diseño
  getTopCompetencies(): Array<{name: string, score: number}> {
    if (!this.scores?.competencias) return [];
    
    return Object.entries(this.scores.competencias)
      .map(([name, score]) => ({ name, score: score as number }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  getAresPhases(): Array<{name: string, score: number}> {
    if (!this.scores?.ares) return [];
    
    return Object.entries(this.scores.ares)
      .map(([name, score]) => ({ name, score: score as number }))
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
}
