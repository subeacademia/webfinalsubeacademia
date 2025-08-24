"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDiagnosticReport = exports.generateObjectives = void 0;
const functions = require("firebase-functions");
const generative_ai_1 = require("@google/generative-ai");
// Inicialización segura de la API
let genAI;
const geminiKey = (_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.key;
if (!geminiKey) {
    console.error("CRITICAL ERROR: Gemini API key is not configured.");
}
else {
    genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
}
exports.generateObjectives = functions.https.onCall(async (data) => {
    console.log("Iniciando generateObjectives con data:", data);
    if (!genAI) {
        throw new functions.https.HttpsError("failed-precondition", "La API de IA no está inicializada. Revisa la configuración.");
    }
    const contextData = data === null || data === void 0 ? void 0 : data.contextData;
    if (!contextData) {
        console.error("Error: Faltan datos en contextData.");
        throw new functions.https.HttpsError("invalid-argument", "La función debe ser llamada con 'contextData'.");
    }
    const prompt = `
    Basado en el siguiente contexto profesional de un usuario, genera 3 objetivos de desarrollo SMART (Específicos, Medibles, Alcanzables, Relevantes y con un Plazo definido).
    - Industria: ${contextData.industria}
    - Área Funcional: ${contextData.area}
    - Rol Actual: ${contextData.rol}
    Devuelve los 3 objetivos en un array de strings JSON. Ejemplo: ["Objetivo 1", "Objetivo 2", "Objetivo 3"]
  `;
    try {
        console.log("Llamando a la API de Gemini para objetivos...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log("Respuesta de Gemini recibida para objetivos.");
        return { objectives: JSON.parse(text) };
    }
    catch (error) {
        console.error("Error CRÍTICO llamando a la API de Gemini para objetivos:", error);
        throw new functions.https.HttpsError("internal", "Falló la generación de objetivos con IA.");
    }
});
exports.generateDiagnosticReport = functions.https.onCall(async (data) => {
    console.log("Iniciando generateDiagnosticReport...");
    if (!genAI) {
        throw new functions.https.HttpsError("failed-precondition", "La API de IA no está inicializada. Revisa la configuración.");
    }
    const diagnosticData = data === null || data === void 0 ? void 0 : data.diagnosticData;
    if (!diagnosticData) {
        console.error("Error: Faltan datos en diagnosticData.");
        throw new functions.https.HttpsError("invalid-argument", "La función debe ser llamada con 'diagnosticData'.");
    }
    const prompt = `
    Basado en los siguientes datos de un diagnóstico de madurez en IA, genera un reporte profesional y detallado.
    Contexto: ${diagnosticData.contexto.industria}, ${diagnosticData.contexto.area}, ${diagnosticData.contexto.rol}.
    Objetivo Principal: ${diagnosticData.objetivo}.
    Competencias Autoevaluadas (de 1 a 10):
    - Pensamiento Crítico y Análisis: ${diagnosticData.competencias['pensamiento-critico']}
    - Resolución de Problemas Complejos: ${diagnosticData.competencias['resolucion-problemas']}
    - Creatividad e Innovación: ${diagnosticData.competencias['creatividad']}
    - Liderazgo e Influencia Social: ${diagnosticData.competencias['liderazgo']}
    - Inteligencia Emocional: ${diagnosticData.competencias['inteligencia-emocional']}
    - Colaboración y Trabajo en Equipo: ${diagnosticData.competencias['colaboracion']}
    - Adaptabilidad y Flexibilidad: ${diagnosticData.competencias['adaptabilidad']}
    - Comunicación Efectiva: ${diagnosticData.competencias['comunicacion']}
    - Curiosidad y Aprendizaje Activo: ${diagnosticData.competencias['curiosidad']}
    - Alfabetización Digital y Tecnológica: ${diagnosticData.competencias['alfabetizacion-digital']}
    ARES (de 1 a 10):
    - Agilidad: ${diagnosticData.ares.agilidad}
    - Resiliencia: ${diagnosticData.ares.resiliencia}
    - Empatía: ${diagnosticData.ares.empatia}
    - Serenidad: ${diagnosticData.ares.serenidad}
    Genera un análisis detallado, identifica 2-3 fortalezas clave, 2-3 áreas de mejora críticas y un plan de acción con 3 pasos concretos.
  `;
    try {
        console.log("Llamando a la API de Gemini para el reporte...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log("Respuesta de Gemini recibida para el reporte.");
        return { reportText: text };
    }
    catch (error) {
        console.error("Error CRÍTICO llamando a la API de Gemini para el reporte:", error);
        throw new functions.https.HttpsError("internal", "Falló la generación del reporte con IA.");
    }
});
//# sourceMappingURL=index.js.map