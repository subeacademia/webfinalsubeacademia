import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticReport } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { RadarChartComponent } from '../radar-chart.component';
import { SemaforoAresComponent } from '../semaforo-ares.component';
import { ApiProgressBarComponent } from '../api-progress-bar/api-progress-bar.component';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, RouterLink, RadarChartComponent, SemaforoAresComponent, ApiProgressBarComponent],
  templateUrl: './diagnostic-results.component.html',
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
    const diagnosticData = this.stateService.getDiagnosticData();
    // 1. Calcula y muestra los scores inmediatamente.
    const ares = this.scoringService.computeAresScore(diagnosticData);
    const competencias = this.scoringService.calculateScores(diagnosticData);
    this.scores = { ares, competencias };

    // 2. Llama a la IA para generar el reporte.
    this.generativeAiService.generateActionPlan(diagnosticData, this.scores)
      .subscribe({
        next: (report) => {
          if (report) {
            this.report = report;
            // 3. Guarda el reporte y escucha para la URL del PDF.
            this.diagnosticsService.saveDiagnosticWithReport(report, this.scores, diagnosticData).then(docRef => {
              onSnapshot(docRef, (doc: any) => {
                const data = doc.data();
                if (data?.pdfUrl) {
                  this.pdfUrl = data.pdfUrl;
                }
              });
            });
          } else {
            this.loadingError = true;
          }
          this.isLoadingReport = false;
        },
        error: () => {
          this.loadingError = true;
          this.isLoadingReport = false;
        }
      });
  }
}
