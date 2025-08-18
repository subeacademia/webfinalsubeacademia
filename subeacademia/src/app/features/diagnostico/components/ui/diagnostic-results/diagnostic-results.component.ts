import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticReport } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { RadarChartComponent } from '../radar-chart.component';
import { SemaforoAresComponent } from '../semaforo-ares.component';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, RouterLink, RadarChartComponent, SemaforoAresComponent],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css']
})
export class DiagnosticResultsComponent implements OnInit {
  private stateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private generativeAiService = inject(GenerativeAiService);
  private diagnosticsService = inject(DiagnosticsService);

  scores: any;
  report: DiagnosticReport | null = null;
  isLoadingReport = true;
  loadingError = false;
  pdfUrl: string | null = null;

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

      // 2. Llama a la IA para generar el reporte detallado.
      this.generateReport(diagnosticData);
      
    } catch (error) {
      console.error('❌ Error al inicializar resultados:', error);
      this.loadingError = true;
      this.isLoadingReport = false;
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
