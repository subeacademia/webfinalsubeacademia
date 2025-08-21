import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CertificateService } from '../services/certificate.service';
import { Certificate } from '../../../core/models';

@Component({
	selector: 'app-certificate-validator',
	standalone: true,
	imports: [CommonModule],
	template: `
	<div class="container mx-auto p-8 min-h-[60vh] flex items-center justify-center text-gray-100">
	  <div *ngIf="isLoading" class="text-center">
	    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mb-3"></div>
	    <p class="text-xl text-gray-200">Verificando certificado...</p>
	  </div>
	  <div *ngIf="!isLoading" class="w-full max-w-2xl">
	    <div *ngIf="certificate" class="result-card opacity-0 bg-gray-800 p-8 rounded-lg border border-green-500 shadow-lg">
	      <h2 class="text-3xl font-bold text-green-400 mb-4">Certificado Válido</h2>
	      <div class="space-y-3 text-lg">
	        <p><strong>Estudiante:</strong> {{ certificate.studentName }}</p>
	        <p><strong>Programa:</strong> {{ certificate.courseName }}</p>
	        <p><strong>Fecha de Finalización:</strong> {{ certificate.completionDate.toDate() | date:'longDate' }}</p>
	        <p class="font-mono text-sm text-gray-400 pt-4"><strong>Código Verificado:</strong> {{ validationCode }}</p>
	      </div>
	    </div>
	    <div *ngIf="error" class="result-card opacity-0 bg-gray-800 p-8 rounded-lg border border-red-500 shadow-lg">
	      <h2 class="text-3xl font-bold text-red-400 mb-4">Error de Validación</h2>
	      <p class="text-lg">{{ error }}</p>
	      <p class="font-mono text-sm text-gray-400 pt-4"><strong>Código Ingresado:</strong> {{ validationCode }}</p>
	    </div>
	    <div *ngIf="!certificate && !error" class="bg-gray-800 p-6 rounded-lg border border-gray-700">
	      <p class="text-gray-300">No hay información para mostrar.</p>
	    </div>
	  </div>
	</div>
	`
})
export class CertificateValidatorComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private certService = inject(CertificateService);

	certificate: Certificate | null = null;
	isLoading = true;
	error = '';
	validationCode = '';

	ngOnInit(): void {
		const code = this.route.snapshot.paramMap.get('code');
		this.validationCode = code || 'N/A';
		if (code) {
			this.verifyCertificate(code);
		} else {
			this.isLoading = false;
			this.error = 'No se proporcionó un código de certificado en la URL.';
		}
	}

	async verifyCertificate(code: string) {
		this.isLoading = true;
		try {
			const result = await this.certService.getCertificateByCode(code);
			if (result.exists) {
				this.certificate = result.data as Certificate;
				this.error = '';
			} else {
				this.error = 'El código de validación no corresponde a ningún certificado emitido.';
				this.certificate = null;
			}
		} catch (e) {
			this.error = 'Ocurrió un error al intentar validar el certificado. Por favor, inténtalo de nuevo.';
			console.error(e);
		} finally {
			this.isLoading = false;
			this.animateResult();
		}
	}

	animateResult() {
		setTimeout(() => {
			const w = (globalThis as any);
			const anime = w && w.anime ? w.anime : null;
			if (anime) {
				anime({ targets: '.result-card', opacity: [0, 1], translateY: [20, 0], duration: 900, easing: 'easeOutExpo' });
			} else {
				// Fallback: mostrar el resultado sin animación si anime.js no está disponible
				const cards = document.querySelectorAll('.result-card');
				cards.forEach((el) => {
					(el as HTMLElement).style.opacity = '1';
					(el as HTMLElement).style.transform = 'translateY(0)';
				});
			}
		}, 100);
	}
}


