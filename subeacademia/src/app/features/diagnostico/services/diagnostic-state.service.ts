import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService, ToastKind } from '../../../core/ui/toast/toast.service';
import { DiagnosticData, INITIAL_DIAGNOSTIC_DATA, Answer } from '../data/diagnostic.models';
import { Report } from '../data/report.model';
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
  private toastService = inject(ToastService);
  private besselAiService = inject(BesselAiService);
  private diagnosticsService = inject(DiagnosticsService);
  private cursosService = inject(CursosService);

  private diagnosticData = signal<DiagnosticData>(JSON.parse(JSON.stringify(INITIAL_DIAGNOSTIC_DATA)));
  currentStep = signal(0);
  isGeneratingReport = signal(false);
  generatedReport = signal<Report | null>(null);

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

  nextStep(): void {
    this.currentStep.update(step => step + 1);
  }

  previousStep(): void {
    this.currentStep.update(step => step - 1);
  }

  async generateReportAndNavigate(): Promise<void> {
    const data = this.diagnosticData();
    if (!data) {
      this.toastService.show('error', 'No hay datos de diagnóstico.');
      return;
    }
    this.isGeneratingReport.set(true);
    try {
      const cursos = await firstValueFrom(this.cursosService.getCursos().pipe(take(1)));
      
      // Convertir los datos al formato esperado por BesselAiService
      const besselData = {
        profile: {
          industry: data.objetivo.industria,
          role: data.objetivo.rol,
          objective: data.objetivo.objetivo
        },
        aresAnswers: data.ares,
        compAnswers: data.competencias,
        riskLevel: 'Mínimo', // Valor por defecto
        lambdaComp: 0.5, // Valor por defecto
        targetLevel: 4, // Valor por defecto
        selectedGoals: [] // Array vacío por defecto
      };
      
      const report = await this.besselAiService.generateReport(besselData, cursos);
      this.generatedReport.set(report);
      const docId = await this.diagnosticsService.saveDiagnosticResult(data, report);
      this.toastService.show('success', 'Reporte generado.');
      this.router.navigate(['/diagnostico/resultados', docId]);
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      this.toastService.show('error', `No se pudo generar el reporte: ${error.message || 'Error desconocido'}`);
    } finally {
      this.isGeneratingReport.set(false);
    }
  }
}