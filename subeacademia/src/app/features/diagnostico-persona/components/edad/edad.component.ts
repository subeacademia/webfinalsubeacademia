import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui-kit/button/button';

@Component({
  selector: 'app-edad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiButtonComponent],
  template: `
    <div class="max-w-2xl mx-auto text-center">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ¿Cuál es tu edad?
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Necesitamos saber tu edad para adaptar el cuestionario a tu nivel de desarrollo
        </p>
      </div>

      <form [formGroup]="edadForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="flex justify-center">
          <div class="relative">
            <input
              type="number"
              formControlName="edad"
              class="w-32 h-16 text-4xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="0"
              min="8"
              max="100"
              autofocus
            />
            <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400">
              años
            </div>
          </div>
        </div>

        <!-- Mensaje de validación -->
        <div *ngIf="edadForm.get('edad')?.invalid && edadForm.get('edad')?.touched" class="text-red-600 dark:text-red-400">
          <p *ngIf="edadForm.get('edad')?.errors?.['required']">Por favor, ingresa tu edad</p>
          <p *ngIf="edadForm.get('edad')?.errors?.['min']">Debes tener al menos 8 años para realizar el diagnóstico</p>
          <p *ngIf="edadForm.get('edad')?.errors?.['max']">Por favor, ingresa una edad válida</p>
        </div>

        <!-- Mensaje para menores de 8 años -->
        <div *ngIf="edadForm.get('edad')?.value && edadForm.get('edad')?.value < 8" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p class="text-yellow-800 dark:text-yellow-200">
            <strong>¡Hola!</strong> Este diagnóstico está diseñado para personas de 8 años en adelante. 
            Te recomendamos explorar nuestros recursos educativos para niños más pequeños.
          </p>
          <div class="mt-4">
            <a href="/recursos-educativos" class="text-blue-600 dark:text-blue-400 hover:underline">
              Ver recursos educativos →
            </a>
          </div>
        </div>

        <!-- Botón de continuar -->
        <div class="pt-6">
          <app-ui-button
            type="submit"
            variant="primary"
            size="lg"
            [disabled]="!edadForm.valid || edadForm.get('edad')?.value < 8"
            class="w-full sm:w-auto"
          >
            Continuar
          </app-ui-button>
        </div>
      </form>

      <!-- Información adicional -->
      <div class="mt-12 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>8-17 años:</strong> Cuestionario adaptado para niños y adolescentes<br>
          <strong>18+ años:</strong> Cuestionario completo para adultos
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdadComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  edadForm: FormGroup;

  constructor() {
    this.edadForm = this.fb.group({
      edad: ['', [Validators.required, Validators.min(8), Validators.max(100)]]
    });
  }

  onSubmit(): void {
    if (this.edadForm.valid) {
      const edad = this.edadForm.get('edad')?.value;
      
      if (edad >= 8 && edad <= 17) {
        // Redirigir a consentimiento para menores
        this.router.navigate(['/es/diagnostico-persona/consentimiento'], { 
          queryParams: { group: 'menor', edad: edad } 
        });
      } else if (edad >= 18) {
        // Redirigir a consentimiento para adultos
        this.router.navigate(['/es/diagnostico-persona/consentimiento'], { 
          queryParams: { group: 'adulto', edad: edad } 
        });
      }
    }
  }
}
