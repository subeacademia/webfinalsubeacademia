import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { COMPETENCIAS, COMPETENCIAS_COMPLETAS } from '../../../data/competencias';
import { SliderFieldComponent, SliderFieldConfig } from '../../ui/slider-field.component';

@Component({
  selector: 'app-step-competencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SliderFieldComponent],
  template: `
    <div class="max-w-6xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white dark:text-white mb-4">
          🧠 Evaluación de Competencias para la Era de la IA
        </h2>
        <p class="text-lg text-gray-300 dark:text-gray-400">
          Evalúa tu nivel actual en las competencias clave que transformarán tu futuro profesional
        </p>
      </div>

      <!-- Explicación de la Transformación por la IA -->
      <div class="bg-gradient-to-r from-indigo-900/30 to-cyan-900/30 border border-indigo-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-indigo-200 font-medium mb-4 text-center text-lg">🚀 ¿Por qué estas competencias son cruciales en la era de la IA?</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-indigo-100">
          <div class="space-y-3">
            <div class="bg-indigo-800/30 rounded-lg p-3">
              <div class="font-semibold text-indigo-200">🤖 La IA automatiza lo básico</div>
              <div class="text-indigo-300 text-xs">Análisis de datos, tareas repetitivas y procesos algorítmicos</div>
            </div>
            <div class="bg-indigo-800/30 rounded-lg p-3">
              <div class="font-semibold text-indigo-200">🧠 El valor humano se desplaza</div>
              <div class="text-indigo-300 text-xs">Hacia la creatividad, intuición y pensamiento de orden superior</div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-indigo-800/30 rounded-lg p-3">
              <div class="font-semibold text-indigo-200">⚡ Aprendizaje continuo es supervivencia</div>
              <div class="text-indigo-300 text-xs">La obsolescencia del conocimiento se acelera exponencialmente</div>
            </div>
            <div class="bg-indigo-800/30 rounded-lg p-3">
              <div class="font-semibold text-indigo-200">🎯 Problemas adaptativos son clave</div>
              <div class="text-indigo-300 text-xs">Juicio, contexto, ética e inteligencia emocional</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información sobre la escala al comienzo -->
      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-green-200 font-medium mb-4 text-center">📊 Escala de Evaluación por Nivel de Dominio:</h4>
        <div class="grid grid-cols-5 gap-4 text-sm text-green-100">
          <div class="text-center">
            <div class="font-medium">1 - Explorador</div>
            <div class="text-xs">Reconoce conceptos básicos</div>
          </div>
          <div class="text-center">
            <div class="font-medium">2 - Aprendiz</div>
            <div class="text-xs">Aplica en contextos familiares</div>
          </div>
          <div class="text-center">
            <div class="font-medium">3 - Practicante</div>
            <div class="text-xs">Implementa de manera independiente</div>
          </div>
          <div class="text-center">
            <div class="font-medium">4 - Avanzado</div>
            <div class="text-xs">Lidera y innova en el área</div>
          </div>
          <div class="text-center">
            <div class="font-medium">5 - Experto</div>
            <div class="text-xs">Transforma la disciplina</div>
          </div>
        </div>
      </div>

      <!-- Explicación de los niveles de dominio -->
      <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-purple-200 font-medium mb-4 text-center text-lg">🎯 Progresión de Dominio en Competencias:</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-100">
          <div class="space-y-3">
            <div class="bg-purple-800/30 rounded-lg p-3">
              <div class="font-semibold text-purple-200">🌱 Niveles 1-2: Fundamentos</div>
              <div class="text-purple-300 text-xs">Comprensión básica y aplicación en contextos familiares</div>
            </div>
            <div class="bg-purple-800/30 rounded-lg p-3">
              <div class="font-semibold text-purple-200">🚀 Nivel 3: Independencia</div>
              <div class="text-purple-300 text-xs">Implementación autónoma y resolución de problemas complejos</div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-purple-800/30 rounded-lg p-3">
              <div class="font-semibold text-purple-200">🎯 Nivel 4: Liderazgo</div>
              <div class="text-purple-300 text-xs">Innovación, mentoría y transformación de equipos</div>
            </div>
            <div class="bg-purple-800/30 rounded-lg p-3">
              <div class="font-semibold text-purple-200">🌟 Nivel 5: Maestría</div>
              <div class="text-purple-300 text-xs">Revolución de la disciplina e influencia global</div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-purple-800/30 rounded-lg p-3">
              <div class="font-semibold text-purple-200">💡 Transformación por la IA</div>
              <div class="text-purple-300 text-xs">Los niveles 1-2 se automatizan, el valor está en 3-5</div>
            </div>
            <div class="bg-purple-800/30 rounded-lg p-3">
              <div class="font-semibold text-purple-200">🎯 Enfoque estratégico</div>
              <div class="text-purple-300 text-xs">Desarrollar competencias que la IA no puede replicar</div>
            </div>
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
  nivelesCompetencia = ['Explorador', 'Aprendiz', 'Practicante', 'Avanzado', 'Experto'];

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
      // 🔧 SOLUCIÓN: Guardar los datos de competencias en el estado global
      const competenciasData = this.competenciasForm.value;
      console.log('🎯 Guardando datos de competencias:', competenciasData);
      
      this.stateService.saveCompetenciasData(competenciasData);
      
      // Navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/objetivo`;
    
    console.log(`🚀 Navegando al siguiente paso: ${nextStepUrl}`);
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('❌ Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'objetivo']).catch(fallbackErr => {
        console.error('❌ Error en fallback de navegación:', fallbackErr);
      });
    });
  }
}
