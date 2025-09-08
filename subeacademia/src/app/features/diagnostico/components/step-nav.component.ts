import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
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
    template: `
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <!-- Mensaje cuando el diagnóstico está completado -->
      @if (stateService.isCompleted()) {
        <div class="mb-4 p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg text-center">
            <p class="text-green-800 dark:text-green-200 font-semibold">¡Diagnóstico completado!</p>
            <p class="text-sm text-green-700 dark:text-green-300">Puedes navegar libremente para revisar tus respuestas.</p>
            <button (click)="startNew()" class="mt-2 text-sm text-blue-600 hover:underline">Iniciar un nuevo diagnóstico</button>
                    </div>
      }

      <!-- Barra de navegación de pasos -->
      <nav class="flex flex-wrap justify-center gap-x-4 gap-y-2">
        @for (step of steps; track step.path) {
          <a [routerLink]="isStepEnabled(step) ? step.path : null"
             routerLinkActive="text-blue-600 font-bold border-b-2 border-blue-600"
             [class.text-blue-600]="isStepEnabled(step) && activeStep()?.order === step.order"
             [class.text-gray-500]="!isStepEnabled(step)"
             [class.pointer-events-none]="!isStepEnabled(step)"
             class="px-3 py-2 text-sm font-medium rounded-md transition-colors">
            {{ step.label }}
          </a>
        }
      </nav>
        </div>
    `,
})
export class StepNavComponent {
  router = inject(Router);
  stateService = inject(DiagnosticStateService);

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
    if (this.stateService.isCompleted()) {
      return true; // Si está completo, todos los pasos están habilitados
    }
    const currentStepOrder = this.activeStep()?.order || 0;
    return step.order <= currentStepOrder;
  }
  
  startNew() {
      this.stateService.startNewDiagnostic();
      this.router.navigate(['/diagnostico/contexto']);
  }
}
