import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
        <div class="mt-6 flex justify-end">
          <button type="submit" 
                  [disabled]="form.invalid" 
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            Continuar
          </button>
        </div>
      </form>
    </div>
  `
})
export class StepContextoComponent {
  private fb = inject(FormBuilder);
  private diagnosticState = inject(DiagnosticStateService);
  private router = inject(Router);

  form = this.fb.group({
    area: ['rrhh', Validators.required],
    experiencia: ['5', [Validators.required, Validators.min(0)]],
    equipo: ['20', [Validators.required, Validators.min(0)]]
  });

  constructor() {
    const currentContexto = this.diagnosticState.state().contexto;
    if (currentContexto) {
      this.form.patchValue(currentContexto);
    }
  }

  next() {
    console.log('next() called, form valid:', this.form.valid);
    console.log('Current URL before navigation:', this.router.url);
    if (this.form.valid) {
      console.log('Form is valid, updating data and navigating to ares');
      this.diagnosticState.updateData({ contexto: this.form.value as any });
      
      // Navegación con prefijo de idioma detectado
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      console.log('Detected language prefix:', languagePrefix);
      console.log('Attempting navigation to:', `/${languagePrefix}/diagnostico/ares`);
      
      this.router.navigate([`/${languagePrefix}/diagnostico/ares`]).then(success => {
        console.log('Navigation success:', success);
        console.log('URL after navigation:', this.router.url);
      }).catch(error => {
        console.error('Navigation error:', error);
      });
    } else {
      console.log('Form is invalid, marking as touched');
      this.form.markAllAsTouched();
    }
  }
}