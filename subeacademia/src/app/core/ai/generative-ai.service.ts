import { Injectable, inject } from '@angular/core';
import { BesselAiService } from './bessel-ai.service';

export interface DiagnosticAnalysisData {
  profile: {
    industry: string;
    role: string;
    objective: string;
  };
  aresAnswers: any;
  compAnswers: any;
}

@Injectable({
  providedIn: 'root'
})
export class GenerativeAiService {
  private besselAiService = inject(BesselAiService);

  /**
   * Genera texto usando IA basado en un prompt
   * @param prompt El prompt para generar el texto
   * @returns Promise<string> El texto generado por la IA
   */
  async generateText(prompt: string): Promise<string> {
    try {
      // Usar el método existente del BesselAiService pero adaptado para texto libre
      const systemPrompt = `
        Eres un asistente de IA especializado en consultoría empresarial y desarrollo profesional.
        Responde de manera concisa, profesional y orientada a resultados.
        ${prompt}
      `;

      const userPrompt = 'Por favor, genera una respuesta basada en las instrucciones del sistema.';

      const payload = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      };

      // Llamada directa a la API usando fetch (similar a como lo hace BesselAiService)
      const response = await fetch('https://apisube-smoky.vercel.app/api/azure/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const responseText = await response.text();
      
      // Limpiar la respuesta de posibles caracteres extra
      const cleanedResponse = responseText.trim();
      
      return cleanedResponse;
    } catch (error) {
      console.error('Error en GenerativeAiService.generateText:', error);
      throw error;
    }
  }

  /**
   * Genera objetivos empresariales específicos basados en contexto
   * @param industry La industria de la empresa
   * @param companySize El tamaño de la empresa
   * @returns Promise<string[]> Array de objetivos generados
   */
  async generateBusinessObjectives(industry: string, companySize: string): Promise<string[]> {
    const prompt = `
      Actúa como un consultor de estrategia de negocios especializado en transformación digital e IA.
      Para una empresa del sector "${industry}" y del tamaño de "${companySize}", genera 3 objetivos empresariales SMART (Específicos, Medibles, Alcanzables, Relevantes, con Plazo).
      Los objetivos deben ser concisos, inspiradores y orientados a resultados.
      Devuelve la respuesta EXCLUSIVAMENTE como un array JSON de strings. 
      Ejemplo: ["Optimizar la eficiencia operativa en un 15% para el Q4 mediante la automatización de procesos.", "Aumentar la captación de clientes en un 20% en los próximos 6 meses.", "Mejorar la satisfacción del cliente a 9/10 para fin de año."]
    `;

    try {
      const response = await this.generateText(prompt);
      
      // Limpiar y parsear la respuesta de la IA
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const objectives: string[] = JSON.parse(cleanedResponse);

      if (objectives && Array.isArray(objectives) && objectives.length > 0) {
        return objectives;
      } else {
        throw new Error('La IA no devolvió objetivos válidos.');
      }
    } catch (error) {
      console.error('Error al generar objetivos empresariales:', error);
      // Fallback: devolver objetivos genéricos
      return [
        `Optimizar la eficiencia operativa en un 15% para el Q4 mediante la automatización de procesos clave en ${industry}.`,
        `Aumentar la captación de clientes en un 20% en los próximos 6 meses a través de estrategias digitales innovadoras.`,
        `Mejorar la satisfacción del cliente a 9/10 para fin de año mediante la implementación de mejores prácticas de atención al cliente.`
      ];
    }
  }

  /**
   * Genera análisis de diagnóstico usando el BesselAiService existente
   * @param data Datos del diagnóstico
   * @param contextoAdicional Contexto adicional
   * @returns Promise<any> Resultado del análisis
   */
  async generateDiagnosticAnalysis(data: DiagnosticAnalysisData, contextoAdicional: any): Promise<any> {
    return await this.besselAiService.generateReport(data as any, contextoAdicional);
  }
}
