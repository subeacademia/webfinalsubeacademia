import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs } from '@angular/fire/firestore';
import { DiagnosticData } from '../data/diagnostic.models';
import { Report } from '../data/report.model';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsService {
  private firestore: Firestore = inject(Firestore);
  
  private get diagnosticsCollection() {
    return collection(this.firestore, 'diagnostics');
  }

  async saveDiagnosticResult(data: DiagnosticData, report: Report): Promise<string> {
    try {
      console.log('Attempting to save diagnostic result to Firestore...');
      console.log('Data:', data);
      console.log('Report:', report);
      
      // Crear la colección en el momento de uso
      const collectionRef = collection(this.firestore, 'diagnostics');
      
      const docRef = await addDoc(collectionRef, {
        data,
        report,
        createdAt: new Date()
      });
      
      console.log('Document saved successfully with ID:', docRef.id);
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding document: ", e);
      console.error("Error details:", {
        code: e?.code,
        message: e?.message,
        stack: e?.stack
      });
      throw e;
    }
  }

  getDiagnosticResult(id: string) {
    const docRef = doc(this.firestore, 'diagnostics', id);
    return getDoc(docRef);
  }

  async getDiagnosticsForUser(userId: string): Promise<any[]> {
    const q = query(this.diagnosticsCollection, where("data.lead.email", "==", userId)); // Suponiendo que el userId es el email
    const querySnapshot = await getDocs(q);
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }
}