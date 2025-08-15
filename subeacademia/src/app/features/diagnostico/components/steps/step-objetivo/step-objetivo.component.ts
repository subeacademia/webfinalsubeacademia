import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">Objetivo del Diagnóstico</h2>
        <p class="text-lg text-gray-300">
          Cuéntanos cuál es tu principal objetivo al implementar IA en tu organización
        </p>
      </div>

      <div class="max-w-2xl mx-auto">
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <label class="block text-lg font-medium text-white mb-4">
            ¿Cuál es tu principal objetivo con la implementación de IA?
          </label>
          
          <div class="space-y-4">
            <label class="flex items-start p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="objetivoControl.value === 'eficiencia'"
                   [class.border-gray-600]="objetivoControl.value !== 'eficiencia'">
              <input type="radio" [formControl]="objetivoControl" value="eficiencia" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3 mt-1 flex-shrink-0"
                   [class.bg-blue-500]="objetivoControl.value === 'eficiencia'"
                   [class.border-blue-500]="objetivoControl.value === 'eficiencia'"
                   [class.border-gray-400]="objetivoControl.value !== 'eficiencia'"></div>
              <div>
                <span class="text-white font-medium">Mejorar la Eficiencia Operativa</span>
                <p class="text-gray-300 text-sm mt-1">Automatizar procesos, reducir costos y optimizar operaciones</p>
              </div>
            </label>
            
            <label class="flex items-start p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="objetivoControl.value === 'innovacion'"
                   [class.border-gray-600]="objetivoControl.value !== 'innovacion'">
              <input type="radio" [formControl]="objetivoControl" value="innovacion" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3 mt-1 flex-shrink-0"
                   [class.bg-blue-500]="objetivoControl.value === 'innovacion'"
                   [class.border-blue-500]="objetivoControl.value === 'innovacion'"
                   [class.border-gray-400]="objetivoControl.value !== 'innovacion'"></div>
              <div>
                <span class="text-white font-medium">Impulsar la Innovación</span>
                <p class="text-gray-300 text-sm mt-1">Desarrollar nuevos productos, servicios o modelos de negocio</p>
              </div>
            </label>
            
            <label class="flex items-start p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="objetivoControl.value === 'experiencia'"
                   [class.border-gray-600]="objetivoControl.value !== 'experiencia'">
              <input type="radio" [formControl]="objetivoControl" value="experiencia" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3 mt-1 flex-shrink-0"
                   [class.bg-blue-500]="objetivoControl.value === 'experiencia'"
                   [class.border-blue-500]="objetivoControl.value === 'experiencia'"
                   [class.border-gray-400]="objetivoControl.value !== 'experiencia'"></div>
              <div>
                <span class="text-white font-medium">Mejorar la Experiencia del Cliente</span>
                <p class="text-gray-300 text-sm mt-1">Personalizar servicios y mejorar la satisfacción del cliente</p>
              </div>
            </label>
            
            <label class="flex items-start p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="objetivoControl.value === 'decisiones'"
                   [class.border-gray-600]="objetivoControl.value !== 'decisiones'">
              <input type="radio" [formControl]="objetivoControl" value="decisiones" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3 mt-1 flex-shrink-0"
                   [class.bg-blue-500]="objetivoControl.value === 'decisiones'"
                   [class.border-blue-500]="objetivoControl.value === 'decisiones'"
                   [class.border-gray-400]="objetivoControl.value !== 'decisiones'"></div>
              <div>
                <span class="text-white font-medium">Mejorar la Toma de Decisiones</span>
                <p class="text-gray-300 text-sm mt-1">Utilizar datos y análisis para decisiones más informadas</p>
              </div>
            </label>
            
            <label class="flex items-start p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="objetivoControl.value === 'competitividad'"
                   [class.border-gray-600]="objetivoControl.value !== 'competitividad'">
              <input type="radio" [formControl]="objetivoControl" value="competitividad" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3 mt-1 flex-shrink-0"
                   [class.bg-blue-500]="objetivoControl.value === 'competitividad'"
                   [class.border-blue-500]="objetivoControl.value === 'competitividad'"
                   [class.border-gray-400]="objetivoControl.value !== 'competitividad'"></div>
              <div>
                <span class="text-white font-medium">Mantener la Competitividad</span>
                <p class="text-gray-300 text-sm mt-1">No quedarse atrás en la transformación digital del mercado</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="flex justify-between mt-8">
        <button 
          (click)="anterior()"
          class="btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Anterior
        </button>
        
        <button 
          (click)="siguiente()"
          [disabled]="!objetivoControl.value"
          class="btn-primary">
          Siguiente
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
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
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
  `]
})
export class StepObjetivoComponent {
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  objetivoControl = new FormControl('');

  constructor() {
    this.loadSavedData();
  }

  private loadSavedData(): void {
    const savedObjetivo = this.diagnosticState.form.get('objetivo')?.value;
    if (savedObjetivo) {
      this.objetivoControl.setValue(savedObjetivo);
    }
  }

  anterior(): void {
    this.router.navigate(['/es', 'diagnostico', 'competencias', '3']);
  }

  siguiente(): void {
    if (this.objetivoControl.value) {
      // Guardar en el formulario principal
      this.diagnosticState.form.patchValue({
        objetivo: this.objetivoControl.value
      });
      
      // Navegar al siguiente paso
      this.router.navigate(['/es', 'diagnostico', 'lead']);
    }
  }
}
