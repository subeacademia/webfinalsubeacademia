import { CompetenciaDef, Segment } from './diagnostic.models';

// Asunción: mapeo de 13 competencias con claves i18n asociadas a methodology.competencies
export const COMPETENCIAS: CompetenciaDef[] = [
  { id: 'c1_pensamiento_critico', nameKey: 'Pensamiento Crítico y Análisis' },
  { id: 'c2_resolucion_problemas', nameKey: 'Resolución de Problemas Complejos' },
  { id: 'c3_alfabetizacion_datos', nameKey: 'Alfabetización de Datos' },
  { id: 'c4_comunicacion', nameKey: 'Comunicación Efectiva' },
  { id: 'c5_colaboracion', nameKey: 'Colaboración y Trabajo en Equipo' },
  { id: 'c6_creatividad', nameKey: 'Creatividad e Innovación' },
  { id: 'c7_diseno_tecnologico', nameKey: 'Diseño Tecnológico' },
  { id: 'c8_automatizacion_agentes', nameKey: 'Automatización y Agentes IA' },
  { id: 'c9_seguridad_privacidad', nameKey: 'Seguridad y Privacidad' },
  { id: 'c10_etica_responsabilidad', nameKey: 'Ética y Responsabilidad' },
  { id: 'c11_sostenibilidad', nameKey: 'Sostenibilidad' },
  { id: 'c12_aprendizaje_continuo', nameKey: 'Aprendizaje Continuo' },
  { id: 'c13_liderazgo_ia', nameKey: 'Liderazgo en IA' },
];

// Prioridades por segmento: top 6 sugeridas.
export const COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO: Record<Segment, string[]> = {
  empresa: [
    'c2_resolucion_problemas',
    'c3_alfabetizacion_datos',
    'c8_automatizacion_agentes',
    'c4_comunicacion',
    'c13_liderazgo_ia',
    'c11_sostenibilidad',
  ],
  educacion_superior: [
    'c3_alfabetizacion_datos',
    'c12_aprendizaje_continuo',
    'c4_comunicacion',
    'c7_diseno_tecnologico',
    'c10_etica_responsabilidad',
    'c5_colaboracion',
  ],
  educacion_escolar: [
    'c12_aprendizaje_continuo',
    'c4_comunicacion',
    'c5_colaboracion',
    'c3_alfabetizacion_datos',
    'c6_creatividad',
    'c10_etica_responsabilidad',
  ],
  profesional_independiente: [
    'c6_creatividad',
    'c2_resolucion_problemas',
    'c3_alfabetizacion_datos',
    'c8_automatizacion_agentes',
    'c12_aprendizaje_continuo',
    'c4_comunicacion',
  ],
};


