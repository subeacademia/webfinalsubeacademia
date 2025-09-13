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

    // Crear el objeto lead con el tipo ya establecido
    const lead = {
      ...leadData,
      type: leadType
    };

    console.log('🔍 updateLead: lead creado:', lead);

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