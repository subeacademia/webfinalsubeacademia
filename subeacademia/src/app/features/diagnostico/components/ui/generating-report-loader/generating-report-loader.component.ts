import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generating-report-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto text-center shadow-xl">
        <!-- Spinner principal -->
        <div class="relative mb-6">
          <div class="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <!-- Icono de IA superpuesto -->
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
        </div>

        <!-- Título -->
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Generando tu Diagnóstico Estratégico
        </h3>
        
        <!-- Descripción -->
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Nuestra IA está analizando tus respuestas y creando un reporte personalizado...
        </p>

        <!-- Progreso visual -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Analizando competencias</span>
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Generando insights estratégicos</span>
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Creando plan de acción</span>
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="mt-6">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style="width: 75%"></div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Esto puede tomar unos segundos...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    .animate-bounce {
      animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
        transform: translate3d(0,0,0);
      }
      40%, 43% {
        animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
        transform: translate3d(0, -8px, 0);
      }
      70% {
        animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
        transform: translate3d(0, -4px, 0);
      }
      90% {
        transform: translate3d(0,-2px,0);
      }
    }
  `]
})
export class GeneratingReportLoaderComponent {
  constructor() {}
}
