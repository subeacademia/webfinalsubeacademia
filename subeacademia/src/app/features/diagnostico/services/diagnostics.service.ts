import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { DiagnosticData, UserLead } from '../data/diagnostic.models';
import { Report, ReportData } from '../data/report.model';
import { VercelAiService } from '../../../core/ai/vercel-ai.service';
import { LeadsService } from '../../../core/services/leads.service';
import { ReporteDiagnosticoEmpresa } from '../data/empresa-diagnostic.models';
import { Observable } from 'rxjs';
import { ToastService } from '../../../core/services/ui/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsService {
  private firestore: Firestore = inject(Firestore);
  private vercelAiService = inject(VercelAiService);
  private leadsService = inject(LeadsService);
  private toastService = inject(ToastService);
  
  // Signal para almacenar el reporte actual
  private currentReport = signal<ReportData | null>(null);
  
  private get diagnosticsCollection() {
    return collection(this.firestore, 'diagnostics');
  }

  private empresaDiagnosticsCollection = collection(this.firestore, 'diagnostic_leads_empresas');

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
      this.toastService.show('error', 'Error al Guardar: No se pudo guardar tu diagnóstico. Por favor, intenta nuevamente.');
      throw e;
    }
  }

  /**
   * Guarda un diagnóstico completo con lead en la colección de leads
   */
  async saveDiagnosticWithLead(data: DiagnosticData, report: Report): Promise<string> {
    try {
      console.log('💾 [DiagnosticsService] Guardando diagnóstico con lead...');
      
      if (!data.lead) {
        throw new Error('No se encontraron datos del lead en el diagnóstico');
      }

      // PASO 1: Guardar el diagnóstico completo primero
      const diagnosticId = await this.saveDiagnosticResult(data, report);
      console.log('✅ [DiagnosticsService] Diagnóstico guardado con ID:', diagnosticId);
      
      // PASO 2: Crear el lead específico con referencia al diagnóstico
      const leadId = await this.leadsService.createDiagnosticLead(data.lead, diagnosticId);
      console.log('✅ [DiagnosticsService] Lead creado con ID:', leadId);
      
      // PASO 3: Adjuntar el diagnóstico, reporte y scores al mismo lead
      try {
        const scores = (report as any)?.scores || undefined;
        await this.leadsService.attachDiagnosticData(leadId, data, report, scores);
      } catch (err) {
        console.warn('⚠️ No se pudo adjuntar reporte/scores, se adjuntará solo el diagnóstico básico.', err);
        await this.leadsService.attachDiagnosticData(leadId, data);
      }
      
      console.log('✅ [DiagnosticsService] Diagnóstico y lead guardados exitosamente');
      console.log('Lead ID:', leadId);
      console.log('Diagnostic ID:', diagnosticId);
      
      return leadId;
    } catch (error) {
      console.error('❌ [DiagnosticsService] Error guardando diagnóstico con lead:', error);
      this.toastService.show('error', 'Error al Guardar: No se pudo guardar tu diagnóstico. Por favor, intenta nuevamente.');
      throw error;
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
      const reportFromAI = await this.vercelAiService.generateComprehensiveReport(diagnosticData);
      
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
      console.error('Error en generateReport:', error);
      
      // El servicio de IA ya maneja el fallback automáticamente
      // Si llegamos aquí, significa que el fallback también falló
      console.log('🔄 El reporte de fallback también falló, intentando generar uno básico...');
      
      // Generar un reporte básico de emergencia
      try {
        const emergencyReport = this.generateEmergencyReport(diagnosticData);
        this.currentReport.set(emergencyReport);
        return emergencyReport;
      } catch (emergencyError) {
        console.error('❌ Error generando reporte de emergencia:', emergencyError);
        return null;
      }
    }
  }

  /**
   * Obtiene el reporte actual almacenado
   */
  getCurrentReport(): ReportData | null {
    return this.currentReport();
  }

  /**
   * Genera un reporte de emergencia cuando todo falla
   */
  private generateEmergencyReport(diagnosticData: any): ReportData {
    console.log('🚨 Generando reporte de emergencia...');
    
    return {
      id: 'emergency-' + Date.now(),
      timestamp: new Date(),
      leadInfo: {
        name: diagnosticData?.lead?.name || 'Usuario',
        email: diagnosticData?.lead?.email || 'usuario@empresa.com',
        companyName: diagnosticData?.lead?.companyName || 'Empresa'
      },
      contexto: diagnosticData,
      aresScores: {},
      competencyScores: [],
      companyContext: {
        industry: diagnosticData?.contexto?.industry || 'No especificada',
        size: diagnosticData?.contexto?.companySize || 'No especificado',
        mainObjective: diagnosticData?.contexto?.mainObjective || 'Mejorar capacidades en IA'
      },
      aiMaturity: {
        level: 'En Desarrollo',
        score: 50,
        summary: 'Tu organización se encuentra en un nivel de desarrollo en IA. Recomendamos continuar con el plan de acción para mejorar las capacidades.'
      },
      executiveSummary: 'Hemos generado un reporte básico basado en tu información. Para obtener un análisis más detallado, por favor intenta nuevamente más tarde.',
      strengthsAnalysis: [],
      weaknessesAnalysis: [],
      insights: [{
        title: 'Sistema de Análisis Temporal',
        description: 'Este reporte fue generado usando nuestro sistema de respaldo. Para obtener un análisis completo, intenta nuevamente.',
        type: 'Fortaleza Clave'
      }],
      actionPlan: [{
        area: 'Desarrollo de Competencias en IA',
        priority: 'Alta',
        timeline: '3-6 meses',
        description: 'Enfócate en desarrollar competencias básicas en IA para tu organización.',
        actions: [{
          accion: 'Capacitación Básica en IA',
          descripcion: 'Inicia con cursos básicos de IA para tu equipo.',
          timeline: '1-2 meses',
          recursos: ['Cursos online', 'Material educativo'],
          kpis: ['Nivel de conocimiento', 'Aplicación práctica'],
          expectedOutcome: 'Equipo con conocimientos básicos en IA',
          painPoint: 'Falta de conocimiento básico en IA',
          aresDimension: 'Agilidad'
        }]
      }],
      generatedAt: new Date(),
      version: '3.0.0-emergency'
    };
  }

  /**
   * Establece el reporte actual
   */
  setCurrentReport(report: ReportData): void {
    this.currentReport.set(report);
  }

  // --- NUEVA LÓGICA PARA DIAGNÓSTICOS DE EMPRESAS ---
  getSavedEmpresaDiagnostics(): Observable<ReporteDiagnosticoEmpresa[]> {
    return collectionData(this.empresaDiagnosticsCollection, { idField: 'id' }) as Observable<ReporteDiagnosticoEmpresa[]>;
  }

  async saveEmpresaDiagnostic(report: ReporteDiagnosticoEmpresa): Promise<string> {
    const firestoreReadyReport = JSON.parse(JSON.stringify(report));
    const docRef = await addDoc(this.empresaDiagnosticsCollection, firestoreReadyReport);
    return docRef.id;
  }
}