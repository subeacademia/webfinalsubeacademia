import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { DiagnosticReport } from '../../../data/report.model';
import { onSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './diagnostic-results.component.html',
})
export class DiagnosticResultsComponent implements OnInit {
  private stateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private generativeAiService = inject(GenerativeAiService);
  private diagnosticsService = inject(DiagnosticsService);

  scores$!: Observable<any>;
  report$!: Observable<DiagnosticReport | null>;
  loadingError = false;
  pdfUrl: string | null = null;

  ngOnInit(): void {
    const diagnosticData = this.stateService.getDiagnosticData();
    const ares = this.scoringService.computeAresScore(diagnosticData);
    const competencias = this.scoringService.computeCompetencyScores(diagnosticData);
    const scores = { ares, competencias };
    
    this.scores$ = of(scores);

    this.report$ = this.generativeAiService.generateActionPlan(diagnosticData, scores).pipe(
      tap(report => {
        if (report) {
          // Guardar el reporte y escuchar para la URL del PDF
          this.diagnosticsService.saveDiagnosticWithReport(report, scores, diagnosticData).then(docRef => {
            onSnapshot(docRef, (doc: any) => {
              const data = doc.data();
              if (data && data.pdfUrl) {
                this.pdfUrl = data.pdfUrl;
              }
            });
          });
        }
      }),
      catchError(() => {
        this.loadingError = true;
        return of(null);
      })
    );
  }
}
