import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticReport } from '../../../data/report.model';

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

  scores$!: Observable<any>;
  report$!: Observable<DiagnosticReport | null>;
  loadingError = false;

  ngOnInit(): void {
    const diagnosticData = this.stateService.getDiagnosticData();
    const ares = this.scoringService.computeAresScore(diagnosticData);
    const competencias = this.scoringService.computeCompetencyScores(diagnosticData);
    const scores = { ares, competencias };
    
    this.scores$ = of(scores);

    this.report$ = this.generativeAiService.generateActionPlan(diagnosticData, scores).pipe(
      catchError(() => {
        this.loadingError = true;
        return of(null);
      })
    );
  }
}
