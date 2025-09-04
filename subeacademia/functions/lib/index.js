"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
exports.health = health;
// Configuración de CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};
// Función para manejar CORS
function handleCors(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return true;
    }
    return false;
}
// Función para generar objetivos personalizados
async function handler(req, res) {
    // Manejar CORS
    if (handleCors(req, res))
        return;
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
    }
    catch (error) {
        console.error('❌ Error en la API de Vercel:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }));
    }
}
// Función para generar objetivos personalizados
async function generarObjetivosPersonalizados(messages) {
    // Extraer el contexto del último mensaje del usuario
    const userMessage = messages.find(msg => msg.role === 'user');
    const context = userMessage?.content || '';
    console.log('🎯 Contexto del cliente:', context);
    // Analizar el contexto para generar objetivos personalizados
    const objetivos = analizarContextoYGenerarObjetivos(context);
    return JSON.stringify(objetivos);
}
// Función para analizar contexto y generar objetivos
function analizarContextoYGenerarObjetivos(context) {
    const objetivos = [];
    // Objetivos base que se adaptan según el contexto
    const objetivosBase = [
        {
            id: "obj-1",
            texto: "Implementar un sistema de automatización de procesos clave para mejorar la eficiencia operativa en un 25%",
            categoria: "Procesos",
            prioridad: "alta",
            tiempoEstimado: "3-4 meses",
            impacto: "Reducción del 25% en tiempo de procesos manuales y mejora en la precisión de tareas repetitivas"
        },
        {
            id: "obj-2",
            texto: "Desarrollar un programa de capacitación en IA para el equipo, enfocado en herramientas específicas del sector",
            categoria: "Capacitación",
            prioridad: "alta",
            tiempoEstimado: "2-3 meses",
            impacto: "Mejora del 40% en competencias digitales del equipo y mayor adopción de tecnologías emergentes"
        },
        {
            id: "obj-3",
            texto: "Establecer un sistema de análisis de datos avanzado para optimizar la toma de decisiones estratégicas",
            categoria: "Analítica",
            prioridad: "media",
            tiempoEstimado: "4-6 meses",
            impacto: "Mejora del 30% en la precisión de decisiones y reducción del 20% en costos operativos"
        },
        {
            id: "obj-4",
            texto: "Crear una estrategia de experiencia del cliente mejorada con herramientas de IA conversacional",
            categoria: "CX",
            prioridad: "media",
            tiempoEstimado: "3-5 meses",
            impacto: "Aumento del 35% en satisfacción del cliente y reducción del 50% en tiempo de respuesta"
        },
        {
            id: "obj-5",
            texto: "Implementar un marco de gobernanza de datos y ética en IA para garantizar el uso responsable",
            categoria: "Gobernanza",
            prioridad: "alta",
            tiempoEstimado: "2-4 meses",
            impacto: "Cumplimiento normativo del 100% y reducción del 60% en riesgos de seguridad de datos"
        },
        {
            id: "obj-6",
            texto: "Desarrollar un laboratorio de innovación para explorar nuevas aplicaciones de IA en productos/servicios",
            categoria: "Innovación",
            prioridad: "baja",
            tiempoEstimado: "6-8 meses",
            impacto: "Lanzamiento de 2-3 nuevos productos/servicios con IA y aumento del 20% en ingresos"
        },
        {
            id: "obj-7",
            texto: "Optimizar la cadena de suministro mediante algoritmos de IA para predecir demanda y gestionar inventarios",
            categoria: "Procesos",
            prioridad: "media",
            tiempoEstimado: "4-5 meses",
            impacto: "Reducción del 30% en costos de inventario y mejora del 25% en precisión de pronósticos"
        },
        {
            id: "obj-8",
            texto: "Establecer un sistema de monitoreo y alertas inteligentes para prevenir fallos operativos",
            categoria: "Analítica",
            prioridad: "alta",
            tiempoEstimado: "2-3 meses",
            impacto: "Reducción del 40% en tiempo de inactividad y mejora del 50% en tiempo de respuesta a incidentes"
        }
    ];
    // Personalizar objetivos según el contexto
    if (context.toLowerCase().includes('pequeña') || context.toLowerCase().includes('startup')) {
        // Para empresas pequeñas, priorizar objetivos de bajo costo y rápida implementación
        return objetivosBase.filter(obj => obj.prioridad === 'alta' &&
            (obj.categoria === 'Capacitación' || obj.categoria === 'Procesos')).slice(0, 4);
    }
    else if (context.toLowerCase().includes('grande') || context.toLowerCase().includes('corporación')) {
        // Para empresas grandes, incluir objetivos de gobernanza y escalabilidad
        return objetivosBase.filter(obj => obj.prioridad === 'alta' || obj.prioridad === 'media').slice(0, 6);
    }
    else if (context.toLowerCase().includes('tecnología') || context.toLowerCase().includes('tech')) {
        // Para empresas de tecnología, enfocarse en innovación y desarrollo
        return objetivosBase.filter(obj => obj.categoria === 'Innovación' || obj.categoria === 'Analítica' || obj.categoria === 'CX').slice(0, 5);
    }
    else if (context.toLowerCase().includes('servicios') || context.toLowerCase().includes('consultoría')) {
        // Para empresas de servicios, priorizar CX y procesos
        return objetivosBase.filter(obj => obj.categoria === 'CX' || obj.categoria === 'Procesos' || obj.categoria === 'Capacitación').slice(0, 5);
    }
    // Por defecto, retornar objetivos balanceados
    return objetivosBase.slice(0, 6);
}
// Endpoint de salud
async function health(req, res) {
    if (handleCors(req, res))
        return;
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'SUBE Academia AI API'
    }));
}
