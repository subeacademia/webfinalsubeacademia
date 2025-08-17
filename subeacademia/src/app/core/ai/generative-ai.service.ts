import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DiagnosticoFormValue } from '../../features/diagnostico/data/diagnostic.models';
import { CoursesService } from '../data/courses.service';
import { Course } from '../models';

export interface DiagnosticAnalysisData {
  userName: string;
  userRole: string;
  userIndustry: string;
  topCompetencies: { name: string; score: number; description: string }[];
  lowestCompetencies: { name: string; score: number; description: string }[];
}

export interface DiagnosticAnalysisResponse {
  titulo_informe: string;
  resumen_ejecutivo: string;
  analisis_ares: Array<{
    dimension: string;
    puntaje: number;
    analisis: string;
  }>;
  plan_de_accion: Array<{
    area_mejora: string;
    descripcion_problema: string;
    acciones_recomendadas: Array<{
      accion: string;
      detalle: string;
      curso_recomendado_id: string | null;
    }>;
  }>;
}

// Interfaces para los datos del diagnóstico
interface DiagnosticData {
  context: {
    role: string;
    industry: string;
    companySize?: string;
  };
  objective: {
    goal: string;
  };
}

interface Scores {
  ares: {
    [key: string]: number; // Dimensiones dinámicas de ARES
  };
  competencies: Array<{
    competenciaId: string;
    puntaje: number;
    nivel: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GenerativeAiService {
  private coursesService = inject(CoursesService);
  private readonly geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;

  generateActionPlan(diagnosticData: DiagnosticData, scores: Scores): Observable<DiagnosticAnalysisResponse> {
    // 1. Obtener los cursos de Firestore
    return from(this.coursesService.getAllCourses()).pipe(
      switchMap(courses => {
        // 2. Formatear los cursos para el prompt
        const formattedCoursesString = courses.map((course: Course) =>
          `- ID: ${course.id}, Título: ${course.title}, Descripción: ${course.summary || course.description || 'Sin descripción'}`
        ).join('\n');

        // 3. Construir el prompt detallado para Gemini
        const prompt = this.buildGeminiPrompt(diagnosticData, scores, formattedCoursesString);

        // 4. Preparar el cuerpo de la solicitud para la API de Gemini
        const requestBody = {
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            // Asegura que la respuesta sea un JSON válido.
            responseMimeType: "application/json",
          }
        };

        // 5. Realizar la llamada a la API
        return from(fetch(this.geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            // 6. Extraer y parsear la respuesta JSON del modelo
            if (data.candidates && data.candidates[0].content.parts[0].text) {
              // La respuesta ya viene como un objeto JSON gracias a 'responseMimeType'
              return JSON.parse(data.candidates[0].content.parts[0].text);
            }
            throw new Error('Respuesta inválida de la API de Gemini');
        }));
      }),
      catchError(err => {
        console.error('Error obteniendo cursos:', err);
        // Fallback sin cursos
        return this.generateActionPlanWithoutCourses(diagnosticData, scores);
      })
    );
  }

