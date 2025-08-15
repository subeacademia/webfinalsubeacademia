import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-contexto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">Contexto de tu Organización</h2>
        <p class="text-lg text-gray-300">Ayúdanos a entender mejor tu empresa para personalizar el diagnóstico</p>
      </div>

      <div class="space-y-6">
        <!-- Industria -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <label class="block text-lg font-medium text-white mb-3">
            ¿En qué industria opera tu organización?
          </label>
          <select 
            [formControl]="industriaControl"
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Selecciona una industria</option>
            <option *ngFor="let industry of industries" [value]="industry.category">
              {{ industry.category }}
            </option>
          </select>
        </div>

        <!-- Tamaño de la empresa -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <label class="block text-lg font-medium text-white mb-3">
            ¿Cuál es el tamaño de tu organización?
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label class="flex items-center p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="tamanoControl.value === 'pequena'"
                   [class.border-gray-600]="tamanoControl.value !== 'pequena'">
              <input type="radio" [formControl]="tamanoControl" value="pequena" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3"
                   [class.bg-blue-500]="tamanoControl.value === 'pequena'"
                   [class.border-blue-500]="tamanoControl.value === 'pequena'"
                   [class.border-gray-400]="tamanoControl.value !== 'pequena'"></div>
              <span class="text-white">Pequeña (1-50 empleados)</span>
            </label>
            
            <label class="flex items-center p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="tamanoControl.value === 'mediana'"
                   [class.border-gray-600]="tamanoControl.value !== 'mediana'">
              <input type="radio" [formControl]="tamanoControl" value="mediana" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3"
                   [class.bg-blue-500]="tamanoControl.value === 'mediana'"
                   [class.border-blue-500]="tamanoControl.value === 'mediana'"
                   [class.border-gray-400]="tamanoControl.value !== 'mediana'"></div>
              <span class="text-white">Mediana (51-500 empleados)</span>
            </label>
            
            <label class="flex items-center p-4 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="tamanoControl.value === 'grande'"
                   [class.border-gray-600]="tamanoControl.value !== 'grande'">
              <input type="radio" [formControl]="tamanoControl" value="grande" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-3"
                   [class.bg-blue-500]="tamanoControl.value === 'grande'"
                   [class.border-blue-500]="tamanoControl.value === 'grande'"
                   [class.border-gray-400]="tamanoControl.value !== 'grande'"></div>
              <span class="text-white">Grande (500+ empleados)</span>
            </label>
          </div>
        </div>

        <!-- Presupuesto de TI -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <label class="block text-lg font-medium text-white mb-3">
            ¿Cuál es tu presupuesto anual para tecnologías de la información?
          </label>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <label class="flex items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="presupuestoControl.value === 'bajo'"
                   [class.border-gray-600]="presupuestoControl.value !== 'bajo'">
              <input type="radio" [formControl]="presupuestoControl" value="bajo" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-2"
                   [class.bg-blue-500]="presupuestoControl.value === 'bajo'"
                   [class.border-blue-500]="presupuestoControl.value === 'bajo'"
                   [class.border-gray-400]="presupuestoControl.value !== 'bajo'"></div>
              <span class="text-white text-sm">Bajo</span>
            </label>
            
            <label class="flex items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="presupuestoControl.value === 'medio'"
                   [class.border-gray-600]="presupuestoControl.value !== 'medio'">
              <input type="radio" [formControl]="presupuestoControl" value="medio" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-2"
                   [class.bg-blue-500]="presupuestoControl.value === 'medio'"
                   [class.border-blue-500]="presupuestoControl.value === 'medio'"
                   [class.border-gray-400]="presupuestoControl.value !== 'medio'"></div>
              <span class="text-white text-sm">Medio</span>
            </label>
            
            <label class="flex items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="presupuestoControl.value === 'alto'"
                   [class.border-gray-600]="presupuestoControl.value !== 'alto'">
              <input type="radio" [formControl]="presupuestoControl" value="alto" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-2"
                   [class.bg-blue-500]="presupuestoControl.value === 'alto'"
                   [class.border-blue-500]="presupuestoControl.value === 'alto'"
                   [class.border-gray-400]="presupuestoControl.value !== 'alto'"></div>
              <span class="text-white text-sm">Alto</span>
            </label>
            
            <label class="flex items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                   [class.border-blue-500]="presupuestoControl.value === 'premium'"
                   [class.border-gray-600]="presupuestoControl.value !== 'premium'">
              <input type="radio" [formControl]="presupuestoControl" value="premium" class="sr-only">
              <div class="w-4 h-4 rounded-full border-2 mr-2"
                   [class.bg-blue-500]="presupuestoControl.value === 'premium'"
                   [class.border-blue-500]="presupuestoControl.value === 'premium'"
                   [class.border-gray-400]="presupuestoControl.value !== 'premium'"></div>
              <span class="text-white text-sm">Premium</span>
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
          [disabled]="!isFormValid()"
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
export class StepContextoComponent {
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly router = inject(Router);

  // Controles del formulario
  industriaControl = new FormControl('');
  tamanoControl = new FormControl('');
  presupuestoControl = new FormControl('');

  // Datos disponibles
  industries = this.diagnosticState.industries;

  // Validación del formulario
  isFormValid = computed(() => {
    return this.industriaControl.value && 
           this.tamanoControl.value && 
           this.presupuestoControl.value;
  });

  constructor() {
    this.loadSavedData();
  }

  private loadSavedData(): void {
    const savedData = this.diagnosticState.getContextoData();
    if (savedData) {
      this.industriaControl.setValue(savedData.industria || '');
      this.tamanoControl.setValue(savedData.tamano || '');
      this.presupuestoControl.setValue(savedData.presupuesto || '');
    }
  }

  anterior(): void {
    this.router.navigate(['/diagnostico/inicio']);
  }

  siguiente(): void {
    console.log('Botón siguiente clickeado');
    console.log('Estado del formulario:', {
      industria: this.industriaControl.value,
      tamano: this.tamanoControl.value,
      presupuesto: this.presupuestoControl.value
    });
    console.log('¿Formulario válido?', this.isFormValid());
    
    if (this.isFormValid()) {
      console.log('Formulario válido, guardando datos...');
      // Guardar datos
      this.diagnosticState.saveContextoData({
        industria: this.industriaControl.value,
        tamano: this.tamanoControl.value,
        presupuesto: this.presupuestoControl.value
      });
      
      console.log('Datos guardados, navegando a ARES F1...');
      // Navegar al siguiente paso
      this.router.navigate(['/diagnostico/ares/F1']).then(() => {
        console.log('Navegación exitosa a ARES F1');
      }).catch(error => {
        console.error('Error en navegación:', error);
      });
    } else {
      console.log('Formulario no válido, no se puede avanzar');
    }
  }
}
