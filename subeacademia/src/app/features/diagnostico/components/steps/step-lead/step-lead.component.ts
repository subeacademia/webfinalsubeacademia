import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { UserLead } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 md:p-8 max-w-lg mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
        ¡Casi listo!
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Introduce tus datos para ver tu reporte personalizado y guardar tu progreso.
      </p>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" class="space-y-4 text-left">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Nombre Completo</label>
          <input type="text" id="name" formControlName="name"
                 class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Correo Electrónico</label>
          <input type="email" id="email" formControlName="email"
                 class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <div class="pt-4">
          <button type="submit" [disabled]="leadForm.invalid || isSaving"
                  class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isSaving ? 'Guardando y generando...' : 'Ver mis Resultados' }}
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepLeadComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private stateService = inject(DiagnosticStateService);
  private diagnosticsDbService = inject(DiagnosticsService);

  isSaving = false;

  leadForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit() {
    if (this.leadForm.invalid) {
      return;
    }
    this.isSaving = true;

    // 1. Actualizar el estado con los datos del usuario
    this.stateService.setUserDetails(this.leadForm.value as UserLead);

    try {
      // 2. Guardar el estado completo en Firestore
      const docId = await this.diagnosticsDbService.saveDiagnosticResult(this.stateService.state());
      this.stateService.setDiagnosticId(docId); // Opcional: guardar el ID por si se necesita después

      // 3. Limpiar el borrador de localStorage
      this.stateService.clearLocalStorageState();

      // 4. Navegar a la página de resultados
      this.router.navigate(['resultados'], { relativeTo: this.route.parent });

    } catch (error) {
      console.error("Failed to save diagnostic:", error);
      // Aquí podrías mostrar un toast de error al usuario
      this.isSaving = false;
    }
  }
}