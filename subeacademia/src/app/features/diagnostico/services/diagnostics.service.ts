import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, doc, docData, updateDoc } from '@angular/fire/firestore';
import { DiagnosticoPersistedPayload } from '../data/diagnostic.models';
import { Observable, map, firstValueFrom, from } from 'rxjs';
import { PlanDeAccionItem } from '../data/report.model';
import { AsistenteIaService } from '../../../shared/ui/chatbot/asistente-ia.service';

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
    private readonly asistenteIaService = inject(AsistenteIaService);
    
    generateDetailedReport(diagnosticData: any): Observable<any> {
        const buildContext = typeof diagnosticData === 'string' ? diagnosticData : JSON.stringify(diagnosticData);
        const resumenPrompt = `Basado en los siguientes datos de un diagnóstico de competencias: ${buildContext}, genera un "resumen_ejecutivo" conciso y profesional.`;
        const fodaPrompt = `Con la misma información del diagnóstico: ${buildContext}, realiza un "analisis_foda" detallado en formato JSON con claves fortalezas, debilidades, oportunidades y amenazas como arrays de strings.`;
        const areasPrompt = `Usando la información del diagnóstico: ${buildContext}, devuelve una lista breve (3 a 5) de "areas_enfoque_principales" en JSON como un array de strings.`;

        const promise = (async () => {
            const [resumen, fodaRaw, areasRaw] = await Promise.all([
                this.callVercelAPI(resumenPrompt),
                this.callVercelAPI(fodaPrompt),
                this.callVercelAPI(areasPrompt)
            ]);

            let analisis_foda: any = { fortalezas: [], debilidades: [], oportunidades: [], amenazas: [] };
            try { analisis_foda = JSON.parse(fodaRaw); } catch {}

            let areas_enfoque_principales: string[] = [];
            try {
                const parsed = JSON.parse(areasRaw);
                areas_enfoque_principales = Array.isArray(parsed) ? parsed : [];
            } catch {}

            return {
                resumen_ejecutivo: resumen,
                analisis_foda,
                areas_enfoque_principales
            } as any;
        })();

        return from(promise);
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

    // =====================
    // Integración con API de Vercel (Azure/OpenAI) vía AsistenteIaService
    // =====================
    private async callVercelAPI(prompt: string): Promise<string> {
        const payload = {
            messages: [
                { role: 'system', content: 'Eres un experto en coaching y desarrollo profesional.' },
                { role: 'user', content: prompt }
            ],
            maxTokens: 1500,
            temperature: 0.7
        } as any;

        try {
            const res: any = await firstValueFrom(this.asistenteIaService.generarTextoAzure(payload));
            if (res && res.choices && res.choices[0]?.message?.content) {
                return res.choices[0].message.content as string;
            }
            throw new Error('Respuesta inesperada de la API de Vercel');
        } catch (error) {
            console.error('Error llamando a la API de Vercel:', error);
            throw error as Error;
        }
    }

    // Orquestador para generar y guardar secciones del reporte usando la API de Vercel
    async generateReportWithVercel(diagnosticId: string, diagnosticData: any): Promise<void> {
        try {
            const diagnosticContext = typeof diagnosticData === 'string' ? diagnosticData : JSON.stringify(diagnosticData);

            // Prompts
            const resumenPrompt = `Basado en los siguientes datos de un diagnóstico de competencias: ${diagnosticContext}, genera un "resumen_ejecutivo" conciso y profesional.`;
            const fodaPrompt = `Con la misma información del diagnóstico: ${diagnosticContext}, realiza un "analisis_foda" detallado en formato JSON con claves fortalezas, debilidades, oportunidades y amenazas como arrays de strings.`;
            const areasPrompt = `Usando la información del diagnóstico: ${diagnosticContext}, devuelve una lista breve (3 a 5) de "areas_enfoque_principales" en JSON como un array de strings.`;

            // Llamadas a IA
            const [resumenGenerado, fodaGenerado, areasGeneradas] = await Promise.all([
                this.callVercelAPI(resumenPrompt),
                this.callVercelAPI(fodaPrompt),
                this.callVercelAPI(areasPrompt)
            ]);

            // Parseos seguros
            let analisisFoda: any = null;
            try { analisisFoda = JSON.parse(fodaGenerado); } catch { analisisFoda = { fortalezas: [], debilidades: [], oportunidades: [], amenazas: [] }; }

            let areasEnfoque: string[] = [];
            try {
                const parsed = JSON.parse(areasGeneradas);
                areasEnfoque = Array.isArray(parsed) ? parsed : [];
            } catch {
                areasEnfoque = [];
            }

            const updatedReportData: any = {
                resumen_ejecutivo: resumenGenerado,
                analisis_foda: analisisFoda,
                areas_enfoque_principales: areasEnfoque
            };

            const reportRef = doc(this.firestore, 'diagnostics', diagnosticId);
            await updateDoc(reportRef, updatedReportData);
        } catch (error) {
            console.error('Error generando reporte con Vercel:', error);
            throw error as Error;
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



