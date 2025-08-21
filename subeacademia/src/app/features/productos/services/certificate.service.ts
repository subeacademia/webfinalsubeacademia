import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDocs, collection, addDoc, query, where, limit, orderBy, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Certificate } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class CertificateService {
	private firestore: Firestore = inject(Firestore);
	private certificatesCollection = collection(this.firestore, 'certificates');

	async getCertificateByCode(code: string) {
		const q = query(this.certificatesCollection, where('certificateCode', '==', code), limit(1));
		const querySnapshot = await getDocs(q);
		if (!querySnapshot.empty) {
			const docSnap = querySnapshot.docs[0];
			return { exists: true, data: docSnap.data() as Certificate, id: docSnap.id };
		}
		return { exists: false, data: null, id: null };
	}

	createCertificate(certificate: Omit<Certificate, 'id'>) {
		return addDoc(this.certificatesCollection, certificate);
	}

	getAllCertificates(): Observable<(Certificate & { id: string })[]> {
		const q = query(this.certificatesCollection, orderBy('completionDate', 'desc'));
		return from(getDocs(q)).pipe(
			map(snapshot => snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Certificate) })))
		);
	}

	deleteCertificate(id: string) {
		const ref = doc(this.firestore, 'certificates', id);
		return deleteDoc(ref);
	}
}


