import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { Report } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { StrategicCtaComponent } from '../strategic-cta/strategic-cta.component';
import { GapAnalysisChartComponent } from '../gap-analysis-chart/gap-analysis-chart.component';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, StrategicCtaComponent, GapAnalysisChartComponent],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css']
})
export class DiagnosticResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private diagnosticsService = inject(DiagnosticsService);
  public stateService = inject(DiagnosticStateService);

  report = signal<Report | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    console.log('DiagnosticResultsComponent initialized');
    
    // Primero intentar obtener el reporte del estado (flujo normal)
    const stateReport = this.stateService.generatedReport();
    console.log('State report:', stateReport);
    
    if (stateReport) {
      this.report.set(stateReport);
      this.isLoading.set(false);
      console.log('Report loaded from state');
    } else {
      // Si no hay reporte en el estado, intentar obtenerlo por ID
      const id = this.route.snapshot.paramMap.get('id');
      console.log('ID from route:', id);
      
      if (id) {
        this.diagnosticsService.getDiagnosticResult(id).then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.report.set(data['report'] as Report);
            console.log('Report loaded from Firebase');
          } else {
            console.error("No such document!");
          }
          this.isLoading.set(false);
        }).catch(error => {
          console.error("Error getting document:", error);
          this.isLoading.set(false);
        });
      } else {
        console.log('No ID and no state report, showing empty state');
        this.isLoading.set(false);
      }
    }
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