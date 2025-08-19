import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Información de Contacto
        </h2>
        <p class="text-lg text-gray-300">
          Completa tus datos para recibir tu diagnóstico personalizado y recomendaciones
        </p>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Nombre -->
        <div class="form-group">
          <label for="nombre" class="block text-sm font-medium text-gray-200 mb-2">
            Nombre completo *
          </label>
          <input 
            type="text" 
            id="nombre" 
            formControlName="nombre"
            placeholder="Ingresa tu nombre completo"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
          <div *ngIf="leadForm.get('nombre')?.invalid && leadForm.get('nombre')?.touched" 
               class="mt-1 text-red-400 text-sm">
            Por favor ingresa tu nombre completo
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="block text-sm font-medium text-gray-200 mb-2">
            Correo electrónico *
          </label>
          <input 
            type="email" 
            id="email" 
            formControlName="email"
            placeholder="tu@email.com"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
          <div *ngIf="leadForm.get('email')?.invalid && leadForm.get('email')?.touched" 
               class="mt-1 text-red-400 text-sm">
            <span *ngIf="leadForm.get('email')?.errors?.['required']">Por favor ingresa tu correo electrónico</span>
            <span *ngIf="leadForm.get('email')?.errors?.['email']">Por favor ingresa un correo electrónico válido</span>
          </div>
        </div>

        <!-- Teléfono (opcional) -->
        <div class="form-group">
          <label for="telefono" class="block text-sm font-medium text-gray-200 mb-2">
            Teléfono (opcional)
          </label>
          <input 
            type="tel" 
            id="telefono" 
            formControlName="telefono"
            placeholder="+56 9 1234 5678"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
        </div>

        <!-- Acepta comunicaciones -->
        <div class="form-group">
          <label class="flex items-start space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              formControlName="aceptaComunicaciones"
              class="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2">
            <div class="text-sm text-gray-300">
              <span class="font-medium">Acepto recibir comunicaciones</span>
              <p class="text-gray-400 mt-1">
                Quiero recibir información sobre IA, mejores prácticas y oportunidades de mejora para mi organización
              </p>
            </div>
          </label>
        </div>

        <!-- Información de privacidad -->
        <div class="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-sm text-gray-300">
              <p class="font-medium text-blue-200 mb-1">Tu información está segura</p>
              <p>Utilizamos tu información únicamente para generar tu diagnóstico personalizado y, si lo autorizas, para enviarte contenido relevante sobre IA. No compartimos tus datos con terceros.</p>
            </div>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="pt-4">
          <button 
            type="submit" 
            [disabled]="leadForm.invalid || isSubmitting"
            class="w-full btn-primary py-3 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">
            <svg *ngIf="!isSubmitting" class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg *ngIf="isSubmitting" class="w-5 h-5 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isSubmitting ? 'Guardando...' : 'Finalizar Diagnóstico' }}
          </button>
        </div>
      </form>
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
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg;
    }

    .form-group {
      @apply space-y-2;
    }

    input[type="checkbox"] {
      @apply rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2;
    }

    input[type="checkbox"]:checked {
      @apply bg-blue-600 border-blue-600;
    }
  `]
})
export class StepLeadComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(DiagnosticStateService);
  private readonly router = inject(Router);
  private readonly firestore = inject(Firestore);

  leadForm!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  private initializeForm(): void {
    this.leadForm = this.stateService.leadForm;
  }

  private loadExistingData(): void {
    // Los datos se cargan automáticamente desde el servicio
    // que ya tiene la lógica de persistencia
  }

  async onSubmit(): Promise<void> {
    if (this.leadForm.valid) {
      this.isSubmitting = true;
      
      try {
        // Guardar lead en Firestore
        await this.saveLeadToFirestore();
        
        // Los datos ya están guardados en el servicio
        // Marcar como completado y navegar a resultados
        this.stateService.markAsCompleted();
        this.navigateToResults();
      } catch (error) {
        console.error('Error al guardar lead:', error);
        // Continuar con el flujo aunque falle el guardado en Firestore
        this.stateService.markAsCompleted();
        this.navigateToResults();
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  private async saveLeadToFirestore(): Promise<void> {
    try {
      const leadData = {
        nombre: this.leadForm.get('nombre')?.value,
        email: this.leadForm.get('email')?.value,
        telefono: this.leadForm.get('telefono')?.value || '',
        aceptaComunicaciones: this.leadForm.get('aceptaComunicaciones')?.value || false,
        timestamp: serverTimestamp(),
        source: 'diagnostico_ia',
        diagnosticData: this.stateService.getDiagnosticData()
      };

      const leadsRef = collection(this.firestore, 'leads');
      const docRef = await addDoc(leadsRef, leadData);
      console.log('✅ Lead guardado en Firestore con ID:', docRef.id);
    } catch (error) {
      console.error('❌ Error al guardar lead en Firestore:', error);
      throw error;
    }
  }

  private navigateToResults(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const resultsUrl = `${baseUrl}/resultados`;
    
    this.router.navigate([resultsUrl]).catch(error => {
      console.error('Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'resultados']);
    });
  }
}
