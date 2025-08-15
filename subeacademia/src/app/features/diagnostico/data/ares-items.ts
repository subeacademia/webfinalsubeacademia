import { AresItem } from './diagnostic.models';

// Asunción: set representativo de ítems ARES por dimensión. Reemplazar/expandir según definición original si aplica.
export const ARES_ITEMS: AresItem[] = [
  { id: 'adopcion_01', dimension: 'adopcion', labelKey: 'Adopción Transversal de IA', phase: 'F5', tooltip: 'Nivel de adopción transversal y escalamiento de IA.' },
  { id: 'adopcion_02', dimension: 'adopcion', labelKey: 'Estrategia de Adopción', phase: 'F5', tooltip: 'Estrategia y roadmap de adopción con hitos.' },
  { id: 'riesgos_01', dimension: 'riesgos', labelKey: 'Gestión de Riesgos', phase: 'F2', tooltip: 'Gestión de riesgos de IA y controles asociados.' },
  { id: 'etica_01', dimension: 'etica', labelKey: 'Principios Éticos', phase: 'F2', tooltip: 'Principios éticos, sesgos y límites de uso.' },
  { id: 'seguridad_01', dimension: 'seguridad', labelKey: 'Seguridad y Privacidad', phase: 'F4', tooltip: 'Privacidad por diseño, acceso y protección de datos.' },
  { id: 'capacidad_01', dimension: 'capacidad', labelKey: 'Capacidades de Desarrollo', phase: 'F3', tooltip: 'Capacidades para desarrollar y operar IA.' },
  { id: 'datos_01', dimension: 'datos', labelKey: 'Gobierno de Datos', phase: 'F1', tooltip: 'Calidad, disponibilidad y gobierno de datos.' },
  { id: 'gobernanza_01', dimension: 'gobernanza', labelKey: 'Gobernanza ARES', phase: 'F1', tooltip: 'Roles y políticas ARES para toma de decisiones.' },
  { id: 'valor_01', dimension: 'valor', labelKey: 'Métricas de Valor', phase: 'F2', tooltip: 'Métricas de valor y casos de uso priorizados.' },
  { id: 'operacion_01', dimension: 'operacion', labelKey: 'Operación y Monitoreo', phase: 'F4', tooltip: 'Monitoreo, retraining y observabilidad.' },
  { id: 'talento_01', dimension: 'talento', labelKey: 'Gestión del Talento', phase: 'F1', tooltip: 'Disponibilidad y desarrollo de talento.' },
  { id: 'tecnologia_01', dimension: 'tecnologia', labelKey: 'Arquitectura Tecnológica', phase: 'F3', tooltip: 'Arquitectura, MLOps y herramientas.' },
  { id: 'integracion_01', dimension: 'integracion', labelKey: 'Integración de Sistemas', phase: 'F3', tooltip: 'Integración con sistemas y procesos.' },
  { id: 'cumplimiento_01', dimension: 'cumplimiento', labelKey: 'Cumplimiento Normativo', phase: 'F4', tooltip: 'Cumplimiento normativo y estándares.' },
  { id: 'transparencia_01', dimension: 'transparencia', labelKey: 'Transparencia y Explicabilidad', phase: 'F2', tooltip: 'Explicabilidad, trazabilidad y reportabilidad.' },
  { id: 'sostenibilidad_01', dimension: 'sostenibilidad', labelKey: 'Sostenibilidad', phase: 'F5', tooltip: 'Uso eficiente de recursos e impacto ambiental.' },
];


