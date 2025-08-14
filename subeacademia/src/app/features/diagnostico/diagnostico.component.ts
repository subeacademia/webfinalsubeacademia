import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DiagnosticStateService, Question } from './services/diagnostic-state.service';
import { InfoModalComponent } from './components/ui/info-modal/info-modal.component';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { StepNavComponent } from './components/step-nav.component';
import { DiagnosticResultsComponent } from './components/ui/diagnostic-results.component';

@Component({
	selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InfoModalComponent, I18nTranslatePipe, StepNavComponent, DiagnosticResultsComponent],
    template: `
        <!-- Mostrar resultados si está completado -->
        <ng-container *ngIf="isCompleted(); else wizardView">
            <app-diagnostic-results
                [aresByPhase]="aresByPhase()"
                [competencyScores]="competencyScores()"
                [competencyLabels]="competencyLabels()"
                [segment]="segment()">
            </app-diagnostic-results>
        </ng-container>

        <!-- Wizard de preguntas -->
        <ng-template #wizardView>
            <div class="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4 pt-24">
                <!-- Barra de progreso -->
                <div class="w-full max-w-3xl mb-8">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-300">Progreso del diagnóstico</span>
                        <span class="text-sm text-gray-300">{{ currentQuestionIndex() + 1 }} / {{ totalQuestions() }}</span>
                    </div>
                    <div class="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-3 bg-blue-500 transition-all duration-500 ease-out" [style.width.%]="progress()"></div>
                    </div>
                </div>

                <!-- Pregunta actual -->
                <div class="w-full max-w-3xl">
                    <ng-container *ngIf="currentQuestion(); else loading">
                        <!-- Pregunta de selección -->
                        <ng-container *ngSwitch="currentQuestion()?.type">
                            <div *ngSwitchCase="'select'" class="bg-slate-800 rounded-lg p-8 shadow-xl">
                                <div class="text-2xl font-semibold mb-6 text-center">
                                    {{ currentQuestion()?.label | i18nTranslate }}
                                </div>
                                <select 
                                    class="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    [formControl]="currentQuestion()?.control!"
                                    (change)="onSelectChanged($event)">
                                    <option value="" disabled selected class="text-gray-400">
                                        {{ 'Selecciona una opción' | i18nTranslate }}
                                    </option>
                                    <ng-container *ngFor="let group of currentQuestion()?.options">
                                        <optgroup [label]="group.category" class="text-gray-300">
                                            <option *ngFor="let o of group.options" [ngValue]="o" class="text-white bg-slate-700">
                                                {{ o }}
                                            </option>
                                        </optgroup>
                                    </ng-container>
                                </select>
                            </div>

                            <!-- Pregunta Likert -->
                            <div *ngSwitchCase="'likert'" class="bg-slate-800 rounded-lg p-8 shadow-xl">
                                <div class="flex items-center justify-between mb-6">
                                    <div class="text-2xl font-semibold text-center flex-1">
                                        {{ currentQuestion()?.label | i18nTranslate }}
                                    </div>
                                    <button 
                                        *ngIf="currentQuestion()?.tooltip"
                                        type="button" 
                                        class="btn btn-ghost btn-circle btn-sm ml-4" 
                                        (click)="openInfo(currentQuestion()?.tooltip)">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </button>
                                </div>
                                
                                <!-- Escala Likert -->
                                <div class="flex flex-wrap gap-3 justify-center">
                                    <button 
                                        *ngFor="let v of [0,1,2,3,4,5]" 
                                        class="px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[80px]"
                                        [class]="getLikertButtonClass(v)"
                                        (click)="setLikertValue(v)">
                                        {{ ('diagnostico.ares.likert.' + v) | i18nTranslate }}
                                    </button>
                                </div>

                                <!-- Etiquetas de la escala -->
                                <div class="flex justify-between mt-4 text-sm text-gray-400">
                                    <span>Nada</span>
                                    <span>Completamente</span>
                                </div>
                            </div>

                            <!-- Pregunta de texto -->
                            <div *ngSwitchCase="'text'" class="bg-slate-800 rounded-lg p-8 shadow-xl">
                                <div class="text-2xl font-semibold mb-6 text-center">
                                    {{ currentQuestion()?.label | i18nTranslate }}
                                </div>
                                <input 
                                    class="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    [formControl]="currentQuestion()?.control!"
                                    [placeholder]="'Escribe tu respuesta aquí...'"
                                    type="text" />
                            </div>
                        </ng-container>
                    </ng-container>

                    <!-- Estado de carga -->
                    <ng-template #loading>
                        <div class="bg-slate-800 rounded-lg p-8 shadow-xl text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p class="text-gray-300">Preparando diagnóstico...</p>
                        </div>
                    </ng-template>
                </div>

                <!-- Navegación -->
                <div class="w-full max-w-3xl mt-8">
                    <app-step-nav 
                        [currentStep]="currentQuestionIndex()"
                        [totalSteps]="totalQuestions()"
                        [canGoPrevious]="canGoPrevious()"
                        [canGoNext]="canGoNext()"
                        [isCompleted]="isCompleted()"
                        (previous)="previousQuestion()"
                        (next)="nextQuestion()"
                        (complete)="onComplete()">
                    </app-step-nav>
                </div>
            </div>
        </ng-template>

        <!-- Modal de información -->
        <app-info-modal [open]="modalOpen" [content]="modalText" (close)="modalOpen=false"></app-info-modal>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {
    private readonly state = inject(DiagnosticStateService);

    // Signals del servicio
    readonly currentQuestionIndex = this.state.currentQuestionIndex;
    readonly totalQuestions = this.state.totalQuestions;
    readonly currentQuestion = this.state.currentQuestion;
    readonly progress = this.state.progress;
    readonly canGoNext = this.state.canGoNext;
    readonly canGoPrevious = this.state.canGoPrevious;
    readonly isCompleted = this.state.isCompleted;

    // Signals para los resultados
    readonly aresByPhase = computed(() => this.state.getAresByPhase());
    readonly competencyScores = computed(() => this.state.getCompetenciasScores().map(c => c.score));
    readonly competencyLabels = computed(() => this.state.getCompetenciasScores().map(c => c.nameKey));
    readonly segment = computed(() => this.state.form.controls['segmento'].value);

    modalOpen = false;
    modalText = '';

    onSelectChanged(ev: Event): void {
        const target = ev.target as HTMLSelectElement | null;
        const value = target?.value || '';
        
        if (value && this.currentQuestion()?.id === 'industria') {
            // Solo procesar si es la pregunta de industria
            this.state.setSegmentFromIndustry(value);
        }
    }

    setLikertValue(value: number): void {
        const question = this.currentQuestion();
        if (question?.control) {
            question.control.setValue(value);
        }
    }

    getLikertButtonClass(value: number): string {
        const question = this.currentQuestion();
        const isSelected = question?.control?.value === value;
        
        if (isSelected) {
            return 'bg-blue-600 text-white shadow-lg scale-105';
        }
        
        return 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white';
    }

    previousQuestion(): void {
        this.state.previousQuestion();
    }

    nextQuestion(): void {
        this.state.nextQuestion();
    }

    onComplete(): void {
        // El diagnóstico ya está marcado como completado en el servicio
        console.log('Diagnóstico completado:', this.state.getFullValue());
    }

    openInfo(text?: string): void {
        if (!text) return;
        this.modalText = text;
        this.modalOpen = true;
    }
}


