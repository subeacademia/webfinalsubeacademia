import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs } from '@angular/fire/firestore';
import { DiagnosticData } from '../data/diagnostic.models';
import { Report } from '../data/report.model';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsService {
  private firestore: Firestore = inject(Firestore);
  private diagnosticsCollection = collection(this.firestore, 'diagnostics');

  async saveDiagnosticResult(data: DiagnosticData, report: Report): Promise<string> {
    try {
      const docRef = await addDoc(this.diagnosticsCollection, {
        data,
        report,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
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