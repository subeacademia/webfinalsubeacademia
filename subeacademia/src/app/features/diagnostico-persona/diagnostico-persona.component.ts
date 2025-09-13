import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-diagnostico-persona',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <!-- Header del diagnóstico de persona -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Diagnóstico de Madurez en IA - Persona
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              Evalúa tu nivel de competencias en Inteligencia Artificial y obtén un plan personalizado
            </p>
          </div>
        </div>
      </div>
      
      <main>
        <div class="max-w-4xl mx-auto py-8 px-4">
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div class="p-6">
              <router-outlet></router-outlet>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoPersonaComponent {
}
