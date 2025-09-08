import { Component, inject, signal, ChangeDetectionStrategy, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ApiService } from '../../../services/api.service';
import { ScoringService } from '../../../services/scoring.service';
import { SmartGoal, Question, ObjectivesApiResponse } from '../../../data/diagnostic.models';


@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-objetivo.component.html', 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepObjetivoComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  public stateService = inject(DiagnosticStateService);
  private apiService = inject(ApiService);
  private scoringService = inject(ScoringService);

  userPrompt = signal('');
  generatedGoals = signal<SmartGoal[]>([]);
  selectedGoalsMap = signal<Record<string, boolean>>({});
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  private aresQuestions: Question[] = [];
  private compQuestions: Question[] = [];

  selectedGoals = computed(() => {
    const goals = this.generatedGoals();
    const map = this.selectedGoalsMap();
    return goals.filter(g => map[g.id]);
  });
  
  ngOnInit(): void {
    forkJoin({
      ares: this.http.get<Question[]>('/assets/data/ares-questions.json'),
      comp: this.http.get<Question[]>('/assets/data/comp-questions.json')
    }).subscribe(({ ares, comp }) => {
      this.aresQuestions = ares;
      this.compQuestions = comp;
    });

    const initialSelected = this.stateService.state().selectedGoals;
    if (initialSelected.length > 0) {
      const map: Record<string, boolean> = {};
      initialSelected.forEach(g => map[g.id] = true);
      this.selectedGoalsMap.set(map);
    }
  }

  async generateObjectives() {
    if (!this.userPrompt().trim() || this.isLoading()) return;
    this.isLoading.set(true);
    this.generatedGoals.set([]);
    this.errorMessage.set(null);
    
    try {
      const aresScores = this.scoringService.computeAresScores(this.aresQuestions, this.stateService.aresAnswers());
      const compScores = this.scoringService.computeCompScores(this.compQuestions, this.stateService.compAnswers());

      const response: ObjectivesApiResponse = await this.apiService.generateObjectives(this.stateService.state(), this.userPrompt(), aresScores, compScores);
      
      this.generatedGoals.set(response.options || []);
      if (!response.options || response.options.length === 0) {
          this.errorMessage.set("La IA no devolvió objetivos. Intenta ser más específico en tu descripción.");
      }

    } catch (error: any) {
      console.error('Error al generar objetivos:', error);
      this.errorMessage.set(`Hubo un error al generar los objetivos: ${error.message}. Por favor, intenta de nuevo.`);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  toggleGoalSelection(goalId: string) {
    this.selectedGoalsMap.update(map => {
      const newMap = {...map};
      newMap[goalId] = !newMap[goalId];
      return newMap;
    });
  }

  goToPrev() {
    this.router.navigate(['/diagnostico/competencias']);
  }

  goToNext() {
    this.stateService.updateSelectedGoals(this.selectedGoals());
    this.router.navigate(['/diagnostico/finalizar']);
  }
}