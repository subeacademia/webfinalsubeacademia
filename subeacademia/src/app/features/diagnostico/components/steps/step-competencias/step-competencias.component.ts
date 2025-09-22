import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { competencias, Competency } from '../../../data/competencias';
import { CompetencyQuestionCardComponent } from '../../ui/competency-question-card/competency-question-card.component';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { Answer } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-competencias',
  standalone: true,
  imports: [CommonModule, CompetencyQuestionCardComponent],
  template: `
    <div class="p-4 md:p-6">
      @for (competency of allCompetencies; track competency.id) {
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">{{ competency.name }}</h3>
          @for (question of competency.questions; track question.id) {
            <app-competency-question-card
              [question]="question"
              [initialAnswer]="getAnswerForQuestion(question.id)"
              (answerChange)="onAnswerChange(question.id, $event)"
            ></app-competency-question-card>
          }
        </div>
      }
      
      <!-- Botones de navegación -->
      <div class="mt-8 flex justify-between">
        <button (click)="previous()" 
                class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
          ← Volver
        </button>
        <button (click)="next()" 
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Continuar →
        </button>
      </div>
    </div>
  `,
})
export class StepCompetenciasComponent {
  public stateService = inject(DiagnosticStateService);
  private router = inject(Router);
  allCompetencies = competencias;

  getAnswerForQuestion(questionId: string): Answer {
    return this.stateService.state().competencias[questionId] || { value: 0, isCritical: false, evidence: '' };
  }

  onAnswerChange(questionId: string, answer: Answer) {
    this.stateService.updateAnswer('competencias', questionId, answer);
  }

  isComplete(): boolean {
    return this.stateService.competenciasProgress().isComplete;
  }

  next() {
    // Permitir avanzar sin validar si todas las preguntas están respondidas
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico/objetivo`]);
  }

  previous() {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico/ares`]);
  }
}