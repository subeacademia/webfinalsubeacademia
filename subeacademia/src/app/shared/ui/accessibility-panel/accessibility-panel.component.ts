import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessibilityService, AccessibilityConfig } from '../../../core/accessibility/accessibility.service';

@Component({
  selector: 'app-accessibility-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed top-20 right-4 z-40" role="complementary" aria-label="Panel de configuración de accesibilidad">
      <!-- Botón para abrir/cerrar el panel -->
      <button 
        (click)="togglePanel()"
        class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="'accessibility-panel'"
        aria-label="Configurar opciones de accesibilidad">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
        </svg>
      </button>

      <!-- Panel de configuración -->
      <div 
        *ngIf="isOpen"
        id="accessibility-panel"
        class="absolute top-16 right-0 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-6"
        role="dialog"
        aria-modal="false"
        aria-labelledby="accessibility-panel-title">
        
        <!-- Header del panel -->
        <div class="flex items-center justify-between mb-4">
          <h3 id="accessibility-panel-title" class="text-lg font-semibold text-slate-900 dark:text-white">
            Configuración de Accesibilidad
          </h3>
          <button 
            (click)="togglePanel()"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
            aria-label="Cerrar panel de accesibilidad">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Opciones de configuración -->
        <div class="space-y-4">
          <!-- Alto contraste -->
          <div class="flex items-center justify-between">
            <div>
              <label for="high-contrast" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Alto contraste
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Mejora la legibilidad del texto
              </p>
            </div>
            <input 
              type="checkbox" 
              id="high-contrast"
              [(ngModel)]="config.enableHighContrast"
              (change)="updateConfig()"
              class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2">
          </div>

          <!-- Texto grande -->
          <div class="flex items-center justify-between">
            <div>
              <label for="large-text" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Texto grande
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Aumenta el tamaño del texto
              </p>
            </div>
            <input 
              type="checkbox" 
              id="large-text"
              [(ngModel)]="config.enableLargeText"
              (change)="updateConfig()"
              class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2">
          </div>

          <!-- Movimiento reducido -->
          <div class="flex items-center justify-between">
            <div>
              <label for="reduced-motion" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Movimiento reducido
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Reduce las animaciones
              </p>
            </div>
            <input 
              type="checkbox" 
              id="reduced-motion"
              [(ngModel)]="config.enableReducedMotion"
              (change)="updateConfig()"
              class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2">
          </div>

          <!-- Navegación por teclado -->
          <div class="flex items-center justify-between">
            <div>
              <label for="keyboard-nav" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Navegación por teclado
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Mejora la navegación con teclado
              </p>
            </div>
            <input 
              type="checkbox" 
              id="keyboard-nav"
              [(ngModel)]="config.enableKeyboardNavigation"
              (change)="updateConfig()"
              class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2">
          </div>

          <!-- Soporte para lectores de pantalla -->
          <div class="flex items-center justify-between">
            <div>
              <label for="screen-reader" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Soporte para lectores
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Optimiza para lectores de pantalla
              </p>
            </div>
            <input 
              type="checkbox" 
              id="screen-reader"
              [(ngModel)]="config.enableScreenReader"
              (change)="updateConfig()"
              class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2">
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <button 
            (click)="resetToDefaults()"
            class="flex-1 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Restablecer configuración por defecto">
            Restablecer
          </button>
          
          <button 
            (click)="generateReport()"
            class="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Generar reporte de accesibilidad">
            Reporte
          </button>
        </div>

        <!-- Información adicional -->
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p class="text-xs text-blue-700 dark:text-blue-300">
            <strong>Consejo:</strong> Estas configuraciones se guardan automáticamente y se aplican a toda la aplicación.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos específicos para el panel de accesibilidad */
    .accessibility-panel {
      transition: all 0.3s ease;
    }
    
    /* Mejoras de accesibilidad para el foco */
    button:focus-visible,
    input:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    /* Reducir movimiento para usuarios que lo prefieren */
    @media (prefers-reduced-motion: reduce) {
      .accessibility-panel,
      button,
      input {
        transition: none !important;
      }
    }
  `]
})
export class AccessibilityPanelComponent implements OnInit {
  isOpen = false;
  config: AccessibilityConfig = {
    enableHighContrast: false,
    enableReducedMotion: false,
    enableLargeText: false,
    enableKeyboardNavigation: true,
    enableScreenReader: true
  };

  private readonly accessibilityService = inject(AccessibilityService);

  ngOnInit(): void {
    // Cargar configuración actual
    this.config = this.accessibilityService.getConfig();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      // Anunciar a lectores de pantalla
      this.accessibilityService.announceToScreenReader('Panel de accesibilidad abierto');
    }
  }

  updateConfig(): void {
    this.accessibilityService.updateConfig(this.config);
    
    // Anunciar cambios a lectores de pantalla
    const changes = Object.entries(this.config)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
      .join(', ');
    
    if (changes) {
      this.accessibilityService.announceToScreenReader(`Configuración actualizada: ${changes}`);
    }
  }

  resetToDefaults(): void {
    this.config = {
      enableHighContrast: false,
      enableReducedMotion: false,
      enableLargeText: false,
      enableKeyboardNavigation: true,
      enableScreenReader: true
    };
    
    this.accessibilityService.updateConfig(this.config);
    this.accessibilityService.announceToScreenReader('Configuración restablecida a valores por defecto');
  }

  generateReport(): void {
    const report = this.accessibilityService.generateAccessibilityReport();
    
    // Mostrar reporte en consola (en producción se podría mostrar en un modal)
    console.log('Reporte de Accesibilidad:', report);
    
    // Anunciar a lectores de pantalla
    const issuesCount = report.issues?.length || 0;
    const warningsCount = report.warnings?.length || 0;
    
    if (issuesCount === 0 && warningsCount === 0) {
      this.accessibilityService.announceToScreenReader('Reporte de accesibilidad generado. No se encontraron problemas.');
    } else {
      this.accessibilityService.announceToScreenReader(
        `Reporte de accesibilidad generado. ${issuesCount} problemas y ${warningsCount} advertencias encontradas.`
      );
    }
  }
}
