import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleDiagnosticService, DiagnosticData } from '../../../services/simple-diagnostic.service';

@Component({
  selector: 'app-simple-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <!-- Contenedor principal del reporte -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          
          <!-- Encabezado -->
          <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white">Diagnóstico de Madurez en IA</h1>
                <p class="text-xl text-gray-600 dark:text-gray-400">Preparado para: <span class="font-semibold text-blue-600 dark:text-blue-400">{{ getLeadName() }}</span></p>
                <p class="text-sm text-gray-500">{{ getCurrentDate() | date:'fullDate' }}</p>
              </div>
            </div>
          </div>

          <!-- Estado de carga -->
          @if (isLoading()) {
            <div class="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <h3 class="mt-6 text-xl font-semibold text-gray-800 dark:text-gray-200">Generando tu diagnóstico personalizado</h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400 text-center max-w-md">
                Estamos analizando tus respuestas para crear un reporte detallado de tu madurez en IA.
              </p>
            </div>
          }

          <!-- Contenido del diagnóstico -->
          @if (!isLoading() && diagnosticContent()) {
            <div class="diagnostic-content">
              <div [innerHTML]="diagnosticContent()"></div>
            </div>
          }

          <!-- Botones de acción -->
          @if (!isLoading()) {
            <div class="mt-8 flex flex-wrap gap-4 justify-center">
              <button 
                (click)="regenerateReport()" 
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Regenerar Reporte
              </button>
              
              <button 
                (click)="downloadPDF()" 
                class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Descargar PDF
              </button>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .diagnostic-content {
      line-height: 1.6;
    }
    
    .diagnostic-content h1 {
      @apply text-3xl font-bold mb-8 text-gray-900 dark:text-white;
    }
    
    .diagnostic-content h2 {
      @apply text-2xl font-bold mb-6 text-gray-900 dark:text-white;
    }
    
    .diagnostic-content h3 {
      @apply text-xl font-bold mb-4 text-gray-900 dark:text-white;
    }
    
    .diagnostic-content p {
      @apply mb-4 text-gray-700 dark:text-gray-300;
    }
    
    .diagnostic-content ul {
      @apply list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2;
    }
    
    .diagnostic-content ol {
      @apply list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2;
    }
    
    .diagnostic-content strong {
      @apply font-semibold text-gray-900 dark:text-white;
    }
    
    .diagnostic-content .card {
      @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6;
    }
    
    .diagnostic-content .priority-high {
      @apply bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded text-xs font-medium;
    }
    
    .diagnostic-content .priority-medium {
      @apply bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs font-medium;
    }
    
    .diagnostic-content .priority-low {
      @apply bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium;
    }
  `]
})
export class SimpleDiagnosticResultsComponent implements OnInit {
  private diagnosticService = new SimpleDiagnosticService();

  // Signals para el estado del componente
  isLoading = signal<boolean>(true);
  diagnosticContent = signal<string>('');
  diagnosticData = signal<any>(null);

  ngOnInit(): void {
    console.log('🚀 Inicializando SimpleDiagnosticResultsComponent...');
    this.loadDiagnosticData();
  }

  private async loadDiagnosticData(): Promise<void> {
    try {
      console.log('📊 Cargando datos del diagnóstico...');
      
      // Simular tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Obtener datos del diagnóstico
      const currentData = this.diagnosticService.getDiagnosticData();
      console.log('📋 Datos obtenidos:', currentData);
      
      this.diagnosticData.set(currentData || {});
      
      // Generar contenido del diagnóstico usando el servicio
      const content = this.diagnosticService.generateReport(currentData || {});
      this.diagnosticContent.set(content);
      
      this.isLoading.set(false);
      console.log('✅ Diagnóstico generado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      this.isLoading.set(false);
      this.diagnosticContent.set(this.generateFallbackContent());
    }
  }



  private generateFallbackContent(): string {
    return `
      <div class="card">
        <h2>Diagnóstico de Madurez en IA</h2>
        <p>Preparado para: <strong>${this.getLeadName()}</strong></p>
        <p>Fecha: <strong>${new Date().toLocaleDateString('es-ES')}</strong></p>
        
        <h3>Análisis General</h3>
        <p>Basado en la información proporcionada, tu organización muestra un nivel de madurez en IA que requiere atención en varias áreas clave.</p>
        
        <h3>Recomendaciones Principales</h3>
        <ol>
          <li>Desarrollar una estrategia de IA clara</li>
          <li>Invertir en formación del equipo</li>
          <li>Establecer procesos de gobernanza</li>
        </ol>
        
        <h3>Próximos Pasos</h3>
        <ul>
          <li>Revisar los resultados detallados</li>
          <li>Implementar las recomendaciones prioritarias</li>
          <li>Programar seguimiento en 3 meses</li>
        </ul>
      </div>
    `;
  }



  getLeadName(): string {
    const data = this.diagnosticData();
    return data?.lead?.nombre || data?.form?.lead?.nombre || 'Usuario';
  }

  getCurrentDate(): Date {
    return new Date();
  }

  async regenerateReport(): Promise<void> {
    console.log('🔄 Regenerando reporte...');
    this.isLoading.set(true);
    await this.loadDiagnosticData();
  }

  downloadPDF(): void {
    console.log('📄 Descargando PDF...');
    // Implementar descarga de PDF
    alert('Función de descarga de PDF en desarrollo');
  }
}
