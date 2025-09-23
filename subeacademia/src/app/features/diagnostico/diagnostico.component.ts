import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { StepNavComponent } from './components/step-nav.component';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StepNavComponent, I18nTranslatePipe],
  template: `
    <div class="bg-white dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      <!-- Barra de navegación integrada - Solo mostrar en páginas de fases -->
      @if (shouldShowNavigation()) {
        <app-step-nav></app-step-nav>
      }
      
      <main>
        <div class="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-6">
          <div class="bg-white dark:bg-slate-800 shadow-xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
            <div class="p-6 md:p-8">
              <!-- El router-outlet ahora siempre está visible -->
              <router-outlet (diagnosticFinished)="generateFinalReport()"></router-outlet>
            </div>
          </div>
        </div>
      </main>

      <!-- Loader de generación de reporte -->
      @if (isGeneratingReport()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ 'diagnostic.company.loader.title' | i18nTranslate }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">{{ 'diagnostic.company.loader.subtitle' | i18nTranslate }}</p>
            
            <!-- Pasos del proceso -->
            <div class="text-left space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>{{ 'diagnostic.company.loader.steps.diagnostic' | i18nTranslate }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span>{{ 'diagnostic.company.loader.steps.action_plan' | i18nTranslate }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                <span>{{ 'diagnostic.company.loader.steps.recommendations' | i18nTranslate }}</span>
              </div>
            </div>
            
            <div class="mt-4 text-xs text-gray-400">
              {{ 'diagnostic.company.loader.estimated_time' | i18nTranslate }}
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent implements OnInit, OnDestroy {
  private stateService = inject(DiagnosticStateService);
  private router = inject(Router);

  // Estado de carga centralizado en el servicio de estado
  isGeneratingReport = this.stateService.isGeneratingReport;

  ngOnInit() {
    // El evento ahora se maneja directamente a través del template binding
  }

  ngOnDestroy() {
    // No hay suscripciones que limpiar
  }

  // ¡ESTE ES AHORA EL ÚNICO PUNTO DE ENTRADA PARA LA GENERACIÓN DEL REPORTE!
  async generateFinalReport(): Promise<void> {
    if (!this.stateService.isComplete()) {
      alert('Por favor, completa todos los pasos del diagnóstico.');
      return;
    }
    
    console.log('DiagnosticoComponent: Recibido evento. Iniciando generación de reporte...');
    this.isGeneratingReport.set(true);

    try {
      await this.stateService.handleDiagnosticFinished();
      
      // Navegar a resultados después de generar el reporte exitosamente
      console.log('✅ Reporte generado exitosamente, navegando a resultados...');
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
      
    } catch (error) {
      console.error('Error final en la generación del diagnóstico:', error);
      alert('Hubo un problema al generar tu diagnóstico. La IA no respondió correctamente. Por favor, inténtalo de nuevo.');
    } finally {
      this.isGeneratingReport.set(false);
    }
  }

  // Método para determinar si mostrar la navegación
  shouldShowNavigation(): boolean {
    const currentUrl = this.router.url;
    
    // Solo mostrar en las páginas específicas de fases del diagnóstico
    const allowedPaths = [
      '/diagnostico/contexto',
      '/diagnostico/ares', 
      '/diagnostico/competencias',
      '/diagnostico/objetivo',
      '/diagnostico/finalizar'
    ];
    
    // Verificar si la URL actual está en la lista de rutas permitidas
    return allowedPaths.some(path => currentUrl.includes(path));
  }

}