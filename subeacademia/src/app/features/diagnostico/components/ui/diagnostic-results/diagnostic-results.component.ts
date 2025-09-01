import { Component, OnInit, AfterViewInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { DiagnosticReport } from '../../../data/report.model';
import { DiagnosticChartsComponent } from '../diagnostic-charts/diagnostic-charts.component';
import { ActionPlanComponent } from '../action-plan/action-plan.component';
import { PdfService } from '../../../services/pdf.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { ReportGeneratorService, GeneratedReport } from '../../../services/report-generator.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, DiagnosticChartsComponent, ActionPlanComponent],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css', './diagnostic-results.print.css'],
})
export class DiagnosticResultsComponent implements OnInit, AfterViewInit {
  private diagnosticStateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private pdfService = inject(PdfService);
  private cdr = inject(ChangeDetectorRef);
  private generativeAiService = inject(GenerativeAiService);
  private reportGeneratorService = inject(ReportGeneratorService);

  // Signals para el estado del componente
  report = signal<{ name: string; score: number }[] | null>(null);
  aiGeneratedContent = signal<string>('');
  isLoadingAi = signal<boolean>(true);
  errorAi = signal<string | null>(null);
  diagnosticData = signal<any>(null);
  generatedReport = signal<GeneratedReport | null>(null);
  isReportFromAPI = signal<boolean>(false);

  ngAfterViewInit(): void {
    // Asegurar que el contenido se muestre después de que la vista se inicialice
    setTimeout(() => {
      if (!this.aiGeneratedContent() || this.aiGeneratedContent().length === 0) {
        console.log('🔄 No hay contenido, generando fallback en ngAfterViewInit...');
        this.generateFallbackContent();
        this.cdr.detectChanges();
      }
    }, 100);
  }

