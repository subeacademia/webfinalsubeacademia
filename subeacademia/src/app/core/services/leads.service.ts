import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs, orderBy, updateDoc, collectionData, deleteDoc, limit, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { LeadData, UserLead, DiagnosticData } from '../../features/diagnostico/data/diagnostic.models';
import { DiagnosticLead, ExtendedDiagnosticLead } from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private firestore: Firestore = inject(Firestore);
  
  private get leadsCollection() {
    return collection(this.firestore, 'diagnostic-leads');
  }

  /**
   * Crea un lead de diagnóstico específico según los requerimientos
   */
  async createDiagnosticLead(leadData: UserLead, diagnosticId: string): Promise<string> {
    try {
      console.log('💾 [LeadsService] Creando lead de diagnóstico:', leadData);
      console.log('📋 [LeadsService] ID del diagnóstico:', diagnosticId);
      
      // Crear el payload según la interfaz DiagnosticLead
      const diagnosticLead: DiagnosticLead = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || '',
        company: leadData.companyName || undefined, // Solo para empresas
        type: leadData.type === 'empresa' ? 'empresa' : 'persona',
        diagnosticId: diagnosticId,
        createdAt: serverTimestamp()
      };

      // Agregar campos extendidos para gestión interna
      const extendedLead: ExtendedDiagnosticLead = {
        ...diagnosticLead,
        position: leadData.position,
        industry: leadData.industry,
        companySize: leadData.companySize,
        acceptsCommunications: leadData.acceptsCommunications,
        updatedAt: serverTimestamp(),
        source: leadData.type === 'empresa' ? 'diagnostico_empresa' : 'diagnostico_persona',
        status: 'nuevo'
      };

      console.log('💾 [LeadsService] Payload final para diagnostic-leads:', extendedLead);

      const docRef = await addDoc(this.leadsCollection, extendedLead);
      console.log('✅ [LeadsService] Lead de diagnóstico creado con ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ [LeadsService] Error creando lead de diagnóstico:', error);
      throw error;
    }
  }

  /**
   * Obtiene el diagnóstico completo asociado a un lead
   */
  async getDiagnosticForLead(diagnosticId: string): Promise<any> {
    try {
      const diagnosticDoc = doc(this.firestore, 'diagnostics', diagnosticId);
      const diagnosticSnap = await getDoc(diagnosticDoc);
      
      if (diagnosticSnap.exists()) {
        return { id: diagnosticSnap.id, ...diagnosticSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ [LeadsService] Error obteniendo diagnóstico:', error);
      throw error;
    }
  }

  /**
   * Guarda un nuevo lead en la base de datos (método original mantenido para compatibilidad)
   */
  async saveLead(leadData: UserLead, diagnosticData?: DiagnosticData, source: 'diagnostico_empresa' | 'diagnostico_persona' = 'diagnostico_empresa'): Promise<string> {
    try {
      console.log('💾 [LeadsService] Guardando lead:', leadData);
      
      // Construir el payload base con campos obligatorios
      const leadPayload: any = {
        name: leadData.name,
        email: leadData.email,
        type: leadData.type,
        acceptsCommunications: leadData.acceptsCommunications,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: source,
        status: 'nuevo'
      };

      // Agregar campos opcionales solo si tienen valores definidos
      if (leadData.phone && leadData.phone.trim() !== '') {
        leadPayload.phone = leadData.phone;
      }
      
      if (leadData.companyName && leadData.companyName.trim() !== '') {
        leadPayload.companyName = leadData.companyName;
      }
      
      if (leadData.position && leadData.position.trim() !== '') {
        leadPayload.position = leadData.position;
      }
      
      if (leadData.industry && leadData.industry.trim() !== '') {
        leadPayload.industry = leadData.industry;
      }
      
      if (leadData.companySize && leadData.companySize.trim() !== '') {
        leadPayload.companySize = leadData.companySize;
      }

      // Agregar datos de diagnóstico si están disponibles
      if (diagnosticData) {
        leadPayload.diagnosticData = diagnosticData;
        leadPayload.diagnosticResponses = {
          objetivo: diagnosticData.objetivo,
          contexto: diagnosticData.contexto,
          competencias: diagnosticData.competencias,
          ares: diagnosticData.ares
        };
      }

      console.log('💾 [LeadsService] Payload final para Firebase:', leadPayload);

      const docRef = await addDoc(this.leadsCollection, leadPayload);
      console.log('✅ [LeadsService] Lead guardado con ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ [LeadsService] Error guardando lead:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los leads con paginación
   */
  getLeads(limit: number = 50): Observable<LeadData[]> {
    const q = query(
      this.leadsCollection,
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<LeadData[]>;
  }

  /**
   * Obtiene un lead específico por ID
   */
  async getLeadById(id: string): Promise<LeadData | null> {
    try {
      const docRef = doc(this.firestore, 'diagnostic-leads', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const leadData = { id: docSnap.id, ...docSnap.data() } as LeadData;
        
        // Si el lead tiene un diagnosticId, cargar también los datos del diagnóstico
        if ((leadData as any).diagnosticId) {
          try {
            const diagnosticData = await this.getDiagnosticForLead((leadData as any).diagnosticId);
            if (diagnosticData) {
              leadData.diagnosticData = diagnosticData;
              leadData.report = diagnosticData.report;
              leadData.scores = diagnosticData.scores;
            }
          } catch (diagnosticError) {
            console.warn('No se pudo cargar el diagnóstico asociado:', diagnosticError);
          }
        }
        
        return leadData;
      } else {
        console.log('No se encontró el lead con ID:', id);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo lead:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un lead
   */
  async updateLeadStatus(id: string, status: LeadData['status'], notes?: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'diagnostic-leads', id);
      await updateDoc(docRef, {
        status: status,
        notes: notes,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [LeadsService] Estado del lead actualizado');
    } catch (error) {
      console.error('❌ [LeadsService] Error actualizando lead:', error);
      throw error;
    }
  }

  /**
   * Obtiene leads por tipo
   */
  async getLeadsByType(type: 'persona_natural' | 'empresa'): Promise<LeadData[]> {
    try {
      const q = query(
        this.leadsCollection,
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const leads: LeadData[] = [];
      
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as LeadData);
      });
      
      return leads;
    } catch (error) {
      console.error('Error obteniendo leads por tipo:', error);
      throw error;
    }
  }

  /**
   * Obtiene leads por estado
   */
  async getLeadsByStatus(status: LeadData['status']): Promise<LeadData[]> {
    try {
      const q = query(
        this.leadsCollection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const leads: LeadData[] = [];
      
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as LeadData);
      });
      
      return leads;
    } catch (error) {
      console.error('Error obteniendo leads por estado:', error);
      throw error;
    }
  }

  /**
   * Busca leads por email
   */
  async getLeadsByEmail(email: string): Promise<LeadData[]> {
    try {
      const q = query(
        this.leadsCollection,
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const leads: LeadData[] = [];
      
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as LeadData);
      });
      
      return leads;
    } catch (error) {
      console.error('Error buscando leads por email:', error);
      throw error;
    }
  }

  /**
   * Actualiza un lead completo
   */
  async updateLead(id: string, leadData: Partial<LeadData>): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'diagnostic-leads', id);
      await updateDoc(docRef, {
        ...leadData,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [LeadsService] Lead actualizado correctamente');
    } catch (error) {
      console.error('❌ [LeadsService] Error actualizando lead:', error);
      throw error;
    }
  }

  /**
   * Elimina un lead
   */
  async deleteLead(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'diagnostic-leads', id);
      await deleteDoc(docRef);
      console.log('✅ [LeadsService] Lead eliminado correctamente');
    } catch (error) {
      console.error('❌ [LeadsService] Error eliminando lead:', error);
      throw error;
    }
  }

  /**
   * Resetea todos los leads antiguos (para limpieza)
   */
  async resetOldLeads(): Promise<{ deleted: number; errors: number }> {
    try {
      console.log('🧹 Iniciando limpieza de leads antiguos...');
      
      // Obtener todos los documentos de la colección 'leads' antigua
      const oldLeadsCollection = collection(this.firestore, 'leads');
      const querySnapshot = await getDocs(oldLeadsCollection);
      
      let deleted = 0;
      let errors = 0;
      
      const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        try {
          await deleteDoc(doc(this.firestore, 'leads', docSnapshot.id));
          deleted++;
          console.log(`🗑️ Eliminado lead antiguo: ${docSnapshot.id}`);
        } catch (error) {
          errors++;
          console.error(`❌ Error eliminando lead ${docSnapshot.id}:`, error);
        }
      });
      
      await Promise.all(deletePromises);
      
      console.log(`✅ Limpieza completada: ${deleted} leads eliminados, ${errors} errores`);
      return { deleted, errors };
    } catch (error) {
      console.error('❌ Error durante la limpieza de leads:', error);
      throw error;
    }
  }

  /**
   * Verifica la conectividad con Firebase
   */
  async testConnection(): Promise<boolean> {
    try {
      const testQuery = query(this.leadsCollection, limit(1));
      await getDocs(testQuery);
      console.log('✅ [LeadsService] Conexión con Firebase exitosa');
      return true;
    } catch (error) {
      console.error('❌ [LeadsService] Error de conexión con Firebase:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de leads
   */
  async getLeadsStats(): Promise<{
    total: number;
    byType: { persona_natural: number; empresa: number };
    byStatus: { [key: string]: number };
    thisMonth: number;
    acceptsCommunications: number;
  }> {
    try {
      // Convertir Observable a Promise para obtener los datos
      const allLeads = await new Promise<LeadData[]>((resolve, reject) => {
        const subscription = this.getLeads().subscribe({
          next: (leads) => {
            subscription.unsubscribe();
            resolve(leads);
          },
          error: reject
        });
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats = {
        total: allLeads.length,
        byType: { persona_natural: 0, empresa: 0 },
        byStatus: {} as { [key: string]: number },
        thisMonth: 0,
        acceptsCommunications: 0
      };

      allLeads.forEach(lead => {
        // Por tipo
        if (lead.type === 'persona_natural') {
          stats.byType.persona_natural++;
        } else if (lead.type === 'empresa') {
          stats.byType.empresa++;
        }

        // Por estado
        const status = lead.status || 'nuevo';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Este mes
        if (lead.createdAt && lead.createdAt >= thisMonth) {
          stats.thisMonth++;
        }

        // Acepta comunicaciones
        if (lead.acceptsCommunications) {
          stats.acceptsCommunications++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}
