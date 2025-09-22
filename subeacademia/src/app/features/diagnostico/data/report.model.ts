// ===== NUEVAS INTERFACES ESTRATÉGICAS =====

export interface KPI {
  name: string;
  target: string; // ej: "Reducir en 15%", "Aumentar a 8/10"
}

export interface ActionStep {
  title: string;
  description: string;
  expectedOutcome: string;
}

export interface RecommendedService {
  name: string;
  type: 'Curso' | 'Asesoría';
  // Futuro: link: string;
}

export interface StrategicInitiative {
  painPoint: string; // El dolor que resuelve, ej: "Toma de decisiones lenta y basada en intuición."
  businessImpact: string; // El impacto en el negocio, ej: "Pérdida de oportunidades y baja eficiencia operativa."
  title: string; // Título de la iniciativa, ej: "Fomentar una Cultura de Datos y Liderazgo Analítico"
  description: string;
  steps: ActionStep[];
  kpis: KPI[];
  timeline: string; // ej: "3-6 Meses"
  effort: 'Bajo' | 'Medio' | 'Alto';
  primaryCompetency: string; // ID de la competencia principal que aborda
  aresDimension: 'Agilidad' | 'Responsabilidad' | 'Ética' | 'Sostenibilidad';
  recommendedService: RecommendedService;
}

export interface ExecutiveSummary {
  currentMaturity: string; // Nivel de madurez general
  mainChallenge: string; // Principal desafío identificado
  strategicRecommendation: string; // Recomendación de alto nivel
}

// ===== NUEVAS INTERFACES PARA ANÁLISIS DE MADUREZ E INSIGHTS =====

export interface AiMaturity {
  level: 'Incipiente' | 'En Desarrollo' | 'Establecido' | 'Estratégico' | 'Transformador';
  score: number; // Un puntaje de 0 a 100 calculado por la IA
  summary: string; // Un párrafo explicando por qué se asignó este nivel
}

export interface CompetencyAnalysis {
  competencyId: string;
  competencyName: string;
  score: number;
  analysis: string; // Análisis de la IA sobre el impacto de este puntaje
}

export interface StrategicInsight {
  title: string;
  description: string;
  type: 'Fortaleza Clave' | 'Riesgo Crítico' | 'Oportunidad Oculta';
}

// ===== INTERFACES LEGACY (MANTENIDAS PARA COMPATIBILIDAD) =====

export interface ReportSection {
  dimension: string;
  puntaje: number;
  analisis: string;
}

export interface RecommendedAction {
  accion: string;
  detalle: string;
  curso_recomendado_id: string | null;
}

export interface ActionPlanSection {
  area_mejora: string;
  descripcion_problema: string;
  acciones_recomendadas: RecommendedAction[];
}

export interface DiagnosticReport {
  titulo_informe: string;
  resumen_ejecutivo: string;
  analisis_ares: ReportSection[];
  plan_de_accion: ActionPlanSection[];
  // Plan de acción generado por la nueva IA (estructura compacta)
  planDeAccion?: { items: PlanDeAccionItem[] };
  alineacionObjetivos?: string; // Explica cómo el plan de acción ayuda a lograr el objetivo principal del usuario
}

// ===== NUEVA INTERFAZ PRINCIPAL DE REPORTE ESTRATÉGICO =====

export interface ReportData {
  id: string;
  timestamp: Date;
  leadInfo: {
    name: string;
    email: string;
    companyName?: string;
  };
  contexto: any; // El contexto que ya tienes
  aresScores: { [key: string]: number };
  competencyScores: { id: string; name: string; score: number }[];
  companyContext: {
    industry: string;
    size: string;
    mainObjective: string;
  };
  
  // --- NUEVOS CAMPOS DE INTELIGENCIA ---
  aiMaturity: AiMaturity;
  executiveSummary: string; // Un resumen ejecutivo totalmente generado por IA
  strengthsAnalysis: CompetencyAnalysis[]; // Análisis de las 3 competencias más altas
  weaknessesAnalysis: CompetencyAnalysis[]; // Análisis de las 3 competencias más bajas
  insights: StrategicInsight[]; // 2-3 insights estratégicos clave (riesgos/oportunidades)
  actionPlan: any[]; // Mantén la estructura del plan de acción que ya tienes
  
  // Metadatos adicionales
  generatedAt: Date;
  version: string;
}

// ===== INTERFACES LEGACY (MANTENIDAS PARA COMPATIBILIDAD) =====

// Nueva interfaz Report para el nuevo flujo de IA
export interface Report {
  titulo: string;
  resumen: string;
  analisisCompetencias: Array<{
    competencia: string;
    puntaje: number;
    descripcion: string;
    sugerencia: string;
  }>;
  identificacionBrechas: string;
  planDeAccion: Array<{
    area: string;
    acciones: Array<{
      accion: string;
      descripcion: string;
      recursos: string[];
    }>;
  }>;
  recomendacionesGenerales: string;
  alineacionObjetivos: string; // Explica cómo el plan de acción ayuda a lograr el objetivo principal del usuario
}

export interface PlanDeAccionItem {
  accion: string;
  completado?: boolean;
}
