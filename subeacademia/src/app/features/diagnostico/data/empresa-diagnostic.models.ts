/**
 * Interfaces para el nuevo diagnóstico de madurez de IA para empresas.
 * Basado en el "Cuestionario de Madurez en Implementación Responsable de IA".
 */

// Tipos de respuesta específicos del cuestionario de empresas
export type RespuestaLikert = 1 | 2 | 3 | 4 | 5;
export type RespuestaVFNS = 'V' | 'F' | 'NS';
export type RespuestaMadurez = 'I' | 'B' | 'M' | 'A' | 'T';

export interface MetadataEmpresa {
  id?: string; // ID de Firestore
  fecha: number; // Timestamp de la realización
  razonSocial: string;
  rut?: string; // Campo opcional
  sectorCiiu: string;
  regionPais: string;
  ventasUFAnual: string; // Cambio a string para manejar rangos
  categoriaTamano: 'Micro' | 'Pequeña' | 'Mediana' | 'Grande';
  dotacion: number;
  modalidad: 'Presencial' | 'Mixta' | 'Remota';
  rolRespondente: string;
  emailContacto: string; // Campo clave para el lead
  nombreContacto: string; // Nombre para personalizar comunicación
}

export interface RespuestaItem {
  n: number; // Número de ítem (1-30)
  dimension: string;
  texto: string;
  tipo: 'Likert' | 'VFNS' | 'Madurez';
  respuesta: RespuestaLikert | RespuestaVFNS | RespuestaMadurez | null;
  puntaje_0_100: number;
}

export interface ResultadoDimension {
  nombre: string;
  indice_0_100: number;
  nota_1_7: number;
  nivel: 'Incipiente' | 'Básico' | 'Intermedio' | 'Avanzado' | 'Transformador';
}

export interface PlanDeAccionIA {
  resumenEjecutivo: string;
  puntosFuertes: { punto: string; justificacion: string; }[];
  areasMejora: { area: string; justificacion: string; }[];
  recomendaciones: {
    horizonte_90_dias: { accion: string; detalle: string; }[];
    horizonte_180_dias: { accion: string; detalle: string; }[];
    horizonte_365_dias: { accion: string; detalle: string; }[];
  };
}

export interface ReporteDiagnosticoEmpresa {
  metadata: MetadataEmpresa;
  respuestas: RespuestaItem[];
  puntajes: {
    dimensiones: ResultadoDimension[];
    ig_ia_0a100: number;
    ig_ia_1a7: number;
    ig_ia_nivel: string;
  };
  planDeAccion?: PlanDeAccionIA; // Opcional, se llena después de la llamada a la API
}
