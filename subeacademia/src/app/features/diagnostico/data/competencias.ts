import { CompetenciaDef, Segment } from './diagnostic.models';

// Interfaces para los niveles de competencia
export interface CompetencyLevel {
  level: 'Explorador' | 'Aprendiz' | 'Practicante' | 'Avanzado' | 'Experto' | 'Maestro';
  definition: string;
  behaviors: string;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  levels: CompetencyLevel[];
}

// Asunción: mapeo de 13 competencias con claves i18n asociadas a methodology.competencies
export const COMPETENCIAS: CompetenciaDef[] = [
  { id: 'c1_pensamiento_critico', nameKey: 'Pensamiento Crítico y Análisis', cluster: 'Cognitivo-Analítico' },
  { id: 'c2_resolucion_problemas', nameKey: 'Resolución de Problemas Complejos', cluster: 'Cognitivo-Analítico' },
  { id: 'c3_alfabetizacion_datos', nameKey: 'Alfabetización de Datos', cluster: 'Cognitivo-Analítico' },
  { id: 'c4_comunicacion', nameKey: 'Comunicación Efectiva', cluster: 'Interpersonal-Social' },
  { id: 'c5_colaboracion', nameKey: 'Colaboración y Trabajo en Equipo', cluster: 'Interpersonal-Social' },
  { id: 'c6_creatividad', nameKey: 'Creatividad e Innovación', cluster: 'Cognitivo-Analítico' },
  { id: 'c7_diseno_tecnologico', nameKey: 'Diseño Tecnológico', cluster: 'Técnico-Funcional' },
  { id: 'c8_automatizacion_agentes', nameKey: 'Automatización y Agentes IA', cluster: 'Técnico-Funcional' },
  { id: 'c9_seguridad_privacidad', nameKey: 'Seguridad y Privacidad', cluster: 'Técnico-Funcional' },
  { id: 'c10_etica_responsabilidad', nameKey: 'Ética y Responsabilidad', cluster: 'Gestión y Estrategia' },
  { id: 'c11_sostenibilidad', nameKey: 'Sostenibilidad', cluster: 'Gestión y Estrategia' },
  { id: 'c12_aprendizaje_continuo', nameKey: 'Aprendizaje Continuo', cluster: 'Autogestión' },
  { id: 'c13_liderazgo_ia', nameKey: 'Liderazgo en IA', cluster: 'Gestión y Estrategia' },
];

