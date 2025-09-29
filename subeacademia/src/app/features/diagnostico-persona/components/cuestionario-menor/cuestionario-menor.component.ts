import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui-kit/button/button';
import { SessionService, QuestionItem } from '../../services/session.service';

@Component({
  selector: 'app-cuestionario-menor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header con progreso -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Cuestionario para Niños y Adolescentes
          </h2>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
        </div>
        
        <!-- Barra de progreso -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            [style.width.%]="progressPercentage">
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ Math.round(progressPercentage) }}% completado
        </p>
      </div>

      <!-- Preguntas -->
      <form [formGroup]="questionnaireForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <div *ngFor="let question of currentQuestions; let i = index" class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="mb-4">
            <label class="block text-lg font-medium text-gray-900 dark:text-white mb-3">
              {{ question.text }}
            </label>
            
            <!-- Escala Likert para menores (1-5) -->
            <div class="flex justify-between items-center space-x-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">Nada de acuerdo</span>
              <div class="flex space-x-2">
                <label *ngFor="let option of likertOptions" class="flex flex-col items-center cursor-pointer">
                  <input
                    type="radio"
                    [formControlName]="question.code"
                    [value]="option.value"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ option.label }}</span>
                </label>
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">Muy de acuerdo</span>
            </div>
          </div>
        </div>

        <!-- Navegación -->
        <div class="flex justify-between pt-6">
          <app-ui-button
            type="button"
            variant="ghost"
            (clicked)="previousPage()"
            [disabled]="currentPage === 1"
            class="flex items-center"
          >
            ← Anterior
          </app-ui-button>

          <div class="flex space-x-4">
            <app-ui-button
              type="button"
              variant="secondary"
              (clicked)="saveProgress()"
              class="flex items-center"
            >
              💾 Guardar
            </app-ui-button>

            <app-ui-button
              *ngIf="currentPage < totalPages"
              type="button"
              variant="primary"
              (clicked)="nextPage()"
              [disabled]="!isCurrentPageValid()"
              class="flex items-center"
            >
              Siguiente →
            </app-ui-button>

            <app-ui-button
              *ngIf="currentPage === totalPages"
              type="submit"
              variant="primary"
              [disabled]="!isCurrentPageValid()"
              class="flex items-center"
            >
              Finalizar Cuestionario ✓
            </app-ui-button>
          </div>
        </div>
      </form>

      <!-- Mensaje de guardado automático -->
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          💡 Tus respuestas se guardan automáticamente
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class CuestionarioMenorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);

  questionnaireForm: FormGroup;
  questions: QuestionItem[] = [];
  currentPage = 1;
  questionsPerPage = 3;
  totalPages = 0;
  currentQuestions: QuestionItem[] = [];

  // Exponer Math para el template
  Math = Math;

  likertOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' }
  ];

  get progressPercentage(): number {
    const answeredQuestions = this.getAnsweredQuestionsCount();
    return (answeredQuestions / this.questions.length) * 100;
  }

  constructor() {
    this.questionnaireForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadQuestions();
    this.setupForm();
    this.loadExistingResponses();
    this.updateCurrentQuestions();
    
    // Escuchar cambios en el formulario para guardar automáticamente
    this.questionnaireForm.valueChanges.subscribe(() => {
      this.saveCurrentPageResponses();
    });
  }

  ngOnDestroy(): void {
    // Guardar progreso al salir
    this.saveProgress();
  }

  private loadQuestions(): void {
    this.questions = this.sessionService.getQuestions('menor');
    this.totalPages = Math.ceil(this.questions.length / this.questionsPerPage);
  }

  private setupForm(): void {
    const formControls: any = {};
    this.questions.forEach(question => {
      formControls[question.code] = [null];
    });
    this.questionnaireForm = this.fb.group(formControls);
  }

  private loadExistingResponses(): void {
    const responses = this.sessionService.currentResponses();
    Object.keys(responses).forEach(code => {
      if (this.questionnaireForm.get(code)) {
        this.questionnaireForm.get(code)?.setValue(responses[code]);
      }
    });
  }

  private updateCurrentQuestions(): void {
    const startIndex = (this.currentPage - 1) * this.questionsPerPage;
    const endIndex = startIndex + this.questionsPerPage;
    this.currentQuestions = this.questions.slice(startIndex, endIndex);
  }

  private getAnsweredQuestionsCount(): number {
    let count = 0;
    this.questions.forEach(question => {
      const control = this.questionnaireForm.get(question.code);
      const value = control?.value;
      if (value !== null && value !== undefined && value !== '') {
        count++;
      }
    });
    return count;
  }

  isCurrentPageValid(): boolean {
    if (!this.currentQuestions || this.currentQuestions.length === 0) {
      return false;
    }
    
    // Verificar que todas las preguntas de la página actual tengan respuesta
    for (const question of this.currentQuestions) {
      const control = this.questionnaireForm.get(question.code);
      if (!control) {
        return false;
      }
      
      const value = control.value;
      // Verificar que el valor no sea null, undefined, o string vacío
      if (value === null || value === undefined || value === '') {
        return false;
      }
    }
    
    return true;
  }

  nextPage(): void {
    if (this.isCurrentPageValid() && this.currentPage < this.totalPages) {
      this.saveCurrentPageResponses();
      this.currentPage++;
      this.updateCurrentQuestions();
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.saveCurrentPageResponses();
      this.currentPage--;
      this.updateCurrentQuestions();
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  }

  saveProgress(): void {
    this.saveCurrentPageResponses();
    // Mostrar mensaje de guardado (opcional)
    console.log('Progreso guardado');
  }

  private saveCurrentPageResponses(): void {
    this.currentQuestions.forEach(question => {
      const value = this.questionnaireForm.get(question.code)?.value;
      if (value && value !== '') {
        this.sessionService.updateResponse(question.code, value);
      }
    });
  }

  onSubmit(): void {
    if (this.questionnaireForm.valid) {
      this.saveCurrentPageResponses();
      this.router.navigate(['/es/diagnostico-persona/resumen']);
    }
  }
}
