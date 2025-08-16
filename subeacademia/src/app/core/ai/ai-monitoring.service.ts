import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AIMonitoringData {
  requestId: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'completed' | 'error' | 'timeout';
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

@Injectable({
  providedIn: 'root'
})
export class AIMonitoringService {
  private readonly monitoringDataSubject = new BehaviorSubject<AIMonitoringData[]>([]);
  private readonly activeRequests = new Map<string, AIMonitoringData>();
  private readonly maxRetries = 2;
  private readonly maxConcurrentRequests = 3;

  readonly monitoringData$ = this.monitoringDataSubject.asObservable();

  /**
   * Inicia el monitoreo de una nueva solicitud de IA
   */
  startMonitoring(requestId: string): boolean {
    // Verificar límite de solicitudes concurrentes
    if (this.activeRequests.size >= this.maxConcurrentRequests) {
      console.warn(`Límite de solicitudes concurrentes alcanzado (${this.maxConcurrentRequests})`);
      return false;
    }

    // Verificar si ya existe una solicitud activa con el mismo ID
    if (this.activeRequests.has(requestId)) {
      console.warn(`Solicitud duplicada detectada: ${requestId}`);
      return false;
    }

    const monitoringData: AIMonitoringData = {
      requestId,
      startTime: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: this.maxRetries
    };

    this.activeRequests.set(requestId, monitoringData);
    this.updateMonitoringData();

    // Configurar timeout automático
    setTimeout(() => {
      this.handleTimeout(requestId);
    }, 35000); // 35 segundos (5 segundos más que el timeout de la API)

    return true;
  }

  /**
   * Marca una solicitud como completada
   */
  completeRequest(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.status = 'completed';
      request.endTime = Date.now();
      this.activeRequests.delete(requestId);
      this.updateMonitoringData();
    }
  }

  /**
   * Marca una solicitud como error
   */
  errorRequest(requestId: string, errorMessage: string): void {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.status = 'error';
      request.errorMessage = errorMessage;
      request.endTime = Date.now();
      this.activeRequests.delete(requestId);
      this.updateMonitoringData();
    }
  }

  /**
   * Incrementa el contador de reintentos
   */
  incrementRetry(requestId: string): boolean {
    const request = this.activeRequests.get(requestId);
    if (request && request.retryCount < request.maxRetries) {
      request.retryCount++;
      this.updateMonitoringData();
      return true;
    }
    return false;
  }

  /**
   * Maneja timeout de una solicitud
   */
  private handleTimeout(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (request && request.status === 'pending') {
      request.status = 'timeout';
      request.endTime = Date.now();
      this.activeRequests.delete(requestId);
      this.updateMonitoringData();
      console.warn(`Timeout detectado para solicitud: ${requestId}`);
    }
  }

  /**
   * Obtiene estadísticas de monitoreo
   */
  getMonitoringStats(): {
    activeRequests: number;
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    errorCount: number;
    timeoutCount: number;
  } {
    const allData = this.monitoringDataSubject.value;
    const active = this.activeRequests.size;
    const total = allData.length;
    const completed = allData.filter(d => d.status === 'completed').length;
    const errors = allData.filter(d => d.status === 'error').length;
    const timeouts = allData.filter(d => d.status === 'timeout').length;

    const responseTimes = allData
      .filter(d => d.endTime && d.status === 'completed')
      .map(d => (d.endTime! - d.startTime) / 1000);

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    return {
      activeRequests: active,
      totalRequests: total,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      averageResponseTime: avgResponseTime,
      errorCount: errors,
      timeoutCount: timeouts
    };
  }

  /**
   * Limpia datos antiguos de monitoreo
   */
  cleanupOldData(maxAge: number = 300000): void { // 5 minutos por defecto
    const now = Date.now();
    const currentData = this.monitoringDataSubject.value;
    const filteredData = currentData.filter(data => 
      !data.endTime || (now - data.endTime) < maxAge
    );
    
    this.monitoringDataSubject.next(filteredData);
  }

  /**
   * Actualiza los datos de monitoreo
   */
  private updateMonitoringData(): void {
    const allData = [
      ...Array.from(this.activeRequests.values()),
      ...this.monitoringDataSubject.value.filter(d => !this.activeRequests.has(d.requestId))
    ];
    
    this.monitoringDataSubject.next(allData);
  }

  /**
   * Verifica si hay problemas de rendimiento
   */
  checkPerformanceIssues(): {
    hasIssues: boolean;
    issues: string[];
  } {
    const stats = this.getMonitoringStats();
    const issues: string[] = [];

    if (stats.activeRequests >= this.maxConcurrentRequests) {
      issues.push('Demasiadas solicitudes concurrentes activas');
    }

    if (stats.successRate < 80) {
      issues.push('Tasa de éxito baja en solicitudes de IA');
    }

    if (stats.averageResponseTime > 25) {
      issues.push('Tiempo de respuesta promedio alto');
    }

    if (stats.timeoutCount > 0) {
      issues.push('Se detectaron timeouts en solicitudes de IA');
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  }
}
