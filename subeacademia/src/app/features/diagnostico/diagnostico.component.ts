import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { QuestionCardComponent, Question } from './components/ui/question-card/question-card.component';
import { StepNavComponent } from './components/step-nav.component';

@Component({
    selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, QuestionCardComponent, StepNavComponent],
    template: `
        <div class="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4 pt-24">
            <!-- Barra de progreso -->
            <app-step-nav 
                [progress]="progress()" 
                [currentStep]="currentQuestionIndex()" 
                [totalSteps]="flatQuestions().length">
            </app-step-nav>
            
            <!-- Contenido principal -->
            <div class="w-full max-w-3xl mt-10">
                <!-- Muestra la pregunta actual usando el componente unificado -->
                <app-question-card
                    *ngIf="currentQuestion()"
                    [question]="currentQuestion()"
                    [form]="getFormForQuestion()"
                ></app-question-card>
            </div>
            
            <!-- Navegación -->
            <div class="mt-8 flex justify-between w-full max-w-3xl">
                <button 
                    class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    (click)="previousQuestion()" 
                    [disabled]="currentQuestionIndex() === 0">
                    <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Anterior
                </button>
                
                <button 
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    (click)="nextQuestion()">
                    Siguiente
                    <svg class="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {
    readonly diagnosticState = inject(DiagnosticStateService);
    private readonly router = inject(Router);

    // Estado del wizard
    flatQuestions = computed(() => this.diagnosticState.flatQuestions());
    currentQuestionIndex = signal(0);
    currentQuestion = computed(() => this.flatQuestions()[this.currentQuestionIndex()]);
    progress = computed(() => {
        const total = this.flatQuestions().length;
        return total > 0 ? (this.currentQuestionIndex() / total) * 100 : 0;
    });

    nextQuestion(): void {
        const currentIndex = this.currentQuestionIndex();
        const totalQuestions = this.flatQuestions().length;
        
        if (currentIndex < totalQuestions - 1) {
            this.currentQuestionIndex.set(currentIndex + 1);
        } else {
            // Navegar al resumen cuando se llegue al final
            this.router.navigate(['/diagnostico/resumen']);
        }
    }

    previousQuestion(): void {
        const currentIndex = this.currentQuestionIndex();
        if (currentIndex > 0) {
            this.currentQuestionIndex.set(currentIndex - 1);
        }
    }

    getFormForQuestion(): FormGroup {
        const question = this.currentQuestion();
        if (!question) return this.diagnosticState.form;
        
        // Determinar qué formulario usar basado en el tipo de pregunta
        if (question.controlName === 'industria' || question.controlName.startsWith('contexto_')) {
            return this.diagnosticState.contextoControls as any;
        } else if (question.controlName.startsWith('ares_')) {
            return this.diagnosticState.aresForm;
        } else if (question.controlName.startsWith('comp_')) {
            return this.diagnosticState.competenciasForm;
        } else if (question.controlName === 'objetivo') {
            return this.diagnosticState.form;
        } else if (question.controlName.startsWith('lead_')) {
            return this.diagnosticState.leadForm;
        }
        
        return this.diagnosticState.form;
    }
}


