import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DiagnosticStateService } from '../../features/diagnostico/services/diagnostic-state.service';

export interface DiagnosticFlowStep {
  step: string;
  timestamp: string;
  dataSnapshot: any;
  completionStatus: 'started' | 'completed' | 'failed';
  errors?: string[];
  metadata?: any;
}

export interface DiagnosticFlowLog {
  sessionId: string;
  startTime: string;
  endTime?: string;
  steps: DiagnosticFlowStep[];
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  finalStatus: 'in_progress' | 'completed' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticFlowLoggerService {
  private router = inject(Router);
  private diagnosticStateService = inject(DiagnosticStateService);
  
  private readonly logPrefix = '🔍 [DiagnosticFlow]';
  private sessionId = this.generateSessionId();
  private currentFlowLog!: DiagnosticFlowLog;
  private isTracking = false;

  constructor() {
    this.initializeFlowTracking();
  }

  private generateSessionId(): string {
    return `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeFlowTracking(): void {
    this.currentFlowLog = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      steps: [],
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      finalStatus: 'in_progress'
    };

    // Rastrear navegación entre pasos del diagnóstico
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url.includes('/diagnostico/')) {
        this.trackStepNavigation(event.url);
      }
    });

    this.logInfo('Servicio de rastreo de flujo de diagnóstico inicializado', {
      sessionId: this.sessionId,
      startTime: this.currentFlowLog.startTime
    });
  }

  public startTracking(): void {
    this.isTracking = true;
    this.logInfo('Iniciando rastreo del flujo de diagnóstico', {
      sessionId: this.sessionId
    });
  }

  public stopTracking(): void {
    this.isTracking = false;
    this.currentFlowLog.endTime = new Date().toISOString();
    this.currentFlowLog.finalStatus = this.calculateFinalStatus();
    
    this.logInfo('Rastreo del flujo de diagnóstico detenido', {
      sessionId: this.sessionId,
      finalStatus: this.currentFlowLog.finalStatus,
      totalSteps: this.currentFlowLog.totalSteps,
      completedSteps: this.currentFlowLog.completedSteps,
      failedSteps: this.currentFlowLog.failedSteps
    });

    this.generateFlowReport();
  }

  private trackStepNavigation(url: string): void {
    if (!this.isTracking) return;

    const step = this.extractStepFromUrl(url);
    if (step) {
      this.logStepStarted(step);
    }
  }

  private extractStepFromUrl(url: string): string | null {
    const diagnosticoMatch = url.match(/\/diagnostico\/([^\/\?]+)/);
    if (diagnosticoMatch) {
      return diagnosticoMatch[1];
    }
    return null;
  }

  public logStepStarted(step: string): void {
    if (!this.isTracking) return;

    const stepData = this.getStepData(step);
    const flowStep: DiagnosticFlowStep = {
      step,
      timestamp: new Date().toISOString(),
      dataSnapshot: stepData,
      completionStatus: 'started',
      metadata: {
        stepType: this.getStepType(step),
        previousStep: this.getPreviousStep(step),
        nextStep: this.getNextStep(step)
      }
    };

    this.currentFlowLog.steps.push(flowStep);
    this.currentFlowLog.totalSteps++;

    this.logInfo(`Paso iniciado: ${step}`, {
      sessionId: this.sessionId,
      step,
      stepData: this.sanitizeDataForLogging(stepData),
      stepNumber: this.currentFlowLog.totalSteps
    });
  }

  public logStepCompleted(step: string, result?: any): void {
    if (!this.isTracking) return;

    const existingStep = this.currentFlowLog.steps.find(s => s.step === step);
    if (existingStep) {
      existingStep.completionStatus = 'completed';
      existingStep.metadata = {
        ...existingStep.metadata,
        completionTime: new Date().toISOString(),
        result: this.sanitizeDataForLogging(result)
      };
    }

    this.currentFlowLog.completedSteps++;

    this.logInfo(`Paso completado: ${step}`, {
      sessionId: this.sessionId,
      step,
      result: this.sanitizeDataForLogging(result),
      completedSteps: this.currentFlowLog.completedSteps,
      totalSteps: this.currentFlowLog.totalSteps
    });
  }

  public logStepFailed(step: string, error: any): void {
    if (!this.isTracking) return;

    const existingStep = this.currentFlowLog.steps.find(s => s.step === step);
    if (existingStep) {
      existingStep.completionStatus = 'failed';
      existingStep.errors = [error.message || error.toString()];
      existingStep.metadata = {
        ...existingStep.metadata,
        failureTime: new Date().toISOString(),
        error: this.sanitizeDataForLogging(error)
      };
    }

    this.currentFlowLog.failedSteps++;

    this.logError(`Paso falló: ${step}`, {
      sessionId: this.sessionId,
      step,
      error: this.sanitizeDataForLogging(error),
      failedSteps: this.currentFlowLog.failedSteps,
      totalSteps: this.currentFlowLog.totalSteps
    });
  }

  public logDataValidation(step: string, data: any, validationResult: any): void {
    if (!this.isTracking) return;

    this.logInfo(`Validación de datos en paso: ${step}`, {
      sessionId: this.sessionId,
      step,
      dataSummary: this.getDataSummary(data),
      validationResult,
      timestamp: new Date().toISOString()
    });
  }

  public logApiCall(step: string, apiDetails: any, response?: any, error?: any): void {
    if (!this.isTracking) return;

    const logData = {
      sessionId: this.sessionId,
      step,
      apiDetails: {
        url: apiDetails.url,
        method: apiDetails.method,
        requestSize: apiDetails.requestSize,
        timestamp: new Date().toISOString()
      }
    };

    if (response) {
      this.logInfo(`Llamada a API exitosa en paso: ${step}`, {
        ...logData,
        response: this.sanitizeDataForLogging(response)
      });
    } else if (error) {
      this.logError(`Error en llamada a API en paso: ${step}`, {
        ...logData,
        error: this.sanitizeDataForLogging(error)
      });
    }
  }

  private getStepData(step: string): any {
    try {
      const currentData = this.diagnosticStateService.getDiagnosticData();
      return this.filterDataByStep(step, currentData);
    } catch (error) {
      this.logError(`Error al obtener datos del paso: ${step}`, { error });
      return null;
    }
  }

  private filterDataByStep(step: string, data: any): any {
    if (!data) return null;

    switch (step) {
      case 'inicio':
        return { step: 'inicio', timestamp: new Date().toISOString() };
      
      case 'contexto':
        return {
          industria: data.contexto?.industria,
          tamano: data.contexto?.tamano,
          presupuesto: data.contexto?.presupuesto
        };
      
      case 'ares':
        return {
          respuestasCount: Object.keys(data.ares?.respuestas || {}).length,
          fases: ['F1', 'F2', 'F3', 'F4', 'F5'].map(fase => ({
            fase,
            respuestas: Object.keys(data.ares?.respuestas || {}).filter(key => key.startsWith(fase.toLowerCase()))
          }))
        };
      
      case 'competencias':
        return {
          nivelesCount: Object.keys(data.competencias?.niveles || {}).length,
          grupos: ['1', '2', '3'].map(grupo => ({
            grupo,
            competencias: Object.keys(data.competencias?.niveles || {}).filter(key => key.startsWith(grupo))
          }))
        };
      
      case 'objetivo':
        return {
          objetivo: data.objetivo,
          prioridad: data.prioridad
        };
      
      case 'lead':
        return {
          nombre: data.lead?.nombre ? 'Proporcionado' : 'No proporcionado',
          email: data.lead?.email ? 'Proporcionado' : 'No proporcionado',
          telefono: data.lead?.telefono ? 'Proporcionado' : 'No proporcionado'
        };
      
      case 'resultados':
        return {
          hasAresData: !!data.ares?.respuestas,
          hasCompetenciasData: !!data.competencias?.niveles,
          hasLeadData: !!data.lead,
          hasContextData: !!data.contexto,
          hasObjetivo: !!data.objetivo
        };
      
      default:
        return { step, data: 'Datos no mapeados' };
    }
  }

  private getStepType(step: string): string {
    const stepTypes: Record<string, string> = {
      'inicio': 'navigation',
      'contexto': 'data_collection',
      'ares': 'assessment',
      'competencias': 'assessment',
      'objetivo': 'data_collection',
      'lead': 'data_collection',
      'resultados': 'processing'
    };
    return stepTypes[step] || 'unknown';
  }

  private getPreviousStep(step: string): string | null {
    const stepFlow: Record<string, string | null> = {
      'inicio': null,
      'contexto': 'inicio',
      'ares': 'contexto',
      'competencias': 'ares',
      'objetivo': 'competencias',
      'lead': 'objetivo',
      'resultados': 'lead'
    };
    return stepFlow[step] || null;
  }

  private getNextStep(step: string): string | null {
    const stepFlow: Record<string, string | null> = {
      'inicio': 'contexto',
      'contexto': 'ares',
      'ares': 'competencias',
      'competencias': 'objetivo',
      'objetivo': 'lead',
      'lead': 'resultados',
      'resultados': null
    };
    return stepFlow[step] || null;
  }

  private calculateFinalStatus(): 'in_progress' | 'completed' | 'failed' {
    if (this.currentFlowLog.failedSteps > 0) {
      return 'failed';
    } else if (this.currentFlowLog.completedSteps === this.currentFlowLog.totalSteps) {
      return 'completed';
    } else {
      return 'in_progress';
    }
  }

  private generateFlowReport(): void {
    const report = {
      sessionId: this.currentFlowLog.sessionId,
      summary: {
        totalSteps: this.currentFlowLog.totalSteps,
        completedSteps: this.currentFlowLog.completedSteps,
        failedSteps: this.currentFlowLog.failedSteps,
        successRate: `${((this.currentFlowLog.completedSteps / this.currentFlowLog.totalSteps) * 100).toFixed(2)}%`
      },
      timeline: this.currentFlowLog.steps.map(step => ({
        step: step.step,
        timestamp: step.timestamp,
        status: step.completionStatus,
        duration: step.metadata?.completionTime ? 
          new Date(step.metadata.completionTime).getTime() - new Date(step.timestamp).getTime() : null
      })),
      errors: this.currentFlowLog.steps
        .filter(step => step.errors && step.errors.length > 0)
        .map(step => ({
          step: step.step,
          errors: step.errors
        }))
    };

    this.logInfo('Reporte del flujo de diagnóstico generado', {
      sessionId: this.sessionId,
      report
    });

    // Guardar en localStorage para debugging
    try {
      localStorage.setItem(`diagnostic_flow_${this.sessionId}`, JSON.stringify(report));
    } catch (error) {
      this.logError('Error al guardar reporte en localStorage', { error });
    }
  }

  private sanitizeDataForLogging(data: any): any {
    if (!data) return null;
    
    // Remover información sensible
    const sensitiveFields = ['email', 'telefono', 'password', 'token'];
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const removeSensitiveData = (obj: any): any => {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (sensitiveFields.includes(key.toLowerCase())) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            removeSensitiveData(obj[key]);
          }
        }
      }
      return obj;
    };

    return removeSensitiveData(sanitized);
  }

  private getDataSummary(data: any): any {
    if (!data) return 'Sin datos';
    
    if (typeof data === 'object') {
      return {
        type: 'object',
        keys: Object.keys(data),
        size: JSON.stringify(data).length
      };
    }
    
    return {
      type: typeof data,
      value: data
    };
  }

  // Métodos de logging
  private logInfo(message: string, data?: any): void {
    console.log(`${this.logPrefix} ℹ️ ${message}`, data || '');
  }

  private logError(message: string, data?: any): void {
    console.error(`${this.logPrefix} ❌ ${message}`, data || '');
  }

  private logWarning(message: string, data?: any): void {
    console.warn(`${this.logPrefix} ⚠️ ${message}`, data || '');
  }

  // Métodos públicos para uso externo
  public getCurrentFlowLog(): DiagnosticFlowLog {
    return { ...this.currentFlowLog };
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.initializeFlowTracking();
    this.logInfo('Nueva sesión de diagnóstico iniciada', { sessionId: this.sessionId });
  }

  public exportFlowLog(): string {
    return JSON.stringify(this.currentFlowLog, null, 2);
  }
}
