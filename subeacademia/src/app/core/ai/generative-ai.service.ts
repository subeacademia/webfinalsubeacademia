import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DiagnosticoFormValue, DiagnosticoScores } from '../../features/diagnostico/data/diagnostic.models';
import { DiagnosticReport } from '../../features/diagnostico/data/report.model';
import { CoursesService } from '../data/courses.service';
import { Course } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GenerativeAiService {
  private coursesService = inject(CoursesService);
  private readonly geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;

  generateActionPlan(diagnosticData: DiagnosticoFormValue, scores: DiagnosticoScores): Observable<DiagnosticReport | null> {
    return from(this.coursesService.getAllCourses()).pipe(
      switchMap(courses => {
        const formattedCoursesString = courses.map((course: Course) =>
          `- ID: ${course.id}, Título: ${course.title}, Descripción: ${course.description}`
        ).join('\n');

        const prompt = this.buildGeminiPrompt(diagnosticData, scores, formattedCoursesString);

        const requestBody = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        };

        return from(
          fetch(this.geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error en la API de Gemini: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) {
              throw new Error('Respuesta inválida o vacía de la API de Gemini.');
            }
            // El texto ya es un JSON, solo necesita ser parseado.
            return JSON.parse(responseText) as DiagnosticReport;
          })
        );
      }),
      tap(response => console.log('Reporte de IA recibido:', response)), // Para depuración
      catchError(error => {
        console.error('Error al generar el plan de acción:', error);
        return of(null); // Devuelve null en caso de error para manejarlo en el componente
      })
    );
  }

  private buildGeminiPrompt(diagnosticData: DiagnosticoFormValue, scores: DiagnosticoScores, formattedCoursesString: string): string {
    return `
      Eres un consultor senior experto en transformación digital e implementación de IA, actuando en nombre de Sube Academia. Tu misión es entregar un análisis profundo y un plan de acción de alto valor basado en el framework ARES-AI y el modelo de 13 competencias de Sube Academia. Tu respuesta debe ser únicamente un objeto JSON, sin texto introductorio, comentarios o comillas de bloque de código.

      **Contexto del Usuario:**
      - Rol: ${diagnosticData.contexto?.industria || 'No especificado'}
      - Industria: ${diagnosticData.contexto?.industria || 'No especificado'}
      - Objetivo Principal: ${diagnosticData.objetivo || 'No especificado'}

      **Resultados del Diagnóstico:**
      - Puntajes ARES-AI: ${JSON.stringify(scores.ares)}
      - Puntajes de Competencias (Puntajes bajos indican debilidades críticas): ${JSON.stringify(scores.competencias)}

      **Catálogo de Cursos de Sube Academia:**
      ${formattedCoursesString}

      **Tu Tarea:**
      Genera un objeto JSON con la siguiente estructura exacta y contenido de alta calidad:
      {
        "titulo_informe": "Un título potente y profesional para el informe. Ejemplo: 'Hoja de Ruta Estratégica para la Adopción de IA'.",
        "resumen_ejecutivo": "Un párrafo de 3-4 frases que resuma el nivel de madurez en IA, destacando la principal fortaleza y las 2 áreas de mejora más críticas. Debe ser claro y directo.",
        "analisis_ares": [
          { "dimension": "Adopción", "puntaje": ${scores.ares['adopcion'] || 0}, "analisis": "Un análisis experto y conciso sobre las implicaciones prácticas de este puntaje en 'Adopción' para la organización." },
          { "dimension": "Riesgos", "puntaje": ${scores.ares['riesgos'] || 0}, "analisis": "Análisis experto para 'Riesgos'." },
          { "dimension": "Ética", "puntaje": ${scores.ares['etica'] || 0}, "analisis": "Análisis experto para 'Ética'." },
          { "dimension": "Seguridad", "puntaje": ${scores.ares['seguridad'] || 0}, "analisis": "Análisis experto para 'Seguridad'." },
          { "dimension": "Capacidad", "puntaje": ${scores.ares['capacidad'] || 0}, "analisis": "Análisis experto para 'Capacidad'." },
          { "dimension": "Datos", "puntaje": ${scores.ares['datos'] || 0}, "analisis": "Análisis experto para 'Datos'." },
          { "dimension": "Gobernanza", "puntaje": ${scores.ares['gobernanza'] || 0}, "analisis": "Análisis experto para 'Gobernanza'." },
          { "dimension": "Valor", "puntaje": ${scores.ares['valor'] || 0}, "analisis": "Análisis experto para 'Valor'." },
          { "dimension": "Operación", "puntaje": ${scores.ares['operacion'] || 0}, "analisis": "Análisis experto para 'Operación'." },
          { "dimension": "Talento", "puntaje": ${scores.ares['talento'] || 0}, "analisis": "Análisis experto para 'Talento'." },
          { "dimension": "Tecnología", "puntaje": ${scores.ares['tecnologia'] || 0}, "analisis": "Análisis experto para 'Tecnología'." },
          { "dimension": "Integración", "puntaje": ${scores.ares['integracion'] || 0}, "analisis": "Análisis experto para 'Integración'." },
          { "dimension": "Cumplimiento", "puntaje": ${scores.ares['cumplimiento'] || 0}, "analisis": "Análisis experto para 'Cumplimiento'." },
          { "dimension": "Transparencia", "puntaje": ${scores.ares['transparencia'] || 0}, "analisis": "Análisis experto para 'Transparencia'." },
          { "dimension": "Sostenibilidad", "puntaje": ${scores.ares['sostenibilidad'] || 0}, "analisis": "Análisis experto para 'Sostenibilidad'." }
        ],
        "plan_de_accion": [
          {
            "area_mejora": "Nombre de la competencia o dimensión ARES con el puntaje MÁS BAJO.",
            "descripcion_problema": "Describe en 2 frases el riesgo o la oportunidad perdida que representa tener un puntaje bajo en esta área.",
            "acciones_recomendadas": [
              { "accion": "Paso 1: Una acción concreta e inmediata (ej: 'Realizar un workshop de sensibilización sobre IA para líderes').", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué' de esta acción.", "curso_recomendado_id": "El ID del curso de Sube Academia MÁS relevante para esta acción. Si ninguno aplica, usa 'null'." },
              { "accion": "Paso 2: Una acción a mediano plazo que construya sobre la anterior (ej: 'Definir un comité de ética en IA').", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué' de esta acción.", "curso_recomendado_id": "El ID del curso de Sube Academia MÁS relevante para esta acción. Si ninguno aplica, usa 'null'." }
            ]
          },
          {
            "area_mejora": "Nombre de la SEGUNDA competencia o dimensión con puntaje más bajo.",
            "descripcion_problema": "Describe en 2 frases el riesgo o la oportunidad perdida que representa tener un puntaje bajo en esta área.",
            "acciones_recomendadas": [
              { "accion": "Paso 1: Una acción concreta e inmediata.", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué'.", "curso_recomendado_id": "El ID del curso de Sube Academia MÁS relevante. Si ninguno aplica, usa 'null'." },
              { "accion": "Paso 2: Una acción a mediano plazo.", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué'.", "curso_recomendado_id": "El ID del curso de Sube Academia MÁS relevante. Si ninguno aplica, usa 'null'." }
            ]
          }
        ]
      }
    `;
  }
}
