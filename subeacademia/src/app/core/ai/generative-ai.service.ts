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

        const prompt = this.buildEnhancedGeminiPrompt(diagnosticData, scores, formattedCoursesString);

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
            return JSON.parse(responseText) as DiagnosticReport;
          })
        );
      }),
      tap(response => console.log('Reporte de IA recibido:', response)),
      catchError(error => {
        console.error('Error al generar el plan de acción:', error);
        return of(null);
      })
    );
  }

  private buildEnhancedGeminiPrompt(diagnosticData: DiagnosticoFormValue, scores: DiagnosticoScores, formattedCoursesString: string): string {
    return `
      Eres un consultor senior experto en transformación digital e IA para Sube Academia. Tu misión es entregar un análisis profundo y un plan de acción de alto valor. Tu respuesta debe ser únicamente un objeto JSON, sin texto, comentarios o \`\`\`.

      **Contexto del Usuario:**
      - Rol: ${diagnosticData.segmento || 'No especificado'}
      - Industria: ${diagnosticData.contexto?.industria || 'No especificado'}
      - Objetivo Principal: ${diagnosticData.objetivo || 'No especificado'}

      **Resultados del Diagnóstico:**
      - Puntajes ARES-AI: ${JSON.stringify(scores.ares)}
      - Puntajes de Competencias: ${JSON.stringify(scores.competencias)}

      **Catálogo de Cursos de Sube Academia:**
      ${formattedCoursesString}

      **Tu Tarea:**
      Genera un objeto JSON con la siguiente estructura y contenido de alta calidad:
      {
        "titulo_informe": "Hoja de Ruta Estratégica para la Adopción de IA",
        "resumen_ejecutivo": "Un párrafo de 3-4 frases resumiendo el nivel de madurez en IA, destacando la principal fortaleza y las 2 áreas de mejora más críticas.",
        "analisis_ares": [
          { "dimension": "Agilidad", "puntaje": ${scores.ares['agilidad'] || 0}, "analisis": "Análisis experto y conciso sobre las implicaciones prácticas de este puntaje en 'Agilidad'." },
          { "dimension": "Responsabilidad", "puntaje": ${scores.ares['responsabilidad'] || 0}, "analisis": "Análisis experto para 'Responsabilidad'." },
          { "dimension": "Ética", "puntaje": ${scores.ares['etica'] || 0}, "analisis": "Análisis experto para 'Ética'." },
          { "dimension": "Sostenibilidad", "puntaje": ${scores.ares['sostenibilidad'] || 0}, "analisis": "Análisis experto para 'Sostenibilidad'." }
        ],
        "plan_de_accion": [
          {
            "area_mejora": "Nombre de la competencia o dimensión con el puntaje MÁS BAJO.",
            "descripcion_problema": "Describe en 2 frases el riesgo o la oportunidad perdida que representa este puntaje bajo.",
            "acciones_recomendadas": [
              { "accion": "Paso 1 (Corto Plazo): Una acción concreta e inmediata.", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué' de esta acción.", "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'." },
              { "accion": "Paso 2 (Mediano Plazo): Una acción que construya sobre la anterior.", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué'.", "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'." }
            ]
          },
          {
            "area_mejora": "Nombre de la SEGUNDA competencia o dimensión con puntaje más bajo.",
            "descripcion_problema": "Describe en 2 frases el riesgo o la oportunidad perdida.",
            "acciones_recomendadas": [
              { "accion": "Paso 1 (Corto Plazo): Una acción concreta e inmediata.", "detalle": "Explica en 2-3 líneas el 'cómo' y el 'porqué'.", "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'." }
            ]
          }
        ]
      }
    `;
  }
}
