// Modelos principales para el diagnóstico ARES-AI

export type LanguageCode = 'es' | 'en' | 'pt';

export type Segment = 'empresa' | 'educacion_superior' | 'educacion_escolar' | 'profesional_independiente';

export interface SegmentSelectionForm {
	segmento: Segment | null;
}

export interface ContextoStartupForm {
	industria: string | null;
	tamanoEquipo: number | null;
	antiguedadMeses: number | null;
	modeloNegocio: string | null;
}

export interface ContextoPymeForm {
	industria: string | null;
	tamanoEmpresa: number | null;
	facturacionAnual: number | null;
	zonaOperacion: string | null;
}

export interface ContextoCorporativoForm {
	industria: string | null;
	numEmpleados: number | null;
	presupuestoInnovacion: number | null;
	presenciaRegional: boolean | null;
}

export type ContextoForm = ContextoStartupForm | ContextoPymeForm | ContextoCorporativoForm;

export type ObjetivoEstrategico = 'eficiencia' | 'crecimiento' | 'innovacion' | 'experienciaCliente';

export interface ObjetivoForm {
	objetivo: ObjetivoEstrategico | null;
}

export interface LikertAnswer {
	itemId: string;
	value: 0 | 1 | 2 | 3 | 4 | 5; // 0: N/A ó No aplica
}

export type AresDimension = 'adopcion' | 'riesgos' | 'etica' | 'seguridad' | 'capacidad' | 'datos' | 'gobernanza' | 'valor' | 'operacion' | 'talento' | 'tecnologia' | 'integracion' | 'cumplimiento' | 'transparencia' | 'sostenibilidad';

export interface AresItem {
	id: string;
    dimension: AresDimension;
    labelKey: string; // clave i18n e.g. 'diagnostico.ares.item_01'
    phase?: 'F1' | 'F2' | 'F3' | 'F4' | 'F5';
    tooltip?: string;
}

export interface AresForm {
	respuestas: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | null>; // itemId -> valor
}

export interface CompetenciaDef {
	id: string;
	nameKey: string; // i18n key
	dimensionMap?: Partial<Record<AresDimension, number>>; // ponderaciones por dimensión
}

export type NivelCompetencia = 'incipiente' | 'basico' | 'intermedio' | 'avanzado' | 'lider';

export interface CompetenciasForm {
	niveles: Record<string, NivelCompetencia | null>; // competenciaId -> nivel autoevaluado
}

export interface LeadForm {
	nombre: string | null;
	email: string | null;
	telefono: string | null;
	aceptaComunicaciones: boolean | null;
}

export interface DiagnosticoFormValue {
	segmento: Segment | null;
	contexto: Partial<ContextoStartupForm & ContextoPymeForm & ContextoCorporativoForm>;
	objetivo: ObjetivoEstrategico | null;
	ares: AresForm;
	competencias: CompetenciasForm;
	lead: LeadForm;
}

export interface AresScoresByDimension {
	[dimension: string]: number; // 0-100
}

export interface CompetencyScore {
	competenciaId: string;
	puntaje: number; // 0-100
	nivel: NivelCompetencia;
}

export interface DiagnosticoScores {
	ares: AresScoresByDimension & { promedio: number };
	competencias: CompetencyScore[];
}

export interface DiagnosticoPersistedPayload {
	version: number;
	lang: LanguageCode;
	createdAt: number;
	form: DiagnosticoFormValue;
	scores?: DiagnosticoScores;
}


