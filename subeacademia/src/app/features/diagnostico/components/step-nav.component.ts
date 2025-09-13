import { Component, inject, ChangeDetectionStrategy, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { DiagnosticStateService } from '../services/diagnostic-state.service';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface Step {
  path: string;
  label: string;
  order: number;
}

@Component({
	selector: 'app-step-nav',
	standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <!-- Barra de navegación integrada -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <!-- Navegación de pasos -->
        <nav class="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-4">
          @for (step of steps; track step.path) {
            <a [routerLink]="isStepEnabled(step) ? step.path : null"
               routerLinkActive="bg-blue-600 text-white shadow-lg transform scale-105"
               [class.bg-blue-100]="isStepEnabled(step) && activeStep()?.order === step.order"
               [class.text-blue-700]="isStepEnabled(step) && activeStep()?.order === step.order"
               [class.text-gray-400]="!isStepEnabled(step)"
               [class.pointer-events-none]="!isStepEnabled(step)"
               [class.opacity-50]="!isStepEnabled(step)"
               class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md">
              {{ step.label }}
            </a>
          }
        </nav>

        <!-- Progreso de la página actual -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ getCurrentPageTitle() }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ getCurrentPageDescription() }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ getCurrentProgress().answered }} / {{ getCurrentProgress().total }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  {{ Math.round((getCurrentProgress().answered / getCurrentProgress().total) * 100) }}% completado
                </div>
              </div>
              <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                     [style.width.%]="(getCurrentProgress().answered / getCurrentProgress().total) * 100">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando el diagnóstico está completado (oculto por ahora) -->
    @if (false) {
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="mb-4 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg text-center">
            <p class="text-green-800 dark:text-green-200 font-semibold">¡Diagnóstico completado!</p>
            <p class="text-sm text-green-700 dark:text-green-300">Puedes navegar libremente para revisar tus respuestas.</p>
            <button (click)="startNew()" class="mt-2 text-sm text-blue-600 hover:underline">Iniciar un nuevo diagnóstico</button>
        </div>
      </div>
    }
    `,
})
export class StepNavComponent {
  router = inject(Router);
  stateService = inject(DiagnosticStateService);

  // Exponer Math para el template
  Math = Math;

  steps: Step[] = [
    { path: 'contexto', label: '1. Perfil', order: 1 },
    { path: 'ares', label: '2. ARES-AI', order: 2 },
    { path: 'competencias', label: '3. Competencias', order: 3 },
    { path: 'objetivo', label: '4. Objetivos', order: 4 },
    { path: 'finalizar', label: '5. Finalizar', order: 5 },
    { path: 'resultados', label: 'Resultados', order: 6 },
  ];

  // Señal que nos dice cuál es el paso activo actualmente
  private currentUrl = toSignal(
      this.router.events.pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
  );

  activeStep = computed(() => {
    const url = this.currentUrl()?.urlAfterRedirects;
    if (!url) return this.steps[0];
    return this.steps.find(s => url.includes(s.path));
  });

  // Lógica para determinar si un paso está habilitado
  isStepEnabled(step: Step): boolean {
    const currentStepOrder = this.activeStep()?.order || 0;
    // Permitir navegación al paso actual y al siguiente paso
    return step.order <= currentStepOrder + 1;
  }

  // Método para obtener el progreso actual basado en la ruta
  getCurrentProgress() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/ares')) {
      return this.stateService.aresProgress();
    } else if (currentUrl.includes('/competencias')) {
      return this.stateService.competenciasProgress();
    } else if (currentUrl.includes('/contexto')) {
      // Para contexto, siempre mostrar 0/1 ya que es solo un paso
      return { answered: 0, total: 1, isComplete: false };
    } else if (currentUrl.includes('/objetivo')) {
      // Para objetivo, verificar si tiene objetivos seleccionados
      const objetivo = this.stateService.state().objetivo;
      const hasObjectives = objetivo && objetivo.objetivo && objetivo.objetivo.length > 0;
      return { answered: hasObjectives ? 1 : 0, total: 1, isComplete: hasObjectives };
    } else {
      // Para otros pasos, mostrar progreso general
      const totalSteps = 4; // contexto, ares, competencias, objetivo
      const completedSteps = 
        (this.stateService.state().contexto ? 1 : 0) +
        (this.stateService.aresProgress().isComplete ? 1 : 0) +
        (this.stateService.competenciasProgress().isComplete ? 1 : 0) +
        (this.stateService.state().objetivo?.objetivo?.length > 0 ? 1 : 0);
      
      return { answered: completedSteps, total: totalSteps, isComplete: completedSteps === totalSteps };
    }
  }

  // Método para obtener el título de la página actual
  getCurrentPageTitle() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/contexto')) {
      return 'Perfil de la Organización';
    } else if (currentUrl.includes('/ares')) {
      return 'Autoevaluación ARES';
    } else if (currentUrl.includes('/competencias')) {
      return 'Autoevaluación de Competencias';
    } else if (currentUrl.includes('/objetivo')) {
      return 'Objetivos Estratégicos';
    } else if (currentUrl.includes('/finalizar')) {
      return 'Finalizar Diagnóstico';
    } else if (currentUrl.includes('/resultados')) {
      return 'Resultados del Diagnóstico';
    } else {
      return 'Diagnóstico de Madurez en IA';
    }
  }

  // Método para obtener la descripción de la página actual
  getCurrentPageDescription() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/contexto')) {
      return 'Proporciona información básica sobre tu organización';
    } else if (currentUrl.includes('/ares')) {
      return 'Evalúa tus habilidades en Aprendizaje, Resiliencia, Ética y Sociabilidad';
    } else if (currentUrl.includes('/competencias')) {
      return 'Evalúa tu nivel en las competencias clave para la transformación digital';
    } else if (currentUrl.includes('/objetivo')) {
      return 'Define los objetivos estratégicos para tu organización';
    } else if (currentUrl.includes('/finalizar')) {
      return 'Revisa y completa tu diagnóstico';
    } else if (currentUrl.includes('/resultados')) {
      return 'Explora los resultados y recomendaciones de tu diagnóstico';
    } else {
      return 'Sistema de autoevaluación integral';
    }
  }
  
  startNew() {
      this.stateService.reset();
      this.router.navigate(['/diagnostico/contexto']);
  }
}
