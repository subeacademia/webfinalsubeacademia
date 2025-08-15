import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Objetivo Principal
        </h2>
        <p class="text-lg text-gray-300">
          Cuéntanos cuál es tu objetivo principal con la implementación de IA en tu organización
        </p>
      </div>

      <form [formGroup]="objectiveForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Objetivo principal -->
        <div class="form-group">
          <label for="mainObjective" class="block text-sm font-medium text-gray-200 mb-2">
            ¿Cuál es tu objetivo principal con la implementación de IA? *
          </label>
          <textarea 
            id="mainObjective" 
            formControlName="mainObjective"
            rows="6"
            placeholder="Describe tu objetivo principal. Por ejemplo: 'Quiero automatizar procesos de atención al cliente para mejorar la eficiencia y reducir costos operativos'"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none">
          </textarea>
          <div *ngIf="objectiveForm.get('mainObjective')?.invalid && objectiveForm.get('mainObjective')?.touched" 
               class="mt-1 text-red-400 text-sm">
            Por favor describe tu objetivo principal
          </div>
          <div class="mt-2 text-sm text-gray-400">
            <p>Ejemplos de objetivos comunes:</p>
            <ul class="mt-2 space-y-1 text-left">
              <li>• Automatizar procesos repetitivos</li>
              <li>• Mejorar la toma de decisiones con datos</li>
              <li>• Optimizar la experiencia del cliente</li>
              <li>• Reducir costos operativos</li>
              <li>• Acelerar la innovación de productos</li>
            </ul>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="pt-4">
          <button 
            type="submit" 
            [disabled]="objectiveForm.invalid"
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

    textarea {
      @apply font-sans;
    }

    textarea:focus {
      @apply outline-none;
    }
  `]
})
export class StepObjetivoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  objectiveForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  private initializeForm(): void {
    this.objectiveForm = this.fb.group({
      mainObjective: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  private loadExistingData(): void {
    const existingObjective = this.stateService.form.get('objetivo')?.value;
    if (existingObjective) {
      this.objectiveForm.patchValue({
        mainObjective: existingObjective
      });
    }
  }

  onSubmit(): void {
    if (this.objectiveForm.valid) {
      const formData = this.objectiveForm.value;
      
      // Guardar en el servicio de estado
      this.stateService.form.patchValue({
        objetivo: formData.mainObjective
      });

      // Navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/lead`;
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'lead']);
    });
  }
}
