import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';
import { DiagnosticoPersistedPayload } from '../data/diagnostic.models';
import { Observable, map } from 'rxjs';

interface UserDiagnostic {
  id: string;
  userId: string;
  fecha: Date;
  puntajeGeneral: number;
  objetivo?: string;
  industria?: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticsService {
	private readonly firestore = inject(Firestore);

	async saveAndRequestEmail(payload: DiagnosticoPersistedPayload & { email?: string; userId?: string }): Promise<string> {
		// Si hay userId, guardar en la colección del usuario
		if (payload.userId) {
			const userCol = collection(this.firestore, `users/${payload.userId}/diagnostics`);
			const docRef = await addDoc(userCol, {
				...payload,
				userId: payload.userId,
				fecha: new Date(),
				timestamp: new Date()
			});
			
			// También guardar en la colección global para compatibilidad
			const globalCol = collection(this.firestore, 'diagnostics');
			await addDoc(globalCol, {
				...payload,
				userId: payload.userId,
				fecha: new Date(),
				timestamp: new Date()
			});
			
			return docRef.id;
		} else {
			// Fallback al comportamiento original
			const col = collection(this.firestore, 'diagnostics');
			const docRef = await addDoc(col, payload as any);
			return docRef.id;
		}
	}

	async saveDiagnostic(payload: DiagnosticoPersistedPayload & { userId?: string; fecha?: Date; puntajeGeneral?: number; objetivo?: string; industria?: string; analysisContent?: any }, userId: string): Promise<string> {
		const userCol = collection(this.firestore, `users/${userId}/diagnostics`);
		const docRef = await addDoc(userCol, {
			...payload,
			userId,
			fecha: payload.fecha || new Date(),
			timestamp: new Date()
		});
		
		// También guardar en la colección global para compatibilidad
		const globalCol = collection(this.firestore, 'diagnostics');
		await addDoc(globalCol, {
			...payload,
			userId,
			fecha: payload.fecha || new Date(),
			timestamp: new Date()
		});
		
		return docRef.id;
	}

	async saveDiagnosticWithReport(report: any, scores: any, diagnosticData: any): Promise<any> {
		// Guardar en la colección global de diagnósticos para que la Cloud Function lo procese
		const globalCol = collection(this.firestore, 'diagnostics');
		const docRef = await addDoc(globalCol, {
			report,
			scores,
			diagnosticData,
			fecha: new Date(),
			timestamp: new Date(),
			status: 'pending_pdf'
		});
		
		return docRef;
	}

	getDiagnosticsForUser(userId: string): Observable<UserDiagnostic[]> {
		const userCol = collection(this.firestore, `users/${userId}/diagnostics`);
		const q = query(userCol, orderBy('fecha', 'desc'));
		
		return collectionData(q, { idField: 'id' }).pipe(
			map(docs => docs.map(doc => ({
				...doc,
				fecha: (doc as any).fecha?.toDate() || new Date(),
				puntajeGeneral: (doc as any).puntajeGeneral || 0
			})) as UserDiagnostic[])
		);
	}

	async getDiagnosticsForUserAsync(userId: string): Promise<UserDiagnostic[]> {
		return new Promise((resolve, reject) => {
			this.getDiagnosticsForUser(userId).subscribe({
				next: (diagnostics) => resolve(diagnostics),
				error: (error) => reject(error)
			});
		});
	}
}