  private generateActionPlanWithoutCourses(diagnosticData: DiagnosticData, scores: Scores): Observable<DiagnosticAnalysisResponse> {
    const prompt = this.buildGeminiPrompt(diagnosticData, scores, 'No hay cursos disponibles en este momento.');

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    return from(fetch(this.geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          return JSON.parse(data.candidates[0].content.parts[0].text);
        }
        throw new Error('Respuesta inválida de la API de Gemini');
    }));
  }

  private buildGeminiPrompt(diagnosticData: DiagnosticData, scores: Scores, formattedCoursesString: string): string {
    // El mismo prompt detallado que definimos anteriormente, pidiendo un JSON.
    return `
      Eres un consultor experto en implementación de IA y transformación digital, basado en el framework ARES-AI y el modelo de 13 competencias de Sube Academia. Tu tarea es analizar el siguiente diagnóstico y generar un informe detallado en formato JSON. NO añadas texto antes o después del objeto JSON.

      **Contexto del Usuario:**
      - Rol: ${diagnosticData.context.role}
      - Industria: ${diagnosticData.context.industry}
      - Objetivo Principal: ${diagnosticData.objective.goal}

      **Resultados del Diagnóstico:**
      - Puntajes ARES-AI: ${JSON.stringify(scores.ares)}
      - Puntajes de Competencias (las más bajas son las debilidades principales): ${JSON.stringify(scores.competencies)}

      **Cursos Disponibles en Sube Academia:**
      ${formattedCoursesString}

      **Tu Tarea:**
      Genera un objeto JSON con la siguiente estructura exacta:
      {
        "titulo_informe": "Un título inspirador y profesional para el informe.",
        "resumen_ejecutivo": "Un párrafo conciso (2-3 frases) que resuma el estado actual de madurez en IA de la organización, destacando su principal fortaleza y su área de mejora más crítica.",
        "analisis_ares": [
          { "dimension": "Agilidad", "puntaje": ${scores.ares['agilidad'] || 0}, "analisis": "Un análisis breve y experto sobre lo que significa este puntaje en la dimensión 'Agilidad' para la organización." },
          { "dimension": "Responsabilidad", "puntaje": ${scores.ares['responsabilidad'] || 0}, "analisis": "Análisis similar para 'Responsabilidad'." },
          { "dimension": "Ética", "puntaje": ${scores.ares['etica'] || 0}, "analisis": "Análisis similar para 'Ética'." },
          { "dimension": "Sostenibilidad", "puntaje": ${scores.ares['sostenibilidad'] || 0}, "analisis": "Análisis similar para 'Sostenibilidad'." }
        ],
        "plan_de_accion": [
          {
            "area_mejora": "Nombre de la competencia o dimensión ARES con puntaje más bajo.",
            "descripcion_problema": "Descripción breve del desafío que representa tener un puntaje bajo en esta área.",
            "acciones_recomendadas": [
              { "accion": "Una acción específica, clara y realizable a corto plazo.", "detalle": "Una explicación de 2-3 líneas sobre cómo implementar esta acción.", "curso_recomendado_id": "El ID del curso de Sube Academia más relevante, o 'null' si ninguno aplica." }
            ]
          }
        ]
      }
    `;
  }

  // Mantener el método anterior para compatibilidad
  generateDiagnosticAnalysis(data: DiagnosticAnalysisData): Observable<string> {
    const prompt = `
      Actúa como un estratega de talento y coach ejecutivo de Sube Academia, con un doctorado en psicología organizacional y más de 15 años de experiencia en el desarrollo de líderes en la era de la IA. Tu tono es experto, empático, y visionario. Tu objetivo es entregar un análisis profundo y accionable que inspire al usuario a tomar control de su desarrollo profesional.

      La respuesta DEBE estar en formato Markdown y seguir estrictamente esta estructura de 4 secciones:

      ### 💡 Resumen Ejecutivo
      Un párrafo inicial que resuma el perfil de ${data.userName}, conectando sus fortalezas y oportunidades con su contexto profesional (rol de ${data.userRole} en la industria de ${data.userIndustry}).

      ### 🚀 Tus Superpoderes: Análisis de Fortalezas
      Para CADA UNA de las 3 competencias destacadas, crea un subtítulo en negrita (ej. **Fortaleza: Liderazgo e Influencia Social**). Luego, en un párrafo, explica por qué esta competencia, cuya definición es "${data.topCompetencies[0]?.description || 'Descripción no disponible'}", es un diferenciador clave en su rol. Proporciona un ejemplo táctico y concreto de cómo puede apalancar esta fortaleza en un proyecto real esta semana. Repite para las otras 2 fortalezas.

      ### 🌱 Tu Próximo Nivel: Oportunidades de Crecimiento
      Para CADA UNA de las 3 áreas de oportunidad, crea un subtítulo en negrita (ej. **Oportunidad: Pensamiento Analítico**). En un párrafo, replantea esta área no como una debilidad, sino como una palanca de crecimiento estratégico. Explica el "costo de oportunidad" de no desarrollarla, basándote en su definición ("${data.lowestCompetencies[0]?.description || 'Descripción no disponible'}"), y el impacto positivo que tendría si la mejorara. Repite para las otras 2 oportunidades.

      ### 🎯 Plan de Acción Estratégico (Próximos 30 Días)
      Crea una lista numerada con 3 acciones concretas, accionables y de alto impacto. Cada acción debe combinar una fortaleza con un área de oportunidad de forma inteligente y sinérgica. Sé específico.
      Ejemplo de acción: "1. **Lidera con Datos:** En tu próxima reunión de equipo, utiliza tu fortaleza en **${data.topCompetencies[0]?.name || 'Competencia'}** para presentar una decisión clave, pero fundamenta tu argumento principal usando un análisis de datos simple (ej. un gráfico de Excel), practicando así tu **${data.lowestCompetencies[0]?.name || 'Área de oportunidad'}**."
    `;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.75,
      }
    };

    return from(fetch(this.geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error('Respuesta inválida de la API de Gemini');
    })
    .catch(err => {
      console.error('Error en GenerativeAiService:', err);
      return '### Error en el Análisis\n\nLo sentimos, no hemos podido generar tu análisis personalizado en este momento. Por favor, intenta recargar la página o contacta con soporte si el problema persiste.';
    }));
  }
}
