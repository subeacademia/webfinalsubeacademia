import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  public exportElementToPdf(elementId: string, fileName: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const opt = {
        margin:       1,
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    } else {
      console.error(`Element with id ${elementId} not found.`);
    }
  }

  // Métodos de compatibilidad para el sistema anterior
  public generateDiagnosticReport(report: any, scores?: any, element?: any): void {
    // Método de compatibilidad - usar el método principal
    const defaultFileName = `diagnostico-ares-ai-${new Date().toISOString().split('T')[0]}.pdf`;
    this.exportElementToPdf('pdf-content', defaultFileName);
  }

  public async generateDiagnosticPDF(data: any, fileName?: string): Promise<void> {
    // Método de compatibilidad - usar el método principal
    const defaultFileName = fileName || `diagnostico-ares-ai-${new Date().toISOString().split('T')[0]}.pdf`;
    this.exportElementToPdf('pdf-content', defaultFileName);
  }
}