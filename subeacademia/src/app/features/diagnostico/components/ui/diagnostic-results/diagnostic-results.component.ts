import { Component, OnInit, inject, signal, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { DiagnosticReport } from '../../../data/report.model';
import { DiagnosticChartsComponent } from '../diagnostic-charts/diagnostic-charts.component';
import { PdfService } from '../../../services/pdf.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DiagnosticoFormValue } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, DiagnosticChartsComponent],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css', './diagnostic-results.print.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DiagnosticResultsComponent implements OnInit {
  private diagnosticStateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private pdfService = inject(PdfService);
  private cdr = inject(ChangeDetectorRef);
  private generativeAiService = inject(GenerativeAiService);
  private sanitizer = inject(DomSanitizer);

  report = signal<DiagnosticReport | null>(null);
  aiGeneratedContent = signal<SafeHtml | null>(null);
  isLoadingAi = signal<boolean>(true);
  errorAi = signal<string | null>(null);
  rawDiagnosticData = signal<string>('');
  currentDate = new Date();

  ngOnInit(): void {
    const currentData = this.diagnosticStateService.getDiagnosticData();
    // Guardamos una copia del JSON para verificación
    this.rawDiagnosticData.set(JSON.stringify(currentData, null, 2)); 
    
    // Crear un reporte básico compatible con la interfaz DiagnosticReport
    const reportData: DiagnosticReport = {
      titulo_informe: 'Diagnóstico de Madurez en IA',
      resumen_ejecutivo: 'Reporte generado automáticamente',
      analisis_ares: [],
      plan_de_accion: []
    };
    this.report.set(reportData);

    this.generateReportWithAI();
  }

  async generateReportWithAI(): Promise<void> {
    this.isLoadingAi.set(true);
    this.errorAi.set(null);
    const diagnosticData = this.diagnosticStateService.getDiagnosticData();

    try {
      const markdownContent = await this.generativeAiService.generateActionPlan(diagnosticData);

      if (markdownContent.includes('Error al Generar')) {
          this.errorAi.set(markdownContent);
      } else {
          this.aiGeneratedContent.set(this.sanitizer.bypassSecurityTrustHtml(markdownContent));
      }

    } catch (error) {
      console.error('Error capturado en el componente:', error);
      this.errorAi.set('Ocurrió un error inesperado al conectar con el servicio de IA. Por favor, intenta de nuevo.');
    } finally {
      this.isLoadingAi.set(false);
      this.cdr.detectChanges();
    }
  }

  printResults(): void {
    const reportElement = document.getElementById('report-content');
    const diagnosticData = this.diagnosticStateService.getDiagnosticData();
    const leadName = diagnosticData?.lead?.nombre || diagnosticData?.form?.lead?.nombre || 'Usuario';
    
    if (reportElement) {
      const fileName = `Reporte_SUBE_Academia_${leadName.replace(/\s/g, '_')}.pdf`;
      // Usar el método correcto del PdfService
      this.pdfService.generateDiagnosticReport(
        this.report() || {
          titulo_informe: 'Diagnóstico de Madurez en IA',
          resumen_ejecutivo: 'Reporte generado automáticamente',
          analisis_ares: [],
          plan_de_accion: []
        },
        diagnosticData,
        reportElement
      );
    } else {
      console.error('No se pudo encontrar el elemento del reporte.');
    }
  }
}
