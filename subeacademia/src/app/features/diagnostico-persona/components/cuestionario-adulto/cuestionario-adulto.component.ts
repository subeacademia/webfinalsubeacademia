import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui-kit/button/button';
import { SessionService, QuestionItem } from '../../services/session.service';

@Component({
  selector: 'app-cuestionario-adulto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 md:px-6">
      <!-- Header con progreso -->
      <div class="mb-6 md:mb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-4 gap-2">
          <h2 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Cuestionario para Adultos
          </h2>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
        </div>
        
        <!-- Barra de progreso -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3">
          <div 
            class="bg-gradient-to-r from-green-500 to-teal-500 h-2 md:h-3 rounded-full transition-all duration-300"
            [style.width.%]="progressPercentage">
          </div>
        </div>
        <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2">
          {{ Math.round(progressPercentage) }}% completado
        </p>
      </div>

      <!-- Preguntas -->
      <form [formGroup]="questionnaireForm" (ngSubmit)="onSubmit()" class="space-y-6 md:space-y-8">
        <div *ngFor="let question of currentQuestions; let i = index" class="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="mb-3 md:mb-4">
            <label class="block text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2 md:mb-3">
              {{ question.text }}
            </label>
            
            <!-- Preguntas V/F/No sé -->
            <div *ngIf="question.type === 'vf'" class="space-y-3">
              <div class="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <label class="flex items-center cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    [formControlName]="question.code"
                    value="V"
                    (change)="onRadioChange(question.code, 'V')"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm md:text-base text-gray-700 dark:text-gray-300">Verdadero</span>
                </label>
                <label class="flex items-center cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    [formControlName]="question.code"
                    value="F"
                    (change)="onRadioChange(question.code, 'F')"
                    class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm md:text-base text-gray-700 dark:text-gray-300">Falso</span>
                </label>
                <label class="flex items-center cursor-pointer min-h-[44px]">
                  <input
                    type="radio"
                    [formControlName]="question.code"
                    value="?"
                    (change)="onRadioChange(question.code, '?')"
                    class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm md:text-base text-gray-700 dark:text-gray-300">No estoy seguro</span>
                </label>
              </div>
            </div>

            <!-- Escala Likert (1-5) -->
            <div *ngIf="question.type === 'likert'" class="space-y-3">
              <div class="flex flex-col space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400">Totalmente en desacuerdo</span>
                  <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400">Totalmente de acuerdo</span>
                </div>
                <div class="flex justify-center space-x-1 md:space-x-2 overflow-x-auto pb-2">
                  <label *ngFor="let option of likertOptions" class="flex flex-col items-center cursor-pointer min-w-[40px] md:min-w-[50px]">
                    <input
                      type="radio"
                      [formControlName]="question.code"
                      [value]="option.value"
                      (change)="onRadioChange(question.code, option.value)"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span class="text-xs md:text-sm text-gray-700 dark:text-gray-300 mt-1">{{ option.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navegación -->
        <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4 md:pt-6">
          <app-ui-button
            type="button"
            variant="ghost"
            (clicked)="previousPage()"
            [disabled]="currentPage === 1"
            class="flex items-center w-full sm:w-auto"
          >
            ← Anterior
          </app-ui-button>

          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <app-ui-button
              type="button"
              variant="secondary"
              (clicked)="saveProgress()"
              class="flex items-center justify-center w-full sm:w-auto"
            >
              💾 Guardar
            </app-ui-button>

            <app-ui-button
              *ngIf="currentPage < totalPages"
              type="button"
              variant="primary"
              (clicked)="nextPage()"
              [disabled]="!isCurrentPageValid()"
              class="flex items-center justify-center w-full sm:w-auto"
            >
              Siguiente →
            </app-ui-button>

            <app-ui-button
              *ngIf="currentPage === totalPages"
              type="submit"
              variant="primary"
              [disabled]="!isCurrentPageValid()"
              class="flex items-center justify-center w-full sm:w-auto"
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
export class CuestionarioAdultoComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private cdr = inject(ChangeDetectorRef);

  questionnaireForm: FormGroup;
  questions: QuestionItem[] = [];
  currentPage = 1;
  questionsPerPage = 4;
  totalPages = 0;
  currentQuestions: QuestionItem[] = [];
  
  // Respuestas del usuario
  userResponses: { [key: string]: string } = {};

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
    if (!this.questions || this.questions.length === 0) {
      return 0;
    }
    
    const answeredQuestions = Object.keys(this.userResponses).length;
    const percentage = (answeredQuestions / this.questions.length) * 100;
    console.log(`📊 Progreso: ${answeredQuestions}/${this.questions.length} = ${percentage.toFixed(1)}%`);
    return percentage;
  }

  constructor() {
    this.questionnaireForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadQuestions();
    this.setupForm();
    this.loadExistingResponses();
    this.updateCurrentQuestions();
    
    // Crear sesión si no existe
    this.ensureSessionExists();
    
    // Escuchar cambios en el formulario para guardar automáticamente
    // IMPORTANTE: Suscribirse DESPUÉS de setupForm() para que funcione correctamente
    this.setupFormChangeListener();
  }

  ngOnDestroy(): void {
    // Guardar progreso al salir
    this.saveProgress();
  }

  private loadQuestions(): void {
    this.questions = this.sessionService.getQuestions('adulto');
    this.totalPages = Math.ceil(this.questions.length / this.questionsPerPage);
  }

  private ensureSessionExists(): void {
    // Intentar cargar sesión existente
    const sessionExists = this.sessionService.loadSessionFromStorage();
    
    if (!sessionExists) {
      // Si no hay sesión, crear una nueva con datos por defecto
      const edad = this.route.snapshot.queryParams['edad'] || 32;
      const consent = {
        acepto: true,
        tutor: '',
        asentimientoMenor: false
      };
      
      this.sessionService.createSession(edad, 'adulto', consent);
      console.log('✅ Sesión creada para adulto');
    } else {
      console.log('✅ Sesión existente cargada');
    }
  }

  private setupForm(): void {
    const formControls: any = {};
    this.questions.forEach(question => {
      formControls[question.code] = [null];
    });
    this.questionnaireForm = this.fb.group(formControls);
  }

  private setupFormChangeListener(): void {
    // Escuchar cambios en el formulario para guardar automáticamente
    this.questionnaireForm.valueChanges.subscribe((values) => {
      console.log('🔄 Formulario cambió:', values);
      console.log('📊 Página válida:', this.isCurrentPageValid());
      console.log('📈 Progreso:', this.progressPercentage + '%');
      console.log('🔍 Preguntas actuales:', this.currentQuestions.map(q => q.code));
      console.log('🔍 Valores de preguntas actuales:', this.currentQuestions.map(q => ({
        code: q.code,
        value: this.questionnaireForm.get(q.code)?.value
      })));
      this.saveCurrentPageResponses();
      
      // Forzar detección de cambios para actualizar la UI
      this.cdr.detectChanges();
    });
  }

  private loadExistingResponses(): void {
    const responses = this.sessionService.currentResponses();
    this.userResponses = { ...responses };
    console.log('📥 Respuestas cargadas:', this.userResponses);
  }

  private updateCurrentQuestions(): void {
    const startIndex = (this.currentPage - 1) * this.questionsPerPage;
    const endIndex = startIndex + this.questionsPerPage;
    this.currentQuestions = this.questions.slice(startIndex, endIndex);
  }

  getAnsweredQuestionsCount(): number {
    const count = Object.keys(this.userResponses).length;
    console.log(`📊 Total respondidas: ${count}/${this.questions.length}`);
    return count;
  }

  isCurrentPageValid(): boolean {
    if (!this.currentQuestions || this.currentQuestions.length === 0) {
      console.log('❌ No hay preguntas actuales');
      return false;
    }
    
    console.log('🔍 Validando página actual:', this.currentPage);
    console.log('📝 Preguntas en página:', this.currentQuestions.length);
    
    // Verificar que todas las preguntas de la página actual tengan respuesta
    for (const question of this.currentQuestions) {
      const value = this.userResponses[question.code];
      console.log(`📋 Pregunta ${question.code}: valor = "${value}"`);
      
      // Verificar que el valor no sea null, undefined, o string vacío
      if (!value || value === '') {
        console.log('❌ Pregunta sin respuesta:', question.code);
        return false;
      }
    }
    
    console.log('✅ Página válida');
    return true;
  }

  nextPage(): void {
    if (this.isCurrentPageValid() && this.currentPage < this.totalPages) {
      this.saveCurrentPageResponses();
      this.currentPage++;
      this.updateCurrentQuestions();
      this.cdr.detectChanges();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.saveCurrentPageResponses();
      this.currentPage--;
      this.updateCurrentQuestions();
      this.cdr.detectChanges();
    }
  }

  saveProgress(): void {
    this.saveCurrentPageResponses();
    // Mostrar mensaje de guardado (opcional)
    console.log('Progreso guardado');
  }

  private saveCurrentPageResponses(): void {
    // Guardar todas las respuestas del usuario
    Object.keys(this.userResponses).forEach(code => {
      const value = this.userResponses[code];
      if (value && value !== '') {
        this.sessionService.updateResponse(code, value);
        console.log(`💾 Guardada respuesta: ${code} = "${value}"`);
      }
    });
  }

  onSubmit(): void {
    if (this.isCurrentPageValid()) {
      this.saveCurrentPageResponses();
      this.router.navigate(['/es/diagnostico-persona/resumen']);
    }
  }

  onRadioChange(questionCode: string, value: string): void {
    console.log(`🔘 Radio cambiado: ${questionCode} = "${value}"`);
    
    // Guardar en userResponses
    this.userResponses[questionCode] = value;
    console.log(`✅ Valor guardado: ${questionCode} = "${value}"`);
    
    // Guardar en el servicio de sesión
    this.sessionService.updateResponse(questionCode, value);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    console.log(`📊 Progreso actualizado: ${Object.keys(this.userResponses).length}/${this.questions.length}`);
  }

}
