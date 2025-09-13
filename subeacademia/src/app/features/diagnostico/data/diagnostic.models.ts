export interface ObjetivoData {
  rol: string;
  industria: string;
  objetivo: string[];
}

export interface ContextoData {
  rol: string;
  industria: string;
  area: string;
  equipo: string;
}

export interface Answer {
  value: number;
  isCritical: boolean;
  evidence?: string;
}

export type LeadType = 'persona_natural' | 'empresa';

export interface UserLead {
  name: string;
  email: string;
  phone?: string;
  type: LeadType;
  companyName?: string; // Solo para empresas
  position?: string; // Cargo en la empresa
  industry?: string; // Industria de la empresa
  companySize?: string; // Tamaño de la empresa
  acceptsCommunications: boolean;
}

// Interfaz para los leads guardados en la base de datos
export interface LeadData {
  id?: string;
  // Datos del lead
  name: string;
  email: string;
  phone?: string;
  type: LeadType;
  companyName?: string;
  position?: string;
  industry?: string;
  companySize?: string;
  acceptsCommunications: boolean;
  
  // Datos del diagnóstico
  diagnosticData?: DiagnosticData;
  diagnosticResponses?: {
    objetivo?: ObjetivoData;
    contexto?: ContextoData;
    competencias?: { [key: string]: Answer };
    ares?: { [key: string]: Answer };
  };
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  source: 'diagnostico_empresa' | 'diagnostico_persona';
  status: 'nuevo' | 'contactado' | 'interesado' | 'no_interesado' | 'convertido';
  notes?: string; // Notas del administrador
}

export interface DiagnosticData {
  objetivo: ObjetivoData;
  contexto: ContextoData;
  competencias: { [key: string]: Answer };
  ares: { [key: string]: Answer };
  lead?: UserLead; // Añadir propiedad opcional para el lead
}

export const INITIAL_DIAGNOSTIC_DATA: DiagnosticData = {
  objetivo: {
    rol: '',
    industria: '',
    objetivo: []
  },
  contexto: {
    rol: '',
    industria: '',
    area: '',
    equipo: ''
  },
  competencias: {},
  ares: {}
};

// Interfaces de compatibilidad para el sistema anterior
export interface DiagnosticoFormValue {
  contexto?: any;
  ares?: any;
  competencias?: any;
  objetivo?: any;
  lead?: any;
}

export interface DiagnosticoPersistedPayload {
  id?: string;
  data: any;
  timestamp?: Date;
}

export interface AresItem {
  id: string;
  labelKey: string;
  tooltip?: string;
  dimension: string;
  phase: string;
}

export interface CompetenciaDef {
  id: string;
  nameKey: string;
  description?: string;
  cluster: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
}

export interface NivelCompetencia {
  id: string;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
}

// Tipos para las preguntas y respuestas
export type AresPillar = 'Agilidad' | 'Responsabilidad y Ética' | 'Sostenibilidad';
export type AresPhase = 'Preparación' | 'Diseño' | 'Desarrollo' | 'Monitoreo' | 'Escalado';
export type RiskLevel = 'Alto' | 'Limitado' | 'Mínimo' | null;

export interface Question {
  id: string;
  text: string;
  pillar: AresPillar;
  subarea?: string;
  phase?: AresPhase;
  comp?: string;
  cluster?: string;
  critical: boolean;
  weight: number;
}

// Tipos para los resultados de los cálculos
export type GatingStatus = 'OK' | 'Bloquea≥3' | 'SIN_DATOS';

export interface AresScores {
  byPillar: Record<AresPillar, number>;
  bySubarea: Record<string, number>;
  byPhase: Record<AresPhase, number>;
  general: number;
  generalWeighted?: number;
  gatingStatus: GatingStatus;
}

export interface CompScores {
  byCompetency: Record<string, number>;
  byCluster: Record<string, number>;
  general: number;
  gatingStatus: GatingStatus;
}

// Tipos para la API de IA (Objetivos y Plan de Acción)
export interface SmartGoal {
  id: string;
  title: string;
  smart: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  };
  pillar?: AresPillar;
  cluster?: string;
}

export interface ActionItem {
  id: string;
  area: string;
  suggestion: string;
  responsible: string;
  deadline: string;
}

export interface ObjectivesApiResponse {
  options: SmartGoal[];
}

export interface ActionPlanApiResponse {
  summary: string;
  items: ActionItem[];
}