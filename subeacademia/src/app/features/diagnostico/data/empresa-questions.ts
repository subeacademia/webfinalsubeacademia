/**
 * Contenido COMPLETO y TEXTUAL del "Cuestionario de Madurez en Implementación Responsable de IA".
 * Extraído del PDF para fácil acceso y mantenimiento. NO MODIFICAR TEXTOS.
 */

export const CUESTIONARIO_EMPRESAS = [
  {
    nombre: "Estrategia y Gobernanza de IA",
    items: [
      { n: 1, tipo: 'Likert', texto: "La organización tiene una estrategia de IA formalmente definida y comunicada, que está alineada con los objetivos de negocio." },
      { n: 2, tipo: 'Likert', texto: "Existen roles y responsabilidades claras para la supervisión y gestión de las iniciativas de IA." },
      { n: 3, tipo: 'Likert', texto: "Se evalúan sistemáticamente los riesgos (éticos, legales, operativos) de los proyectos de IA antes de su implementación." },
      { n: 4, tipo: 'VFNS', texto: "La empresa cuenta con un comité o un responsable formal de ética y gobernanza de datos y/o IA." },
      { n: 5, tipo: 'Madurez', texto: "Evalúe el nivel de madurez general de la gobernanza de IA en su organización.", opciones: {I: "Incipiente", B: "Básico", M: "Intermedio", A: "Avanzado", T: "Transformador"} },
    ]
  },
  {
    nombre: "Competencias y Cultura Organizacional",
    items: [
      { n: 6, tipo: 'Likert', texto: "La organización invierte activamente en la formación y el desarrollo de competencias en IA para sus colaboradores." },
      { n: 7, tipo: 'Likert', texto: "Se fomenta una cultura de experimentación y aprendizaje continuo en torno a la IA." },
      { n: 8, tipo: 'Likert', texto: "Los equipos son multidisciplinarios e incluyen perfiles técnicos, de negocio y de ética/legal en los proyectos de IA." },
      { n: 9, tipo: 'VFNS', texto: "Existen programas de 'alfabetización en IA' para personal no técnico." },
      { n: 10, tipo: 'Madurez', texto: "Evalúe el nivel de madurez de las competencias y la cultura de IA en su organización.", opciones: {I: "Incipiente", B: "Básico", M: "Intermedio", A: "Avanzado", T: "Transformador"} },
    ]
  },
  {
    nombre: "Uso Responsable y Ético de la IA",
    items: [
      { n: 11, tipo: 'Likert', texto: "Se aplican principios de equidad y no discriminación en el diseño y uso de los sistemas de IA." },
      { n: 12, tipo: 'Likert', texto: "La transparencia y la explicabilidad de los modelos de IA son una prioridad en su desarrollo." },
      { n: 13, tipo: 'Likert', texto: "La privacidad y seguridad de los datos son gestionadas rigurosamente en todo el ciclo de vida de la IA." },
      { n: 14, tipo: 'VFNS', texto: "Se realizan auditorías periódicas para detectar sesgos en los algoritmos de IA." },
      { n: 15, tipo: 'Madurez', texto: "Evalúe la madurez de las prácticas de IA responsable y ética en su organización.", opciones: {I: "Incipiente", B: "Básico", M: "Intermedio", A: "Avanzado", T: "Transformador"} },
    ]
  },
  {
    nombre: "Agilidad y Sostenibilidad",
    items: [
      { n: 16, tipo: 'Likert', texto: "La organización utiliza metodologías ágiles para gestionar los proyectos de IA, permitiendo una rápida iteración." },
      { n: 17, tipo: 'Likert', texto: "Los modelos de IA se monitorean y actualizan continuamente para asegurar su rendimiento y relevancia." },
      { n: 18, tipo: 'Likert', texto: "Se considera el impacto ambiental (ej. consumo energético) de las soluciones de IA." },
      { n: 19, tipo: 'VFNS', texto: "La estrategia de IA contempla la escalabilidad de las soluciones a largo plazo." },
      { n: 20, tipo: 'Madurez', texto: "Evalúe la madurez de la agilidad y sostenibilidad de las iniciativas de IA.", opciones: {I: "Incipiente", B: "Básico", M: "Intermedio", A: "Avanzado", T: "Transformador"} },
    ]
  },
  {
    nombre: "Infraestructura y Gestión de Datos",
    items: [
      { n: 21, tipo: 'Likert', texto: "La infraestructura tecnológica (hardware, software, cloud) es adecuada para soportar las iniciativas de IA actuales y futuras." },
      { n: 22, tipo: 'Likert', texto: "La organización tiene una estrategia clara para la adquisición, almacenamiento y gobierno de los datos necesarios para la IA." },
      { n: 23, tipo: 'Likert', texto: "Se garantiza la calidad y la integridad de los datos utilizados para entrenar los modelos de IA." },
      { n: 24, tipo: 'VFNS', texto: "Existe un catálogo de datos centralizado y accesible para los equipos de desarrollo." },
      { n: 25, tipo: 'Madurez', texto: "Evalúe la madurez de la infraestructura y gestión de datos para la IA.", opciones: {I: "Incipiente", B: "Básico", M: "Intermedio", A: "Avanzado", T: "Transformador"} },
    ]
  },
  {
    nombre: "Impacto Organizacional y Social",
    items: [
      { n: 26, tipo: 'Likert', texto: "Se mide y comunica el valor e impacto (ROI) de los proyectos de IA en la organización." },
      { n: 27, tipo: 'Likert', texto: "Se gestiona proactivamente el impacto de la IA en los roles y el futuro del trabajo de los colaboradores." },
      { n: 28, tipo: 'Likert', texto: "La organización considera el impacto social y comunitario de sus soluciones de IA." },
      { n: 29, tipo: 'VFNS', texto: "Se han rediseñado procesos de negocio para maximizar el valor de la IA implementada." },
      { n: 30, tipo: 'Madurez', texto: "Evalúe la madurez en la gestión del impacto organizacional y social de la IA.", opciones: {I: "Incipiente", B: "Básico", M: "Intermedio", A: "Avanzado", T: "Transformador"} },
    ]
  }
];
