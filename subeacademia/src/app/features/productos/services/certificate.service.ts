import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDocs, collection, addDoc, query, where, limit, orderBy, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Certificate } from '../../../core/models';
import { CertificateGeneratorService } from '../../../core/services/certificate-generator.service';

@Injectable({ providedIn: 'root' })
export class CertificateService {
	private firestore: Firestore = inject(Firestore);
	private certificateGenerator = inject(CertificateGeneratorService);
	private certificatesCollection = collection(this.firestore, 'certificates');

	async getCertificateByCode(code: string) {
		const q = query(this.certificatesCollection, where('certificateCode', '==', code), limit(1));
		const querySnapshot = await getDocs(q);
		if (!querySnapshot.empty) {
			const docSnap = querySnapshot.docs[0];
			const certificate = docSnap.data() as Certificate;
			
			// Validar integridad del certificado
			const isValid = this.certificateGenerator.isCertificateValid(certificate);
			
			return { 
				exists: true, 
				data: certificate, 
				id: docSnap.id,
				isValid: isValid
			};
		}
		return { exists: false, data: null, id: null, isValid: false };
	}

	async createCertificate(certificateData: {
		studentName: string;
		courseName: string;
		completionDate: Date;
		grade?: number;
		instructorName?: string;
		courseDuration?: string;
		certificateType?: 'completion' | 'achievement' | 'participation';
		issuerEmail?: string;
		issuerName?: string;
	}) {
		// Generar certificado completo con códigos de seguridad
		const completeCertificate = await this.certificateGenerator.createCompleteCertificate(
			certificateData.studentName,
			certificateData.courseName,
			certificateData.completionDate,
			{
				grade: certificateData.grade,
				instructorName: certificateData.instructorName,
				courseDuration: certificateData.courseDuration,
				certificateType: certificateData.certificateType,
				issuerEmail: certificateData.issuerEmail,
				issuerName: certificateData.issuerName
			}
		);

		return addDoc(this.certificatesCollection, completeCertificate);
	}

	// Método legacy para compatibilidad
	createCertificateLegacy(certificate: Omit<Certificate, 'id'>) {
		return addDoc(this.certificatesCollection, certificate);
	}

	getAllCertificates(): Observable<(Certificate & { id: string })[]> {
		const q = query(this.certificatesCollection, orderBy('issuedDate', 'desc'));
		return from(getDocs(q)).pipe(
			map(snapshot => snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Certificate) })))
		);
	}

	async updateCertificateStatus(id: string, status: 'active' | 'revoked' | 'expired') {
		const ref = doc(this.firestore, 'certificates', id);
		return updateDoc(ref, { status });
	}

	async revokeCertificate(id: string) {
		return this.updateCertificateStatus(id, 'revoked');
	}

	deleteCertificate(id: string) {
		const ref = doc(this.firestore, 'certificates', id);
		return deleteDoc(ref);
	}

	// Búsqueda avanzada de certificados
	async searchCertificates(filters: {
		studentName?: string;
		courseName?: string;
		status?: string;
		dateFrom?: Date;
		dateTo?: Date;
	}): Promise<(Certificate & { id: string })[]> {
		let q = query(this.certificatesCollection, orderBy('issuedDate', 'desc'));

		if (filters.status) {
			q = query(q, where('status', '==', filters.status));
		}

		const querySnapshot = await getDocs(q);
		let results = querySnapshot.docs.map(d => ({ id: d.id, ...(d.data() as Certificate) }));

		// Filtros adicionales en memoria (para campos de texto)
		if (filters.studentName) {
			results = results.filter(cert => 
				cert.studentName.toLowerCase().includes(filters.studentName!.toLowerCase())
			);
		}

		if (filters.courseName) {
			results = results.filter(cert => 
				cert.courseName.toLowerCase().includes(filters.courseName!.toLowerCase())
			);
		}

		if (filters.dateFrom) {
			results = results.filter(cert => 
				cert.issuedDate.toDate() >= filters.dateFrom!
			);
		}

		if (filters.dateTo) {
			results = results.filter(cert => 
				cert.issuedDate.toDate() <= filters.dateTo!
			);
		}

		return results;
	}

	// Estadísticas de certificados
	async getCertificateStats(): Promise<{
		total: number;
		active: number;
		revoked: number;
		expired: number;
		byType: Record<string, number>;
		recentIssued: number;
	}> {
		const allCertificates = await this.getAllCertificates().toPromise() || [];
		const now = new Date();
		const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

		const stats = {
			total: allCertificates.length,
			active: allCertificates.filter(c => c.status === 'active').length,
			revoked: allCertificates.filter(c => c.status === 'revoked').length,
			expired: allCertificates.filter(c => c.status === 'expired').length,
			byType: {} as Record<string, number>,
			recentIssued: allCertificates.filter(c => c.issuedDate.toDate() >= lastMonth).length
		};

		// Contar por tipo
		allCertificates.forEach(cert => {
			const type = cert.certificateType || 'completion';
			stats.byType[type] = (stats.byType[type] || 0) + 1;
		});

		return stats;
	}
}


