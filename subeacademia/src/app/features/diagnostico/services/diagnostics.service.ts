import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, doc, docData, updateDoc } from '@angular/fire/firestore';
import { DiagnosticoPersistedPayload } from '../data/diagnostic.models';
import { Observable, map } from 'rxjs';
import { PlanDeAccionItem } from '../data/report.model';

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
    private readonly http = inject(HttpClient);
    
    generateDetailedReport(diagnosticData: any) {
        try {
            const projectId = (window as any)?.FIREBASE_CONFIG?.projectId || (window as any)?.__FIREBASE_DEFAULTS__?.projectId || 'web-subeacademia';
            const region = 'us-central1';
            const url = `https://${region}-${projectId}.cloudfunctions.net/generateDetailedReport`;
            return this.http.post<any>(url, diagnosticData);
        } catch (error) {
            // Fallback a URL estática si no se puede resolver projectId en runtime
            const url = 'https://us-central1-web-subeacademia.cloudfunctions.net/generateDetailedReport';
            return this.http.post<any>(url, diagnosticData);
        }
    }

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

    // Actualiza solo el campo planDeAccion.items en el documento del diagnóstico
    updateActionPlan(diagnosticId: string, planItems: PlanDeAccionItem[]): Promise<void> {
        const ref = doc(this.firestore, 'diagnostics', diagnosticId);
        return updateDoc(ref, { 'planDeAccion.items': planItems }) as Promise<void>;
    }

	getById(id: string) {
		const ref = doc(this.firestore, `diagnostics/${id}`);
		return docData(ref, { idField: 'id' });
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
		try {
			console.log('💾 Guardando diagnóstico con reporte...', { report, scores, diagnosticData });
			
			// Guardar en la colección global de diagnósticos para que la Cloud Function lo procese
			const globalCol = collection(this.firestore, 'diagnostics');
			const docRef = await addDoc(globalCol, {
				report,
				scores,
				diagnosticData,
				fecha: new Date(),
				timestamp: new Date(),
				status: 'pending_pdf',
				// Asegurar que los datos del lead estén en el lugar correcto
				lead: diagnosticData.lead,
				form: {
					lead: diagnosticData.lead
				}
			});
			
			console.log('✅ Diagnóstico guardado exitosamente en Firestore:', docRef.id);
			
			// También guardar en la colección del usuario si hay userId
			if (diagnosticData.lead?.userId) {
				const userCol = collection(this.firestore, `users/${diagnosticData.lead.userId}/diagnostics`);
				await addDoc(userCol, {
					report,
					scores,
					diagnosticData,
					fecha: new Date(),
					timestamp: new Date(),
					status: 'completed',
					userId: diagnosticData.lead.userId
				});
				console.log('✅ Diagnóstico guardado en colección del usuario');
			}
			
			return docRef;
		} catch (error) {
			console.error('❌ Error al guardar diagnóstico:', error);
			throw error;
		}
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

// Actualización parcial del plan de acción en el documento
export interface PlanDeAccionPayload {
    items: PlanDeAccionItem[];
}

// Método público para actualizar el plan de acción interactivo
export interface UpdateActionPlanResult {}



