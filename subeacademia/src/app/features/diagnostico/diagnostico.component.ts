import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { StepNavComponent } from './components/step-nav.component';
import { DiagnosticStateService } from './services/diagnostic-state.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StepNavComponent],
  template: `
    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <!-- Barra de navegación integrada -->
      <app-step-nav></app-step-nav>
      
      <main>
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div class="p-2 md:p-4">
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">🤖 Inteligencia Artificial</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">La IA está analizando tus respuestas y creando un reporte personalizado...</p>
            
            <!-- Pasos del proceso -->
            <div class="text-left space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Creando diagnóstico personalizado...</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span>Diseñando plan de acción estratégico...</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                <span>Generando recomendaciones específicas...</span>
              </div>
            </div>
            
            <div class="mt-4 text-xs text-gray-400">
              ⏱️ Tiempo estimado: 30-60 segundos
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
    } catch (error) {
      console.error('Error final en la generación del diagnóstico:', error);
      alert('Hubo un problema al generar tu diagnóstico. La IA no respondió correctamente. Por favor, inténtalo de nuevo.');
    } finally {
      this.isGeneratingReport.set(false);
    }
  }

}