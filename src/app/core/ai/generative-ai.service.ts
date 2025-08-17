import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DiagnosticData } from '../../features/diagnostico/data/diagnostic.models';
import { DiagnosticReport } from '../../features/diagnostico/data/report.model';
import { Scores } from '../../features/diagnostico/services/scoring.service';
import { CoursesService } from '../data/courses.service';
import { Course } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GenerativeAiService {
  private coursesService = inject(CoursesService);
  private readonly geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;

  generateActionPlan(diagnosticData: DiagnosticData, scores: Scores): Observable<DiagnosticReport | null> {
    return from(this.coursesService.getAllOnce()).pipe(
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

  private buildGeminiPrompt(diagnosticData: DiagnosticData, scores: Scores, formattedCoursesString: string): string {
    // Este prompt está cuidadosamente diseñado para forzar una salida JSON limpia.
    return `
      Eres un consultor experto en implementación de IA y transformación digital, basado en el framework ARES-AI y el modelo de 13 competencias de Sube Academia. Tu tarea es analizar el siguiente diagnóstico y generar un informe detallado en formato JSON. NO añadas texto, comillas de bloque de código (\`\`\`) ni ningún otro carácter antes o después del objeto JSON. Tu respuesta debe ser únicamente el JSON.

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
          { "dimension": "Agilidad", "puntaje": ${scores.ares.agilidad}, "analisis": "Un análisis breve y experto sobre lo que significa este puntaje en la dimensión 'Agilidad' para la organización." },
          { "dimension": "Responsabilidad", "puntaje": ${scores.ares.responsabilidad}, "analisis": "Análisis similar para 'Responsabilidad'." },
          { "dimension": "Ética", "puntaje": ${scores.ares.etica}, "analisis": "Análisis similar para 'Ética'." },
          { "dimension": "Sostenibilidad", "puntaje": ${scores.ares.sostenibilidad}, "analisis": "Análisis similar para 'Sostenibilidad'." }
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
}
