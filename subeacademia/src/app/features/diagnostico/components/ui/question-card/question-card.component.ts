import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';
import { InfoModalComponent } from '../info-modal/info-modal.component';

export interface Question {
    id: string;
    type: 'likert' | 'select' | 'text';
    label: string;
    tooltip?: string;
    controlName: string;
    options?: any[];
    required?: boolean;
}

@Component({
    selector: 'app-question-card',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, InfoModalComponent],
    template: `
        <div class="bg-slate-800 rounded-lg p-8 shadow-xl">
            <!-- Header de la pregunta -->
            <div class="flex items-center justify-between mb-6">
                <div class="text-2xl font-semibold text-center flex-1 text-white">
                    {{ question.label | i18nTranslate }}
                </div>
                <button 
                    *ngIf="question.tooltip"
                    type="button" 
                    class="btn btn-ghost btn-circle btn-sm ml-4 text-blue-400 hover:text-blue-300" 
                    (click)="openInfo(question.tooltip)">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </button>
            </div>

            <!-- Contenido de la pregunta según el tipo -->
            <ng-container [ngSwitch]="question.type">
                
                <!-- Pregunta Likert -->
                <div *ngSwitchCase="'likert'" class="space-y-6">
                    <!-- Escala Likert -->
                    <div class="flex flex-wrap gap-3 justify-center">
                        <button 
                            *ngFor="let value of [0,1,2,3,4,5]" 
                            class="px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[80px] text-lg"
                            [class]="getLikertButtonClass(value)"
                            (click)="setLikertValue(value)">
                            {{ ('diagnostico.ares.likert.' + value) | i18nTranslate }}
                        </button>
                    </div>

                    <!-- Etiquetas de la escala -->
                    <div class="flex justify-between mt-4 text-sm text-gray-400">
                        <span>Nada</span>
                        <span>Completamente</span>
                    </div>
                </div>

                <!-- Pregunta de selección -->
                <div *ngSwitchCase="'select'" class="space-y-4">
                    <select 
                        class="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        [formControlName]="question.controlName">
                        <option value="" disabled selected class="text-gray-400">
                            {{ 'Selecciona una opción' | i18nTranslate }}
                        </option>
                        <ng-container *ngFor="let group of question.options">
                            <optgroup [label]="group.category" class="text-gray-300">
                                <option *ngFor="let option of group.options" [ngValue]="option" class="text-white bg-slate-700">
                                    {{ option }}
                                </option>
                            </optgroup>
                        </ng-container>
                    </select>
                </div>

                <!-- Pregunta de texto -->
                <div *ngSwitchCase="'text'" class="space-y-4">
                    <input 
                        class="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        [formControlName]="question.controlName"
                        [placeholder]="'Escribe tu respuesta aquí...'"
                        type="text" />
                </div>

            </ng-container>
        </div>

        <!-- Modal de información -->
        <app-info-modal [open]="modalOpen" [content]="modalText" (close)="modalOpen=false"></app-info-modal>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionCardComponent {
    @Input({ required: true }) question!: Question;
    @Input({ required: true }) form!: FormGroup;

    modalOpen = false;
    modalText = '';

    setLikertValue(value: number): void {
        const control = this.form.get(this.question.controlName);
        if (control) {
            control.setValue(value);
        }
    }

    getLikertButtonClass(value: number): string {
        const control = this.form.get(this.question.controlName);
        const isSelected = control?.value === value;
        
        if (isSelected) {
            return 'bg-blue-600 text-white shadow-lg scale-105';
        }
        
        return 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white';
    }

    openInfo(text?: string): void {
        if (!text) return;
        this.modalText = text;
        this.modalOpen = true;
    }
}
