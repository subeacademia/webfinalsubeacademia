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


