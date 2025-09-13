import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Answer } from '../../../data/diagnostic.models';
import { CompetencyQuestion } from '../../../data/competencias';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-competency-question-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-start mb-3">
        <p class="text-base font-medium text-gray-800 dark:text-gray-100 flex-1">{{ question.text }}</p>
        @if (question.isCritical) {
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
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetencyQuestionCardComponent implements OnInit {
  @Input({ required: true }) question!: CompetencyQuestion;
  @Input() initialAnswer: Answer = { value: 0, isCritical: false };
  @Output() answerChange = new EventEmitter<Answer>();

  answerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.answerForm = this.fb.group({
      value: [this.initialAnswer.value || 0],
    });

    // Emitir el valor inicial inmediatamente para que se registre como respuesta
    const initialValue = this.initialAnswer.value || 0;
    this.answerChange.emit({ 
      value: initialValue, 
      isCritical: this.question.isCritical || false 
    });

    this.answerForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)))
      .subscribe(value => {
        const answerValue = value.value ? Number(value.value) : 0;
        this.answerChange.emit({ 
          value: answerValue, 
          isCritical: this.question.isCritical || false 
        });
      });
  }
}
