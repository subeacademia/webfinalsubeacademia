import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, query, where, getDocs, orderBy, updateDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { LeadData, UserLead, DiagnosticData } from '../../features/diagnostico/data/diagnostic.models';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private firestore: Firestore = inject(Firestore);
  
  private get leadsCollection() {
    return collection(this.firestore, 'leads');
  }

  /**
   * Guarda un nuevo lead en la base de datos
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
      const docRef = doc(this.firestore, 'leads', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LeadData;
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
      const docRef = doc(this.firestore, 'leads', id);
      await updateDoc(docRef, {
        status: status,
        notes: notes,
        updatedAt: new Date()
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
}
