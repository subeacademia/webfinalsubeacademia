import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { UserLead } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 md:p-6 max-w-lg mx-auto">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">¡Casi listo!</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Déjanos tus datos para enviarte el informe completo y personalizado a tu correo.
      </p>
      <form [formGroup]="leadForm" (ngSubmit)="submit()">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
            <input type="text" id="name" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <input type="email" id="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Opcional)</label>
            <input type="tel" id="phone" formControlName="phone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
        </div>
        
        <!-- Botones de navegación -->
        <div class="mt-8 flex justify-between">
          <button type="button" (click)="previous()" 
                  class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
            ← Volver
          </button>
          <button type="submit" 
                  [disabled]="leadForm.invalid || stateService.isGeneratingReport()"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            @if (stateService.isGeneratingReport()) {
              <span>Generando...</span>
            } @else {
              <span>Finalizar Diagnóstico</span>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class StepLeadComponent {
  private fb = inject(FormBuilder);
  public stateService = inject(DiagnosticStateService);
  private router = inject(Router);

  leadForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  submit() {
    if (this.leadForm.valid) {
      this.stateService.updateData({ lead: this.leadForm.value as UserLead });
      this.stateService.generateReportAndNavigate();
    } else {
      this.leadForm.markAllAsTouched();
    }
  }

  previous() {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico/objetivo`]);
  }
}