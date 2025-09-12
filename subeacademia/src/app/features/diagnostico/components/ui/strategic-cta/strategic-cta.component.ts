import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Componente de Call-to-Action estratégico para el Dashboard de Mando
 * Este es el motor de conversión principal del diagnóstico
 */
@Component({
  selector: 'app-strategic-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strategic-cta-container">
      <!-- Header del CTA -->
      <div class="cta-header">
        <div class="cta-icon">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="cta-title">Tus Próximos Pasos Estratégicos</h3>
      </div>

      <!-- Contenido del CTA -->
      <div class="cta-content">
        <p class="cta-description">
          Este diagnóstico es tu punto de partida. La verdadera transformación comienza con la ejecución. 
          Permítenos ser tu socio en este viaje hacia la excelencia en IA.
        </p>

        <!-- Botones de Acción -->
        <div class="cta-actions">
          <!-- Botón Principal -->
          <button 
            (click)="scheduleStrategicSession()"
            class="btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Agendar Sesión Estratégica
          </button>

          <!-- Botón Secundario -->
          <button 
            (click)="downloadReport()"
            class="btn-secondary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Descargar Reporte en PDF
          </button>
        </div>

        <!-- Información Adicional -->
        <div class="cta-info">
          <div class="info-item">
            <div class="info-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span>Sesión de 60 minutos</span>
          </div>
          <div class="info-item">
            <div class="info-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span>Roadmap personalizado</span>
          </div>
          <div class="info-item">
            <div class="info-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span>Sin compromiso</span>
          </div>
        </div>
      </div>

      <!-- Badge de Urgencia -->
      <div class="urgency-badge">
        <span class="badge-text">⚡ Oferta limitada: 20% descuento en tu primera sesión</span>
      </div>
    </div>
  `,
  styles: [`
    .strategic-cta-container {
      @apply bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 
             border border-blue-200 dark:border-blue-700 rounded-xl p-6 h-full flex flex-col;
      position: relative;
      overflow: hidden;
    }

    .strategic-cta-container::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
      border-radius: 50%;
      transform: translate(30px, -30px);
    }

    .cta-header {
      @apply flex items-center gap-3 mb-4;
    }

    .cta-icon {
      @apply p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg;
    }

    .cta-title {
      @apply text-xl font-bold text-gray-800 dark:text-white;
    }

    .cta-content {
      @apply flex-1 flex flex-col;
    }

    .cta-description {
      @apply text-gray-600 dark:text-gray-300 mb-6 leading-relaxed;
    }

    .cta-actions {
      @apply space-y-3 mb-6;
    }

    .btn-primary {
      @apply w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
             py-3 px-4 rounded-lg flex items-center justify-center gap-2 
             hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 
             transition-all duration-200 shadow-lg hover:shadow-xl;
    }

    .btn-secondary {
      @apply w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold 
             py-3 px-4 rounded-lg flex items-center justify-center gap-2 
             border border-gray-300 dark:border-gray-600 
             hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 
             transition-all duration-200 shadow-md hover:shadow-lg;
    }

    .cta-info {
      @apply space-y-2;
    }

    .info-item {
      @apply flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400;
    }

    .info-icon {
      @apply text-green-500;
    }

    .urgency-badge {
      @apply absolute top-4 right-4;
    }

    .badge-text {
      @apply bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold 
             px-3 py-1 rounded-full shadow-lg animate-pulse;
    }

    /* Animaciones */
    .strategic-cta-container {
      animation: slideInRight 0.8s ease-out;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .strategic-cta-container {
        @apply p-4;
      }
      
      .cta-title {
        @apply text-lg;
      }
      
      .urgency-badge {
        @apply relative top-0 right-0 mb-4;
      }
    }
  `]
})
export class StrategicCtaComponent {
  private router = inject(Router);

  /**
   * Navega a la página de contacto o Calendly para agendar sesión estratégica
   */
  scheduleStrategicSession() {
    // Aquí puedes implementar la lógica para abrir Calendly o navegar a contacto
    console.log('Agendando sesión estratégica...');
    
    // Ejemplo: Abrir Calendly en nueva ventana
    // window.open('https://calendly.com/subeacademia/sesion-estrategica', '_blank');
    
    // O navegar a página de contacto
    this.router.navigate(['/contacto']);
  }

  /**
   * Descarga el reporte en formato PDF
   */
  downloadReport() {
    console.log('Descargando reporte en PDF...');
    
    // Aquí puedes implementar la lógica para generar y descargar PDF
    // Por ahora, simular descarga
    const link = document.createElement('a');
    link.href = '#'; // URL del PDF generado
    link.download = 'reporte-estrategico-subeacademia.pdf';
    link.click();
  }
}
