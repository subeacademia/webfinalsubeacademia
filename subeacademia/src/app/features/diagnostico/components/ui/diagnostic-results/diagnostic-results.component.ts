import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticReport } from '../../../data/report.model';
import { RadarChartComponent } from '../radar-chart.component';
import { SemaforoAresComponent } from '../semaforo-ares.component';
import { ApiProgressBarComponent } from '../api-progress-bar/api-progress-bar.component';
import { RouterLink } from '@angular/router';

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

  scores: any;
  report$!: Observable<DiagnosticReport | null>;
  loadingError = false;
  pdfUrl: string | null = null;

  ngOnInit(): void {
    const diagnosticData = this.stateService.getDiagnosticData();
    const ares = this.scoringService.computeAresScore(diagnosticData);
    const competencias = this.scoringService.computeCompetencyScores(diagnosticData);
    this.scores = { ares, competencias };

    this.report$ = this.generativeAiService.generateActionPlan(diagnosticData, this.scores).pipe(
      tap(report => {
        if (report) {
          console.log('Reporte de IA generado:', report);
          // Por ahora solo guardamos en localStorage para evitar dependencias circulares
          localStorage.setItem('lastDiagnosticReport', JSON.stringify({
            report,
            scores: this.scores,
            timestamp: new Date().toISOString()
          }));
        }
      }),
      catchError((error) => {
        console.error('Error al generar reporte:', error);
        this.loadingError = true;
        return of(null);
      })
    );
  }
}
