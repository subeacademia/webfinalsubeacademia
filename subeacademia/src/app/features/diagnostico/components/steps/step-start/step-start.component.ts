import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScrollService } from '../../../../../core/services/scroll/scroll.service';
import { UiButtonComponent } from '../../../../../shared/ui-kit/button/button';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-step-start',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, I18nTranslatePipe],
  template: `
    <div class="text-center animate-fade-in">
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-4xl font-bold mb-3 md:mb-4 px-4">
          <span class="orange-gradient-text">{{ 'diagnostico.title' | i18nTranslate }}</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed px-4">
          {{ 'diagnostico.subtitle' | i18nTranslate }}
        </p>
      </div>
      
      <div class="mb-6 md:mb-8">
        <div class="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 md:px-6 py-2 md:py-3 text-blue-700 shadow-sm mx-4">
          <svg class="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="font-medium text-sm md:text-base">{{ 'diagnostico.estimated_time' | i18nTranslate }}</span>
        </div>
      </div>

      <!-- Selección de tipo de diagnóstico -->
      <div class="mb-6 md:mb-8">
        <h2 class="text-xl md:text-2xl font-semibold text-slate-900 mb-4 md:mb-6 px-4">
          {{ 'diagnostico.select_type' | i18nTranslate }}
        </h2>
        
        <div class="flex flex-col md:flex-row gap-4 md:gap-6 justify-center max-w-4xl mx-auto px-4">
          <!-- Opción Empresa -->
          <div class="flex-1 max-w-md">
            <div class="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <div class="text-center">
                <div class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 class="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{{ 'diagnostico.company_option' | i18nTranslate }}</h3>
                <p class="text-slate-600 mb-4 md:mb-6 text-xs md:text-sm leading-relaxed">
                  {{ 'diagnostico.company_description' | i18nTranslate }}
                </p>
                <app-ui-button
                  variant="primary"
                  size="md"
                  (clicked)="comenzarDiagnosticoEmpresa()"
                  class="w-full text-sm md:text-base"
                  style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 25%, #f97316 50%, #fb923c 75%, #fdba74 100%); color: white; border: none; border-radius: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 700; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4); transition: all 0.3s ease;">
                  {{ 'diagnostico.company_button' | i18nTranslate }}
                </app-ui-button>
              </div>
            </div>
          </div>

          <!-- Opción Persona -->
          <div class="flex-1 max-w-md">
            <div class="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              <div class="text-center">
                <div class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 class="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{{ 'diagnostico.person_option' | i18nTranslate }}</h3>
                <p class="text-slate-600 mb-4 md:mb-6 text-xs md:text-sm leading-relaxed">
                  {{ 'diagnostico.person_description' | i18nTranslate }}
                </p>
                <app-ui-button
                  variant="primary"
                  size="md"
                  (clicked)="comenzarDiagnosticoPersona()"
                  class="w-full text-sm md:text-base"
                  style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 25%, #f97316 50%, #fb923c 75%, #fdba74 100%); color: white; border: none; border-radius: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 700; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4); transition: all 0.3s ease;">
                  {{ 'diagnostico.person_button' | i18nTranslate }}
                </app-ui-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 md:mt-8 text-slate-500 text-xs md:text-sm px-4">
        <p>{{ 'diagnostico.privacy_notice' | i18nTranslate }}</p>
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
    
    /* Gradiente naranja - NUEVO COLOR PRIMARIO */
    .orange-gradient-text {
      background: linear-gradient(135deg, #ea580c 0%, #dc2626 25%, #f97316 50%, #fb923c 75%, #fdba74 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);
      font-weight: 900 !important;
    }
    
    /* Modo oscuro */
    :global(.dark) .orange-gradient-text {
      background: linear-gradient(135deg, #fdba74 0%, #fb923c 25%, #f97316 50%, #ea580c 75%, #dc2626 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 8px rgba(251, 146, 60, 0.4);
      font-weight: 900 !important;
    }
  `]
})
export class StepStartComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly diagnosticStateService = inject(DiagnosticStateService);
  private readonly scrollService = inject(ScrollService);

  comenzarDiagnosticoEmpresa(): void {
    console.log('🚀 [StepStartComponent] Iniciando navegación al diagnóstico de empresa');
    
    // Navegar al nuevo diagnóstico de empresas
    this.router.navigate(['/es/diagnostico/empresas']).then((success) => {
      if (success) {
        console.log('✅ [StepStartComponent] Navegación exitosa al diagnóstico de empresas');
        // Hacer scroll al inicio después de navegar
        this.scrollService.scrollToMainContent();
      } else {
        console.error('❌ [StepStartComponent] La navegación falló pero no lanzó error');
      }
    }).catch(error => {
      console.error('❌ [StepStartComponent] Error en navegación:', error);
    });
  }

  comenzarDiagnosticoPersona(): void {
    console.log('Navegando al diagnóstico de persona');
    
    // Establecer el tipo de lead como persona natural
    this.diagnosticStateService.setLeadType('persona_natural');
    
    // Navegar al diagnóstico de persona
    this.router.navigate(['/es', 'diagnostico-persona', 'edad']).then(() => {
      console.log('✅ Navegación completada exitosamente a diagnóstico de persona');
      // Hacer scroll al inicio después de navegar
      this.scrollService.scrollToMainContent();
    }).catch(error => {
      console.error('❌ Error en navegación a diagnóstico de persona:', error);
    });
  }
}
