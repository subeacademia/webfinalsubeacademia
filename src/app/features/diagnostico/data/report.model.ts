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
}
