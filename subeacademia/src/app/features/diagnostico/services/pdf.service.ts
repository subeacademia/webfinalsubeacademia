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

  async generateDiagnosticPDF(diagnosticData: any, aiAnalysis: any, leadName: string): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      let yPosition = margin;
      
      // Encabezado con diseño mejorado
      doc.setFillColor(59, 130, 246); // Blue-600
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Título principal en el encabezado
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnóstico de Madurez en IA', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 50;
      
      // Información del lead con diseño de tarjeta
      doc.setFillColor(248, 250, 252); // Gray-50
      doc.rect(margin, yPosition, contentWidth, 25, 'F');
      doc.setDrawColor(226, 232, 240); // Gray-200
      doc.rect(margin, yPosition, contentWidth, 25, 'S');
      
      doc.setTextColor(31, 41, 55); // Gray-800
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Preparado para: ${leadName}`, margin + 10, yPosition + 8);
      
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 10, yPosition + 18);
      
      yPosition += 35;
      
      // Información de la empresa
      if (diagnosticData?.contexto) {
        const industry = diagnosticData.contexto.industria || 'No especificado';
        const size = diagnosticData.contexto.tamanoEquipo || diagnosticData.contexto.tamanoEmpresa || 'No especificado';
        
        doc.setFillColor(241, 245, 249); // Gray-100
        doc.rect(margin, yPosition, contentWidth, 20, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, yPosition, contentWidth, 20, 'S');
        
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Industria: ${industry}`, margin + 10, yPosition + 8);
        doc.text(`Tamaño: ${size}`, margin + 10, yPosition + 16);
        
        yPosition += 30;
      }
      
      // Puntajes generales
      if (diagnosticData) {
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen de Puntajes:', margin, yPosition);
        yPosition += 10;
        
        // Calcular puntajes
        const aresScores = Object.values(diagnosticData.ares?.respuestas || {}).map(v => (v as number) * 20);
        const aresAverage = aresScores.length > 0 ? aresScores.reduce((sum, score) => sum + score, 0) / aresScores.length : 0;
        
        const competencyScores = Object.values(diagnosticData.competencias?.niveles || {}).map(v => {
          const nivel = v as string;
          const nivelMap: Record<string, number> = {
            'incipiente': 20, 'basico': 40, 'intermedio': 60, 'avanzado': 80, 'lider': 100
          };
          return nivelMap[nivel] || 0;
        });
        const competencyAverage = competencyScores.length > 0 ? competencyScores.reduce((sum, score) => sum + score, 0) / competencyScores.length : 0;
        
        const overallScore = Math.round((aresAverage + competencyAverage) / 2);
        
        // Mostrar puntajes en una tabla
        const scores = [
          ['Métrica', 'Puntaje', 'Nivel'],
          ['Framework ARES-AI', `${Math.round(aresAverage)}%`, this.getMaturityLevel(aresAverage)],
          ['Competencias Clave', `${Math.round(competencyAverage)}%`, this.getMaturityLevel(competencyAverage)],
          ['Puntaje General', `${overallScore}%`, this.getMaturityLevel(overallScore)]
        ];
        
        this.drawTable(doc, scores, margin, yPosition, contentWidth);
        yPosition += 50;
      }
      
      // Análisis de IA
      if (aiAnalysis && aiAnalysis.analysis) {
        doc.setFontSize(16);
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.text('Análisis y Plan de Acción:', margin, yPosition);
        yPosition += 10;
        
        // Convertir markdown a texto simple y dividir en líneas
        const analysisText = this.markdownToText(aiAnalysis.analysis);
        const lines = this.splitTextIntoLines(analysisText, contentWidth, doc);
        
        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);
        doc.setFont('helvetica', 'normal');
        
        for (const line of lines) {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
      }
      
      // Guardar PDF
      const fileName = `diagnostico-ia-${leadName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('No se pudo generar el PDF del diagnóstico');
    }
  }

  private drawTable(doc: jsPDF, data: string[][], x: number, y: number, width: number): void {
    const rowHeight = 8;
    const colWidth = width / data[0].length;
    
    // Dibujar encabezados
    doc.setFillColor(59, 130, 246);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    for (let i = 0; i < data[0].length; i++) {
      doc.rect(x + (i * colWidth), y, colWidth, rowHeight, 'F');
      doc.text(data[0][i], x + (i * colWidth) + 2, y + 6);
    }
    
    // Dibujar filas de datos
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    
    for (let row = 1; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        doc.rect(x + (col * colWidth), y + (row * rowHeight), colWidth, rowHeight, 'S');
        doc.text(data[row][col], x + (col * colWidth) + 2, y + (row * rowHeight) + 6);
      }
    }
  }

  private getMaturityLevel(score: number): string {
    if (score >= 80) return 'Líder';
    if (score >= 60) return 'Avanzado';
    if (score >= 40) return 'Intermedio';
    if (score >= 20) return 'Básico';
    return 'Incipiente';
  }

  private markdownToText(markdown: string): string {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remover negritas
      .replace(/\*(.*?)\*/g, '$1')     // Remover cursivas
      .replace(/### (.*?)\n/g, '$1\n') // Remover encabezados H3
      .replace(/## (.*?)\n/g, '$1\n')  // Remover encabezados H2
      .replace(/# (.*?)\n/g, '$1\n')   // Remover encabezados H1
      .replace(/`(.*?)`/g, '$1')       // Remover código inline
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remover enlaces
  }

  private splitTextIntoLines(text: string, maxWidth: number, doc: jsPDF): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
}


