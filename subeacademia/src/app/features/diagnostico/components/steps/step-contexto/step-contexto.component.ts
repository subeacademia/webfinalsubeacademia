import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { INDUSTRIES } from '../../../data/industries';

@Component({
  selector: 'app-step-contexto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Contexto de tu Organización
        </h2>
        <p class="text-lg text-gray-300">
          Ayúdanos a entender mejor tu contexto para personalizar el diagnóstico
        </p>
      </div>

      <form [formGroup]="contextForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Industria -->
        <div class="form-group">
          <label for="industria" class="block text-sm font-medium text-gray-200 mb-2">
            ¿En qué industria opera tu organización? *
          </label>
          <select 
            id="industria" 
            formControlName="industria"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
            <option value="">Selecciona una industria</option>
            <ng-container *ngFor="let category of industries">
              <optgroup [label]="category.category" class="text-gray-400">
                <option 
                  *ngFor="let option of category.options" 
                  [value]="option"
                  class="text-white">
                  {{ option }}
                </option>
              </optgroup>
            </ng-container>
          </select>
          <div *ngIf="contextForm.get('industria')?.invalid && contextForm.get('industria')?.touched" 
               class="mt-1 text-red-400 text-sm">
            Por favor selecciona una industria
          </div>
        </div>

        <!-- Tamaño -->
        <div class="form-group">
          <label for="tamano" class="block text-sm font-medium text-gray-200 mb-2">
            ¿Cuál es el tamaño de tu organización? *
          </label>
          <select 
            id="tamano" 
            formControlName="tamano"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
            <option value="">Selecciona el tamaño</option>
            <option value="micro">Micro (1-10 empleados)</option>
            <option value="pequena">Pequeña (11-50 empleados)</option>
            <option value="mediana">Mediana (51-250 empleados)</option>
            <option value="grande">Grande (251+ empleados)</option>
          </select>
          <div *ngIf="contextForm.get('tamano')?.invalid && contextForm.get('tamano')?.touched" 
               class="mt-1 text-red-400 text-sm">
            Por favor selecciona el tamaño
          </div>
        </div>

        <!-- Presupuesto -->
        <div class="form-group">
          <label for="presupuesto" class="block text-sm font-medium text-gray-200 mb-2">
            ¿Cuál es tu presupuesto anual para proyectos de IA? *
          </label>
          <select 
            id="presupuesto" 
            formControlName="presupuesto"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
            <option value="">Selecciona el presupuesto</option>
            <option value="bajo">Bajo (menos de $50K USD)</option>
            <option value="medio">Medio ($50K - $500K USD)</option>
            <option value="alto">Alto ($500K - $5M USD)</option>
            <option value="muy-alto">Muy alto (más de $5M USD)</option>
          </select>
          <div *ngIf="contextForm.get('presupuesto')?.invalid && contextForm.get('presupuesto')?.touched" 
               class="mt-1 text-red-400 text-sm">
            Por favor selecciona el presupuesto
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="pt-4">
          <button 
            type="submit" 
            [disabled]="contextForm.invalid"
            class="w-full btn-primary py-3 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            Siguiente
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

    select option {
      @apply bg-gray-800 text-white;
    }

    select optgroup {
      @apply bg-gray-700 text-gray-300;
    }
  `]
})
export class StepContextoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  contextForm!: FormGroup;
  industries = INDUSTRIES;

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  private initializeForm(): void {
    this.contextForm = this.fb.group({
      industria: ['', [Validators.required]],
      tamano: ['', [Validators.required]],
      presupuesto: ['', [Validators.required]]
    });
  }

  private loadExistingData(): void {
    const existingData = this.stateService.getContextoData();
    if (existingData) {
      this.contextForm.patchValue({
        industria: existingData.industria || '',
        tamano: existingData.tamano || '',
        presupuesto: existingData.presupuesto || ''
      });
    }
  }

  onSubmit(): void {
    if (this.contextForm.valid) {
      const formData = this.contextForm.value;
      
      // Guardar en el servicio de estado
      this.stateService.saveContextoData({
        industria: formData.industria,
        tamano: formData.tamano,
        presupuesto: formData.presupuesto
      });

      // Navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/ares`;
    
    console.log(`🚀 Navegando al siguiente paso: ${nextStepUrl}`);
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('❌ Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'ares']).catch(fallbackErr => {
        console.error('❌ Error en fallback de navegación:', fallbackErr);
      });
    });
  }
}
