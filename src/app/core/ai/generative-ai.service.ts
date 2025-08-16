import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AsistenteIaService } from '../../shared/ui/chatbot/asistente-ia.service';

export interface DiagnosticAnalysisData {
  userName: string;
  userRole: string;
  userIndustry: string;
  topCompetencies: { name: string; score: number; description: string }[];
  lowestCompetencies: { name: string; score: number; description: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class GenerativeAiService {

  constructor(private asistenteIaService: AsistenteIaService) {}

  generateDiagnosticAnalysis(data: DiagnosticAnalysisData): Observable<string> {
    
    // MEGA PROMPT DE SISTEMA V2 - MÁS DETALLADO Y CONTEXTUAL
    const systemPrompt = `
      Actúa como un estratega de talento y coach ejecutivo de Sube Academia, con un doctorado en psicología organizacional y más de 15 años de experiencia en el desarrollo de líderes en la era de la IA. Tu tono es experto, empático, y visionario. Tu objetivo es entregar un análisis profundo y accionable que inspire al usuario a tomar control de su desarrollo profesional.

      La respuesta DEBE estar en formato Markdown y seguir estrictamente esta estructura de 4 secciones:

      ### 💡 Resumen Ejecutivo
      Un párrafo inicial que resuma el perfil de ${data.userName}, conectando sus fortalezas y oportunidades con su contexto profesional (rol de ${data.userRole} en la industria de ${data.userIndustry}).

      ### 🚀 Tus Superpoderes: Análisis de Fortalezas
      Para CADA UNA de las 3 competencias destacadas, crea un subtítulo en negrita (ej. **Fortaleza: Liderazgo e Influencia Social**). Luego, en un párrafo, explica por qué esta competencia, cuya definición es "${data.topCompetencies[0].description}", es un diferenciador clave en su rol. Proporciona un ejemplo táctico y concreto de cómo puede apalancar esta fortaleza en un proyecto real esta semana.

      ### 🌱 Tu Próximo Nivel: Oportunidades de Crecimiento
      Para CADA UNA de las 3 áreas de oportunidad, crea un subtítulo en negrita (ej. **Oportunidad: Pensamiento Analítico**). En un párrafo, replantea esta área no como una debilidad, sino como una palanca de crecimiento estratégico. Explica el "costo de oportunidad" de no desarrollarla, basándote en su definición ("${data.lowestCompetencies[0].description}"), y el impacto positivo que tendría si la mejorara.

      ### 🎯 Plan de Acción Estratégico (Próximos 30 Días)
      Crea una lista numerada con 3 acciones concretas, accionables y de alto impacto. Cada acción debe combinar una fortaleza con un área de oportunidad de forma inteligente y sinérgica. Sé específico.
      Ejemplo de acción: "1. **Lidera con Datos:** En tu próxima reunión de equipo, utiliza tu fortaleza en **${data.topCompetencies[0].name}** para presentar una decisión clave, pero fundamenta tu argumento principal usando un análisis de datos simple (ej. un gráfico de Excel), practicando así tu **${data.lowestCompetencies[0].name}**."
    `;

    // Prompt de Usuario con contexto completo
    const userPrompt = `
      Analiza mi perfil y genera mi informe de desarrollo profesional. Los datos completos son:
      - Nombre: ${data.userName}
      - Rol: ${data.userRole}
      - Industria: ${data.userIndustry}
      - Fortalezas: ${JSON.stringify(data.topCompetencies)}
      - Oportunidades: ${JSON.stringify(data.lowestCompetencies)}
    `;

    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 1500,
      temperature: 0.75
    };

    return this.asistenteIaService.generarTextoAzure(payload).pipe(
      map(res => {
        if (res?.choices?.[0]?.message?.content) {
          return res.choices[0].message.content;
        }
        throw new Error('Respuesta de la IA con formato inesperado.');
      }),
      catchError(err => {
        console.error('Error en GenerativeAiService:', err);
        return of('### Error en el Análisis\n\nLo sentimos, no hemos podido generar tu análisis personalizado en este momento. Por favor, intenta recargar la página o contacta con soporte si el problema persiste.');
      })
    );
  }
}
