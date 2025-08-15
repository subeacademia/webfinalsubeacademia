import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { AresItem } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-ares',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Evaluación ARES-AI: Fase {{ currentPhase }}
        </h2>
        <p class="text-lg text-gray-300">{{ getPhaseDescription() }}</p>
      </div>

      <div class="space-y-6">
        <div *ngFor="let item of currentPhaseItems" class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div class="mb-4">
            <h3 class="text-xl font-semibold text-white mb-2">{{ item.labelKey }}</h3>
            <p class="text-gray-300">{{ item.tooltip || 'Evaluación de madurez en ' + item.dimension }}</p>
          </div>
          
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-200 mb-2">
              Nivel de madurez actual:
            </label>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
              <label *ngFor="let nivel of niveles" 
                     class="flex flex-col items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                     [class.border-blue-500]="getAresControl(item.id).value === nivel.value"
                     [class.border-gray-600]="getAresControl(item.id).value !== nivel.value">
                <input type="radio" [formControl]="getAresControl(item.id)" [value]="nivel.value" class="sr-only">
                <div class="w-4 h-4 rounded-full border-2 mb-2"
                     [class.bg-blue-500]="getAresControl(item.id).value === nivel.value"
                     [class.border-blue-500]="getAresControl(item.id).value === nivel.value"
                     [class.border-gray-400]="getAresControl(item.id).value !== nivel.value"></div>
                <span class="text-white text-sm text-center">{{ nivel.label }}</span>
              </label>
            </div>
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
          [disabled]="!isPhaseComplete()"
          class="btn-primary">
          {{ isLastPhase() ? 'Siguiente Sección' : 'Siguiente Fase' }}
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
export class StepAresComponent implements OnInit {
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  currentPhase = '';
  currentPhaseItems: AresItem[] = [];

  // Niveles de madurez
  niveles = [
    { value: 1, label: 'Incipiente' },
    { value: 2, label: 'Básico' },
    { value: 3, label: 'Intermedio' },
    { value: 4, label: 'Avanzado' },
    { value: 5, label: 'Líder' }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentPhase = params['phase'];
      this.loadPhaseItems();
    });
  }

  private loadPhaseItems(): void {
    this.currentPhaseItems = this.diagnosticState.aresItems.filter(item => 
      item.phase === this.currentPhase
    );
  }

  getPhaseDescription(): string {
    const descriptions: Record<string, string> = {
      'F1': 'Fundamentos: Evaluación de la infraestructura básica y capacidades iniciales',
      'F2': 'Desarrollo: Análisis de la implementación y madurez de procesos',
      'F3': 'Optimización: Evaluación de la excelencia operativa y mejora continua',
      'F4': 'Innovación: Análisis de capacidades avanzadas y liderazgo en el mercado'
    };
    return descriptions[this.currentPhase] || '';
  }

  getAresControl(itemId: string): FormControl {
    return this.diagnosticState.getAresControl(itemId);
  }

  isPhaseComplete(): boolean {
    return this.currentPhaseItems.every(item => {
      const control = this.getAresControl(item.id);
      return control.value !== null && control.value !== undefined && control.value !== '';
    });
  }

  isLastPhase(): boolean {
    return this.currentPhase === 'F4';
  }

  anterior(): void {
    if (this.currentPhase === 'F1') {
      this.router.navigate(['/diagnostico/contexto']);
    } else {
      const prevPhase = this.getPreviousPhase();
      this.router.navigate(['/diagnostico/ares', prevPhase]);
    }
  }

  siguiente(): void {
    if (this.isLastPhase()) {
      this.router.navigate(['/diagnostico/competencias/1']);
    } else {
      const nextPhase = this.getNextPhase();
      this.router.navigate(['/diagnostico/ares', nextPhase]);
    }
  }

  private getPreviousPhase(): string {
    const phases = ['F1', 'F2', 'F3', 'F4'];
    const currentIndex = phases.indexOf(this.currentPhase);
    return phases[Math.max(0, currentIndex - 1)];
  }

  private getNextPhase(): string {
    const phases = ['F1', 'F2', 'F3', 'F4'];
    const currentIndex = phases.indexOf(this.currentPhase);
    return phases[Math.min(phases.length - 1, currentIndex + 1)];
  }
}
