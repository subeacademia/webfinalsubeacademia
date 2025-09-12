import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService, ToastKind } from '../../../core/ui/toast/toast.service';
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
  currentStep = signal(0);
  isGeneratingReport = signal(false);
  generatedReport = signal<Report | null>(null);
  generatedStrategicReport = signal<ReportData | null>(null);

  public state = computed(() => this.diagnosticData());

  public aresProgress = computed(() => {
    const answeredCount = Object.keys(this.diagnosticData().ares).length;
    const totalCount = aresQuestions.length;
    return { answered: answeredCount, total: totalCount, isComplete: answeredCount === totalCount };
  });

  public competenciasProgress = computed(() => {
    const answeredCount = Object.keys(this.diagnosticData().competencias).length;
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
      data.lead &&
      this.aresProgress().isComplete &&
      this.competenciasProgress().isComplete
    );
  }

  start(): void {
    this.reset();
    this.currentStep.set(1);
  }

  reset(): void {
    this.diagnosticData.set(JSON.parse(JSON.stringify(INITIAL_DIAGNOSTIC_DATA)));
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
   * Actualiza los datos del lead (información de contacto)
   */
  updateLead(leadData: any): void {
    this.diagnosticData.update(currentData => ({
      ...currentData,
      lead: leadData
    }));
  }

  nextStep(): void {
    this.currentStep.update(step => step + 1);
    
    // Navegar al siguiente paso basado en el paso actual
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/contexto')) {
      console.log('Navigating to ares');
      this.router.navigate(['/diagnostico/ares']);
    } else if (currentUrl.includes('/ares')) {
      console.log('Navigating to competencias');
      this.router.navigate(['/diagnostico/competencias']);
    } else if (currentUrl.includes('/competencias')) {
      console.log('Navigating to objetivo');
      this.router.navigate(['/diagnostico/objetivo']);
    } else if (currentUrl.includes('/objetivo')) {
      console.log('Navigating to finalizar');
      this.router.navigate(['/diagnostico/finalizar']);
    } else {
      console.log('No navigation match found for URL:', currentUrl);
    }
  }

  previousStep(): void {
    this.currentStep.update(step => step - 1);
  }

  // MÉTODO ELIMINADO: La lógica de generación y navegación se centraliza ahora en diagnostico.component.ts
  // Esto desacopla el servicio de estado de la lógica de aplicación y navegación

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
      // Usar cursos mock para evitar problemas de Firebase
      const cursosMock = [
        {
          id: '1',
          titulo: 'Curso de Introducción a la IA',
          descripcion: 'Aprende los conceptos básicos de la inteligencia artificial',
          precio: 99,
          duracion: '4 semanas',
          nivel: 'Principiante',
          activo: true
        }
      ];
      
      // Convertir los datos al formato esperado por BesselAiService
      const besselData = {
        profile: {
          industry: data.objetivo.industria,
          companySize: data.contexto?.equipo ? `${data.contexto.equipo} empleados` : 'No especificado',
          mainObjective: data.objetivo.objetivo
        },
        aresAnswers: data.ares,
        compAnswers: data.competencias,
        riskLevel: 'Mínimo',
        lambdaComp: 0.5,
        targetLevel: 4,
        selectedGoals: []
      };
      
      console.log('🚀 Generando reporte estratégico con datos:', besselData);
      
      const strategicReport = await this.besselAiService.generateStrategicReport(besselData, cursosMock);
      this.generatedStrategicReport.set(strategicReport);
      
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