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
            (input)="formatPhoneNumber($event)"
            (keypress)="onlyNumbers($event)"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
          <div *ngIf="leadForm.get('telefono')?.invalid && leadForm.get('telefono')?.touched" 
               class="mt-1 text-red-400 text-sm">
            <span *ngIf="leadForm.get('telefono')?.errors?.['pattern']">El teléfono solo debe contener números y espacios</span>
          </div>
          <div class="mt-1 text-xs text-gray-400">
            Formato: +56 9 1234 5678 (solo números y espacios)
          </div>
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
              <span class="font-medium">Tu información está segura</span>
              <p class="text-gray-400 mt-1">
                La información que nos proporcionas se utiliza únicamente para generar tu diagnóstico personalizado y enviarte contenido relevante sobre IA. No compartimos tus datos con terceros.
              </p>
            </div>
          </div>
        </div>

        <!-- Botón de envío -->
        <button 
          type="submit" 
          [disabled]="leadForm.invalid || isSubmitting"
          class="w-full btn-primary py-3 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">
          <svg *ngIf="!isSubmitting" class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
          <svg *ngIf="isSubmitting" class="w-5 h-5 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isSubmitting ? 'Guardando...' : 'Generar Diagnóstico' }}
        </button>
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

    input:focus {
      @apply outline-none;
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
    
    // Agregar validación personalizada para teléfono
    const telefonoControl = this.leadForm.get('telefono');
    if (telefonoControl) {
      telefonoControl.setValidators([
        this.phoneNumberValidator()
      ]);
      telefonoControl.updateValueAndValidity();
    }
  }

  private loadExistingData(): void {
    // Los datos se cargan automáticamente desde el servicio
    // que ya tiene la lógica de persistencia
  }

  // Validador personalizado para teléfono
  private phoneNumberValidator() {
    return (control: any) => {
      if (!control.value) {
        return null; // Campo opcional
      }
      
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(control.value)) {
        return { pattern: true };
      }
      
      return null;
    };
  }

  // Solo permitir números y algunos caracteres especiales
  onlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '(', ')', ' '];
    const key = event.key;
    
    if (!allowedKeys.includes(key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  // Formatear número de teléfono
  formatPhoneNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remover todos los caracteres excepto números
    let numbers = value.replace(/\D/g, '');
    
    // Aplicar formato chileno si empieza con 56
    if (numbers.startsWith('56') && numbers.length >= 9) {
      let formatted = '';
      
      if (numbers.length >= 2) {
        formatted += '+' + numbers.substring(0, 2);
        numbers = numbers.substring(2);
      }
      
      if (numbers.length >= 1) {
        formatted += ' ' + numbers.substring(0, 1);
        numbers = numbers.substring(1);
      }
      
      if (numbers.length >= 4) {
        formatted += ' ' + numbers.substring(0, 4);
        numbers = numbers.substring(4);
      }
      
      if (numbers.length >= 4) {
        formatted += ' ' + numbers.substring(0, 4);
        numbers = numbers.substring(4);
      }
      
      if (numbers.length > 0) {
        formatted += ' ' + numbers;
      }
      
      input.value = formatted;
    } else {
      // Formato simple para otros casos
      let formatted = '';
      for (let i = 0; i < numbers.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += numbers[i];
      }
      input.value = formatted;
    }
    
    // Actualizar el control del formulario
    this.leadForm.patchValue({ telefono: input.value });
  }

  async onSubmit(): Promise<void> {
    if (this.leadForm.valid) {
      this.isSubmitting = true;
      
      try {
        const formData = this.leadForm.value;
        
        // Limpiar teléfono antes de guardar
        if (formData.telefono) {
          formData.telefono = formData.telefono.replace(/\s+/g, ' ').trim();
        }
        
        // Guardar en el servicio de estado
        this.stateService.leadForm.patchValue(formData);
        
        // Marcar como completado
        this.stateService.markAsCompleted();
        
        // Intentar guardar en Firestore
        try {
          const diagnosticData = this.stateService.getDiagnosticData();
          
          const docData = {
            diagnosticData,
            lead: formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(this.firestore, 'diagnostics'), docData);
          console.log('✅ Diagnóstico guardado en Firestore con ID:', docRef.id);
        } catch (firestoreError) {
          console.warn('⚠️ No se pudo guardar en Firestore, pero continuando con el diagnóstico:', firestoreError);
          // Continuar aunque falle Firestore
        }
        
        // Navegar a resultados
        this.navigateToResults();
        
      } catch (error) {
        console.error('❌ Error general al procesar el diagnóstico:', error);
        alert('Error al procesar el diagnóstico. Por favor, intenta de nuevo.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  private navigateToResults(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const resultsUrl = `${baseUrl}/resultados`;
    
    this.router.navigate([resultsUrl]).catch(error => {
      console.error('Error en navegación a resultados:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'resultados']);
    });
  }
}
