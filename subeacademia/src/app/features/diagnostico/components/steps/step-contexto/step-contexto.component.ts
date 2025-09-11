import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-contexto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 md:p-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Tu Contexto Profesional</h2>
      <form [formGroup]="form" (ngSubmit)="next()">
        <div class="space-y-4">
          <div>
            <label for="area" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Área o Departamento</label>
            <input type="text" id="area" formControlName="area" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="experiencia" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Años de Experiencia</label>
            <input type="number" id="experiencia" formControlName="experiencia" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="equipo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tamaño del equipo a cargo (si aplica)</label>
            <input type="number" id="equipo" formControlName="equipo" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
        </div>
      </form>
    </div>
  `
})
export class StepContextoComponent {
  private fb = inject(FormBuilder);
  private diagnosticState = inject(DiagnosticStateService);

  form = this.fb.group({
    area: ['', Validators.required],
    experiencia: ['', [Validators.required, Validators.min(0)]],
    equipo: ['0', [Validators.required, Validators.min(0)]]
  });

  constructor() {
    const currentContexto = this.diagnosticState.state().contexto;
    if (currentContexto) {
      this.form.patchValue(currentContexto);
    }
  }

  next() {
    if (this.form.valid) {
      this.diagnosticState.updateData({ contexto: this.form.value as any });
      this.diagnosticState.nextStep();
    } else {
      this.form.markAllAsTouched();
    }
  }
}