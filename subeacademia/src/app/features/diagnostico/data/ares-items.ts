import { AresItem } from './diagnostic.models';

// Asunción: set representativo de ítems ARES por dimensión. Reemplazar/expandir según definición original si aplica.
export const ARES_ITEMS: AresItem[] = [
  { id: 'adopcion_01', dimension: 'adopcion', labelKey: 'diagnostico.ares.items.adopcion_01', phase: 'F5', tooltip: 'Nivel de adopción transversal y escalamiento de IA.' },
  { id: 'adopcion_02', dimension: 'adopcion', labelKey: 'diagnostico.ares.items.adopcion_02', phase: 'F5', tooltip: 'Estrategia y roadmap de adopción con hitos.' },
  { id: 'riesgos_01', dimension: 'riesgos', labelKey: 'diagnostico.ares.items.riesgos_01', phase: 'F2', tooltip: 'Gestión de riesgos de IA y controles asociados.' },
  { id: 'etica_01', dimension: 'etica', labelKey: 'diagnostico.ares.items.etica_01', phase: 'F2', tooltip: 'Principios éticos, sesgos y límites de uso.' },
  { id: 'seguridad_01', dimension: 'seguridad', labelKey: 'diagnostico.ares.items.seguridad_01', phase: 'F4', tooltip: 'Privacidad por diseño, acceso y protección de datos.' },
  { id: 'capacidad_01', dimension: 'capacidad', labelKey: 'diagnostico.ares.items.capacidad_01', phase: 'F3', tooltip: 'Capacidades para desarrollar y operar IA.' },
  { id: 'datos_01', dimension: 'datos', labelKey: 'diagnostico.ares.items.datos_01', phase: 'F1', tooltip: 'Calidad, disponibilidad y gobierno de datos.' },
  { id: 'gobernanza_01', dimension: 'gobernanza', labelKey: 'diagnostico.ares.items.gobernanza_01', phase: 'F1', tooltip: 'Roles y políticas ARES para toma de decisiones.' },
  { id: 'valor_01', dimension: 'valor', labelKey: 'diagnostico.ares.items.valor_01', phase: 'F2', tooltip: 'Métricas de valor y casos de uso priorizados.' },
  { id: 'operacion_01', dimension: 'operacion', labelKey: 'diagnostico.ares.items.operacion_01', phase: 'F4', tooltip: 'Monitoreo, retraining y observabilidad.' },
  { id: 'talento_01', dimension: 'talento', labelKey: 'diagnostico.ares.items.talento_01', phase: 'F1', tooltip: 'Disponibilidad y desarrollo de talento.' },
  { id: 'tecnologia_01', dimension: 'tecnologia', labelKey: 'diagnostico.ares.items.tecnologia_01', phase: 'F3', tooltip: 'Arquitectura, MLOps y herramientas.' },
  { id: 'integracion_01', dimension: 'integracion', labelKey: 'diagnostico.ares.items.integracion_01', phase: 'F3', tooltip: 'Integración con sistemas y procesos.' },
  { id: 'cumplimiento_01', dimension: 'cumplimiento', labelKey: 'diagnostico.ares.items.cumplimiento_01', phase: 'F4', tooltip: 'Cumplimiento normativo y estándares.' },
  { id: 'transparencia_01', dimension: 'transparencia', labelKey: 'diagnostico.ares.items.transparencia_01', phase: 'F2', tooltip: 'Explicabilidad, trazabilidad y reportabilidad.' },
  { id: 'sostenibilidad_01', dimension: 'sostenibilidad', labelKey: 'diagnostico.ares.items.sostenibilidad_01', phase: 'F5', tooltip: 'Uso eficiente de recursos e impacto ambiental.' },
];


