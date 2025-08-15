import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';

@Component({
  selector: 'app-step-competencias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Autoevaluación de Competencias (Parte {{ currentGroup }}/3)
        </h2>
        <p class="text-lg text-gray-300">
          Evalúa el nivel de madurez de las competencias clave en tu organización
        </p>
      </div>

      <div class="space-y-6">
        <div *ngFor="let competencia of currentGroupCompetencias" class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div class="mb-4">
            <h3 class="text-xl font-semibold text-white mb-2">{{ competencia.nameKey }}</h3>
            <p class="text-gray-300 text-sm">
              {{ getCompetenciaDescription(competencia.id) }}
            </p>
          </div>
          
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-200 mb-2">
              Nivel de madurez actual:
            </label>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
              <label *ngFor="let nivel of niveles" 
                     class="flex flex-col items-center p-3 bg-gray-700 rounded-lg border-2 cursor-pointer hover:bg-gray-600 transition-colors"
                     [class.border-blue-500]="getCompetenciaControl(competencia.id).value === nivel.value"
                     [class.border-gray-600]="getCompetenciaControl(competencia.id).value !== nivel.value">
                <input type="radio" [formControl]="getCompetenciaControl(competencia.id)" [value]="nivel.value" class="sr-only">
                <div class="w-4 h-4 rounded-full border-2 mb-2"
                     [class.bg-blue-500]="getCompetenciaControl(competencia.id).value === nivel.value"
                     [class.border-blue-500]="getCompetenciaControl(competencia.id).value === nivel.value"
                     [class.border-gray-400]="getCompetenciaControl(competencia.id).value !== nivel.value"></div>
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
          [disabled]="!isGroupComplete()"
          class="btn-primary">
          {{ isLastGroup() ? 'Siguiente Sección' : 'Siguiente Grupo' }}
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
export class StepCompetenciasComponent implements OnInit {
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  currentGroup = 1;
  currentGroupCompetencias: { id: string; nameKey: string }[] = [];

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
      this.currentGroup = parseInt(params['group']);
      this.loadGroupCompetencias();
    });
  }

  private loadGroupCompetencias(): void {
    const allCompetencias = this.diagnosticState.competencias;
    const itemsPerGroup = Math.ceil(allCompetencias.length / 3);
    const startIndex = (this.currentGroup - 1) * itemsPerGroup;
    const endIndex = startIndex + itemsPerGroup;
    
    this.currentGroupCompetencias = allCompetencias.slice(startIndex, endIndex);
  }

  getCompetenciaDescription(competenciaId: string): string {
    const descriptions: Record<string, string> = {
      'comp_estrategia': 'Capacidad de la organización para definir y ejecutar estrategias de IA',
      'comp_gobernanza': 'Marco de políticas, procedimientos y controles para la gestión de IA',
      'comp_talento': 'Disponibilidad y capacidades del personal en tecnologías de IA',
      'comp_tecnologia': 'Infraestructura tecnológica y plataformas de IA disponibles',
      'comp_datos': 'Calidad, gobernanza y disponibilidad de datos para entrenar modelos',
      'comp_etica': 'Compromiso con el uso responsable y ético de la IA',
      'comp_innovacion': 'Capacidad para desarrollar e implementar soluciones innovadoras',
      'comp_colaboracion': 'Habilidades para trabajar en equipos multidisciplinarios de IA',
      'comp_aprendizaje': 'Cultura de aprendizaje continuo y mejora en el uso de IA'
    };
    return descriptions[competenciaId] || 'Evaluación de competencia clave';
  }

  getCompetenciaControl(competenciaId: string): FormControl {
    return this.diagnosticState.getCompetenciaControl(competenciaId);
  }

  isGroupComplete(): boolean {
    return this.currentGroupCompetencias.every(comp => {
      const control = this.getCompetenciaControl(comp.id);
      return control.value !== null && control.value !== undefined && control.value !== '';
    });
  }

  isLastGroup(): boolean {
    return this.currentGroup === 3;
  }

  anterior(): void {
    if (this.currentGroup === 1) {
      this.router.navigate(['/diagnostico/ares/F4']);
    } else {
      this.router.navigate(['/diagnostico/competencias', this.currentGroup - 1]);
    }
  }

  siguiente(): void {
    if (this.isLastGroup()) {
      this.router.navigate(['/diagnostico/objetivo']);
    } else {
      this.router.navigate(['/diagnostico/competencias', this.currentGroup + 1]);
    }
  }
}
