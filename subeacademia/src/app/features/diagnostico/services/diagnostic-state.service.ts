import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService, ToastKind } from '../../../core/services/ui/toast/toast.service';
import { DiagnosticData, INITIAL_DIAGNOSTIC_DATA, Answer } from '../data/diagnostic.models';
import { Report, ReportData } from '../data/report.model';
import { BesselAiService } from '../../../core/ai/bessel-ai.service';
import { DiagnosticsService } from './diagnostics.service';
import { CursosService } from '../../productos/services/cursos.service';
import { firstValueFrom, take } from 'rxjs';
import { aresQuestions } from '../data/ares-items';
import { competencias } from '../data/competencias';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticStateService {
  private router = inject(Router);
  public toastService = inject(ToastService);
  private besselAiService = inject(BesselAiService);
  private diagnosticsService = inject(DiagnosticsService);
  private cursosService = inject(CursosService);

  private diagnosticData = signal<DiagnosticData>(JSON.parse(JSON.stringify(INITIAL_DIAGNOSTIC_DATA)));
  private leadType = signal<'persona_natural' | 'empresa' | null>(null);
  currentStep = signal(0);
  isGeneratingReport = signal(false);
  generatedReport = signal<Report | null>(null);
  generatedStrategicReport = signal<ReportData | null>(null);

  public state = computed(() => this.diagnosticData());
  public currentLeadType = computed(() => this.leadType());

  public aresProgress = computed(() => {
    const aresData = this.diagnosticData().ares;
    // Considerar una respuesta válida si existe y tiene un valor (incluyendo 0)
    const answeredCount = Object.keys(aresData).filter(key => 
      aresData[key] && (aresData[key].value !== null && aresData[key].value !== undefined)
    ).length;
    const totalCount = aresQuestions.length;
    return { answered: answeredCount, total: totalCount, isComplete: answeredCount === totalCount };
  });

  public competenciasProgress = computed(() => {
    const competenciasData = this.diagnosticData().competencias;
    // Considerar una respuesta válida si existe y tiene un valor (incluyendo 0)
    const answeredCount = Object.keys(competenciasData).filter(key => 
      competenciasData[key] && (competenciasData[key].value !== null && competenciasData[key].value !== undefined)
    ).length;
    const totalCount = competencias.flatMap(c => c.questions).length;
    return { answered: answeredCount, total: totalCount, isComplete: answeredCount === totalCount };
  });

  /**
   * Verifica si el diagnóstico está completo para poder generar el reporte
   */
  public isComplete(): boolean {
    const data = this.diagnosticData();
    return !!(
      data.contexto &&
      data.objetivo &&
      data.objetivo.objetivo &&
      data.objetivo.objetivo.length > 0 &&
      this.aresProgress().isComplete &&
      this.competenciasProgress().isComplete
    );
  }

  start(): void {
    this.reset();
    this.currentStep.set(1);
  }

  setLeadType(type: 'persona_natural' | 'empresa'): void {
    this.leadType.set(type);
    console.log('Tipo de lead establecido:', type);
  }

  updateLead(leadData: any): void {
    const currentData = this.diagnosticData();
    const leadType = this.leadType();
    
    console.log('🔍 updateLead: leadData recibido:', leadData);
    console.log('🔍 updateLead: leadType actual:', leadType);
    console.log('🔍 updateLead: currentData antes:', currentData);
    
    if (!leadType) {
      console.error('❌ No se ha establecido el tipo de lead');
      return;
    }

    // Obtener datos del contexto para incluir en el lead
    const contexto = currentData.contexto;
    const position = contexto?.rol || '';
    const industry = contexto?.industria || '';
    const companySize = contexto?.equipo || '';

    // Crear el objeto lead con el tipo ya establecido y datos del contexto
    const lead = {
      ...leadData,
      type: leadType,
      // Incluir datos del contexto (cargo, industria y tamaño de empresa)
      position: position,
      industry: industry,
      companySize: companySize
    };

    console.log('🔍 updateLead: lead creado con datos del contexto:', lead);

    this.diagnosticData.set({
      ...currentData,
      lead
    });
    
    console.log('✅ Lead actualizado:', lead);
    console.log('🔍 updateLead: currentData después:', this.diagnosticData());
  }

  reset(): void {
    this.diagnosticData.set(JSON.parse(JSON.stringify(INITIAL_DIAGNOSTIC_DATA)));
    this.leadType.set(null);
    this.currentStep.set(0);
    this.isGeneratingReport.set(false);
    this.generatedReport.set(null);
  }

  updateData(newData: Partial<DiagnosticData>): void {
    this.diagnosticData.update(currentData => ({ 
        ...currentData, 
        ...newData 
    }));
  }
  
  updateAnswer(section: 'ares' | 'competencias', questionId: string, answer: Answer): void {
    this.diagnosticData.update(currentData => {
      const updatedSection = { ...currentData[section], [questionId]: answer };
      return { ...currentData, [section]: updatedSection };
    });
  }


  /**
   * Actualiza los objetivos seleccionados
   */
  updateObjetivo(objetivos: string[]): void {
    this.diagnosticData.update(currentData => ({
      ...currentData,
      objetivo: {
        ...currentData.objetivo,
        objetivo: objetivos
      }
    }));
  }

  nextStep(): void {
    this.currentStep.update(step => step + 1);
    
    // Navegar al siguiente paso basado en el paso actual
    const currentUrl = this.router.url;
    console.log('🔍 DiagnosticStateService.nextStep() - Current URL:', currentUrl);
    console.log('🔍 Current step:', this.currentStep());
    
    // Detectar prefijo de idioma
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    console.log('🔍 Language prefix detected:', languagePrefix);
    
    if (currentUrl.includes('/contexto')) {
      console.log('✅ Navigating to ares');
      this.router.navigate([`/${languagePrefix}/diagnostico/ares`]);
    } else if (currentUrl.includes('/ares')) {
      console.log('✅ Navigating to competencias');
      this.router.navigate([`/${languagePrefix}/diagnostico/competencias`]);
    } else if (currentUrl.includes('/competencias')) {
      console.log('✅ Navigating to objetivo');
      this.router.navigate([`/${languagePrefix}/diagnostico/objetivo`]);
    } else if (currentUrl.includes('/objetivo')) {
      console.log('✅ Navigating to finalizar');
      this.router.navigate([`/${languagePrefix}/diagnostico/finalizar`]);
    } else {
      console.log('❌ No navigation match found for URL:', currentUrl);
      // Fallback: navegar a la página de inicio si no se encuentra una ruta válida
      console.log('🔄 Fallback: navigating to home');
      this.router.navigate([`/${languagePrefix}/`]);
    }
  }

  previousStep(): void {
    this.currentStep.update(step => step - 1);
  }

  // MÉTODO ELIMINADO: La lógica de generación y navegación se centraliza ahora en diagnostico.component.ts
  // Esto desacopla el servicio de estado de la lógica de aplicación y navegación

  /**
   * Maneja la finalización del diagnóstico y genera el reporte
   */
  async handleDiagnosticFinished(): Promise<void> {
    if (this.isGeneratingReport()) return;
    
    const data = this.diagnosticData();
    if (!data) {
      this.toastService.show('error', 'No hay datos de diagnóstico.');
      return;
    }

    // Verificar que tenemos datos del lead
    if (!data.lead) {
      this.toastService.show('error', 'No se encontraron datos del lead. Por favor, completa la información personal.');
      return;
    }
    
    this.isGeneratingReport.set(true);
    
    try {
      console.log('🚀 Generando reporte comprehensivo con datos reales:', data);
      
      // Generar el reporte estratégico (incluye fallback automático)
      const comprehensiveReport = await this.besselAiService.generateComprehensiveReport(data);
      console.log('📊 Reporte recibido del servicio de IA:', comprehensiveReport ? 'Sí' : 'No');
      console.log('📋 ID del reporte:', comprehensiveReport?.id);
      console.log('📋 Versión del reporte:', comprehensiveReport?.version);
      
      this.generatedStrategicReport.set(comprehensiveReport);
      
      console.log('✅ Reporte generado exitosamente:', comprehensiveReport ? 'Sí' : 'No');
      
      // Crear el objeto Report para guardar
      const report: Report = {
        titulo: 'Diagnóstico de Madurez en IA',
        resumen: comprehensiveReport?.executiveSummary || 'Análisis de madurez en IA completado',
        analisisCompetencias: comprehensiveReport?.competencyScores?.map(comp => ({
          competencia: comp.name,
          puntaje: comp.score,
          descripcion: '',
          sugerencia: ''
        })) || [],
        identificacionBrechas: comprehensiveReport?.executiveSummary || 'Análisis de brechas completado',
        planDeAccion: comprehensiveReport?.actionPlan?.map(area => ({
          area: area.area,
          acciones: area.actions?.map((action: any) => ({
            accion: action.accion,
            descripcion: action.descripcion,
            recursos: action.recursos || []
          })) || []
        })) || [],
        recomendacionesGenerales: comprehensiveReport?.executiveSummary || 'Recomendaciones generales',
        alineacionObjetivos: comprehensiveReport?.executiveSummary || 'Alineación con objetivos'
      };
      
      // Guardar el diagnóstico con lead en Firebase
      console.log('💾 Guardando diagnóstico con lead en Firebase...');
      const leadId = await this.diagnosticsService.saveDiagnosticWithLead(data, report);
      console.log('✅ Lead guardado exitosamente con ID:', leadId);
      
      this.toastService.show('success', 'Diagnóstico completado y guardado correctamente.');
      
      // Navegar con prefijo de idioma
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
    } catch (error: any) {
      console.error('❌ Error al generar reporte estratégico:', error);
      console.error('❌ Tipo de error:', error.constructor.name);
      console.error('❌ Mensaje de error:', error.message);
      
      // El servicio de IA ya maneja el fallback automáticamente
      // Si llegamos aquí, significa que el fallback también falló
      console.log('🔄 El reporte de fallback también falló, generando reporte de emergencia...');
      
      try {
        // Generar un reporte de emergencia básico
        const emergencyReport = this.generateEmergencyReport(data);
        this.generatedStrategicReport.set(emergencyReport);
        console.log('✅ Reporte de emergencia generado exitosamente');
        console.log('📋 ID del reporte de emergencia:', emergencyReport?.id);
      } catch (emergencyError) {
        console.error('❌ Error generando reporte de emergencia:', emergencyError);
      }
      
      // Mostrar mensaje más amigable
      const isTimeoutError = error.message?.includes('timeout') || error.message?.includes('API tardó demasiado') || error.message?.includes('504');
      const errorMessage = isTimeoutError 
        ? '⚡ La IA está tomando más tiempo del esperado. Hemos generado tu diagnóstico usando nuestro sistema de análisis avanzado.'
        : `❌ Problema temporal con la IA. Tu diagnóstico se ha generado correctamente usando análisis alternativos.`;
      
      this.toastService.show('info', errorMessage);
      
      // Navegar a resultados de todos modos
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      console.log('🧭 Navegando a resultados...');
      console.log('🧭 URL de destino:', `/${languagePrefix}/diagnostico/resultados`);
      this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
    } finally {
      this.isGeneratingReport.set(false);
    }
  }

  /**
   * Genera un reporte de emergencia cuando todo falla
   */
  private generateEmergencyReport(data: any): any {
    console.log('🚨 Generando reporte de emergencia en el servicio de estado...');
    
    return {
      id: 'emergency-' + Date.now(),
      timestamp: new Date(),
      leadInfo: {
        name: data.lead?.name || 'Usuario',
        email: data.lead?.email || 'usuario@empresa.com',
        companyName: data.lead?.companyName || 'Empresa'
      },
      contexto: data,
      aresScores: {},
      competencyScores: [],
      companyContext: {
        industry: data.contexto?.industria || 'No especificada',
        size: data.contexto?.equipo ? `${data.contexto.equipo} personas` : 'No especificada',
        mainObjective: data.objetivo?.objetivo?.[0] || 'Mejorar capacidades en IA'
      },
      aiMaturity: {
        level: 'En Desarrollo',
        score: 50,
        summary: 'Tu organización se encuentra en un nivel de desarrollo en IA. Recomendamos continuar con el plan de acción para mejorar las capacidades.'
      },
      executiveSummary: 'Hemos generado un reporte básico basado en tu información. Para obtener un análisis más detallado, por favor intenta nuevamente más tarde.',
      strengthsAnalysis: [],
      weaknessesAnalysis: [],
      insights: [{
        title: 'Sistema de Análisis Temporal',
        description: 'Este reporte fue generado usando nuestro sistema de respaldo. Para obtener un análisis completo, intenta nuevamente.',
        type: 'Fortaleza Clave'
      }],
      actionPlan: [{
        area: 'Desarrollo de Competencias en IA',
        priority: 'Alta',
        timeline: '3-6 meses',
        description: 'Enfócate en desarrollar competencias básicas en IA para tu organización.',
        actions: [{
          accion: 'Capacitación Básica en IA',
          descripcion: 'Inicia con cursos básicos de IA para tu equipo.',
          timeline: '1-2 meses',
          recursos: ['Cursos online', 'Material educativo'],
          kpis: ['Nivel de conocimiento', 'Aplicación práctica'],
          expectedOutcome: 'Equipo con conocimientos básicos en IA',
          painPoint: 'Falta de conocimiento básico en IA',
          aresDimension: 'Agilidad'
        }]
      }],
      generatedAt: new Date(),
      version: '3.0.0-emergency'
    };
  }

  /**
   * NUEVO MÉTODO: Genera un reporte estratégico de alto nivel
   */
  async generateStrategicReport(): Promise<void> {
    if (this.isGeneratingReport()) return;
    
    const data = this.diagnosticData();
    if (!data) {
      this.toastService.show('error', 'No hay datos de diagnóstico.');
      return;
    }
    
    this.isGeneratingReport.set(true);
    
    try {
      console.log('🚀 Generando reporte comprehensivo con datos reales:', data);
      
      const comprehensiveReport = await this.besselAiService.generateComprehensiveReport(data);
      this.generatedStrategicReport.set(comprehensiveReport);
      
      this.toastService.show('success', 'Reporte estratégico generado correctamente.');
      
      // Navegar con prefijo de idioma
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
    } catch (error: any) {
      console.error('❌ Error al generar reporte estratégico:', error);
      this.toastService.show('error', `No se pudo generar el reporte estratégico: ${error.message || 'Error desconocido'}`);
    } finally {
      this.isGeneratingReport.set(false);
    }
  }
}