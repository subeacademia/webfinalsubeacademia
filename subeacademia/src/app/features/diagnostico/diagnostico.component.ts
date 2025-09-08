import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StepNavComponent } from './components/step-nav.component';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StepNavComponent],
  template: `
    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 class="text-xl font-bold leading-tight text-gray-900 dark:text-white">
            Diagnóstico de Madurez en IA
          </h1>
        </div>
      </header>
      
      <main>
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <app-step-nav></app-step-nav>
            <div class="p-2 md:p-4">
              <!-- El router-outlet ahora siempre está visible -->
              <router-outlet></router-outlet>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {}