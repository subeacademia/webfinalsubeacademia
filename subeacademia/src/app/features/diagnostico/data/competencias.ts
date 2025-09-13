export interface Level {
  level: string;
  definition: string;
  behaviors: string;
}

export interface CompetencyQuestion {
  id: string;
  text: string;
  isCritical?: boolean;
}

export interface Competency {
  id: string;
  name: string;
  cluster: string; // Se añade la propiedad que faltaba
  description: string;
  levels: Level[];
  questions: CompetencyQuestion[];
}

export const competencias: Competency[] = [
    {
        id: 'pensamiento_critico',
        name: 'Pensamiento Crítico',
        cluster: 'Cognitivo-Analítico',
        description: 'Capacidad para analizar información de manera objetiva y tomar decisiones lógicas.',
        levels: [
            { level: 'Explorador', definition: 'Identifica los elementos clave de un problema.', behaviors: 'Hace preguntas básicas para entender la situación.' },
            { level: 'Aprendiz', definition: 'Distingue entre hechos y opiniones.', behaviors: 'Evalúa la credibilidad de las fuentes de información.' },
            { level: 'Practicante', definition: 'Analiza argumentos complejos y reconoce falacias.', behaviors: 'Descompone problemas en partes manejables.' },
            { level: 'Avanzado', definition: 'Construye argumentos sólidos y bien fundamentados.', behaviors: 'Propone soluciones innovadoras basadas en el análisis.' },
            { level: 'Experto', definition: 'Evalúa sistemas complejos y anticipa consecuencias a largo plazo.', behaviors: 'Cuestiona supuestos fundamentales para reformular problemas.' },
            { level: 'Maestro', definition: 'Crea nuevos marcos conceptuales para abordar problemas ambiguos.', behaviors: 'Lidera a otros en la resolución de problemas complejos.' },
        ],
        questions: [
            { id: 'pc_q1', text: 'Cuando me enfrento a un problema complejo, lo descompongo en partes más pequeñas para entenderlo mejor.' },
            { id: 'pc_q2', text: 'Evalúo la credibilidad de la información antes de aceptarla como un hecho.', isCritical: true },
        ]
    },
    {
        id: 'resolucion_problemas',
        name: 'Resolución de Problemas',
        cluster: 'Cognitivo-Analítico',
        description: 'Habilidad para abordar desafíos complejos y encontrar soluciones efectivas.',
        levels: [
            { level: 'Explorador', definition: 'Identifica problemas simples y busca soluciones básicas.', behaviors: 'Sigue procedimientos establecidos para resolver problemas rutinarios.' },
            { level: 'Aprendiz', definition: 'Aplica metodologías estructuradas para resolver problemas.', behaviors: 'Utiliza técnicas de análisis para descomponer problemas.' },
            { level: 'Practicante', definition: 'Resuelve problemas complejos con múltiples variables.', behaviors: 'Considera diferentes perspectivas y alternativas.' },
            { level: 'Avanzado', definition: 'Desarrolla soluciones innovadoras para problemas únicos.', behaviors: 'Crea nuevos enfoques y metodologías.' },
            { level: 'Experto', definition: 'Resuelve problemas que otros consideran intratables.', behaviors: 'Establece nuevos estándares en resolución de problemas.' },
            { level: 'Maestro', definition: 'Transforma la forma en que se abordan los problemas.', behaviors: 'Lidera la innovación en metodologías de resolución.' },
        ],
        questions: [
            { id: 'rp_q1', text: 'Cuando enfrento un problema nuevo, busco múltiples enfoques para resolverlo.' },
            { id: 'rp_q2', text: 'Evalúo las consecuencias a largo plazo de mis decisiones.', isCritical: true },
        ]
    },
    {
        id: 'alfabetizacion_datos',
        name: 'Alfabetización de Datos',
        cluster: 'Cognitivo-Analítico',
        description: 'Capacidad para interpretar, analizar y comunicar información basada en datos.',
        levels: [
            { level: 'Explorador', definition: 'Comprende conceptos básicos de datos y estadísticas.', behaviors: 'Lee gráficos simples e interpreta porcentajes básicos.' },
            { level: 'Aprendiz', definition: 'Analiza conjuntos de datos para extraer información relevante.', behaviors: 'Utiliza herramientas básicas de análisis de datos.' },
            { level: 'Practicante', definition: 'Interpreta datos complejos para tomar decisiones informadas.', behaviors: 'Identifica patrones y tendencias en los datos.' },
            { level: 'Avanzado', definition: 'Desarrolla estrategias de análisis de datos.', behaviors: 'Crea visualizaciones efectivas de datos complejos.' },
            { level: 'Experto', definition: 'Crea metodologías avanzadas de análisis de datos.', behaviors: 'Desarrolla nuevos enfoques analíticos.' },
            { level: 'Maestro', definition: 'Revoluciona el campo del análisis de datos.', behaviors: 'Establece nuevos paradigmas en ciencia de datos.' },
        ],
        questions: [
            { id: 'ad_q1', text: 'Puedo interpretar gráficos y estadísticas para tomar decisiones informadas.' },
            { id: 'ad_q2', text: 'Identifico patrones y tendencias en conjuntos de datos complejos.', isCritical: true },
        ]
    },
    {
        id: 'comunicacion',
        name: 'Comunicación Efectiva',
        cluster: 'Interpersonal-Social',
        description: 'Habilidad para transmitir ideas de manera clara y persuasiva.',
        levels: [
            { level: 'Explorador', definition: 'Comunica ideas básicas de manera clara.', behaviors: 'Expresa pensamientos de forma comprensible.' },
            { level: 'Aprendiz', definition: 'Adapta el mensaje al público específico.', behaviors: 'Ajusta el tono y vocabulario según la audiencia.' },
            { level: 'Practicante', definition: 'Comunica conceptos complejos de manera accesible.', behaviors: 'Simplifica ideas técnicas para audiencias generales.' },
            { level: 'Avanzado', definition: 'Influencia a través de la comunicación estratégica.', behaviors: 'Desarrolla narrativas convincentes.' },
            { level: 'Experto', definition: 'Transforma percepciones a través de la comunicación.', behaviors: 'Crea campañas de comunicación efectivas.' },
            { level: 'Maestro', definition: 'Revoluciona la comunicación en su campo.', behaviors: 'Establece nuevos estándares comunicativos.' },
        ],
        questions: [
            { id: 'com_q1', text: 'Adapto mi mensaje según mi audiencia para asegurar comprensión.' },
            { id: 'com_q2', text: 'Puedo explicar conceptos técnicos complejos de manera simple.', isCritical: true },
        ]
    },
    {
        id: 'colaboracion',
        name: 'Colaboración y Trabajo en Equipo',
        cluster: 'Interpersonal-Social',
        description: 'Capacidad para trabajar efectivamente en equipos diversos.',
        levels: [
            { level: 'Explorador', definition: 'Contribuye activamente en equipos pequeños.', behaviors: 'Participa en discusiones y comparte ideas.' },
            { level: 'Aprendiz', definition: 'Facilita la colaboración y resuelve conflictos menores.', behaviors: 'Coordina tareas y media en desacuerdos.' },
            { level: 'Practicante', definition: 'Lidera equipos pequeños y gestiona dinámicas grupales.', behaviors: 'Asigna responsabilidades y motiva al equipo.' },
            { level: 'Avanzado', definition: 'Construye equipos de alto rendimiento.', behaviors: 'Recluta talento y desarrolla cultura de equipo.' },
            { level: 'Experto', definition: 'Transforma organizaciones a través del trabajo en equipo.', behaviors: 'Rediseña estructuras organizacionales.' },
            { level: 'Maestro', definition: 'Revoluciona la colaboración en su industria.', behaviors: 'Crea nuevos modelos de trabajo en equipo.' },
        ],
        questions: [
            { id: 'col_q1', text: 'Trabajo efectivamente en equipos multidisciplinarios.' },
            { id: 'col_q2', text: 'Facilito la colaboración entre diferentes áreas de la organización.', isCritical: true },
        ]
    },
    {
        id: 'creatividad_innovacion',
        name: 'Creatividad e Innovación',
        cluster: 'Cognitivo-Analítico',
        description: 'Capacidad para generar ideas originales y soluciones innovadoras.',
        levels: [
            { level: 'Explorador', definition: 'Genera ideas básicas y creativas.', behaviors: 'Propone soluciones simples y originales.' },
            { level: 'Aprendiz', definition: 'Aplica técnicas de creatividad estructurada.', behaviors: 'Utiliza métodos como brainstorming y design thinking.' },
            { level: 'Practicante', definition: 'Desarrolla soluciones innovadoras para problemas complejos.', behaviors: 'Combina ideas de diferentes disciplinas.' },
            { level: 'Avanzado', definition: 'Crea procesos de innovación sistemáticos.', behaviors: 'Establece culturas de innovación en equipos.' },
            { level: 'Experto', definition: 'Lidera transformaciones innovadoras en organizaciones.', behaviors: 'Desarrolla nuevas metodologías de innovación.' },
            { level: 'Maestro', definition: 'Revoluciona industrias con innovaciones disruptivas.', behaviors: 'Crea nuevos paradigmas de pensamiento.' },
        ],
        questions: [
            { id: 'ci_q1', text: 'Genero ideas creativas y originales para resolver problemas complejos.' },
            { id: 'ci_q2', text: 'Aplico metodologías de innovación como design thinking o lean startup.', isCritical: true },
        ]
    },
    {
        id: 'diseno_tecnologico',
        name: 'Diseño Tecnológico',
        cluster: 'Técnico-Digital',
        description: 'Capacidad para crear soluciones tecnológicas centradas en el usuario.',
        levels: [
            { level: 'Explorador', definition: 'Comprende principios básicos de diseño de interfaces.', behaviors: 'Crea prototipos simples y funcionales.' },
            { level: 'Aprendiz', definition: 'Aplica metodologías de diseño centrado en el usuario.', behaviors: 'Realiza investigación de usuarios y testing.' },
            { level: 'Practicante', definition: 'Diseña experiencias digitales complejas y accesibles.', behaviors: 'Integra principios de UX/UI en soluciones tecnológicas.' },
            { level: 'Avanzado', definition: 'Desarrolla sistemas de diseño y arquitecturas de información.', behaviors: 'Crea frameworks de diseño reutilizables.' },
            { level: 'Experto', definition: 'Lidera estrategias de diseño tecnológico a nivel organizacional.', behaviors: 'Establece estándares de diseño en la industria.' },
            { level: 'Maestro', definition: 'Revoluciona el campo del diseño tecnológico.', behaviors: 'Crea nuevos paradigmas de interacción humano-computadora.' },
        ],
        questions: [
            { id: 'dt_q1', text: 'Diseño soluciones tecnológicas centradas en las necesidades del usuario.' },
            { id: 'dt_q2', text: 'Aplico principios de accesibilidad y usabilidad en mis diseños.', isCritical: true },
        ]
    },
    {
        id: 'automatizacion_agentes_ia',
        name: 'Automatización y Agentes IA',
        cluster: 'Técnico-Digital',
        description: 'Capacidad para implementar y gestionar sistemas automatizados e inteligentes.',
        levels: [
            { level: 'Explorador', definition: 'Comprende conceptos básicos de automatización.', behaviors: 'Utiliza herramientas de automatización simples.' },
            { level: 'Aprendiz', definition: 'Implementa automatizaciones básicas con scripts y macros.', behaviors: 'Configura workflows automatizados.' },
            { level: 'Practicante', definition: 'Desarrolla sistemas de automatización complejos.', behaviors: 'Integra múltiples herramientas y APIs.' },
            { level: 'Avanzado', definition: 'Crea agentes de IA y sistemas inteligentes.', behaviors: 'Implementa machine learning y NLP.' },
            { level: 'Experto', definition: 'Lidera estrategias de automatización organizacional.', behaviors: 'Diseña arquitecturas de IA escalables.' },
            { level: 'Maestro', definition: 'Revoluciona la automatización con nuevas tecnologías.', behaviors: 'Crea nuevos paradigmas de interacción humano-IA.' },
        ],
        questions: [
            { id: 'aa_q1', text: 'Implemento sistemas de automatización para optimizar procesos repetitivos.' },
            { id: 'aa_q2', text: 'Desarrollo y gestiono agentes de IA para tareas específicas.', isCritical: true },
        ]
    },
    {
        id: 'adaptabilidad_flexibilidad',
        name: 'Adaptabilidad y Flexibilidad',
        cluster: 'Interpersonal-Social',
        description: 'Capacidad para ajustarse a cambios y nuevas situaciones de manera efectiva.',
        levels: [
            { level: 'Explorador', definition: 'Se adapta a cambios simples y predecibles.', behaviors: 'Acepta nuevas tareas y responsabilidades.' },
            { level: 'Aprendiz', definition: 'Maneja cambios moderados con flexibilidad.', behaviors: 'Ajusta métodos de trabajo según nuevas circunstancias.' },
            { level: 'Practicante', definition: 'Se adapta rápidamente a cambios complejos.', behaviors: 'Reorganiza prioridades y recursos dinámicamente.' },
            { level: 'Avanzado', definition: 'Anticipa cambios y prepara respuestas proactivas.', behaviors: 'Desarrolla estrategias de adaptación anticipada.' },
            { level: 'Experto', definition: 'Lidera la adaptación organizacional a cambios disruptivos.', behaviors: 'Transforma organizaciones para ser más ágiles.' },
            { level: 'Maestro', definition: 'Crea culturas organizacionales de adaptación continua.', behaviors: 'Establece nuevos modelos de flexibilidad organizacional.' },
        ],
        questions: [
            { id: 'af_q1', text: 'Me adapto rápidamente a cambios en prioridades y objetivos.' },
            { id: 'af_q2', text: 'Mantengo la productividad en entornos de incertidumbre y cambio constante.', isCritical: true },
        ]
    },
    {
        id: 'etica_responsabilidad',
        name: 'Ética y Responsabilidad',
        cluster: 'Valores-Ética',
        description: 'Capacidad para actuar con integridad y responsabilidad social en el uso de tecnología.',
        levels: [
            { level: 'Explorador', definition: 'Comprende principios básicos de ética en tecnología.', behaviors: 'Sigue códigos de conducta establecidos.' },
            { level: 'Aprendiz', definition: 'Aplica consideraciones éticas en decisiones tecnológicas.', behaviors: 'Evalúa el impacto social de las tecnologías.' },
            { level: 'Practicante', definition: 'Integra principios éticos en el diseño de soluciones.', behaviors: 'Implementa medidas de transparencia y explicabilidad.' },
            { level: 'Avanzado', definition: 'Desarrolla marcos éticos para proyectos tecnológicos.', behaviors: 'Establece comités de ética y gobernanza.' },
            { level: 'Experto', definition: 'Lidera iniciativas de responsabilidad social tecnológica.', behaviors: 'Crea estándares éticos para la industria.' },
            { level: 'Maestro', definition: 'Revoluciona la ética en tecnología a nivel global.', behaviors: 'Establece nuevos paradigmas de responsabilidad tecnológica.' },
        ],
        questions: [
            { id: 'er_q1', text: 'Considero el impacto ético y social de las tecnologías que desarrollo o uso.' },
            { id: 'er_q2', text: 'Implemento medidas de transparencia y explicabilidad en sistemas de IA.', isCritical: true },
        ]
    },
    {
        id: 'sostenibilidad',
        name: 'Sostenibilidad',
        cluster: 'Valores-Ética',
        description: 'Capacidad para considerar el impacto ambiental y social a largo plazo en las decisiones tecnológicas.',
        levels: [
            { level: 'Explorador', definition: 'Comprende conceptos básicos de sostenibilidad tecnológica.', behaviors: 'Considera el consumo energético en decisiones tecnológicas.' },
            { level: 'Aprendiz', definition: 'Aplica principios de sostenibilidad en proyectos tecnológicos.', behaviors: 'Evalúa el impacto ambiental de las soluciones.' },
            { level: 'Practicante', definition: 'Diseña soluciones tecnológicas sostenibles.', behaviors: 'Implementa métricas de sostenibilidad en proyectos.' },
            { level: 'Avanzado', definition: 'Desarrolla estrategias de sostenibilidad tecnológica.', behaviors: 'Crea programas de sostenibilidad organizacional.' },
            { level: 'Experto', definition: 'Lidera transformaciones hacia tecnologías sostenibles.', behaviors: 'Establece estándares de sostenibilidad en la industria.' },
            { level: 'Maestro', definition: 'Revoluciona la sostenibilidad en tecnología.', behaviors: 'Crea nuevos paradigmas de tecnología verde.' },
        ],
        questions: [
            { id: 'sos_q1', text: 'Considero el impacto ambiental y social de las tecnologías que implemento.' },
            { id: 'sos_q2', text: 'Desarrollo soluciones tecnológicas que contribuyen a la sostenibilidad.', isCritical: true },
        ]
    },
    {
        id: 'aprendizaje_continuo',
        name: 'Aprendizaje Continuo',
        cluster: 'Interpersonal-Social',
        description: 'Capacidad para desarrollar habilidades constantemente y mantenerse actualizado.',
        levels: [
            { level: 'Explorador', definition: 'Identifica áreas de mejora y busca oportunidades de aprendizaje.', behaviors: 'Participa en cursos y capacitaciones básicas.' },
            { level: 'Aprendiz', definition: 'Desarrolla planes de aprendizaje estructurados.', behaviors: 'Aplica nuevas habilidades en proyectos reales.' },
            { level: 'Practicante', definition: 'Mantiene un ritmo constante de actualización profesional.', behaviors: 'Comparte conocimiento con otros y aprende de la experiencia.' },
            { level: 'Avanzado', definition: 'Lidera iniciativas de aprendizaje organizacional.', behaviors: 'Crea programas de desarrollo profesional.' },
            { level: 'Experto', definition: 'Transforma culturas organizacionales hacia el aprendizaje continuo.', behaviors: 'Establece ecosistemas de aprendizaje innovadores.' },
            { level: 'Maestro', definition: 'Revoluciona el aprendizaje en su campo profesional.', behaviors: 'Crea nuevos paradigmas de desarrollo profesional.' },
        ],
        questions: [
            { id: 'ac_q1', text: 'Mantengo un plan de aprendizaje continuo para desarrollar nuevas habilidades.' },
            { id: 'ac_q2', text: 'Aplico activamente lo que aprendo en proyectos y situaciones reales.', isCritical: true },
        ]
    },
    {
        id: 'liderazgo_ia',
        name: 'Liderazgo en IA',
        cluster: 'Interpersonal-Social',
        description: 'Capacidad para guiar equipos y organizaciones en la transformación digital con IA.',
        levels: [
            { level: 'Explorador', definition: 'Comprende conceptos básicos de liderazgo en transformación digital.', behaviors: 'Participa en proyectos de IA como miembro del equipo.' },
            { level: 'Aprendiz', definition: 'Lidera pequeños equipos en proyectos de IA.', behaviors: 'Facilita la adopción de nuevas tecnologías.' },
            { level: 'Practicante', definition: 'Gestiona equipos multidisciplinarios en iniciativas de IA.', behaviors: 'Desarrolla estrategias de cambio organizacional.' },
            { level: 'Avanzado', definition: 'Lidera transformaciones digitales a nivel departamental.', behaviors: 'Crea culturas de innovación y experimentación.' },
            { level: 'Experto', definition: 'Dirige transformaciones digitales organizacionales completas.', behaviors: 'Establece visiones estratégicas de IA.' },
            { level: 'Maestro', definition: 'Revoluciona el liderazgo en transformación digital.', behaviors: 'Crea nuevos modelos de liderazgo tecnológico.' },
        ],
        questions: [
            { id: 'li_q1', text: 'Lidero equipos en la implementación de proyectos de IA y transformación digital.' },
            { id: 'li_q2', text: 'Desarrollo estrategias de cambio organizacional para adoptar nuevas tecnologías.', isCritical: true },
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


