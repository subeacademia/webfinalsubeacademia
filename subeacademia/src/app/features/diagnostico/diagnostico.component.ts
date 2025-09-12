import { Component, ChangeDetectionStrategy, inject, signal, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { StepNavComponent } from './components/step-nav.component';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { DiagnosticsService } from './services/diagnostics.service';
import { DiagnosticFlowService } from './services/diagnostic-flow.service';
import { Subscription } from 'rxjs';

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

      <!-- Loader de generación de reporte -->
      @if (isGeneratingReport()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generando tu diagnóstico</h3>
            <p class="text-gray-600 dark:text-gray-300">La IA está analizando tus respuestas y creando un reporte personalizado...</p>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent implements OnInit, OnDestroy {
  private stateService = inject(DiagnosticStateService);
  private diagnosticsService = inject(DiagnosticsService);
  private flowService = inject(DiagnosticFlowService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Estado de carga centralizado en este componente
  isGeneratingReport = signal(false);
  private subscription?: Subscription;

  ngOnInit() {
    // Escuchar el evento de diagnóstico completado
    this.subscription = this.flowService.diagnosticFinished$.subscribe(() => {
      this.generateFinalReport();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ¡ESTE ES AHORA EL ÚNICO PUNTO DE ENTRADA PARA LA GENERACIÓN DEL REPORTE!
  async generateFinalReport(): Promise<void> {
    console.log('DiagnosticoComponent: Recibido evento. Iniciando generación de reporte...');
    this.isGeneratingReport.set(true);
    this.cdr.detectChanges(); // Muestra el loader

    try {
      const report = await this.diagnosticsService.generateReport(this.stateService.state());
      if (!report) {
        throw new Error('El servicio de diagnóstico devolvió un reporte nulo.');
      }
      this.diagnosticsService.setCurrentReport(report);
      
      // Navegar con prefijo de idioma
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
    } catch (error) {
      console.error('Error final en la generación del diagnóstico:', error);
      alert('Hubo un problema al generar tu diagnóstico. La IA no respondió correctamente. Por favor, inténtalo de nuevo.');
    } finally {
      this.isGeneratingReport.set(false);
      this.cdr.detectChanges(); // Oculta el loader
    }
  }
}