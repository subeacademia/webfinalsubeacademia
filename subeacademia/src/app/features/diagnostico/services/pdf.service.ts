import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DiagnosticReport } from '../data/report.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  async generateDiagnosticReport(
    report: DiagnosticReport, 
    scores: any, 
    elementToCapture: HTMLElement
  ): Promise<void> {
    try {
      console.log('🚀 Iniciando generación de PDF...');
      
      // Crear nuevo PDF con márgenes y tipografía consistentes
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = { top: 20, right: 15, bottom: 18, left: 15 };
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - margin.left - margin.right;

      // Renderizar encabezado común
      const renderHeader = (pageNumber: number) => {
        pdf.setFontSize(16);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Informe de Diagnóstico de IA', pageWidth / 2, margin.top - 5, { align: 'center' });
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, margin.top + 1, { align: 'center' });
      };

      // Renderizar pie de página con numeración
      const renderFooter = (pageNumber: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        pdf.text('Generado por Sube Academ-IA', pageWidth - margin.right, pageHeight - 8, { align: 'right' });
      };

      let currentPage = 1;
      renderHeader(currentPage);
      renderFooter(currentPage);

      // Buscar secciones marcadas para evitar cortes (data-pdf-section)
      const sections = elementToCapture.querySelectorAll('[data-pdf-section]');
      const targets: HTMLElement[] = sections.length ? Array.from(sections) as HTMLElement[] : [elementToCapture];

      for (let i = 0; i < targets.length; i++) {
        const section = targets[i];
        // Capturar la sección como imagen con alta resolución
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');

        // Calcular tamaño manteniendo aspecto y dentro de márgenes
        const imgPxWidth = canvas.width;
        const imgPxHeight = canvas.height;
        const imgAspect = imgPxWidth / imgPxHeight;
        let renderW = contentWidth;
        let renderH = renderW / imgAspect;
        const maxHeight = pageHeight - margin.top - margin.bottom;
        if (renderH > maxHeight) {
          renderH = maxHeight;
          renderW = renderH * imgAspect;
        }

        // Si no es la primera sección, añadir nueva página con header/footer
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          renderHeader(currentPage);
          renderFooter(currentPage);
        }

        // Centrar la imagen en el área de contenido
        const x = margin.left + (contentWidth - renderW) / 2;
        const y = margin.top + 8; // pequeño offset bajo el encabezado
        pdf.addImage(imgData, 'PNG', x, y, renderW, renderH, undefined, 'FAST');
      }

      // Añadir página de resumen ejecutivo
      pdf.addPage();
      currentPage++;
      renderHeader(currentPage);
      this.addExecutiveSummary(pdf, report);
      renderFooter(currentPage);

      // Añadir página de plan de acción
      pdf.addPage();
      currentPage++;
      renderHeader(currentPage);
      this.addActionPlan(pdf, report);
      renderFooter(currentPage);
      
      // Añadir página de métricas
      pdf.addPage();
      currentPage++;
      renderHeader(currentPage);
      this.addMetricsPage(pdf, scores);
      renderFooter(currentPage);

      // Guardar el PDF con nombre más descriptivo
      const fileName = `diagnostico-subeacademia-${new Date().toISOString().slice(0,10)}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generado exitosamente:', fileName);
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      throw error;
    }
  }

  private addExecutiveSummary(pdf: jsPDF, report: DiagnosticReport): void {
    // Título de la página
    pdf.setFontSize(18);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Resumen Ejecutivo', 20, 20);

    // Resumen ejecutivo
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    const summaryText = report.resumen_ejecutivo || 'No hay resumen ejecutivo disponible.';
    const splitText = pdf.splitTextToSize(summaryText, 170);
    pdf.text(splitText, 20, 40);

    // Solo mostrar título del informe si existe y es diferente del resumen
    if (report.titulo_informe && report.titulo_informe !== summaryText) {
      pdf.setFontSize(16);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Información Adicional', 20, 80);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(report.titulo_informe, 20, 95);
    }
  }

  private addActionPlan(pdf: jsPDF, report: DiagnosticReport): void {
    // Título de la página
    pdf.setFontSize(18);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Plan de Acción', 20, 20);

    let yPosition = 40;
    
    if (report.plan_de_accion && report.plan_de_accion.length > 0) {
      report.plan_de_accion.forEach((plan, index) => {
        // Área de mejora
        pdf.setFontSize(14);
        pdf.setTextColor(239, 68, 68); // Red color
        pdf.text(`${index + 1}. ${plan.area_mejora}`, 20, yPosition);
        yPosition += 10;

        // Descripción del problema
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        const problemText = pdf.splitTextToSize(plan.descripcion_problema || 'Sin descripción', 170);
        pdf.text(problemText, 25, yPosition);
        yPosition += problemText.length * 5 + 10;

        // Acciones recomendadas
        if (plan.acciones_recomendadas && plan.acciones_recomendadas.length > 0) {
          pdf.setFontSize(12);
          pdf.setTextColor(59, 130, 246);
          pdf.text('Acciones Recomendadas:', 25, yPosition);
          yPosition += 8;

          plan.acciones_recomendadas.forEach((accion, accionIndex) => {
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`• ${accion.accion}`, 30, yPosition);
            yPosition += 6;

            if (accion.detalle) {
              const detailText = pdf.splitTextToSize(accion.detalle, 150);
              pdf.text(detailText, 35, yPosition);
              yPosition += detailText.length * 5 + 5;
            }
          });
        }

        yPosition += 15;

        // Si no hay espacio suficiente, añadir nueva página
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    } else {
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text('No hay plan de acción disponible.', 20, yPosition);
    }
  }

  private addMetricsPage(pdf: jsPDF, scores: any): void {
    // Título de la página
    pdf.setFontSize(18);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Métricas del Diagnóstico', 20, 20);

    let yPosition = 40;

    // Métricas de competencias
    if (scores?.competencias) {
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Competencias Clave:', 20, yPosition);
      yPosition += 10;

      // Verificar si competencias es un array o un objeto
      if (Array.isArray(scores.competencias)) {
        // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
        scores.competencias.forEach((comp: any) => {
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          
          // Obtener el nombre de la competencia usando COMPETENCIAS
          const competencyName = comp.competenciaId || comp.name || 'Competencia';
          const score = typeof comp.puntaje === 'number' ? comp.puntaje : 0;
          const level = comp.nivel || 'N/A';
          
          pdf.text(`${competencyName}: ${score}/100 (${level})`, 20, yPosition);
          yPosition += 8;
        });
      } else {
        // Fallback para formato de objeto
        Object.entries(scores.competencias).forEach(([name, score]) => {
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          const scoreValue = typeof score === 'number' ? score : 0;
          pdf.text(`${name}: ${scoreValue}/100`, 20, yPosition);
          yPosition += 8;
        });
      }
    }

    yPosition += 10;

    // Métricas ARES
    if (scores?.ares) {
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Fases ARES:', 20, yPosition);
      yPosition += 10;

      Object.entries(scores.ares).forEach(([phase, score]) => {
        if (phase !== 'promedio' && phase !== 'total') {
          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          const scoreValue = typeof score === 'number' ? score : 0;
          pdf.text(`${phase}: ${scoreValue}/100`, 20, yPosition);
          yPosition += 8;
        }
      });

      // Mostrar puntaje total
      if (scores.ares.total) {
        yPosition += 5;
        pdf.setFontSize(12);
        pdf.setTextColor(59, 130, 246);
        pdf.text(`Puntaje Total: ${scores.ares.total}/100`, 20, yPosition);
      }
    }

    // Pie de página
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Generado por Sube Academ-IA - Herramienta de Diagnóstico de IA', 105, 280, { align: 'center' });
  }

  async captureElementAsImage(element: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al capturar elemento:', error);
      throw error;
    }
  }
}


