// subeacademia/functions/index.js

const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiKey = functions.config().gemini && functions.config().gemini.key;
if (!geminiKey) {
  console.error("ERROR: La clave de API de Gemini no está configurada. Ejecuta 'firebase functions:config:set gemini.key=...'");
}
const genAI = new GoogleGenerativeAI(geminiKey || "");

exports.generateObjectives = functions.https.onCall(async (data, context) => {
  console.log("Iniciando generateObjectives con data:", data);
  const contextData = data && data.contextData;
  if (!contextData) {
    console.error("Error: Faltan datos en contextData.");
    throw new functions.https.HttpsError('invalid-argument', 'La función debe ser llamada con "contextData".');
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
    const response = await result.response;
    const text = response.text();
    console.log("Respuesta de Gemini recibida para objetivos.");
    return { objectives: JSON.parse(text) };
  } catch (error) {
    console.error("Error CRÍTICO llamando a la API de Gemini para objetivos:", error);
    throw new functions.https.HttpsError('internal', 'Falló la generación de objetivos con IA.', error && error.message ? error.message : undefined);
  }
});

exports.generateDiagnosticReport = functions.https.onCall(async (data, context) => {
  console.log("Iniciando generateDiagnosticReport...");
  const diagnosticData = data && data.diagnosticData;
  if (!diagnosticData) {
    console.error("Error: Faltan datos en diagnosticData.");
    throw new functions.https.HttpsError('invalid-argument', 'La función debe ser llamada con "diagnosticData".');
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
    const response = await result.response;
    const text = response.text();
    console.log("Respuesta de Gemini recibida para el reporte.");
    return { reportText: text };
  } catch (error) {
    console.error("Error CRÍTICO llamando a la API de Gemini para el reporte:", error);
    throw new functions.https.HttpsError('internal', 'Falló la generación del reporte con IA.', error && error.message ? error.message : undefined);
  }
});

