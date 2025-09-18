import { Timestamp, FieldValue } from '@angular/fire/firestore';

/**
 * Interfaz principal para los leads de diagnóstico según requerimientos
 */
export interface DiagnosticLead {
  id?: string; // El ID del documento en Firestore
  name: string;
  email: string;
  phone: string;
  company?: string; // Este campo es opcional, para cuando el tipo es 'persona'
  type: 'persona' | 'empresa'; // Esto diferencia los dos tipos de leads
  diagnosticId: string; // ID del documento del diagnóstico completo
  createdAt: Timestamp | Date | FieldValue; // Firestore Timestamp
}

/**
 * Interfaz extendida para gestión interna (compatible con sistema actual)
 */
export interface ExtendedDiagnosticLead extends DiagnosticLead {
  // Campos adicionales para gestión
  position?: string; // Cargo en la empresa
  industry?: string; // Industria de la empresa
  companySize?: string; // Tamaño de la empresa
  acceptsCommunications: boolean;
  updatedAt: Timestamp | Date | FieldValue;
  source: 'diagnostico_empresa' | 'diagnostico_persona';
  status: 'nuevo' | 'contactado' | 'interesado' | 'no_interesado' | 'convertido';
  notes?: string; // Notas del administrador
  
  // Datos del diagnóstico para referencia rápida
  diagnosticData?: any;
  diagnosticResponses?: {
    objetivo?: any;
    contexto?: any;
    competencias?: { [key: string]: any };
    ares?: { [key: string]: any };
  };
}
