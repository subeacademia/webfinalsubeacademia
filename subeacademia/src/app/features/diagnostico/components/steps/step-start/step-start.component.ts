import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-step-start',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center animate-fade-in">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">
          Diagnóstico de Madurez ARES-AI
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Evalúa la madurez de tu organización en Inteligencia Artificial y 
          obtén un plan personalizado para acelerar tu transformación digital
        </p>
      </div>
      
      <div class="mb-8">
        <div class="inline-flex items-center space-x-2 bg-blue-900/30 border border-blue-500/50 rounded-full px-6 py-3 text-blue-200">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-medium">Tiempo estimado: 15-20 minutos</span>
        </div>
      </div>

      <button 
        (click)="comenzarDiagnostico()"
        class="btn-primary text-lg px-8 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-2xl">
        <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        Comenzar Diagnóstico
      </button>

      <div class="mt-8 text-gray-400 text-sm">
        <p>Tu información está segura y solo se utiliza para generar tu diagnóstico personalizado</p>
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
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg;
    }
  `]
})
export class StepStartComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  comenzarDiagnostico(): void {
    console.log('Navegando al siguiente paso del diagnóstico');
    
    // Navegar directamente a la ruta contexto usando navegación relativa
    this.router.navigate(['contexto'], { relativeTo: this.route.parent }).then(() => {
      console.log('✅ Navegación completada exitosamente a contexto');
    }).catch(error => {
      console.error('❌ Error en navegación relativa:', error);
      // Fallback: navegar usando la ruta absoluta
      this.router.navigate(['/es', 'diagnostico', 'contexto']).catch(fallbackErr => {
        console.error('❌ Error en fallback de navegación:', fallbackErr);
      });
    });
  }
}
