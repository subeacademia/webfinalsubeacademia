import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Question, Answer } from '../../../data/diagnostic.models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-start mb-3">
        <p class="text-base font-medium text-gray-800 dark:text-gray-100 flex-1">{{ question.text }}</p>
        @if (question.critical) {
          <span class="ml-4 px-2 py-1 text-xs font-bold text-red-800 bg-red-200 dark:text-red-200 dark:bg-red-800 rounded-full flex-shrink-0">CRÍTICO</span>
        }
      </div>

      <form [formGroup]="answerForm">
        <div class="mb-4">
          <input type="range" min="1" max="5" step="1" formControlName="value"
                 class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
            <span>Inexistente</span>
            <span>En Desarrollo</span>
            <span>Definido</span>
            <span>Gestionado</span>
            <span>Optimizado</span>
          </div>
        </div>

        <div class="text-right mb-2">
            <button type="button" (click)="showOptional.set(!showOptional())" class="text-sm text-blue-600 hover:underline">
                {{ showOptional() ? 'Ocultar notas' : 'Añadir notas (Opcional)' }}
            </button>
        </div>

        @if (showOptional()) {
            <div class="border-t pt-4 animate-fade-in">
                <label for="evidence-{{question.id}}" class="block text-sm text-gray-600 dark:text-gray-300">
                    Notas Personales
                </label>
                <textarea id="evidence-{{question.id}}" formControlName="evidence" rows="2"
                       class="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
        }
      </form>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class QuestionCardComponent implements OnInit {
  @Input({ required: true }) question!: Question;
  @Input() initialAnswer: Answer = { value: null };
  @Output() answerChange = new EventEmitter<Answer>();

  answerForm!: FormGroup;
  showOptional = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.answerForm = this.fb.group({
      value: [this.initialAnswer.value],
      evidence: [this.initialAnswer.evidence || ''],
    });

    if(this.initialAnswer.evidence) {
        this.showOptional.set(true);
    }

    this.answerForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)))
      .subscribe(value => {
        const answerValue = value.value ? Number(value.value) : null;
        this.answerChange.emit({ value: answerValue, evidence: value.evidence });
      });
  }
}