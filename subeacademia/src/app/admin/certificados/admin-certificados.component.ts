import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Certificate } from '../../core/models';
import { CertificateService } from '../../features/productos/services/certificate.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
	selector: 'app-admin-certificados',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
	<div class="space-y-6">
	  <div class="flex items-center justify-between">
	    <h1 class="text-2xl font-bold">Emisión de Certificados</h1>
	    <button (click)="seedExamples()" class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700">Cargar Ejemplos</button>
	  </div>

	  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
	    <h2 class="text-lg font-semibold mb-4">Emitir nuevo certificado</h2>
	    <form (ngSubmit)="emit()" class="grid md:grid-cols-2 gap-4">
	      <div>
	        <label class="block text-sm mb-1">Nombre del Estudiante</label>
	        <input class="w-full px-3 py-2 rounded border" [(ngModel)]="form.studentName" name="studentName" required />
	      </div>
	      <div>
	        <label class="block text-sm mb-1">Nombre del Curso</label>
	        <input class="w-full px-3 py-2 rounded border" [(ngModel)]="form.courseName" name="courseName" required />
	      </div>
	      <div>
	        <label class="block text-sm mb-1">Fecha de Finalización</label>
	        <input type="date" class="w-full px-3 py-2 rounded border" [(ngModel)]="form.dateHtml" name="dateHtml" required />
	      </div>
	      <div>
	        <label class="block text-sm mb-1">Código Único</label>
	        <input class="w-full px-3 py-2 rounded border font-mono" [(ngModel)]="form.certificateCode" name="certificateCode" required />
	      </div>
	      <div class="md:col-span-2 flex gap-3 mt-2">
	        <button type="submit" class="px-4 py-2 rounded bg-green-600 text-white">Emitir</button>
	        <span *ngIf="status" [class.text-green-700]="ok" [class.text-red-700]="!ok">{{ status }}</span>
	      </div>
	    </form>
	  </div>

	  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
	    <h2 class="text-lg font-semibold mb-4">Certificados emitidos</h2>
	    <div class="overflow-x-auto">
	      <table class="min-w-full text-sm">
	        <thead>
	          <tr class="text-left">
	            <th class="px-3 py-2">Estudiante</th>
	            <th class="px-3 py-2">Curso</th>
	            <th class="px-3 py-2">Fecha</th>
	            <th class="px-3 py-2">Código</th>
	            <th class="px-3 py-2">Acciones</th>
	          </tr>
	        </thead>
	        <tbody>
	          <tr *ngFor="let c of certificates">
	            <td class="px-3 py-2">{{ c.studentName }}</td>
	            <td class="px-3 py-2">{{ c.courseName }}</td>
	            <td class="px-3 py-2">{{ c.completionDate.toDate() | date:'mediumDate' }}</td>
	            <td class="px-3 py-2 font-mono">{{ c.certificateCode }}</td>
	            <td class="px-3 py-2">
	              <a class="text-blue-600 hover:underline" [href]="'/es/productos/certificaciones/validar/' + c.certificateCode" target="_blank">Validar</a>
	              <button class="ml-3 text-red-600" (click)="remove(c.id)">Eliminar</button>
	            </td>
	          </tr>
	          <tr *ngIf="certificates.length === 0">
	            <td colspan="5" class="px-3 py-6 text-center text-gray-500">Sin certificados emitidos</td>
	          </tr>
	        </tbody>
	      </table>
	    </div>
	  </div>
	</div>
	`
})
export class AdminCertificadosComponent {
	certificates: (Certificate & { id: string })[] = [];
	form: any = { studentName: '', courseName: '', dateHtml: '', certificateCode: '' };
	status = '';
	ok = false;

	constructor(private svc: CertificateService) {
		this.refresh();
	}

	async refresh() {
		this.svc.getAllCertificates().subscribe(list => this.certificates = list);
	}

	async emit() {
		this.status = '';
		this.ok = false;
		try {
			const { studentName, courseName, dateHtml, certificateCode } = this.form;
			const ts = Timestamp.fromDate(new Date(dateHtml));
			await this.svc.createCertificate({ studentName, courseName, completionDate: ts, certificateCode });
			this.status = 'Certificado emitido';
			this.ok = true;
			this.form = { studentName: '', courseName: '', dateHtml: '', certificateCode: '' };
			this.refresh();
		} catch (e) {
			console.error(e);
			this.status = 'Error al emitir';
			this.ok = false;
		}
	}

	async remove(id?: string) {
		if (!id) return;
		await this.svc.deleteCertificate(id);
		this.refresh();
	}

	async seedExamples() {
		const today = new Date();
		const samples: Omit<Certificate, 'id'>[] = [
			{ studentName: 'Ana Pérez', courseName: 'Introducción a la IA', completionDate: Timestamp.fromDate(today), certificateCode: 'CERT-IA-0001' },
			{ studentName: 'Luis García', courseName: 'IA para Marketing', completionDate: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()-7)), certificateCode: 'CERT-IA-0002' },
			{ studentName: 'María López', courseName: 'Aprendizaje Automático', completionDate: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()-30)), certificateCode: 'CERT-IA-0003' },
		];
		for (const s of samples) { await this.svc.createCertificate(s); }
		this.refresh();
	}
}


