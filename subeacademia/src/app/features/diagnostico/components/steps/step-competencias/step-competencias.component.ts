import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { COMPETENCIAS } from '../../../data/competencias';
import { SliderFieldComponent, SliderFieldConfig } from '../../ui/slider-field.component';

@Component({
  selector: 'app-step-competencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SliderFieldComponent],
  template: `
    <div class="max-w-6xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white dark:text-white mb-4">
          Evaluación de Competencias
        </h2>
        <p class="text-lg text-gray-300 dark:text-gray-400">
          Evalúa tu nivel actual en cada una de las competencias clave para la implementación de IA
        </p>
      </div>

      <!-- Información sobre la escala al comienzo -->
      <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-blue-200 font-medium mb-4 text-center">Escala de Evaluación:</h4>
        <div class="grid grid-cols-5 gap-4 text-sm text-blue-100">
          <div class="text-center">
            <div class="font-medium">1 - Incipiente</div>
            <div class="text-xs">Conocimiento básico</div>
          </div>
          <div class="text-center">
            <div class="font-medium">2 - Básico</div>
            <div class="text-xs">Comprensión general</div>
          </div>
          <div class="text-center">
            <div class="font-medium">3 - Intermedio</div>
            <div class="text-xs">Aplicación práctica</div>
          </div>
          <div class="text-center">
            <div class="font-medium">4 - Avanzado</div>
            <div class="text-xs">Experiencia sólida</div>
          </div>
          <div class="text-center">
            <div class="font-medium">5 - Líder</div>
            <div class="text-xs">Experto reconocido</div>
          </div>
        </div>
      </div>

      <form [formGroup]="competenciasForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Lista de competencias con sliders -->
        <div class="space-y-6">
          <app-slider-field 
            *ngFor="let competencia of competencias" 
            [config]="getSliderConfig(competencia)"
            (valueChange)="onSliderValueChange($event, competencia.id)">
          </app-slider-field>
        </div>

        <!-- Botón de envío -->
        <div class="pt-6">
          <button 
            type="submit" 
            [disabled]="competenciasForm.invalid"
            class="w-full btn-primary py-4 px-8 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">
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
  `]
})
export class StepCompetenciasComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
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

  getSliderConfig(competencia: any): SliderFieldConfig {
    return {
      id: competencia.id,
      labelKey: competencia.nameKey,
      descriptionKey: 'Evalúa tu nivel actual de competencia en esta área',
      tooltipKey: 'Esta competencia es fundamental para el éxito en la implementación de IA. Considera tu experiencia práctica y conocimiento teórico.',
      dimension: 'competencia',
      phase: 'C',
      minValue: 1,
      maxValue: 5,
      step: 1,
      labels: this.nivelesCompetencia,
      formControl: this.getCompetenciaControl(competencia.id)
    };
  }

  onSliderValueChange(value: number, compId: string): void {
    const control = this.getCompetenciaControl(compId);
    control.setValue(value);
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
