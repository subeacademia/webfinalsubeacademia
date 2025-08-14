import { Injectable } from '@angular/core';

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
		const pageHeight = pdf.internal.pageSize.getHeight();
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
}


