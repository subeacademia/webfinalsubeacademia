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
      Eres un consultor senior experto en transformación digital e IA para Sube Academia. Tu misión es entregar un análisis profundo, personalizado y de alto valor que inspire acción inmediata. Tu respuesta debe ser únicamente un objeto JSON, sin texto, comentarios o \`\`\`.

      **Contexto del Usuario:**
      - Rol: ${diagnosticData.segmento || 'No especificado'}
      - Industria: ${diagnosticData.contexto?.industria || 'No especificado'}
      - Objetivo Principal: ${diagnosticData.objetivo || 'No especificado'}
      - Contexto Organizacional: ${diagnosticData.segmento || 'No especificado'}

      **Resultados del Diagnóstico:**
      - Puntajes ARES-AI: ${JSON.stringify(scores.ares)}
      - Puntajes de Competencias: ${JSON.stringify(scores.competencias)}

      **Catálogo de Cursos de Sube Academia:**
      ${formattedCoursesString}

      **Tu Tarea:**
      Genera un objeto JSON con la siguiente estructura y contenido de EXCELENTE calidad, personalizado para el contexto específico del usuario:

      {
        "titulo_informe": "Hoja de Ruta Estratégica para la Adopción de IA - [Industria del Usuario]",
        "resumen_ejecutivo": "Un párrafo de 4-5 frases que resuma el nivel de madurez en IA, destaque la principal fortaleza, identifique las 2-3 áreas de mejora más críticas, y establezca el impacto potencial en el negocio. Usa lenguaje motivacional y orientado a resultados.",
        "analisis_ares": [
          {
            "dimension": "Agilidad",
            "puntaje": ${scores.ares['agilidad'] || 0},
            "analisis": "Análisis experto de 3-4 frases sobre las implicaciones prácticas de este puntaje en 'Agilidad'. Incluye riesgos específicos, oportunidades perdidas, y el impacto en la velocidad de innovación. Sé específico para la industria del usuario."
          },
          {
            "dimension": "Responsabilidad",
            "puntaje": ${scores.ares['responsabilidad'] || 0},
            "analisis": "Análisis experto de 3-4 frases para 'Responsabilidad'. Explica cómo este puntaje afecta la gobernanza de IA, la transparencia, y la confianza de los stakeholders. Incluye ejemplos específicos de la industria."
          },
          {
            "dimension": "Ética",
            "puntaje": ${scores.ares['etica'] || 0},
            "analisis": "Análisis experto de 3-4 frases para 'Ética'. Describe el impacto en la toma de decisiones éticas, la prevención de sesgos, y la reputación corporativa. Sé específico sobre los riesgos éticos en la industria del usuario."
          },
          {
            "dimension": "Sostenibilidad",
            "puntaje": ${scores.ares['sostenibilidad'] || 0},
            "analisis": "Análisis experto de 3-4 frases para 'Sostenibilidad'. Explica cómo este puntaje afecta la eficiencia operativa, el impacto ambiental, y la viabilidad a largo plazo. Incluye métricas específicas de sostenibilidad."
          }
        ],
        "plan_de_accion": [
          {
            "area_mejora": "Nombre de la competencia o dimensión con el puntaje MÁS BAJO. Sé específico y usa terminología de la industria.",
            "descripcion_problema": "Describe en 3-4 frases el riesgo específico, la oportunidad perdida, y el impacto cuantificable en el negocio. Incluye métricas relevantes y consecuencias a corto y largo plazo.",
            "acciones_recomendadas": [
              {
                "accion": "Paso 1 (Corto Plazo - 0-3 meses): Una acción concreta, medible y ejecutable inmediatamente.",
                "detalle": "Explica en 3-4 líneas el 'cómo', 'porqué', 'cuándo' y 'quién' debe ejecutar esta acción. Incluye métricas de éxito y recursos necesarios.",
                "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'."
              },
              {
                "accion": "Paso 2 (Mediano Plazo - 3-6 meses): Una acción que construya sobre la anterior y genere momentum.",
                "detalle": "Explica en 3-4 líneas cómo esta acción se conecta con la anterior, qué resultados esperar, y cómo medir el progreso. Incluye dependencias y riesgos.",
                "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'."
              },
              {
                "accion": "Paso 3 (Largo Plazo - 6-12 meses): Una acción estratégica que transforme la organización.",
                "detalle": "Explica en 3-4 líneas la visión a largo plazo, el impacto transformacional, y cómo esta acción posiciona a la organización para el futuro. Incluye métricas de transformación.",
                "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'."
              }
            ]
          },
          {
            "area_mejora": "Nombre de la SEGUNDA competencia o dimensión con puntaje más bajo. Sé específico y contextual.",
            "descripcion_problema": "Describe en 3-4 frases el riesgo específico, la oportunidad perdida, y el impacto en el negocio. Conecta con la primera área de mejora.",
            "acciones_recomendadas": [
              {
                "accion": "Paso 1 (Corto Plazo): Una acción concreta que complemente la primera área de mejora.",
                "detalle": "Explica en 3-4 líneas cómo esta acción se alinea con la estrategia general y genera sinergias. Incluye métricas de éxito.",
                "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'."
              },
              {
                "accion": "Paso 2 (Mediano Plazo): Una acción que consolide los avances y genere valor sostenible.",
                "detalle": "Explica en 3-4 líneas cómo esta acción crea capacidades duraderas y prepara para el siguiente nivel de madurez.",
                "curso_recomendado_id": "El ID del curso MÁS relevante. Si ninguno aplica, usa 'null'."
              }
            ]
          }
        ]
      }

      **Instrucciones Especiales:**
      1. Personaliza cada análisis para la industria específica del usuario
      2. Usa lenguaje motivacional y orientado a resultados
      3. Incluye métricas específicas y cuantificables
      4. Conecta las acciones entre sí para crear una estrategia coherente
      5. Sé específico sobre el impacto en el negocio
      6. Usa terminología técnica apropiada para el nivel del usuario
      7. Incluye consideraciones de riesgo y mitigación
      8. Enfócate en la ejecución práctica y medible
    `;
  }
}
