import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { COMPETENCIAS } from '../../../data/competencias';

@Component({
  selector: 'app-step-competencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Evaluación de Competencias
        </h2>
        <p class="text-lg text-gray-300">
          Evalúa tu nivel actual en cada una de las competencias clave para la implementación de IA
        </p>
      </div>

      <form [formGroup]="competenciasForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Información sobre la escala al comienzo -->
        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 class="text-blue-200 font-medium mb-2">Escala de Evaluación:</h4>
          <div class="grid grid-cols-5 gap-2 text-sm text-blue-100">
            <div class="text-center">
              <div class="font-medium">Incipiente</div>
              <div class="text-xs">Conocimiento básico</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Básico</div>
              <div class="text-xs">Comprensión general</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Intermedio</div>
              <div class="text-xs">Aplicación práctica</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Avanzado</div>
              <div class="text-xs">Experiencia sólida</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Líder</div>
              <div class="text-xs">Experto reconocido</div>
            </div>
          </div>
        </div>

        <!-- Lista de competencias -->
        <div class="space-y-6">
          <div *ngFor="let competencia of competencias; let i = index" 
               class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-white mb-2">
                {{ competencia.nameKey }}
              </h3>
              <p class="text-gray-300 text-sm">
                Evalúa tu nivel actual de competencia en esta área
              </p>
            </div>

            <!-- Escala de evaluación -->
            <div class="grid grid-cols-5 gap-3">
              <label *ngFor="let nivel of nivelesCompetencia; let j = index" 
                     class="flex flex-col items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                     [class.border-blue-500]="getCompetenciaControl(competencia.id).value === j"
                     [class.border-gray-600]="getCompetenciaControl(competencia.id).value !== j">
                <input type="radio" 
                       [formControl]="getCompetenciaControl(competencia.id)" 
                       [value]="j" 
                       class="sr-only">
                <div class="w-4 h-4 rounded-full border-2 mb-2"
                     [class.bg-blue-500]="getCompetenciaControl(competencia.id).value === j"
                     [class.border-blue-500]="getCompetenciaControl(competencia.id).value === j"
                     [class.border-gray-400]="getCompetenciaControl(competencia.id).value !== j">
                </div>
                <span class="text-white text-xs text-center">{{ nivel }}</span>
              </label>
            </div>

            <!-- Validación -->
            <div *ngIf="getCompetenciaControl(competencia.id).invalid && getCompetenciaControl(competencia.id).touched" 
                 class="mt-2 text-red-400 text-sm">
              Por favor evalúa tu nivel en esta competencia
            </div>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="pt-4">
          <button 
            type="submit" 
            [disabled]="competenciasForm.invalid"
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
  `]
})
export class StepCompetenciasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  competenciasForm!: FormGroup;
  competencias = COMPETENCIAS;
  nivelesCompetencia = ['Incipiente', 'Básico', 'Intermedio', 'Avanzado', 'Líder'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  private initializeForm(): void {
    this.competenciasForm = this.stateService.competenciasForm;
    
    // Asegurar que todos los controles estén inicializados
    this.competencias.forEach(comp => {
      this.stateService.getCompetenciaControl(comp.id);
    });
  }

  private loadExistingData(): void {
    // Los datos se cargan automáticamente desde el servicio
    // que ya tiene la lógica de persistencia
  }

  getCompetenciaControl(compId: string) {
    return this.stateService.getCompetenciaControl(compId);
  }

  onSubmit(): void {
    if (this.competenciasForm.valid) {
      // Los datos ya están guardados en el servicio
      // Solo necesitamos navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/objetivo`;
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'objetivo']);
    });
  }
}
