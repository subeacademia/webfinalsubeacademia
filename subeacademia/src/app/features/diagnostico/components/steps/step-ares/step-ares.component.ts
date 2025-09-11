import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
      
      <!-- Botones de navegación -->
      <div class="mt-8 flex justify-between">
        <button (click)="previous()" 
                class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
          ← Volver
        </button>
        <button (click)="next()" 
                [disabled]="!isComplete()"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
          Continuar →
        </button>
      </div>
    </div>
  `,
})
export class StepAresComponent {
  public stateService = inject(DiagnosticStateService);
  private router = inject(Router);
  questions = aresQuestions;

  getAnswerForQuestion(questionId: string): Answer {
    return this.stateService.state().ares[questionId] || { value: null };
  }

  onAnswerChange(questionId: string, answer: Answer) {
    this.stateService.updateAnswer('ares', questionId, answer);
  }

  isComplete(): boolean {
    return this.stateService.aresProgress().isComplete;
  }

  next() {
    if (this.isComplete()) {
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      this.router.navigate([`/${languagePrefix}/diagnostico/competencias`]);
    }
  }

  previous() {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico/contexto`]);
  }
}