import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { httpsCallable } from '@angular/fire/functions';
import { Functions } from '@angular/fire/functions';
import { DiagnosticoPersistedPayload } from '../data/diagnostic.models';

@Injectable({ providedIn: 'root' })
export class DiagnosticsService {
	private readonly firestore = inject(Firestore);
	private readonly functions = inject(Functions);

	async saveAndRequestEmail(payload: DiagnosticoPersistedPayload & { email?: string }): Promise<string> {
		const col = collection(this.firestore, 'diagnostics');
		const docRef = await addDoc(col, payload as any);
		try {
			const sendFn = httpsCallable(this.functions, 'sendDiagnosticReport');
			await sendFn({ docId: docRef.id, email: payload.form?.lead?.email || payload.email });
		} catch {
			// ignorar errores de CF para no romper UX local
		}
		return docRef.id;
	}
}


