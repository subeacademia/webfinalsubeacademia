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
