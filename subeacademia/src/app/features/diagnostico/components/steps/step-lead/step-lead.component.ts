import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">Información de Contacto</h2>
        <p class="text-lg text-gray-300">
          Completa tus datos para recibir tu diagnóstico personalizado y plan de acción
        </p>
      </div>

      <div class="max-w-2xl mx-auto">
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <form class="space-y-6">
            <!-- Nombre -->
            <div>
              <label class="block text-lg font-medium text-white mb-2">
                Nombre completo *
              </label>
              <input 
                type="text" 
                [formControl]="nombreControl"
                placeholder="Tu nombre completo"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="nombreControl.invalid && nombreControl.touched"
                [class.border-gray-600]="!nombreControl.invalid || !nombreControl.touched">
              <div *ngIf="nombreControl.invalid && nombreControl.touched" class="text-red-400 text-sm mt-1">
                El nombre es requerido
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-lg font-medium text-white mb-2">
                Correo electrónico *
              </label>
              <input 
                type="email" 
                [formControl]="emailControl"
                placeholder="tu@email.com"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="emailControl.invalid && emailControl.touched"
                [class.border-gray-600]="!emailControl.invalid || !emailControl.touched">
              <div *ngIf="emailControl.invalid && emailControl.touched" class="text-red-400 text-sm mt-1">
                <span *ngIf="emailControl.errors?.['required']">El email es requerido</span>
                <span *ngIf="emailControl.errors?.['email']">Ingresa un email válido</span>
              </div>
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-lg font-medium text-white mb-2">
                Teléfono (opcional)
              </label>
              <input 
                type="tel" 
                [formControl]="telefonoControl"
                placeholder="+1 (555) 123-4567"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <!-- Checkbox de comunicaciones -->
            <div class="flex items-start">
              <input 
                type="checkbox" 
                [formControl]="aceptaComunicacionesControl"
                id="aceptaComunicaciones"
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mt-1">
              <label for="aceptaComunicaciones" class="ml-3 text-sm text-gray-300">
                Acepto recibir comunicaciones sobre mi diagnóstico y oportunidades de mejora. 
                Puedo cancelar en cualquier momento.
              </label>
            </div>

            <!-- Información adicional -->
            <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div class="text-sm text-blue-200">
                  <p class="font-medium mb-1">Tu información está segura</p>
                  <p>Utilizamos tus datos únicamente para generar tu diagnóstico personalizado y enviarte el plan de acción. No compartimos tu información con terceros.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="flex justify-between mt-8">
        <button 
          (click)="anterior()"
          class="btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Anterior
        </button>
        
        <button 
          (click)="finalizar()"
          [disabled]="!isFormValid()"
          class="btn-primary">
          Finalizar Diagnóstico
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .btn-primary {
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
  `]
})
export class StepLeadComponent {
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  // Controles del formulario
  nombreControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  telefonoControl = new FormControl('');
  aceptaComunicacionesControl = new FormControl(false);

  // Validación del formulario
  isFormValid = computed(() => {
    return this.nombreControl.valid && 
           this.emailControl.valid && 
           this.nombreControl.value && 
           this.emailControl.value;
  });

  constructor() {
    this.loadSavedData();
  }

  private loadSavedData(): void {
    const savedData = this.diagnosticState.leadForm.value;
    if (savedData) {
      this.nombreControl.setValue(savedData.nombre || '');
      this.emailControl.setValue(savedData.email || '');
      this.telefonoControl.setValue(savedData.telefono || '');
      this.aceptaComunicacionesControl.setValue(savedData.aceptaComunicaciones || false);
    }
  }

  anterior(): void {
    this.router.navigate(['/diagnostico/objetivo']);
  }

  finalizar(): void {
    if (this.isFormValid()) {
      // Guardar datos del lead
      this.diagnosticState.leadForm.patchValue({
        nombre: this.nombreControl.value,
        email: this.emailControl.value,
        telefono: this.telefonoControl.value,
        aceptaComunicaciones: this.aceptaComunicacionesControl.value
      });

      // Marcar como completado y navegar a resultados
      this.diagnosticState.markAsCompleted();
      this.router.navigate(['/diagnostico/resultados']);
    }
  }
}