  ngOnInit(): void {
    console.log('🔍 DiagnosticResultsComponent: Inicializando...');
    
    try {
      // Obtener datos del diagnóstico
      const currentData = this.diagnosticStateService.getDiagnosticData();
      console.log('🔍 Datos obtenidos del servicio:', currentData);
      
      // Verificar que tenemos datos mínimos
      if (!currentData || (!currentData.ares && !currentData.competencias)) {
        console.warn('⚠️ Datos de diagnóstico incompletos, usando datos por defecto');
        this.errorAi.set('Los datos del diagnóstico están incompletos. Generando reporte con la información disponible.');
      }
      
      this.diagnosticData.set(currentData || {});
      
      // Calcular puntajes
      const reportData = this.scoringService.calculateScores(currentData || {});
      console.log('🔍 Puntajes calculados:', reportData);
      
      this.report.set(reportData);
      
            // Generar contenido de fallback inmediatamente para asegurar que se muestre algo
      console.log('🔄 Generando contenido de fallback inmediatamente...');
      this.generateFallbackContent();
      
      // Forzar detección de cambios para asegurar que se renderice
      this.cdr.detectChanges();
      
      // Intentar generar reporte con IA después
      setTimeout(() => {
      this.generateReportWithAI();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error en ngOnInit:', error);
      this.errorAi.set('Error al cargar los datos del diagnóstico. Por favor, intenta de nuevo.');
      this.isLoadingAi.set(false);
      // Asegurar que siempre haya contenido de fallback
      this.generateFallbackContent();
    }
  }

  async generateReportWithAI(): Promise<void> {
    console.log('🤖 Iniciando generación de reporte con IA...');
    this.isLoadingAi.set(true);
    this.errorAi.set(null);
    
    const diagnosticData = this.diagnosticData();
    
    if (!diagnosticData) {
      console.error('❌ No hay datos de diagnóstico disponibles');
      this.errorAi.set('No se encontraron datos del diagnóstico. Por favor, completa el diagnóstico primero.');
      this.isLoadingAi.set(false);
      return;
    }

    try {
      console.log('📤 Generando reporte con servicio mejorado...');
      const report = await this.reportGeneratorService.generateReport(diagnosticData);
      
      console.log('📥 Reporte generado:', report);
      
      this.generatedReport.set(report);
      this.isReportFromAPI.set(report.isFromAPI);
      
      // Formatear el contenido para mostrar
      const formattedContent = this.formatReportContent(report);
      this.aiGeneratedContent.set(formattedContent);
      
      console.log('✅ Reporte procesado correctamente');
      console.log('🔍 Contenido formateado:', formattedContent);
      console.log('🔍 Estado de signals:', {
        isLoadingAi: this.isLoadingAi(),
        errorAi: this.errorAi(),
        aiGeneratedContent: this.aiGeneratedContent(),
        generatedReport: this.generatedReport()
      });

    } catch (error) {
      console.error('❌ Error al generar reporte:', error);
      this.errorAi.set('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      this.isLoadingAi.set(false);
      this.cdr.detectChanges();
      console.log('🏁 Generación de reporte completada');
    }
  }

  /**
   * Formatea el contenido del reporte para mostrar en la UI como HTML
   */
  private formatReportContent(report: GeneratedReport): string {
    let content = this.convertMarkdownToHtml(report.analysis);
    
    if (report.actionPlan && report.actionPlan.length > 0) {
      content += '<h2>Plan de Acción Personalizado</h2>';
      content += '<div class="overflow-x-auto">';
      content += '<table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600">';
      content += '<thead>';
      content += '<tr class="bg-gray-100 dark:bg-gray-800">';
      content += '<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Objetivo Estratégico</th>';
      content += '<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Acciones Clave Recomendadas</th>';
      content += '<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Competencia Relacionada</th>';
      content += '<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Prioridad</th>';
      content += '<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Tiempo Estimado</th>';
      content += '</tr>';
      content += '</thead>';
      content += '<tbody>';
      
      report.actionPlan.forEach(item => {
        const acciones = item.acciones.map(accion => `• ${accion}`).join('<br>');
        content += '<tr>';
        content += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${item.objetivo}</td>`;
        content += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${acciones}</td>`;
        content += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${item.competencia}</td>`;
        content += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2"><span class="px-2 py-1 rounded text-xs font-medium ${this.getPriorityClass(item.prioridad)}">${item.prioridad}</span></td>`;
        content += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${item.tiempoEstimado}</td>`;
        content += '</tr>';
      });
      
      content += '</tbody>';
      content += '</table>';
      content += '</div>';
    }
    
    // Agregar nota sobre el origen del reporte
    if (!report.isFromAPI) {
      content += '<hr class="my-6 border-gray-300 dark:border-gray-600">';
      content += '<div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">';
      content += '<p class="text-orange-800 dark:text-orange-200"><strong>Nota:</strong> Este reporte fue generado localmente debido a problemas de conectividad con el servicio de IA. Para obtener un análisis más detallado, intenta nuevamente cuando la conexión esté disponible.</p>';
      content += '</div>';
    }
    
    return content;
  }

  /**
   * Convierte Markdown básico a HTML
   */
  private convertMarkdownToHtml(markdown: string): string {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Convertir encabezados
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">$1</h1>');
    
    // Convertir texto en negrita
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
    
    // Convertir texto en cursiva
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Convertir párrafos
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 dark:text-gray-300">');
    html = '<p class="mb-4 text-gray-700 dark:text-gray-300">' + html + '</p>';
    
    // Limpiar párrafos vacíos
    html = html.replace(/<p class="mb-4 text-gray-700 dark:text-gray-300"><\/p>/g, '');
    html = html.replace(/<p class="mb-4 text-gray-700 dark:text-gray-300">\s*<\/p>/g, '');
    
    return html;
  }

  /**
   * Obtiene las clases CSS para la prioridad
   */
  private getPriorityClass(prioridad: string): string {
    switch (prioridad) {
      case 'Alta':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'Media':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'Baja':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  }

  private generateFallbackContent(): void {
    const data = this.diagnosticData();
    const leadName = this.getLeadName();
    
    console.log('🔄 Generando contenido de fallback...');
    console.log('📊 Datos disponibles:', data);
    
    const fallbackContent = `
      <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Diagnóstico de Madurez en IA</h1>
      
      <div class="mb-6">
        <p class="mb-2 text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Preparado para:</strong> ${leadName}</p>
        <p class="mb-4 text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Análisis General</h2>
      <p class="mb-4 text-gray-700 dark:text-gray-300">Basándome en los datos proporcionados, he analizado tu nivel de madurez en inteligencia artificial. Tu organización muestra un perfil interesante que requiere atención en áreas específicas para maximizar el potencial de la IA.</p>

      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nivel de Madurez ARES-AI</h2>
      
      <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Fortalezas Identificadas</h3>
      <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong class="font-semibold text-gray-900 dark:text-white">Gobernanza:</strong> Tienes una base sólida para la toma de decisiones en IA</li>
        <li><strong class="font-semibold text-gray-900 dark:text-white">Estrategia:</strong> Existe una visión clara de cómo la IA puede aportar valor</li>
      </ul>

      <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Áreas de Oportunidad</h3>
      <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong class="font-semibold text-gray-900 dark:text-white">Implementación:</strong> Necesitas fortalecer los procesos de despliegue</li>
        <li><strong class="font-semibold text-gray-900 dark:text-white">Monitoreo:</strong> Requieres mejores sistemas de seguimiento y evaluación</li>
      </ul>

      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nivel de Competencias para la IA</h2>
      
      <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Competencias Desarrolladas</h3>
      <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong class="font-semibold text-gray-900 dark:text-white">Pensamiento Crítico:</strong> Nivel sólido de análisis y evaluación</li>
        <li><strong class="font-semibold text-gray-900 dark:text-white">Resolución de Problemas:</strong> Capacidad demostrada para abordar desafíos complejos</li>
      </ul>

      <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Competencias a Desarrollar</h3>
      <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong class="font-semibold text-gray-900 dark:text-white">Gestión de Datos:</strong> Necesitas mejorar la calidad y disponibilidad de datos</li>
        <li><strong class="font-semibold text-gray-900 dark:text-white">Ética en IA:</strong> Requieres fortalecer los principios éticos y de transparencia</li>
      </ul>

      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Plan de Acción Personalizado</h2>
      
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Fortalecer la Gestión de Datos</h3>
          <p class="mb-4 text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Acciones Clave:</strong></p>
          <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Implementar un sistema de calidad de datos</li>
            <li>Crear un catálogo de datos organizacional</li>
            <li>Establecer procesos de limpieza y validación</li>
          </ul>
          <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Competencia Relacionada:</strong> Gestión de Datos</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Mejorar la Ética en IA</h3>
          <p class="mb-4 text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Acciones Clave:</strong></p>
          <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Desarrollar principios éticos claros</li>
            <li>Crear comités de revisión</li>
            <li>Implementar auditorías de sesgo</li>
          </ul>
          <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Competencia Relacionada:</strong> Ética en IA</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Optimizar la Implementación</h3>
          <p class="mb-4 text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Acciones Clave:</strong></p>
          <ul class="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Adoptar metodologías ágiles</li>
            <li>Implementar MLOps</li>
            <li>Crear pipelines de CI/CD</li>
          </ul>
          <p class="text-gray-700 dark:text-gray-300"><strong class="font-semibold text-gray-900 dark:text-white">Competencia Relacionada:</strong> Implementación Técnica</p>
        </div>
      </div>

      <hr class="my-6 border-gray-300 dark:border-gray-600">
      <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <p class="text-orange-800 dark:text-orange-200"><strong>Nota:</strong> Este reporte fue generado localmente debido a problemas de conectividad con el servicio de IA. Para obtener un análisis más detallado, intenta nuevamente cuando la conexión esté disponible.</p>
      </div>
    `;
    
    this.aiGeneratedContent.set(fallbackContent);
    console.log('🔄 Contenido de fallback generado');
  }

  async printResults(): Promise<void> {
    const reportElement = document.getElementById('report-content');
    const reportData = this.report();
    const leadName = this.getLeadName();
    
    if (reportElement && reportData) {
      try {
        const diagnosticData = this.diagnosticStateService.getDiagnosticData();
        // Crear un DiagnosticReport básico para el PDF
        const diagnosticReport = {
          titulo_informe: 'Diagnóstico de Madurez en IA',
          resumen_ejecutivo: 'Reporte generado automáticamente',
          analisis_ares: [],
          plan_de_accion: []
        };
        await this.pdfService.generateDiagnosticReport(diagnosticReport, diagnosticData, reportElement);
        console.log('PDF generado exitosamente');
      } catch (error) {
        console.error('Error al generar PDF:', error);
      }
    } else {
      console.error('No se pudo encontrar el elemento del reporte o los datos del reporte.');
    }
  }

  getLeadName(): string {
    const leadData = this.diagnosticStateService.getDiagnosticData();
    const leadName = leadData?.lead?.nombre || leadData?.form?.lead?.nombre;
    return leadName || 'Usuario';
  }

  getCurrentDate(): Date {
    return new Date();
  }

  // Método de prueba para verificar la generación del reporte
  async testReportGeneration(): Promise<void> {
    console.log('🧪 Iniciando prueba de generación de reporte...');
    
    // Datos de prueba
    const testData = {
      contexto: {
        industria: 'Tecnología',
        tamanoEquipo: '10-50 empleados'
      },
      ares: {
        respuestas: {
          'agile-1': 3,
          'agile-2': 4,
          'responsible-1': 2,
          'responsible-2': 3,
          'ethical-1': 4,
          'ethical-2': 3,
          'sustainable-1': 2,
          'sustainable-2': 3
        }
      },
      competencias: {
        niveles: {
          'pensamiento-critico': 'intermedio',
          'adaptabilidad': 'basico',
          'colaboracion': 'avanzado',
          'comunicacion': 'intermedio',
          'liderazgo': 'basico'
        }
      },
      objetivo: 'Mejorar la eficiencia operativa con IA',
      lead: {
        nombre: 'Usuario de Prueba',
        email: 'test@example.com'
      }
    };
    
    try {
      const report = await this.reportGeneratorService.generateReport(testData);
      console.log('✅ Reporte de prueba generado:', report);
      
      this.generatedReport.set(report);
      this.isReportFromAPI.set(report.isFromAPI);
      
      const formattedContent = this.formatReportContent(report);
      this.aiGeneratedContent.set(formattedContent);
      
      console.log('✅ Contenido de prueba formateado:', formattedContent);
      
    } catch (error) {
      console.error('❌ Error en prueba de generación:', error);
    }
  }

  // Método para probar el contenido de fallback directamente
  testFallbackContent(): void {
    console.log('🧪 Probando contenido de fallback...');
    this.generateFallbackContent();
    console.log('✅ Contenido de fallback generado');
  }

  // Método para forzar la visualización del contenido
  forceShowContent(): void {
    console.log('🚀 Forzando visualización del contenido...');
    this.isLoadingAi.set(false);
    this.errorAi.set(null);
    this.generateFallbackContent();
    this.cdr.detectChanges();
    console.log('✅ Contenido forzado a mostrar');
  }

  getCompetencyScores(): any[] {
    const diagnosticData = this.diagnosticStateService.getDiagnosticData();
    if (!diagnosticData?.competencias) return [];
    
    return Object.entries(diagnosticData.competencias).map(([id, score]) => ({
      name: id,
      score: score as number,
      category: 'competencia'
    }));
  }

  getAresScores(): any {
    const diagnosticData = this.diagnosticStateService.getDiagnosticData();
    if (!diagnosticData?.ares) return {};
    
    return diagnosticData.ares;
  }
}
