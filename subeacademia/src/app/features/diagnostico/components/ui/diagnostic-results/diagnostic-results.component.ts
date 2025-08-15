import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center animate-fade-in">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">
          ¡Diagnóstico Completado!
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Has completado exitosamente el diagnóstico de madurez ARES-AI. 
          Pronto recibirás tu reporte personalizado por correo electrónico.
        </p>
      </div>
      
      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 max-w-2xl mx-auto">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-16 h-16 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-green-200 mb-2">Próximos Pasos</h3>
        <ul class="text-green-100 text-left space-y-2">
          <li class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Recibirás tu reporte detallado por email en las próximas 24 horas
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Nuestro equipo se pondrá en contacto para agendar una sesión de consultoría
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Acceso a recursos exclusivos y mejores prácticas de implementación
          </li>
        </ul>
      </div>

      <div class="mt-8 space-y-4">
        <button class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Descargar Resumen
        </button>
        
        <button class="btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Agendar Sesión de Consultoría
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
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
  `]
})
export class DiagnosticResultsComponent {
  constructor() {}
}
