import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs } from '@angular/fire/firestore';
import { DiagnosticData } from '../data/diagnostic.models';
import { Report, ReportData } from '../data/report.model';
import { BesselAiService } from '../../../core/ai/bessel-ai.service';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsService {
  private firestore: Firestore = inject(Firestore);
  private besselAiService = inject(BesselAiService);
  
  // Signal para almacenar el reporte actual
  private currentReport = signal<ReportData | null>(null);
  
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

  /**
   * MÉTODO CRÍTICO: Genera el reporte usando el servicio de IA
   */
  async generateReport(diagnosticData: any): Promise<ReportData | null> {
    // --- LOG DE VERIFICACIÓN #1 ---
    console.log('--- DIAGNOSTICS SERVICE: INICIANDO GENERACIÓN ---');
    console.log('Datos recibidos del state:', JSON.stringify(diagnosticData, null, 2));

    if (!diagnosticData || !diagnosticData.contexto || !diagnosticData.competencias) {
      console.error('ERROR CRÍTICO: Los datos para generar el reporte son incompletos o nulos.');
      console.error('Contexto:', diagnosticData?.contexto);
      console.error('Competencias:', diagnosticData?.competencias);
      return null;
    }

    try {
      // --- LLAMADA AL CEREBRO DE IA ---
      const reportFromAI = await this.besselAiService.generateComprehensiveReport(diagnosticData);
      
      // --- LOG DE VERIFICACIÓN #2 ---
      console.log('--- DIAGNOSTICS SERVICE: REPORTE RECIBIDO DE IA ---');
      console.log(JSON.stringify(reportFromAI, null, 2));

      if (!reportFromAI) {
        throw new Error('El servicio de IA devolvió un resultado nulo.');
      }

      // Almacenar el reporte actual
      this.currentReport.set(reportFromAI);
      return reportFromAI;

    } catch (error) {
      console.error('Error CATASTRÓFICO en generateReport:', error);
      return null; 
    }
  }

  /**
   * Obtiene el reporte actual almacenado
   */
  getCurrentReport(): ReportData | null {
    return this.currentReport();
  }

  /**
   * Establece el reporte actual
   */
  setCurrentReport(report: ReportData): void {
    this.currentReport.set(report);
  }
}