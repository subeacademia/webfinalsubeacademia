// Perfil de la empresa que realiza el diagnóstico
export interface CompanyProfile {
  industry: string;
  size: '1-10' | '11-50' | '51-200' | '201-1000' | '1001+';
  iaBudgetUSD: number | null;
}

// Información del usuario que completa el diagnóstico
export interface UserLead {
    name: string;
    email: string;
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

export interface Answer {
  value: number | null; // Escala de 1 a 5
  evidence?: string; // Lo renombraremos a "Notas" en la UI
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