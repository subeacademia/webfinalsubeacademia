import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ARES_ITEMS } from '../../../data/ares-items';

@Component({
  selector: 'app-step-ares',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Evaluación ARES-AI
        </h2>
        <p class="text-lg text-gray-300">
          Evalúa la madurez de tu organización en las dimensiones clave del modelo ARES-AI
        </p>
      </div>

      <form [formGroup]="aresForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Información sobre la escala al comienzo -->
        <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 class="text-blue-200 font-medium mb-2">Escala de Evaluación:</h4>
          <div class="grid grid-cols-5 gap-2 text-sm text-blue-100">
            <div class="text-center">
              <div class="font-medium">Incipiente</div>
              <div class="text-xs">Sin implementación</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Básico</div>
              <div class="text-xs">Implementación inicial</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Intermedio</div>
              <div class="text-xs">Implementación parcial</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Avanzado</div>
              <div class="text-xs">Implementación sólida</div>
            </div>
            <div class="text-center">
              <div class="font-medium">Líder</div>
              <div class="text-xs">Excelencia operativa</div>
            </div>
          </div>
        </div>

        <!-- Información sobre fases -->
        <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h4 class="text-purple-200 font-medium mb-2">Fases del Modelo ARES-AI:</h4>
          <div class="grid grid-cols-5 gap-2 text-sm text-purple-100">
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

        <!-- Lista de elementos ARES -->
        <div class="space-y-6">
          <div *ngFor="let item of aresItems" 
               class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-white">
                  {{ item.labelKey }}
                </h3>
                <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {{ item.phase }}
                </span>
              </div>
              <p class="text-gray-300 text-sm mb-3">
                {{ item.tooltip }}
              </p>
              <div class="text-xs text-gray-400">
                Dimensión: <span class="text-blue-300">{{ item.dimension }}</span>
              </div>
            </div>

            <!-- Escala de evaluación -->
            <div class="grid grid-cols-5 gap-3">
              <label *ngFor="let nivel of nivelesCompetencia; let j = index" 
                     class="flex flex-col items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                     [class.border-blue-500]="getAresControl(item.id).value === j"
                     [class.border-gray-600]="getAresControl(item.id).value !== j">
                <input type="radio" 
                       [formControl]="getAresControl(item.id)" 
                       [value]="j" 
                       class="sr-only">
                <div class="w-4 h-4 rounded-full border-2 mb-2"
                     [class.bg-blue-500]="getAresControl(item.id).value === j"
                     [class.border-blue-500]="getAresControl(item.id).value === j"
                     [class.border-gray-400]="getAresControl(item.id).value !== j">
                </div>
                <span class="text-white text-xs text-center">{{ nivel }}</span>
              </label>
            </div>

            <!-- Validación -->
            <div *ngIf="getAresControl(item.id).invalid && getAresControl(item.id).touched" 
                 class="mt-2 text-red-400 text-sm">
              Por favor evalúa tu nivel en esta dimensión
            </div>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="pt-4">
          <button 
            type="submit" 
            [disabled]="aresForm.invalid"
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
export class StepAresComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
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

  onSubmit(): void {
    if (this.aresForm.valid) {
      // Los datos ya están guardados en el servicio
      // Solo necesitamos navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/competencias`;
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'competencias']);
    });
  }
}
