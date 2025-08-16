import { Injectable } from '@angular/core';
import { DiagnosticoFormValue } from '../data/diagnostic.models';

@Injectable({ providedIn: 'root' })
export class PdfService {
	async renderReport(elementId: string): Promise<Blob> {
		const el = document.getElementById(elementId);
		if (!el) throw new Error(`No se encontró el elemento #${elementId}`);
		// Carga dinámica para no afectar SSR
		const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
			import('html2canvas'),
			import('jspdf'),
		]);
		el.classList.add('pdf-render-mode');
		const canvas = await html2canvas(el, {
			scale: 2,
			backgroundColor: '#ffffff',
			useCORS: true,
		});
		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getPageHeight();
		const imgWidth = pageWidth;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;
		let y = 0;
		let remaining = imgHeight;
		// Paginado si excede una página
		while (remaining > 0) {
			pdf.addImage(imgData, 'PNG', 0, y ? 0 : 0, imgWidth, imgHeight);
			remaining -= pageHeight;
			if (remaining > 0) {
				pdf.addPage();
				y -= pageHeight;
			}
		}
		el.classList.remove('pdf-render-mode');
		const blob = pdf.output('blob');
		return blob as Blob;
	}

	async generatePdf(
		element: HTMLElement, 
		diagnosticData: DiagnosticoFormValue, 
		competencyResults: { name: string; score: number }[], 
		analysis: string
	): Promise<void> {
		try {
			const blob = await this.renderReport('pdf-content');
			
			// Crear enlace de descarga
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `diagnostico-${diagnosticData.lead?.nombre || 'usuario'}-${new Date().toISOString().split('T')[0]}.pdf`;
			
			// Descargar automáticamente
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
			// Limpiar URL
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error generando PDF:', error);
			alert('Error al generar el PDF. Por favor, intenta de nuevo.');
		}
	}
}


