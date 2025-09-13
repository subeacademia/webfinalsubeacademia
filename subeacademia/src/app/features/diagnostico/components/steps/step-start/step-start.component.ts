import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UiButtonComponent } from '../../../../../shared/ui-kit/button/button';

@Component({
  selector: 'app-step-start',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <div class="text-center animate-fade-in">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">
          Diagnóstico de Madurez ARES-AI
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Evalúa la madurez en Inteligencia Artificial y obtén un plan personalizado 
          para acelerar tu transformación digital
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

      <!-- Selección de tipo de diagnóstico -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-white mb-6">
          ¿Cómo quieres realizar tu diagnóstico?
        </h2>
        
        <div class="flex flex-col sm:flex-row gap-6 justify-center max-w-4xl mx-auto">
          <!-- Opción Empresa -->
          <div class="flex-1 max-w-md">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white mb-3">Como Empresa</h3>
                <p class="text-gray-300 mb-6 text-sm leading-relaxed">
                  Evalúa la madurez de tu organización en IA. Incluye análisis de competencias, 
                  procesos, cultura y estrategia organizacional.
                </p>
                <app-ui-button
                  variant="primary"
                  size="lg"
                  (clicked)="comenzarDiagnosticoEmpresa()"
                  class="w-full">
                  Realizar diagnóstico como empresa
                </app-ui-button>
              </div>
            </div>
          </div>

          <!-- Opción Persona -->
          <div class="flex-1 max-w-md">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white mb-3">Como Persona</h3>
                <p class="text-gray-300 mb-6 text-sm leading-relaxed">
                  Evalúa tus competencias personales en IA. Adaptado para niños (8-17) y adultos (18+). 
                  Incluye recomendaciones educativas personalizadas.
                </p>
                <app-ui-button
                  variant="secondary"
                  size="lg"
                  (clicked)="comenzarDiagnosticoPersona()"
                  class="w-full">
                  Realizar diagnóstico como persona
                </app-ui-button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

  comenzarDiagnosticoEmpresa(): void {
    console.log('Navegando al diagnóstico de empresa');
    
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

  comenzarDiagnosticoPersona(): void {
    console.log('Navegando al diagnóstico de persona');
    
    // Navegar al diagnóstico de persona
    this.router.navigate(['/es', 'diagnostico-persona', 'edad']).then(() => {
      console.log('✅ Navegación completada exitosamente a diagnóstico de persona');
    }).catch(error => {
      console.error('❌ Error en navegación a diagnóstico de persona:', error);
    });
  }
}
