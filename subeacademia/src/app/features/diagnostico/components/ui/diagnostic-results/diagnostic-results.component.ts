import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { Report, ReportData } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { StrategicCtaComponent } from '../strategic-cta/strategic-cta.component';
import { GapAnalysisChartComponent } from '../gap-analysis-chart/gap-analysis-chart.component';
import { AiMaturityMeterComponent } from '../ai-maturity-meter/ai-maturity-meter';
import { StrategicInsightsComponent } from '../strategic-insights/strategic-insights';
import { CompetencyAnalysisComponent } from '../competency-analysis/competency-analysis';
import { AnalysisCardComponent } from '../analysis-card/analysis-card';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [
    CommonModule, 
    StrategicCtaComponent, 
    GapAnalysisChartComponent,
    AiMaturityMeterComponent,
    StrategicInsightsComponent,
    CompetencyAnalysisComponent,
    AnalysisCardComponent
  ],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css']
})
export class DiagnosticResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private diagnosticsService = inject(DiagnosticsService);
  public stateService = inject(DiagnosticStateService);

  report = signal<Report | null>(null);
  holisticReport = signal<ReportData | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    console.log('DiagnosticResultsComponent initialized');
    
    // --- LÓGICA CRÍTICA DE OBTENCIÓN DE DATOS ---
    const currentReport = this.diagnosticsService.getCurrentReport();
    
    // --- LOG DE VERIFICACIÓN #3 ---
    console.log('--- DIAGNOSTIC-RESULTS COMPONENT: ngOnInit ---');
    console.log('Reporte obtenido del servicio:', JSON.stringify(currentReport, null, 2));

    if (currentReport && this.isValidReportData(currentReport)) {
      this.holisticReport.set(currentReport);
      this.isLoading.set(false);
      console.log('Report loaded from service');
    } else {
      // Fallback: intentar obtener del estado
      const stateReport = this.stateService.generatedStrategicReport();
      console.log('State report fallback:', stateReport);
      
      if (stateReport && this.isValidReportData(stateReport)) {
        this.holisticReport.set(stateReport);
        this.isLoading.set(false);
        console.log('Report loaded from state fallback');
      } else {
        console.error("No se encontró ningún reporte para mostrar. Esto no debería pasar.");
        this.handleInvalidReport();
        this.isLoading.set(false);
      }
    }
  }

  /**
   * Valida que el reporte tenga la estructura mínima necesaria
   */
  private isValidReport(report: any): boolean {
    return report && 
           typeof report === 'object' && 
           report.titulo && 
           report.resumen && 
           Array.isArray(report.analisisCompetencias);
  }

  /**
   * Valida que el reporte de datos tenga la estructura mínima necesaria
   */
  private isValidReportData(report: any): boolean {
    return report && 
           typeof report === 'object' && 
           report.executiveSummary && 
           report.aiMaturity &&
           Array.isArray(report.strengthsAnalysis) &&
           Array.isArray(report.weaknessesAnalysis);
  }

  /**
   * Maneja el caso cuando el reporte es inválido o no existe
   */
  private handleInvalidReport(): void {
    console.warn('No hay reporte válido disponible. Redirigiendo al inicio del diagnóstico.');
    // Opcional: redirigir al inicio del diagnóstico
    // this.router.navigate(['/diagnostico/contexto']);
  }

  printReport() {
    window.print();
  }

  reloadPage() {
    window.location.reload();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  /**
   * Calcula la puntuación general del diagnóstico
   */
  getOverallScore(): number {
    const report = this.report();
    if (!report?.analisisCompetencias || report.analisisCompetencias.length === 0) {
      return 0;
    }

    const totalScore = report.analisisCompetencias.reduce((sum, comp) => sum + comp.puntaje, 0);
    const maxScore = report.analisisCompetencias.length * 5;
    const percentage = (totalScore / maxScore) * 100;
    
    return Math.round(percentage);
  }

  /**
   * Convierte los datos de competencias al formato requerido por GapAnalysisChart
   */
  getCompetencyScoresForGapAnalysis(): Record<string, number> {
    const report = this.report();
    if (!report?.analisisCompetencias || report.analisisCompetencias.length === 0) {
      return {};
    }

    const scores: Record<string, number> = {};
    report.analisisCompetencias.forEach(comp => {
      // Convertir el nombre de la competencia a un formato de clave
      const key = comp.competencia.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[áéíóú]/g, (match) => {
          const map: { [key: string]: string } = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u'
          };
          return map[match] || match;
        });
      scores[key] = comp.puntaje;
    });

    return scores;
  }
}