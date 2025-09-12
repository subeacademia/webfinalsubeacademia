import { Injectable, signal, inject } from '@angular/core';
import { DiagnosticStateService } from './diagnostic-state.service';
import { DiagnosticsService } from './diagnostics.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticFlowService {
  private diagnosticStateService = inject(DiagnosticStateService);
  private diagnosticsService = inject(DiagnosticsService);
  private router = inject(Router);

  private isGeneratingReport = signal(false);

  // Subject para comunicar eventos entre componentes
  private diagnosticFinishedSubject = new Subject<void>();
  public diagnosticFinished$ = this.diagnosticFinishedSubject.asObservable();

  // Getter para el estado
  public get isGeneratingReportState() {
    return this.isGeneratingReport();
  }

  // Método para actualizar el estado
  public setGeneratingReport(value: boolean): void {
    this.isGeneratingReport.set(value);
  }

  // Método para emitir el evento de diagnóstico completado
  public emitDiagnosticFinished(): void {
    this.diagnosticFinishedSubject.next();
  }

  // Reset del estado
  public reset(): void {
    this.isGeneratingReport.set(false);
  }
}
