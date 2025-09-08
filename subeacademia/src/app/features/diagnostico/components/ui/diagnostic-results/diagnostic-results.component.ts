import { Component, inject, computed, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { ApiService } from '../../../services/api.service';
import { PdfService } from '../../../services/pdf.service';
import { AresScores, CompScores, ActionItem, Question, ActionPlanApiResponse } from '../../../data/diagnostic.models';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface Gap {
  area: string;
  score: number;
  target: number;
  gap: number;
}

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./diagnostic-results.component.css', './diagnostic-results.print.css'],
  templateUrl: './diagnostic-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticResultsComponent implements OnInit {
  stateService = inject(DiagnosticStateService);
  scoringService = inject(ScoringService);
  apiService = inject(ApiService);
  pdfService = inject(PdfService);
  http = inject(HttpClient);

  aresQuestions = signal<Question[]>([]);
  compQuestions = signal<Question[]>([]);

  isLoadingPlan = signal(false);
  actionPlan = signal<ActionPlanApiResponse | null>(null);

  ngOnInit() {
    forkJoin({
      ares: this.http.get<Question[]>('/assets/data/ares-questions.json'),
      comp: this.http.get<Question[]>('/assets/data/comp-questions.json')
    }).subscribe(({ ares, comp }) => {
      this.aresQuestions.set(ares);
      this.compQuestions.set(comp);
    });
  }

  // --- Computed Signals for Scores ---
  aresScores = computed<AresScores>(() => {
    const questions = this.aresQuestions();
    if (!questions.length) return this.emptyAresScores();
    const answers = this.stateService.aresAnswers();
    return this.scoringService.computeAresScores(questions, answers);
  });

  weightedAresScores = computed<AresScores>(() => {
    const scores = this.aresScores();
    const risk = this.stateService.riskLevel();
    return this.scoringService.applyRiskWeighting(scores, risk);
  });
  
  compScores = computed<CompScores>(() => {
    const questions = this.compQuestions();
    if (!questions.length) return this.emptyCompScores();
    const answers = this.stateService.compAnswers();
    return this.scoringService.computeCompScores(questions, answers);
  });

  compositeScore = computed<number>(() => {
    const aresScore = this.weightedAresScores().generalWeighted ?? this.weightedAresScores().general;
    const compScore = this.compScores().general;
    const lambda = this.stateService.lambdaComp();
    return this.scoringService.composite(aresScore, compScore, lambda);
  });
  
  // --- Computed Signals for Gaps and Plan ---
  gaps = computed<Gap[]>(() => {
      const target = this.stateService.targetLevel();
      const aresPillars = this.aresScores().byPillar;
      const compClusters = this.compScores().byCluster;
      
      const aresGaps = Object.entries(aresPillars).map(([area, score]) => ({
          area, score, target, gap: Math.max(0, target - score)
      }));
      
      const compGaps = Object.entries(compClusters).map(([area, score]) => ({
          area, score, target, gap: Math.max(0, target - score)
      }));

      return [...aresGaps, ...compGaps].sort((a,b) => b.gap - a.gap);
  });

  // --- Methods ---
  async generateActionPlan() {
    this.isLoadingPlan.set(true);
    try {
      const plan = await this.apiService.generatePlan(this.stateService.state(), this.aresScores(), this.compScores());
      this.actionPlan.set(plan);
    } catch (error) {
      console.error('Error generating action plan:', error);
    } finally {
      this.isLoadingPlan.set(false);
    }
  }

  exportToPdf() {
    const profile = this.stateService.profile();
    const filename = `diagnostico-ares-ai-${profile.industry.replace(/\s+/g, '-')}.pdf`;
    this.pdfService.exportElementToPdf('pdf-content', filename);
  }
  
  scoreToPercentage(score: number): number {
    return Math.max(0, (score - 1) * 25);
  }

  getColorForScore(score: number): string {
    if (score < 2.5) return 'bg-red-500';
    if (score < 3.5) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
  
  // --- Helpers for initial state ---
  private emptyAresScores(): AresScores {
    return { byPillar: { Agilidad: 0, 'Responsabilidad y Ética': 0, Sostenibilidad: 0 }, bySubarea: {}, byPhase: { 'Preparación':0,'Diseño':0,'Desarrollo':0,'Monitoreo':0,'Escalado':0 }, general: 0, gatingStatus: 'SIN_DATOS' };
  }
  private emptyCompScores(): CompScores {
    return { byCompetency: {}, byCluster: {}, general: 0, gatingStatus: 'SIN_DATOS' };
  }
}