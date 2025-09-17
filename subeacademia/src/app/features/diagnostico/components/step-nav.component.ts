import { Component, inject, ChangeDetectionStrategy, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { DiagnosticStateService } from '../services/diagnostic-state.service';
import { ScrollService } from '../../../core/services/scroll/scroll.service';
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
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <!-- Solo mostrar la barra de navegación si NO estamos en la página de inicio o en el diagnóstico de empresas -->
    @if (shouldShowNavigation()) {
      <!-- Barra de navegación integrada -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <!-- Navegación de pasos -->
          <nav class="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-3 md:mb-4">
            @for (step of steps; track step.path) {
              <button 
                 (click)="isStepEnabled(step) ? navigateToStep(step.path) : null"
                 [class.bg-blue-600]="activeStep()?.order === step.order"
                 [class.text-white]="activeStep()?.order === step.order"
                 [class.shadow-lg]="activeStep()?.order === step.order"
                 [class.transform]="activeStep()?.order === step.order"
                 [class.scale-105]="activeStep()?.order === step.order"
                 [class.bg-blue-100]="isStepEnabled(step) && activeStep()?.order !== step.order"
                 [class.text-blue-700]="isStepEnabled(step) && activeStep()?.order !== step.order"
                 [class.text-gray-400]="!isStepEnabled(step)"
                 [class.pointer-events-none]="!isStepEnabled(step)"
                 [class.opacity-50]="!isStepEnabled(step)"
                 [disabled]="!isStepEnabled(step)"
                 class="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md border-none bg-transparent cursor-pointer">
                {{ step.label }}
              </button>
            }
          </nav>

          <!-- Progreso de la página actual -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 md:p-4">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
              <div class="flex-1">
                <h2 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{{ getCurrentPageTitle() }}</h2>
                <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">{{ getCurrentPageDescription() }}</p>
              </div>
              <div class="flex items-center space-x-3 md:space-x-4 w-full md:w-auto">
                <div class="text-right">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ getCurrentProgress().answered }} / {{ getCurrentProgress().total }}
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    {{ Math.round((getCurrentProgress().answered / getCurrentProgress().total) * 100) }}% completado
                  </div>
                </div>
                <div class="w-24 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3 overflow-hidden">
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
    }
    `,
})
export class StepNavComponent {
  router = inject(Router);
  stateService = inject(DiagnosticStateService);
  scrollService = inject(ScrollService);

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
      this.router.navigate(['/diagnostico/contexto']).then(() => {
        // Hacer scroll al inicio después de navegar
        this.scrollService.scrollToMainContent();
      });
  }

  /**
   * Maneja la navegación entre pasos con scroll automático
   */
  navigateToStep(stepPath: string): void {
    this.router.navigate([stepPath]).then(() => {
      // Hacer scroll al inicio del contenido principal
      this.scrollService.scrollToMainContent();
    });
  }

  // Método para determinar si mostrar la navegación
  shouldShowNavigation(): boolean {
    const currentUrl = this.router.url;
    
    // No mostrar en la página de inicio del diagnóstico (ruta vacía o solo /diagnostico)
    if (currentUrl.endsWith('/diagnostico') || currentUrl.endsWith('/diagnostico/')) {
      return false;
    }
    
    // No mostrar en el nuevo diagnóstico de empresas
    if (currentUrl.includes('/diagnostico/empresas')) {
      return false;
    }
    
    // Mostrar en todas las demás rutas del diagnóstico de personas
    return true;
  }
}
