import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui-kit/button/button';
import { SessionService } from '../../services/session.service';
import { ScoringService } from '../../services/scoring.service';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Resumen de tu Diagnóstico
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Revisa tus respuestas antes de generar tu reporte personalizado
        </p>
      </div>

      <!-- Información de la sesión -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Información del Diagnóstico
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-blue-800 dark:text-blue-200">Edad:</span>
            <span class="ml-2 text-blue-700 dark:text-blue-300">{{ sessionData?.edad }} años</span>
          </div>
          <div>
            <span class="font-medium text-blue-800 dark:text-blue-200">Tipo:</span>
            <span class="ml-2 text-blue-700 dark:text-blue-300">
              {{ sessionData?.group === 'menor' ? 'Niños/Adolescentes' : 'Adultos' }}
            </span>
          </div>
          <div>
            <span class="font-medium text-blue-800 dark:text-blue-200">Preguntas respondidas:</span>
            <span class="ml-2 text-blue-700 dark:text-blue-300">{{ answeredCount }} / {{ totalQuestions }}</span>
          </div>
        </div>
      </div>

      <!-- Resumen de respuestas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tus Respuestas
          </h3>
          
          <div class="space-y-4">
            <div *ngFor="let question of questions; let i = index" class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {{ i + 1 }}. {{ question.text }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ getQuestionTypeLabel(question.type) }}
                  </p>
                </div>
                <div class="ml-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        [ngClass]="getResponseClass(question.code)">
                    {{ getResponseLabel(question.code) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advertencia si faltan respuestas -->
      <div *ngIf="answeredCount < totalQuestions" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Respuestas incompletas
            </h3>
            <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>Tienes {{ totalQuestions - answeredCount }} preguntas sin responder. Te recomendamos completar todas las preguntas para obtener un diagnóstico más preciso.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <app-ui-button
          variant="ghost"
          (clicked)="volverAEditar()"
          class="flex items-center"
        >
          ← Volver a Editar
        </app-ui-button>

        <app-ui-button
          variant="primary"
          size="lg"
          (clicked)="generarResultados()"
          [disabled]="answeredCount === 0"
          class="flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Generar mi Diagnóstico
        </app-ui-button>
      </div>

      <!-- Información adicional -->
      <div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Tu diagnóstico incluirá un análisis detallado de tus competencias en IA, 
          recomendaciones personalizadas y un plan de desarrollo adaptado a tu perfil.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenComponent implements OnInit {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private scoringService = inject(ScoringService);

  sessionData: any = null;
  questions: any[] = [];
  responses: Record<string, string> = {};
  answeredCount = 0;
  totalQuestions = 0;

  ngOnInit(): void {
    this.loadSessionData();
    this.loadQuestions();
    this.loadResponses();
    this.calculateStats();
  }

  private loadSessionData(): void {
    this.sessionData = this.sessionService.currentSessionData();
  }

  private loadQuestions(): void {
    if (this.sessionData?.group) {
      this.questions = this.sessionService.getQuestions(this.sessionData.group);
      this.totalQuestions = this.questions.length;
    }
  }

  private loadResponses(): void {
    this.responses = this.sessionService.currentResponses();
  }

  private calculateStats(): void {
    this.answeredCount = Object.values(this.responses).filter(value => value && value !== '').length;
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'likert':
        return 'Escala 1-5';
      case 'vf':
        return 'Verdadero/Falso';
      default:
        return type;
    }
  }

  getResponseLabel(questionCode: string): string {
    const response = this.responses[questionCode];
    if (!response || response === '') {
      return 'Sin responder';
    }

    if (response === 'V') return 'Verdadero';
    if (response === 'F') return 'Falso';
    if (response === '?') return 'No estoy seguro';
    
    return response;
  }

  getResponseClass(questionCode: string): string {
    const response = this.responses[questionCode];
    if (!response || response === '') {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }

    if (response === 'V') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (response === 'F') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (response === '?') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    
    // Para respuestas Likert
    const numValue = parseInt(response);
    if (numValue <= 2) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (numValue <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }

  volverAEditar(): void {
    if (this.sessionData?.group) {
      this.router.navigate([`/es/diagnostico-persona/cuestionario/${this.sessionData.group}`]);
    }
  }

  generarResultados(): void {
    if (this.sessionData && this.answeredCount > 0) {
      // Calcular puntuación
      const scoreResult = this.scoringService.calculateScore(this.responses, this.sessionData.group);
      
      // Guardar resultados en la sesión (en un caso real, esto se enviaría al backend)
      const sessionId = this.sessionData.id;
      
      // Redirigir a resultados
      this.router.navigate([`/es/diagnostico-persona/resultados/${sessionId}`]);
    }
  }
}
