import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report } from '../../features/diagnostico/data/report.model';

// Interfaz para los datos del diagnóstico
export interface DiagnosticData {
  profile: any;
  aresAnswers: any;
  compAnswers: any;
  riskLevel: any;
  lambdaComp: number;
  targetLevel: number;
  selectedGoals: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BesselAiService {
  private http = inject(HttpClient);
  private apiUrl = environment.gptApiUrl;

  async generateReport(data: DiagnosticData, contextoAdicional: any): Promise<Report> {
    console.log('Iniciando la generación de reporte con datos:', data);
    console.log('Contexto adicional (cursos):', contextoAdicional);

    const systemPrompt = `
      Eres un coach ejecutivo y analista de talento para "Sube Academia". Tu tarea es generar un informe de diagnóstico profesional y personalizado.
      Recibirás dos bloques de información del usuario:
      1.  Los datos del diagnóstico del usuario (objetivos, autoevaluación, etc.).
      2.  Un JSON con el catálogo de cursos y servicios que ofrece "Sube Academia".

      Tu respuesta DEBE SER ÚNICA Y EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO, sin texto adicional, que coincida con esta interfaz de TypeScript:
      
      interface Report {
        titulo: string;
        resumen: string;
        analisisCompetencias: Array<{ competencia: string; puntaje: number; descripcion: string; sugerencia: string; }>;
        identificacionBrechas: string;
        planDeAccion: Array<{ area: string; acciones: Array<{ accion: string; descripcion: string; recursos: string[]; }>; }>;
        recomendacionesGenerales: string;
        alineacionObjetivos: string; // Explica cómo el plan de acción ayuda a lograr el objetivo principal del usuario.
      }

      INSTRUCCIONES CLAVE:
      - En el 'planDeAccion', donde sea apropiado, recomienda explícitamente cursos o servicios del catálogo proporcionado. Menciona el nombre del curso.
      - En el campo 'alineacionObjetivos', analiza el 'objetivo' del usuario (del JSON de diagnóstico) y redacta un párrafo explicando cómo el plan de acción que creaste le ayudará a alcanzarlo.
      - Sé profesional, alentador y orienta la acción.
      - NO INCLUYAS NINGÚN TEXTO ANTES O DESPUÉS DEL OBJETO JSON. La respuesta debe empezar con '{' y terminar con '}'.
    `;

    const userPrompt = `
      Aquí están mis datos del diagnóstico:
      ${JSON.stringify(data, null, 2)}

      Y aquí está el catálogo de cursos y servicios disponibles en Sube Academia para que los uses en tus recomendaciones:
      ${JSON.stringify(contextoAdicional, null, 2)}
    `;
    
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    console.log('Enviando payload a la API:', JSON.stringify(payload));

    try {
      const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
      console.log('Respuesta cruda de la API:', response);

      let responseText = '';
      if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content;
      } else {
        throw new Error('La respuesta de la API no tiene el formato esperado.');
      }
      
      console.log('Texto extraído:', responseText);

      try {
        const cleanedText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const report: Report = JSON.parse(cleanedText);
        console.log('Reporte parseado con éxito:', report);
        return report;
      } catch (parseError) {
        console.error('Error fatal al parsear JSON:', parseError, 'Texto recibido:', responseText);
        throw new Error('La respuesta de la IA no es un objeto JSON válido.');
      }
    } catch (error) {
      console.error('Error en la llamada a la API de Bessel:', error);
      throw error;
    }
  }

  async generarSugerenciasDeObjetivos(rol: string, industria: string): Promise<string[]> {
    console.log(`Generando sugerencias para rol: ${rol}, industria: ${industria}`);

    const systemPrompt = `
      Eres un experto en desarrollo profesional y coaching de carrera. 
      Tu única tarea es generar 3 sugerencias de objetivos SMART (específicos, medibles, alcanzables, relevantes, con plazos) para una persona con un rol y en una industria específicos.
      LA RESPUESTA DEBE SER ÚNICA Y EXCLUSIVAMENTE UN ARRAY DE STRINGS EN FORMATO JSON VÁLIDO.
      Ejemplo de respuesta esperada: 
      ["Desarrollar un proyecto de análisis de datos para optimizar un 15% los costos de logística en los próximos 6 meses.", "Completar la certificación avanzada en marketing digital para liderar la nueva campaña de producto en el Q4.", "Mejorar mis habilidades de liderazgo de equipos mediante un curso y la mentoría de un nuevo miembro del equipo este semestre."]

      NO INCLUYAS NINGÚN TEXTO INTRODUCTORIO, EXPLICACIÓN, O CARACTERES ADICIONALES ANTES O DESPUÉS DEL ARRAY JSON.
      La respuesta debe empezar con '[' y terminar con ']'.
    `;

    const userPrompt = `Rol: '${rol}', Industria: '${industria}'`;

    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    console.log('Enviando payload para sugerencias:', JSON.stringify(payload));

    try {
      const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
      console.log('Respuesta cruda de la API para sugerencias:', response);

      let responseText = '';
      if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content;
      } else {
        throw new Error('La respuesta de la API para sugerencias no tiene el formato esperado.');
      }
      
      console.log('Texto de sugerencias extraído:', responseText);

      try {
        const cleanedText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const sugerencias: string[] = JSON.parse(cleanedText);
        console.log('Sugerencias parseadas con éxito:', sugerencias);
        if (!Array.isArray(sugerencias)) throw new Error('La respuesta no es un array.');
        return sugerencias;
      } catch (parseError) {
        console.error('Error fatal al parsear JSON de sugerencias:', parseError, 'Texto recibido:', responseText);
        throw new Error('La respuesta de la IA no es un array JSON válido.');
      }
    } catch (error) {
      console.error('Error en la llamada a la API para generar sugerencias:', error);
      throw error;
    }
  }
}