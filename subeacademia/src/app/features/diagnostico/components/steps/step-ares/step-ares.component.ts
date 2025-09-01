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
          🎯 Evaluación ARES-AI Framework
        </h2>
        <p class="text-lg text-gray-300 dark:text-gray-400">
          Evalúa la madurez de tu organización en la implementación responsable de IA
        </p>
      </div>

      <!-- Explicación del Framework ARES-AI -->
      <div class="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-blue-200 font-medium mb-4 text-center text-lg">🚀 ¿Qué es el Framework ARES-AI?</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-100">
          <div class="space-y-3">
            <div class="bg-blue-800/30 rounded-lg p-3">
              <div class="font-semibold text-blue-200">🎯 Ágil (Agile)</div>
              <div class="text-blue-300 text-xs">Adaptación rápida, desarrollo iterativo y ciclos de feedback continuo</div>
            </div>
            <div class="bg-blue-800/30 rounded-lg p-3">
              <div class="font-semibold text-blue-200">🛡️ Responsable (Responsible)</div>
              <div class="text-blue-300 text-xs">Cumplimiento normativo, gobernanza de datos y rendición de cuentas</div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-blue-800/30 rounded-lg p-3">
              <div class="font-semibold text-blue-200">⚖️ Ético (Ethical)</div>
              <div class="text-blue-300 text-xs">Equidad, justicia, mitigación de sesgos e impacto social positivo</div>
            </div>
            <div class="bg-blue-800/30 rounded-lg p-3">
              <div class="font-semibold text-blue-200">🌱 Sostenible (Sustainable)</div>
              <div class="text-blue-300 text-xs">Eficiencia energética, impacto ambiental y viabilidad a largo plazo</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información sobre la escala al comienzo -->
      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-green-200 font-medium mb-4 text-center">📊 Escala de Evaluación:</h4>
        <div class="grid grid-cols-5 gap-4 text-sm text-green-100">
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

      <!-- Fases del Modelo ARES-AI con explicación detallada -->
      <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-purple-200 font-medium mb-4 text-center text-lg">🔄 Las 5 Fases del Modelo ARES-AI:</h4>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-purple-100">
          <div class="text-center bg-purple-800/30 rounded-lg p-3">
            <div class="font-medium text-purple-200">F1</div>
            <div class="text-xs text-purple-300">Preparación y Evaluación</div>
            <div class="text-xs text-purple-400 mt-1">Fundamentos, datos y talento</div>
          </div>
          <div class="text-center bg-purple-800/30 rounded-lg p-3">
            <div class="font-medium text-purple-200">F2</div>
            <div class="text-xs text-purple-300">Diseño y Prototipado</div>
            <div class="text-xs text-purple-400 mt-1">Estrategia, ética y riesgos</div>
          </div>
          <div class="text-center bg-purple-800/30 rounded-lg p-3">
            <div class="font-medium text-purple-200">F3</div>
            <div class="text-xs text-purple-300">Desarrollo e Implementación</div>
            <div class="text-xs text-purple-400 mt-1">Tecnología y capacidades</div>
          </div>
          <div class="text-center bg-purple-800/30 rounded-lg p-3">
            <div class="font-medium text-purple-200">F4</div>
            <div class="text-xs text-purple-300">Operación y Monitoreo</div>
            <div class="text-xs text-purple-400 mt-1">Seguridad y cumplimiento</div>
          </div>
          <div class="text-center bg-purple-800/30 rounded-lg p-3">
            <div class="font-medium text-purple-200">F5</div>
            <div class="text-xs text-purple-300">Escalado y Sostenibilidad</div>
            <div class="text-xs text-purple-400 mt-1">Adopción transversal</div>
          </div>
        </div>
      </div>

      <!-- Dimensiones ARES con mapeo a pilares -->
      <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6 mb-8">
        <h4 class="text-orange-200 font-medium mb-4 text-center text-lg">🎯 Dimensiones Evaluadas por Pilar ARES:</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-100">
          <div class="space-y-3">
            <div class="bg-orange-800/30 rounded-lg p-3">
              <div class="font-semibold text-orange-200">🔄 Ágil (Agile)</div>
              <div class="text-orange-300 text-xs">Adopción, Estrategia, Capacidades, Integración</div>
            </div>
            <div class="bg-orange-800/30 rounded-lg p-3">
              <div class="font-semibold text-orange-200">🛡️ Responsable (Responsible)</div>
              <div class="text-orange-300 text-xs">Gobernanza, Cumplimiento, Seguridad, Privacidad</div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-orange-800/30 rounded-lg p-3">
              <div class="font-semibold text-orange-200">⚖️ Ético (Ethical)</div>
              <div class="text-orange-300 text-xs">Ética, Riesgos, Transparencia, Explicabilidad</div>
            </div>
            <div class="bg-orange-800/30 rounded-lg p-3">
              <div class="font-semibold text-orange-200">🌱 Sostenible (Sustainable)</div>
              <div class="text-orange-300 text-xs">Sostenibilidad, Operación, Monitoreo, Valor</div>
            </div>
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
