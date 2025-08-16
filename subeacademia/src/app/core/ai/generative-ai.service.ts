import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AsistenteIaService } from '../../shared/ui/chatbot/asistente-ia.service';

// Interfaz para los datos de entrada
export interface DiagnosticAnalysisData {
  userName: string;
  userRole: string;
  userIndustry: string;
  topCompetencies: { name: string; score: number }[];
  lowestCompetencies: { name: string; score: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class GenerativeAiService {

  constructor(private asistenteIaService: AsistenteIaService) {}

  /**
   * Genera un análisis de diagnóstico personalizado llamando a la API de Azure.
   * Construye un payload conversacional (system + user) que es el formato esperado por la API.
   */
  generateDiagnosticAnalysis(data: DiagnosticAnalysisData): Observable<string> {
    // 1. Prompt de Sistema: Define el rol y el formato de salida de la IA.
    const systemPrompt = `
      Actúa como un coach ejecutivo y experto en desarrollo de talento para la empresa Sube Academia.
      Tu tono debe ser inspirador, profesional, constructivo y altamente personalizado.
      Tu misión es analizar los datos del diagnóstico de un usuario y generar un informe narrativo conciso y poderoso en formato Markdown.
      El informe debe tener exactamente 3 secciones con los siguientes títulos en negrita:
      **1. Tus Superpoderes: Análisis de Fortalezas**
      **2. Tu Próximo Nivel: Oportunidades de Crecimiento**
      **3. Plan de Acción Estratégico**
      Utiliza negritas para resaltar conceptos clave dentro de cada párrafo.
    `;

    // 2. Prompt de Usuario: Contiene los datos específicos del diagnóstico a analizar.
    const userPrompt = `
      Por favor, genera el informe de diagnóstico para el siguiente perfil:

      **Datos del Usuario:**
      - Nombre: ${data.userName}
      - Rol Actual: ${data.userRole}
      - Industria: ${data.userIndustry}

      **Resultados del Diagnóstico:**
      - Competencias Destacadas (Fortalezas):
        ${data.topCompetencies.map(c => `- ${c.name} (Puntaje: ${c.score}/100)`).join('\n')}
      
      - Áreas de Oportunidad (Para Crecer):
        ${data.lowestCompetencies.map(c => `- ${c.name} (Puntaje: ${c.score}/100)`).join('\n')}

      Genera el informe siguiendo estrictamente las 3 secciones y el tono definidos en tus instrucciones de sistema.
    `;

    // 3. Payload para la API: La estructura conversacional correcta.
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 1200,
      temperature: 0.7
    };

    // 4. Llamada a la API y Manejo de Respuesta
    return this.asistenteIaService.generarTextoAzure(payload).pipe(
      map((res: any) => {
        if (res?.choices?.[0]?.message?.content) {
          return res.choices[0].message.content;
        }
        throw new Error('Respuesta de la IA con formato inesperado.');
      }),
      catchError(err => {
        console.error('Error en GenerativeAiService:', err);
        return of('Lo sentimos, ha ocurrido un error al generar tu análisis personalizado. Por favor, intenta recargar la página.');
      })
    );
  }
}
