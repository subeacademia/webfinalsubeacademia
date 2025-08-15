import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { QuestionCardComponent } from './components/ui/question-card/question-card.component';
import { StepNavComponent } from './components/step-nav.component';
import { DiagnosticResultsComponent } from './components/ui/diagnostic-results.component';

@Component({
    selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, QuestionCardComponent, StepNavComponent, DiagnosticResultsComponent],
    template: `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <ng-container *ngIf="!isCompleted(); else results">
                <div class="w-full max-w-3xl">
                    <app-step-nav [progress]="progress()"></app-step-nav>

                    <div class="mt-10 animate-fade-in">
                        <app-question-card
                            *ngIf="currentQuestion()"
                            [question]="currentQuestion()"
                            [form]="getFormForQuestion()"
                        ></app-question-card>
                    </div>

                    <div class="mt-8 flex justify-between w-full">
                        <button 
                            (click)="previousQuestion()" 
                            [disabled]="currentQuestionIndex() === 0" 
                            class="btn-secondary">
                            Anterior
                        </button>
                        <button 
                            (click)="nextQuestion()" 
                            [disabled]="!isCurrentQuestionValid()" 
                            class="btn-primary">
                            {{ (currentQuestionIndex() === questions().length - 1) ? 'Finalizar' : 'Siguiente' }}
                        </button>
                    </div>
                </div>
            </ng-container>

            <ng-template #results>
                <app-diagnostic-results></app-diagnostic-results>
            </ng-template>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {
    private readonly diagnosticState = inject(DiagnosticStateService);

    // Estado del Wizard - Señales principales
    currentQuestionIndex = signal(0);
    isCompleted = signal(false);

    // Señales computadas que manejan todo el estado
    questions = computed(() => this.diagnosticState.flatQuestions());
    currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
    progress = computed(() => {
        const total = this.questions().length;
        return total > 0 ? (this.currentQuestionIndex() / total) * 100 : 0;
    });

    // Lógica de navegación
    nextQuestion(): void {
        if (this.currentQuestionIndex() < this.questions().length - 1) {
            this.currentQuestionIndex.update(i => i + 1);
        } else {
            this.isCompleted.set(true); // Muestra la pantalla de resultados
        }
    }

    previousQuestion(): void {
        if (this.currentQuestionIndex() > 0) {
            this.currentQuestionIndex.update(i => i - 1);
        }
    }

    // Validación de la pregunta actual
    isCurrentQuestionValid(): boolean {
        const question = this.currentQuestion();
        if (!question) return false;

        const form = this.getFormForQuestion();
        const control = form.get(question.controlName);
        
        if (!control) return true; // Si no hay control, consideramos válido
        
        if (question.required) {
            return control.value !== null && control.value !== undefined && control.value !== '';
        }
        
        return true;
    }

    // Determinar qué formulario usar basado en el tipo de pregunta
    getFormForQuestion(): any {
        const question = this.currentQuestion();
        if (!question) return this.diagnosticState.form;
        
        // Determinar qué formulario usar basado en el tipo de pregunta
        if (question.controlName === 'industria' || question.controlName.startsWith('contexto_')) {
            return this.diagnosticState.contextoControls;
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


