import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { aresQuestions } from '../../../data/ares-items';
import { QuestionCardComponent } from '../../ui/question-card/question-card.component';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { Answer } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-ares',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent],
  template: `
    <div class="p-4 md:p-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Autoevaluación ARES</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Evalúa tus habilidades en Aprendizaje, Resiliencia, Ética y Sociabilidad.
      </p>
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-6">
        <p class="text-sm text-blue-700 dark:text-blue-200">
          Progreso: {{ stateService.aresProgress().answered }} / {{ stateService.aresProgress().total }}
        </p>
      </div>
      <div class="space-y-4">
        @for (question of questions; track question.id) {
          <app-question-card
            [question]="question"
            [initialAnswer]="getAnswerForQuestion(question.id)"
            (answerChange)="onAnswerChange(question.id, $event)"
          ></app-question-card>
        }
      </div>
    </div>
  `,
})
export class StepAresComponent {
  public stateService = inject(DiagnosticStateService);
  questions = aresQuestions;

  getAnswerForQuestion(questionId: string): Answer {
    return this.stateService.state().ares[questionId] || { value: null };
  }

  onAnswerChange(questionId: string, answer: Answer) {
    this.stateService.updateAnswer('ares', questionId, answer);
  }
}