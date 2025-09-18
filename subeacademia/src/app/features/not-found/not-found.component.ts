import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div class="text-center px-6 py-12 max-w-2xl mx-auto">
        <!-- 404 Number -->
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            404
          </h1>
        </div>

        <!-- Error Icon -->
        <div class="mb-6">
          <div class="text-6xl animate-bounce">🔍</div>
        </div>

        <!-- Main Title -->
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Página No Encontrada
        </h2>

        <!-- Description -->
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe o fue movida. 
          <br class="hidden sm:block">
          Puede que hayas escrito mal la URL o que el enlace esté desactualizado.
        </p>

        <!-- Suggestions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ¿Qué puedes hacer?
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div class="flex items-start">
              <span class="text-blue-500 mr-2">✓</span>
              <span>Verifica la URL en la barra de direcciones</span>
            </div>
            <div class="flex items-start">
              <span class="text-blue-500 mr-2">✓</span>
              <span>Usa el botón "Volver" de tu navegador</span>
            </div>
            <div class="flex items-start">
              <span class="text-blue-500 mr-2">✓</span>
              <span>Visita nuestra página de inicio</span>
            </div>
            <div class="flex items-start">
              <span class="text-blue-500 mr-2">✓</span>
              <span>Explora nuestros cursos y servicios</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            routerLink="/"
            class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
            <span class="mr-2">🏠</span>
            Volver al Inicio
          </a>
          
          <a
            routerLink="/productos"
            class="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
            <span class="mr-2">📚</span>
            Ver Cursos
          </a>
        </div>

        <!-- Additional Help -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            ¿Necesitas ayuda adicional?
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <a
              routerLink="/contacto"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
              📧 Contáctanos
            </a>
            <span class="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
            <a
              routerLink="/diagnostico"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
              🎯 Iniciar Diagnóstico
            </a>
            <span class="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
            <a
              routerLink="/metodologia"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
              🔬 Nuestra Metodología
            </a>
          </div>
        </div>

        <!-- Fun Element -->
        <div class="mt-8 text-gray-400 dark:text-gray-500 text-sm">
          <p>Error 404: Página no encontrada en el espacio-tiempo digital 🚀</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    /* Gradient text animation */
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .bg-clip-text {
      background-size: 200% 200%;
      animation: gradient 3s ease infinite;
    }
  `]
})
export class NotFoundComponent {
  constructor() {}
}
