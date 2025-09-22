import { VercelRequest, VercelResponse } from '@vercel/node';

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Función para manejar CORS
function handleCors(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return true;
  }
  return false;
}

// Función para generar objetivos personalizados
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  try {
    // Verificar que sea una petición POST
    if (req.method !== 'POST') {
      res.writeHead(405, corsHeaders);
      res.end(JSON.stringify({ error: 'Método no permitido' }));
      return;
    }

    const { messages, maxTokens = 1000, temperature = 0.7 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.writeHead(400, corsHeaders);
      res.end(JSON.stringify({ error: 'Se requieren mensajes válidos' }));
      return;
    }

    console.log('🚀 Generando objetivos personalizados con IA...');
    console.log('📊 Mensajes recibidos:', messages.length);

    // Simular respuesta de IA para objetivos personalizados
    const objetivosGenerados = await generarObjetivosPersonalizados(messages);

    // Estructura de respuesta compatible con OpenAI
    const response = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: objetivosGenerados
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300
      }
    };

    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify(response));

  } catch (error) {
    console.error('❌ Error en la API de Vercel:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }));
  }
}

// Función para generar objetivos personalizados
async function generarObjetivosPersonalizados(messages: any[]): Promise<string> {
  // Extraer el contexto del último mensaje del usuario
  const userMessage = messages.find(msg => msg.role === 'user');
  const context = userMessage?.content || '';

  console.log('🎯 Contexto del cliente:', context);

  // Analizar el contexto para generar objetivos personalizados
  const objetivos = analizarContextoYGenerarObjetivos(context);

  return JSON.stringify(objetivos);
}

// Función para analizar contexto y generar objetivos
function analizarContextoYGenerarObjetivos(context: string): any {
  // Objetivos base que se adaptan según el contexto
  const objetivosBase = [
    {
      id: "goal1",
      title: "Implementar un sistema de automatización de procesos clave para mejorar la eficiencia operativa en un 25%",
      smart: {
        specific: "Automatizar al menos 5 procesos manuales críticos identificados en el diagnóstico",
        measurable: "Reducir tiempo de procesamiento en 25% y errores en 40%",
        achievable: "Con el presupuesto y recursos disponibles, implementable en 3-4 meses",
        relevant: "Alineado con la mejora de eficiencia operativa y reducción de costos",
        timeBound: "Completar implementación en 4 meses máximo"
      }
    },
    {
      id: "goal2", 
      title: "Desarrollar un programa de capacitación en IA para el equipo, enfocado en herramientas específicas del sector",
      smart: {
        specific: "Capacitar al 80% del equipo en herramientas de IA relevantes para su área",
        measurable: "Certificar a 15 empleados y lograr 90% de satisfacción en la capacitación",
        achievable: "Con recursos internos y externos disponibles, factible en 2-3 meses",
        relevant: "Esencial para la adopción exitosa de tecnologías de IA en la organización",
        timeBound: "Completar programa de capacitación en 3 meses"
      }
    },
    {
      id: "goal3",
      title: "Establecer un sistema de análisis de datos avanzado para optimizar la toma de decisiones estratégicas",
      smart: {
        specific: "Implementar dashboard de BI con métricas clave y alertas automáticas",
        measurable: "Reducir tiempo de análisis en 50% y mejorar precisión de decisiones en 30%",
        achievable: "Con herramientas disponibles y personal capacitado, realizable en 4-6 meses",
        relevant: "Crítico para la competitividad y crecimiento sostenible de la empresa",
        timeBound: "Sistema operativo en 6 meses"
      }
    },
    {
      id: "goal4",
      title: "Crear una estrategia de experiencia del cliente mejorada con herramientas de IA conversacional",
      smart: {
        specific: "Implementar chatbot inteligente y sistema de análisis de sentimientos",
        measurable: "Aumentar satisfacción del cliente en 35% y reducir tiempo de respuesta en 50%",
        achievable: "Con tecnología disponible y presupuesto asignado, factible en 3-5 meses",
        relevant: "Directamente impacta la retención y crecimiento de clientes",
        timeBound: "Sistema en producción en 5 meses"
      }
    },
    {
      id: "goal5",
      title: "Implementar un marco de gobernanza de IA para asegurar el uso ético y responsable de la tecnología",
      smart: {
        specific: "Crear políticas, procedimientos y comité de ética para supervisar uso de IA",
        measurable: "100% de cumplimiento normativo y 0 incidentes de uso inadecuado de IA",
        achievable: "Con asesoría legal y recursos internos, implementable en 4-5 meses",
        relevant: "Esencial para la sostenibilidad y reputación a largo plazo",
        timeBound: "Marco operativo en 5 meses"
      }
    },
    {
      id: "goal6",
      title: "Desarrollar un laboratorio de innovación para experimentar con nuevas tecnologías de IA",
      smart: {
        specific: "Crear espacio físico y virtual para pruebas de conceptos de IA emergentes",
        measurable: "Identificar 3-5 nuevas oportunidades de negocio y lanzar 2 pilotos",
        achievable: "Con presupuesto de innovación y personal dedicado, realizable en 6-8 meses",
        relevant: "Posiciona a la empresa como líder en innovación tecnológica",
        timeBound: "Laboratorio operativo en 8 meses"
      }
    }
  ];

  // Personalizar objetivos según el contexto
  let objetivosSeleccionados = objetivosBase;
  
  if (context.toLowerCase().includes('pequeña') || context.toLowerCase().includes('startup')) {
    // Para empresas pequeñas, priorizar objetivos de bajo costo y rápida implementación
    objetivosSeleccionados = objetivosBase.filter(obj => 
      obj.id === 'goal1' || obj.id === 'goal2' || obj.id === 'goal4'
    );
  }
  else if (context.toLowerCase().includes('grande') || context.toLowerCase().includes('corporación')) {
    // Para empresas grandes, incluir objetivos de gobernanza y escalabilidad
    objetivosSeleccionados = objetivosBase.filter(obj => 
      obj.id === 'goal1' || obj.id === 'goal3' || obj.id === 'goal5' || obj.id === 'goal6'
    );
  }
  else if (context.toLowerCase().includes('tecnología') || context.toLowerCase().includes('tech')) {
    // Para empresas de tecnología, enfocarse en innovación y desarrollo
    objetivosSeleccionados = objetivosBase.filter(obj => 
      obj.id === 'goal3' || obj.id === 'goal4' || obj.id === 'goal6'
    );
  }
  else if (context.toLowerCase().includes('servicios') || context.toLowerCase().includes('consultoría')) {
    // Para empresas de servicios, priorizar CX y procesos
    objetivosSeleccionados = objetivosBase.filter(obj => 
      obj.id === 'goal1' || obj.id === 'goal2' || obj.id === 'goal4'
    );
  }
  
  // Devolver en el formato esperado por el frontend
  return {
    options: objetivosSeleccionados
  };
}

// Endpoint de salud
export async function health(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  
  res.writeHead(200, corsHeaders);
  res.end(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'SUBE Academia AI API'
  }));
}
