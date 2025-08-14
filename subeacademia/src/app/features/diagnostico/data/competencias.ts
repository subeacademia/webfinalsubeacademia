import { CompetenciaDef, Segment } from './diagnostic.models';

// Asunción: mapeo de 13 competencias con claves i18n asociadas a methodology.competencies
export const COMPETENCIAS: CompetenciaDef[] = [
  { id: 'c1_pensamiento_critico', nameKey: 'methodology.competencies.c1_title' },
  { id: 'c2_resolucion_problemas', nameKey: 'methodology.competencies.c2_title' },
  { id: 'c3_alfabetizacion_datos', nameKey: 'methodology.competencies.c3_title' },
  { id: 'c4_comunicacion', nameKey: 'methodology.competencies.c4_title' },
  { id: 'c5_colaboracion', nameKey: 'methodology.competencies.c5_title' },
  { id: 'c6_creatividad', nameKey: 'methodology.competencies.c6_title' },
  { id: 'c7_diseno_tecnologico', nameKey: 'methodology.competencies.c7_title' },
  { id: 'c8_automatizacion_agentes', nameKey: 'methodology.competencies.c8_title' },
  { id: 'c9_seguridad_privacidad', nameKey: 'methodology.competencies.c9_title' },
  { id: 'c10_etica_responsabilidad', nameKey: 'methodology.competencies.c10_title' },
  { id: 'c11_sostenibilidad', nameKey: 'methodology.competencies.c11_title' },
  { id: 'c12_aprendizaje_continuo', nameKey: 'methodology.competencies.c12_title' },
  { id: 'c13_liderazgo_ia', nameKey: 'methodology.competencies.c13_title' },
];

// Prioridades por segmento: top 6 sugeridas.
export const COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO: Record<Segment, string[]> = {
  startup: [
    'c6_creatividad',
    'c2_resolucion_problemas',
    'c7_diseno_tecnologico',
    'c8_automatizacion_agentes',
    'c3_alfabetizacion_datos',
    'c13_liderazgo_ia',
  ],
  pyme: [
    'c2_resolucion_problemas',
    'c3_alfabetizacion_datos',
    'c8_automatizacion_agentes',
    'c4_comunicacion',
    'c5_colaboracion',
    'c12_aprendizaje_continuo',
  ],
  corporativo: [
    'c13_liderazgo_ia',
    'c9_seguridad_privacidad',
    'c10_etica_responsabilidad',
    'c11_sostenibilidad',
    'c3_alfabetizacion_datos',
    'c5_colaboracion',
  ],
};


