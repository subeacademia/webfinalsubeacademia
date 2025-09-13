import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { ToastService } from '../../../../../core/services/ui/toast/toast.service';

@Component({
  selector: 'app-step-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
        <h2 class="text-2xl font-bold mb-1 text-gray-800 dark:text-white">¡Ya casi terminamos!</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Completa tus datos para recibir tu diagnóstico personalizado.</p>
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
          <input type="text" id="name" formControlName="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
          <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-red-500 text-sm mt-1">
            Tu nombre es requerido.
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Corporativo</label>
          <input type="email" id="email" formControlName="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
           <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-500 text-sm mt-1">
            Por favor, ingresa un email válido.
           </div>
        </div>
      
        <div>
          <label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Empresa (Opcional)</label>
          <input type="text" id="companyName" formControlName="companyName" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
        </div>
      
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input id="acceptTerms" formControlName="acceptTerms" type="checkbox" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700">
          </div>
          <div class="ml-3 text-sm">
            <label for="acceptTerms" class="font-medium text-gray-700 dark:text-gray-300">Acepto los <a routerLink="/terminos" target="_blank" class="text-blue-600 hover:underline">términos y condiciones</a></label>
          </div>
        </div>
         <div *ngIf="form.get('acceptTerms')?.invalid && form.get('acceptTerms')?.touched" class="text-red-500 text-sm">
            Debes aceptar los términos para continuar.
         </div>
      
        <div class="flex justify-between items-center pt-4">
          <button type="button" (click)="diagnosticStateService.previousStep()" class="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Anterior
          </button>
          <button 
            type="submit" 
            class="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            [disabled]="form.invalid || isGenerating">
            @if (isGenerating) {
              <span class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </span>
            } @else {
              <span>Finalizar y Ver mi Diagnóstico</span>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class StepLeadComponent {
  @Output() diagnosticFinished = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private diagnosticsService = inject(DiagnosticsService);
  private toastService = inject(ToastService);
  public diagnosticStateService = inject(DiagnosticStateService);

  isGenerating = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    companyName: [''],
    acceptTerms: [false, Validators.requiredTrue]
  });

  async submit(): Promise<void> {
    if (this.form.valid && !this.isGenerating) {
      this.diagnosticStateService.updateLead(this.form.value);
      console.log('StepLead: Formulario válido. Iniciando generación de reporte...');
      this.isGenerating = true;
      
      try {
        if (!this.diagnosticStateService.isComplete()) {
          this.toastService.show('error', 'Por favor, completa todos los pasos del diagnóstico.');
          return;
        }
        
        const report = await this.diagnosticsService.generateReport(this.diagnosticStateService.state());
        if (!report) {
          throw new Error('El servicio de diagnóstico devolvió un reporte nulo.');
        }
        
        this.diagnosticsService.setCurrentReport(report);
        const currentUrl = this.router.url;
        const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
        this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
        
      } catch (error) {
        console.error('Error al generar el diagnóstico:', error);
        this.toastService.show('error', 'Hubo un problema al generar tu diagnóstico. La IA no respondió correctamente. Por favor, inténtalo de nuevo.');
      } finally {
        this.isGenerating = false;
      }
    } else if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }
}