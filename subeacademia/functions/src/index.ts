import * as functions from "firebase-functions";
// Importa la nueva biblioteca de Vertex AI
import { VertexAI } from "@google-cloud/vertexai";

// Inicializa Vertex AI.
// Utilizará automáticamente las credenciales de la cuenta de servicio de la función.
const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
const vertex_ai = new VertexAI({
  project: projectId as string,
  location: "us-central1",
});

// Modelo de IA a utilizar
const model = "gemini-1.0-pro-001";

const generativeModel = vertex_ai.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.4,
    topP: 1,
    topK: 32,
  },
});

export const generateObjectives = functions.https.onCall(async (data) => {
  console.log("Iniciando generateObjectives v2 con data:", data);
  const contextData = (data as any)?.contextData;
  if (!contextData) {
    console.error("Error: Faltan datos en contextData.");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "La función debe ser llamada con 'contextData'."
    );
  }

  const prompt = `
    Basado en el siguiente contexto profesional de un usuario, genera 3 objetivos de desarrollo SMART (Específicos, Medibles, Alcanzables, Relevantes y con un Plazo definido).
    - Industria: ${contextData.industria}
    - Área Funcional: ${contextData.area}
    - Rol Actual: ${contextData.rol}
    Devuelve los 3 objetivos en un array de strings JSON. Ejemplo: ["Objetivo 1", "Objetivo 2", "Objetivo 3"]
  `;

  try {
    console.log("Llamando a la API de Vertex AI para objetivos...");
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    const result = await generativeModel.generateContent(request);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Respuesta sin texto para objetivos", JSON.stringify(response));
      throw new functions.https.HttpsError(
        "internal",
        "La respuesta de IA no contiene texto."
      );
    }
    console.log("Respuesta de Vertex AI recibida para objetivos.");
    return { objectives: JSON.parse(text) };
  } catch (error: any) {
    console.error("Error CRÍTICO llamando a la API de Vertex AI para objetivos:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Falló la generación de objetivos con IA."
    );
  }
});

export const generateDiagnosticReport = functions.https.onCall(async (data) => {
  console.log("Iniciando generateDiagnosticReport v2...");
  const diagnosticData = (data as any)?.diagnosticData;
  if (!diagnosticData) {
    console.error("Error: Faltan datos en diagnosticData.");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "La función debe ser llamada con 'diagnosticData'."
    );
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
    console.log("Llamando a la API de Vertex AI para el reporte...");
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    const result = await generativeModel.generateContent(request);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Respuesta sin texto para reporte", JSON.stringify(response));
      throw new functions.https.HttpsError(
        "internal",
        "La respuesta de IA no contiene texto."
      );
    }
    console.log("Respuesta de Vertex AI recibida para el reporte.");
    return { reportText: text };
  } catch (error: any) {
    console.error("Error CRÍTICO llamando a la API de Vertex AI para el reporte:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Falló la generación del reporte con IA."
    );
  }
});