// Datos completos de las 13 competencias con niveles de dominio
export const COMPETENCIAS_COMPLETAS: Competency[] = [
  {
    id: '1',
    name: 'Pensamiento Analítico e Innovación',
    description: 'Capacidad de analizar problemas complejos y generar soluciones innovadoras basadas en datos y razonamiento crítico.',
    levels: [
      { level: 'Explorador', definition: 'Identifica problemas sencillos y reconoce patrones básicos.', behaviors: 'Reconoce tendencias simples en datos, hace preguntas clave sobre situaciones cotidianas.' },
      { level: 'Aprendiz', definition: 'Interpreta información para encontrar relaciones entre variables.', behaviors: 'Analiza información de diferentes fuentes, identifica conexiones entre conceptos, formula hipótesis básicas.' },
      { level: 'Practicante', definition: 'Aplica métodos analíticos para resolver problemas complejos.', behaviors: 'Utiliza herramientas de análisis, evalúa múltiples soluciones, identifica sesgos en la información.' },
      { level: 'Avanzado', definition: 'Desarrolla estrategias analíticas innovadoras para desafíos únicos.', behaviors: 'Crea nuevos métodos de análisis, anticipa problemas futuros, lidera procesos de resolución.' },
      { level: 'Experto', definition: 'Revoluciona enfoques analíticos en su campo de especialización.', behaviors: 'Desarrolla teorías analíticas, innova en metodologías, establece estándares de la industria.' },
      { level: 'Maestro', definition: 'Transforma fundamentalmente el pensamiento analítico en su dominio.', behaviors: 'Crea nuevos paradigmas analíticos, influye en múltiples disciplinas, forma a la próxima generación de analistas.' }
    ]
  },
  {
    id: '2',
    name: 'Resolución de Problemas Complejos',
    description: 'Habilidad para abordar y resolver desafíos multidimensionales utilizando pensamiento sistémico y creativo.',
    levels: [
      { level: 'Explorador', definition: 'Resuelve problemas simples siguiendo pasos establecidos.', behaviors: 'Sigue procedimientos básicos, identifica soluciones obvias, pide ayuda cuando es necesario.' },
      { level: 'Aprendiz', definition: 'Aplica métodos de resolución de problemas a situaciones familiares.', behaviors: 'Utiliza técnicas estructuradas, evalúa opciones, implementa soluciones paso a paso.' },
      { level: 'Practicante', definition: 'Resuelve problemas complejos con múltiples variables.', behaviors: 'Analiza interdependencias, considera alternativas, evalúa riesgos y beneficios.' },
      { level: 'Avanzado', definition: 'Desarrolla soluciones innovadoras para problemas únicos.', behaviors: 'Crea nuevos enfoques, anticipa consecuencias, integra múltiples perspectivas.' },
      { level: 'Experto', definition: 'Resuelve problemas que otros consideran intratables.', behaviors: 'Desarrolla metodologías únicas, resuelve crisis complejas, establece precedentes.' },
      { level: 'Maestro', definition: 'Transforma la forma en que se abordan los problemas en su campo.', behaviors: 'Crea nuevos paradigmas de resolución, influye en políticas globales, forma a líderes.' }
    ]
  },
  {
    id: '3',
    name: 'Alfabetización de Datos',
    description: 'Capacidad para interpretar, analizar y comunicar información basada en datos de manera efectiva.',
    levels: [
      { level: 'Explorador', definition: 'Comprende conceptos básicos de datos y estadísticas.', behaviors: 'Lee gráficos simples, interpreta porcentajes, reconoce patrones básicos en información.' },
      { level: 'Aprendiz', definition: 'Analiza conjuntos de datos para extraer información relevante.', behaviors: 'Utiliza herramientas básicas de análisis, identifica tendencias, valida la calidad de datos.' },
      { level: 'Practicante', definition: 'Interpreta datos complejos para tomar decisiones informadas.', behaviors: 'Analiza múltiples fuentes, identifica correlaciones, comunica hallazgos efectivamente.' },
      { level: 'Avanzado', definition: 'Desarrolla estrategias de análisis de datos para problemas complejos.', behaviors: 'Diseña estudios, interpreta resultados estadísticos, valida metodologías.' },
      { level: 'Experto', definition: 'Crea metodologías avanzadas de análisis de datos.', behaviors: 'Desarrolla nuevos enfoques analíticos, resuelve problemas de datos complejos, establece estándares.' },
      { level: 'Maestro', definition: 'Revoluciona el campo del análisis de datos.', behaviors: 'Crea nuevos paradigmas, influye en políticas de datos, forma a expertos en el campo.' }
    ]
  },
  {
    id: '4',
    name: 'Comunicación Efectiva',
    description: 'Habilidad para transmitir ideas complejas de manera clara y persuasiva a diversos públicos.',
    levels: [
      { level: 'Explorador', definition: 'Comunica ideas básicas de manera clara y comprensible.', behaviors: 'Expresa pensamientos simples, escucha activamente, usa lenguaje apropiado.' },
      { level: 'Aprendiz', definition: 'Adapta el mensaje al público y contexto específico.', behaviors: 'Ajusta el tono y vocabulario, usa ejemplos relevantes, solicita retroalimentación.' },
      { level: 'Practicante', definition: 'Comunica conceptos complejos de manera accesible.', behaviors: 'Simplifica ideas complejas, usa analogías efectivas, maneja objeciones constructivamente.' },
      { level: 'Avanzado', definition: 'Influencia y persuade a través de la comunicación estratégica.', behaviors: 'Desarrolla narrativas convincentes, adapta mensajes a diferentes audiencias, lidera conversaciones difíciles.' },
      { level: 'Experto', definition: 'Transforma percepciones y comportamientos a través de la comunicación.', behaviors: 'Crea campañas de comunicación efectivas, resuelve crisis de comunicación, establece estándares.' },
      { level: 'Maestro', definition: 'Revoluciona la comunicación en su campo de especialización.', behaviors: 'Desarrolla nuevos enfoques comunicativos, influye en políticas globales, forma a comunicadores expertos.' }
    ]
  },
  {
    id: '5',
    name: 'Colaboración y Trabajo en Equipo',
    description: 'Capacidad para trabajar efectivamente en equipos diversos y multidisciplinarios.',
    levels: [
      { level: 'Explorador', definition: 'Contribuye activamente en equipos pequeños y colaborativos.', behaviors: 'Participa en discusiones, comparte ideas, apoya a otros miembros del equipo.' },
      { level: 'Aprendiz', definition: 'Facilita la colaboración y resuelve conflictos menores.', behaviors: 'Coordina tareas, media en desacuerdos, promueve la inclusión.' },
      { level: 'Practicante', definition: 'Lidera equipos pequeños y gestiona dinámicas grupales.', behaviors: 'Asigna responsabilidades, motiva al equipo, resuelve conflictos complejos.' },
      { level: 'Avanzado', definition: 'Construye y lidera equipos de alto rendimiento.', behaviors: 'Recluta talento, desarrolla cultura de equipo, establece estándares de excelencia.' },
      { level: 'Experto', definition: 'Transforma organizaciones a través del trabajo en equipo.', behaviors: 'Rediseña estructuras organizacionales, implementa culturas colaborativas, establece mejores prácticas.' },
      { level: 'Maestro', definition: 'Revoluciona la colaboración en su industria.', behaviors: 'Crea nuevos modelos de trabajo en equipo, influye en políticas laborales, forma a líderes colaborativos.' }
    ]
  },
  {
    id: '6',
    name: 'Creatividad e Innovación',
    description: 'Habilidad para generar ideas originales y transformar conceptos en soluciones innovadoras.',
    levels: [
      { level: 'Explorador', definition: 'Genera ideas creativas para problemas simples.', behaviors: 'Propone soluciones alternativas, experimenta con enfoques diferentes, se inspira en diversas fuentes.' },
      { level: 'Aprendiz', definition: 'Desarrolla conceptos innovadores para desafíos específicos.', behaviors: 'Combina ideas existentes de manera novedosa, prototipa soluciones, valida conceptos.' },
      { level: 'Practicante', definition: 'Crea soluciones innovadoras para problemas complejos.', behaviors: 'Desarrolla conceptos únicos, lidera procesos de innovación, evalúa viabilidad.' },
      { level: 'Avanzado', definition: 'Revoluciona enfoques en su área de especialización.', behaviors: 'Crea nuevos paradigmas, anticipa tendencias futuras, lidera transformaciones.' },
      { level: 'Experto', definition: 'Transforma industrias a través de la innovación disruptiva.', behaviors: 'Desarrolla tecnologías revolucionarias, establece nuevos estándares, influye en mercados globales.' },
      { level: 'Maestro', definition: 'Cambia fundamentalmente la forma en que se aborda la innovación.', behaviors: 'Crea nuevos campos de estudio, influye en políticas de innovación, forma a innovadores.' }
    ]
  },
  {
    id: '7',
    name: 'Diseño Tecnológico',
    description: 'Capacidad para crear soluciones tecnológicas centradas en el usuario y la experiencia.',
    levels: [
      { level: 'Explorador', definition: 'Comprende principios básicos de diseño y usabilidad.', behaviors: 'Identifica problemas de usabilidad, sugiere mejoras simples, aprecia el buen diseño.' },
      { level: 'Aprendiz', definition: 'Aplica metodologías de diseño para crear soluciones funcionales.', behaviors: 'Conduce investigaciones de usuario, crea prototipos, itera basado en feedback.' },
      { level: 'Practicante', definition: 'Diseña experiencias de usuario complejas y accesibles.', behaviors: 'Desarrolla sistemas de diseño, optimiza flujos de usuario, considera accesibilidad.' },
      { level: 'Avanzado', definition: 'Crea experiencias de usuario revolucionarias.', behaviors: 'Desarrolla nuevos patrones de diseño, anticipa necesidades futuras, establece estándares.' },
      { level: 'Experto', definition: 'Transforma la forma en que se diseñan las tecnologías.', behaviors: 'Crea nuevas metodologías de diseño, influye en políticas de accesibilidad, establece mejores prácticas.' },
      { level: 'Maestro', definition: 'Revoluciona el campo del diseño tecnológico.', behaviors: 'Crea nuevos paradigmas de diseño, influye en políticas globales, forma a diseñadores expertos.' }
    ]
  },
  {
    id: '8',
    name: 'Automatización y Agentes IA',
    description: 'Habilidad para diseñar, implementar y gestionar sistemas automatizados e inteligentes.',
    levels: [
      { level: 'Explorador', definition: 'Comprende conceptos básicos de automatización e IA.', behaviors: 'Identifica oportunidades de automatización, usa herramientas de IA existentes, reconoce limitaciones.' },
      { level: 'Aprendiz', definition: 'Implementa soluciones de automatización básicas.', behaviors: 'Configura flujos de trabajo automatizados, integra APIs de IA, monitorea rendimiento.' },
      { level: 'Practicante', definition: 'Diseña sistemas de automatización complejos.', behaviors: 'Arquitectura soluciones de IA, optimiza algoritmos, gestiona riesgos de automatización.' },
      { level: 'Avanzado', definition: 'Crea sistemas de IA innovadores y éticos.', behaviors: 'Desarrolla nuevos algoritmos, implementa controles éticos, anticipa impactos sociales.' },
      { level: 'Experto', definition: 'Revoluciona la automatización en su industria.', behaviors: 'Crea nuevas tecnologías de IA, establece estándares éticos, influye en regulaciones.' },
      { level: 'Maestro', definition: 'Transforma fundamentalmente la automatización global.', behaviors: 'Desarrolla nuevos paradigmas de IA, influye en políticas globales, forma a expertos en IA.' }
    ]
  },
  {
    id: '9',
    name: 'Seguridad y Privacidad',
    description: 'Comprensión y aplicación de principios de seguridad digital y protección de datos personales.',
    levels: [
      { level: 'Explorador', definition: 'Comprende conceptos básicos de seguridad digital.', behaviors: 'Reconoce amenazas comunes, usa contraseñas seguras, protege información personal.' },
      { level: 'Aprendiz', definition: 'Implementa medidas de seguridad básicas en entornos digitales.', behaviors: 'Configura configuraciones de seguridad, identifica vulnerabilidades, educa a otros.' },
      { level: 'Practicante', definition: 'Diseña e implementa estrategias de seguridad robustas.', behaviors: 'Desarrolla políticas de seguridad, conduce auditorías, responde a incidentes.' },
      { level: 'Avanzado', definition: 'Crea sistemas de seguridad innovadores y resilientes.', behaviors: 'Desarrolla nuevas tecnologías de seguridad, anticipa amenazas emergentes, establece estándares.' },
      { level: 'Experto', definition: 'Revoluciona la seguridad digital en su industria.', behaviors: 'Crea nuevos paradigmas de seguridad, influye en regulaciones, establece mejores prácticas.' },
      { level: 'Maestro', definition: 'Transforma la seguridad digital a nivel global.', behaviors: 'Desarrolla nuevos enfoques de seguridad, influye en políticas globales, forma a expertos en seguridad.' }
    ]
  },
  {
    id: '10',
    name: 'Ética y Responsabilidad',
    description: 'Comprensión y aplicación de principios éticos en el desarrollo y uso de tecnologías.',
    levels: [
      { level: 'Explorador', definition: 'Reconoce dilemas éticos básicos en tecnología.', behaviors: 'Identifica sesgos obvios, considera impactos en usuarios, pregunta sobre implicaciones éticas.' },
      { level: 'Aprendiz', definition: 'Aplica principios éticos en decisiones tecnológicas.', behaviors: 'Evalúa impactos éticos, implementa controles básicos, educa a otros sobre ética.' },
      { level: 'Practicante', definition: 'Diseña sistemas con consideraciones éticas integradas.', behaviors: 'Desarrolla marcos éticos, implementa auditorías éticas, resuelve dilemas complejos.' },
      { level: 'Avanzado', definition: 'Crea marcos éticos innovadores para tecnologías emergentes.', behaviors: 'Desarrolla nuevos enfoques éticos, anticipa desafíos futuros, establece estándares.' },
      { level: 'Experto', definition: 'Revoluciona la ética tecnológica en su industria.', behaviors: 'Crea nuevos paradigmas éticos, influye en regulaciones, establece mejores prácticas.' },
      { level: 'Maestro', definition: 'Transforma la ética tecnológica a nivel global.', behaviors: 'Desarrolla nuevos enfoques éticos, influye en políticas globales, forma a expertos en ética.' }
    ]
  },
  {
    id: '11',
    name: 'Sostenibilidad',
    description: 'Comprensión y aplicación de principios de desarrollo sostenible en proyectos tecnológicos.',
    levels: [
      { level: 'Explorador', definition: 'Reconoce conceptos básicos de sostenibilidad tecnológica.', behaviors: 'Identifica impactos ambientales, sugiere mejoras simples, considera eficiencia energética.' },
      { level: 'Aprendiz', definition: 'Implementa prácticas sostenibles en proyectos tecnológicos.', behaviors: 'Optimiza uso de recursos, evalúa impactos ambientales, educa a otros sobre sostenibilidad.' },
      { level: 'Practicante', definition: 'Diseña sistemas tecnológicos sostenibles y eficientes.', behaviors: 'Desarrolla estrategias de sostenibilidad, implementa métricas ambientales, optimiza recursos.' },
      { level: 'Avanzado', definition: 'Crea soluciones tecnológicas revolucionarias para la sostenibilidad.', behaviors: 'Desarrolla tecnologías verdes, anticipa desafíos ambientales, establece estándares.' },
      { level: 'Experto', definition: 'Transforma industrias hacia la sostenibilidad tecnológica.', behaviors: 'Crea nuevos paradigmas sostenibles, influye en políticas ambientales, establece mejores prácticas.' },
      { level: 'Maestro', definition: 'Revoluciona la sostenibilidad tecnológica global.', behaviors: 'Desarrolla nuevos enfoques sostenibles, influye en políticas globales, forma a expertos en sostenibilidad.' }
    ]
  },
  {
    id: '12',
    name: 'Aprendizaje Continuo',
    description: 'Compromiso con el desarrollo profesional continuo y la adaptación a nuevas tecnologías.',
    levels: [
      { level: 'Explorador', definition: 'Mantiene curiosidad por nuevas tecnologías y tendencias.', behaviors: 'Lee sobre nuevas tecnologías, participa en cursos básicos, experimenta con herramientas nuevas.' },
      { level: 'Aprendiz', definition: 'Desarrolla hábitos sistemáticos de aprendizaje continuo.', behaviors: 'Establece metas de aprendizaje, participa en comunidades profesionales, comparte conocimiento.' },
      { level: 'Practicante', definition: 'Lidera iniciativas de aprendizaje organizacional.', behaviors: 'Diseña programas de capacitación, mentorea a otros, crea recursos de aprendizaje.' },
      { level: 'Avanzado', definition: 'Crea culturas de aprendizaje continuo en organizaciones.', behaviors: 'Desarrolla estrategias de aprendizaje, implementa sistemas de conocimiento, establece estándares.' },
      { level: 'Experto', definition: 'Revoluciona el aprendizaje continuo en su industria.', behaviors: 'Crea nuevos enfoques de aprendizaje, influye en políticas educativas, establece mejores prácticas.' },
      { level: 'Maestro', definition: 'Transforma el aprendizaje continuo a nivel global.', behaviors: 'Desarrolla nuevos paradigmas educativos, influye en políticas globales, forma a educadores.' }
    ]
  },
  {
    id: '13',
    name: 'Liderazgo en IA',
    description: 'Capacidad para liderar equipos y organizaciones en la adopción y desarrollo de tecnologías de IA.',
    levels: [
      { level: 'Explorador', definition: 'Comprende conceptos básicos de liderazgo en entornos tecnológicos.', behaviors: 'Observa líderes efectivos, participa en proyectos de equipo, desarrolla habilidades de comunicación.' },
      { level: 'Aprendiz', definition: 'Lidera pequeños equipos en proyectos de IA.', behaviors: 'Coordina tareas, motiva al equipo, resuelve conflictos menores, establece metas claras.' },
      { level: 'Practicante', definition: 'Lidera equipos multidisciplinarios en proyectos complejos de IA.', behaviors: 'Gestiona recursos, desarrolla talento, establece estrategias, resuelve crisis.' },
      { level: 'Avanzado', definition: 'Transforma organizaciones a través de la adopción de IA.', behaviors: 'Desarrolla estrategias de transformación digital, lidera cambios culturales, establece visión de futuro.' },
      { level: 'Experto', definition: 'Revoluciona la adopción de IA en su industria.', behaviors: 'Crea nuevos modelos de liderazgo en IA, influye en políticas industriales, establece estándares.' },
      { level: 'Maestro', definition: 'Transforma fundamentalmente el liderazgo en IA global.', behaviors: 'Desarrolla nuevos paradigmas de liderazgo, influye en políticas globales, forma a líderes en IA.' }
    ]
  }
];

// Prioridades por segmento: top 6 sugeridas.
export const COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO: Record<string, string[]> = {
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


