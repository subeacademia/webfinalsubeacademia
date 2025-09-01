import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ARES_ITEMS } from '../../../data/ares-items';
import { SliderFieldComponent, SliderFieldConfig } from '../../ui/slider-field.component';

@Component({
  selector: 'app-step-ares',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SliderFieldComponent],
  template: `
    <div class="max-w-6xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white dark:text-white mb-4">
          Evaluación ARES-AI
        </h2>
        <p class="text-lg text-gray-300 dark:text-gray-400">
          Evalúa la madurez de tu organización en las dimensiones clave del modelo ARES-AI
        </p>
      </div>

      <!-- Información sobre la escala al comienzo -->
      <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-blue-200 font-medium mb-4 text-center">Escala de Evaluación:</h4>
        <div class="grid grid-cols-5 gap-4 text-sm text-blue-100">
          <div class="text-center">
            <div class="font-medium">1 - Incipiente</div>
            <div class="text-xs">Sin implementación</div>
          </div>
          <div class="text-center">
            <div class="font-medium">2 - Básico</div>
            <div class="text-xs">Implementación inicial</div>
          </div>
          <div class="text-center">
            <div class="font-medium">3 - Intermedio</div>
            <div class="text-xs">Implementación parcial</div>
          </div>
          <div class="text-center">
            <div class="font-medium">4 - Avanzado</div>
            <div class="text-xs">Implementación sólida</div>
          </div>
          <div class="text-center">
            <div class="font-medium">5 - Líder</div>
            <div class="text-xs">Excelencia operativa</div>
          </div>
        </div>
      </div>

      <!-- Explicación de las dimensiones ARES -->
      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-green-200 font-medium mb-4 text-center">¿Qué evaluamos en cada dimensión?</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-100">
          <div class="space-y-3">
            <div class="bg-green-800/30 rounded-lg p-3">
              <div class="font-semibold text-green-200">Datos & Talento</div>
              <div class="text-green-300 text-xs">Calidad de datos, disponibilidad de talento y gobernanza básica</div>
            </div>
            <div class="bg-green-800/30 rounded-lg p-3">
              <div class="font-semibold text-green-200">Valor & Ética</div>
              <div class="text-green-300 text-xs">Métricas de valor, principios éticos y gestión de riesgos</div>
            </div>
            <div class="bg-green-800/30 rounded-lg p-3">
              <div class="font-semibold text-green-200">Tecnología & Integración</div>
              <div class="text-green-300 text-xs">Capacidades técnicas y capacidad de integración</div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-green-800/30 rounded-lg p-3">
              <div class="font-semibold text-green-200">Operación & Seguridad</div>
              <div class="text-green-300 text-xs">Monitoreo, seguridad y cumplimiento normativo</div>
            </div>
            <div class="bg-green-800/30 rounded-lg p-3">
              <div class="font-semibold text-green-200">Adopción & Sostenibilidad</div>
              <div class="text-green-300 text-xs">Escalamiento transversal y sostenibilidad a largo plazo</div>
            </div>
            <div class="bg-green-800/30 rounded-lg p-3">
              <div class="font-semibold text-green-200">Transparencia</div>
              <div class="text-green-300 text-xs">Explicabilidad y transparencia en el uso de IA</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información sobre fases -->
      <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-purple-200 font-medium mb-4 text-center">Fases del Modelo ARES-AI:</h4>
        <div class="grid grid-cols-5 gap-4 text-sm text-purple-100">
          <div class="text-center">
            <div class="font-medium">F1</div>
            <div class="text-xs">Fundamentos</div>
          </div>
          <div class="text-center">
            <div class="font-medium">F2</div>
            <div class="text-xs">Estrategia</div>
          </div>
          <div class="text-center">
            <div class="font-medium">F3</div>
            <div class="text-xs">Capacidades</div>
          </div>
          <div class="text-center">
            <div class="font-medium">F4</div>
            <div class="text-xs">Operación</div>
          </div>
          <div class="text-center">
            <div class="font-medium">F5</div>
            <div class="text-xs">Transformación</div>
          </div>
        </div>
      </div>

      <form [formGroup]="aresForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Lista de elementos ARES con sliders -->
        <div class="space-y-6">
          <app-slider-field 
            *ngFor="let item of aresItems" 
            [config]="getSliderConfig(item)"
            (valueChange)="onSliderValueChange($event, item.id)">
          </app-slider-field>
        </div>

        <!-- Botón de envío -->
        <div class="pt-6">
          <button 
            type="submit" 
            [disabled]="aresForm.invalid"
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
export class StepAresComponent implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly stateService = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  aresForm!: FormGroup;
  aresItems = ARES_ITEMS;
  nivelesCompetencia = ['Incipiente', 'Básico', 'Intermedio', 'Avanzado', 'Líder'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
  }

  private initializeForm(): void {
    this.aresForm = this.stateService.aresForm;
    
    // Asegurar que todos los controles estén inicializados
    this.aresItems.forEach(item => {
      this.stateService.getAresControl(item.id);
    });
  }

  private loadExistingData(): void {
    // Los datos se cargan automáticamente desde el servicio
    // que ya tiene la lógica de persistencia
  }

  getAresControl(itemId: string) {
    return this.stateService.getAresControl(itemId);
  }

  getSliderConfig(item: any): SliderFieldConfig {
    return {
      id: item.id,
      labelKey: item.labelKey,
      descriptionKey: item.tooltip,
      tooltipKey: item.tooltip,
      dimension: item.dimension,
      phase: item.phase,
      minValue: 1,
      maxValue: 5,
      step: 1,
      labels: this.nivelesCompetencia,
      formControl: this.getAresControl(item.id)
    };
  }

  onSliderValueChange(value: number, itemId: string): void {
    const control = this.getAresControl(itemId);
    control.setValue(value);
  }

  onSubmit(): void {
    if (this.aresForm.valid) {
      // 🔧 SOLUCIÓN: Guardar los datos de ARES en el estado global
      const aresData = this.aresForm.value;
      console.log('🎯 Guardando datos de ARES:', aresData);
      
      this.stateService.saveAresData(aresData);
      
      // Navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/competencias`;
    
    console.log(`🚀 Navegando al siguiente paso: ${nextStepUrl}`);
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('❌ Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'competencias']).catch(fallbackErr => {
        console.error('❌ Error en fallback de navegación:', fallbackErr);
      });
    });
  }
}
