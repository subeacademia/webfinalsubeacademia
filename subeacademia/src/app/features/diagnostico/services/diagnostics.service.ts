import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, serverTimestamp } from '@angular/fire/firestore';
import { DiagnosticState } from './diagnostic-state.service';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsService {
  private firestore: Firestore = inject(Firestore);

  constructor() { }

  // Guarda el resultado completo del diagnóstico en Firestore
  async saveDiagnosticResult(state: DiagnosticState): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'diagnostics'), {
        ...state,
        createdAt: serverTimestamp(),
        status: 'completed'
      });
      console.log("Diagnostic result saved with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e; // Lanza el error para que el componente lo maneje
    }
  }

  // Método de compatibilidad para el dashboard
  async getDiagnosticsForUserAsync(userId: string): Promise<any[]> {
    // Implementación básica para compatibilidad
    // En una implementación real, esto consultaría Firestore
    console.log("Getting diagnostics for user:", userId);
    return [];
  }
}