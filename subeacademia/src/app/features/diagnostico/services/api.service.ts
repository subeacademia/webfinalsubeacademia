import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DiagnosticState } from './diagnostic-state.service';
import { ObjectivesApiResponse, ActionPlanApiResponse, AresScores, CompScores } from '../data/diagnostic.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // Usar el proxy local para evitar problemas de CORS
  private apiUrl = '/api/proxy/generate';

  private extractJsonFromString(text: string): any {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Fallo al parsear el JSON extraído de la respuesta:", text);
        throw new Error("La respuesta de la IA no es un JSON válido.");
      }
    }
    console.error("No se encontró JSON en la respuesta:", text);
    throw new Error("No se encontró un objeto JSON en la respuesta de la IA.");
  }

  async generateObjectives(
    currentState: DiagnosticState,
    userPrompt: string,
    aresScores: AresScores,
    compScores: CompScores
  ): Promise<ObjectivesApiResponse> {

    const aresSummary = `Resultados ARES - General: ${aresScores.general.toFixed(2)}, Pilares: ${Object.entries(aresScores.byPillar).map(([p, s]) => `${p}: ${s.toFixed(2)}`).join(', ')}`;
    const compSummary = `Resultados Competencias - General: ${compScores.general.toFixed(2)}, Clusters: ${Object.entries(compScores.byCluster).map(([c, s]) => `${c}: ${s.toFixed(2)}`).join(', ')}`;

    const fullPrompt = `
**Rol:** Eres un consultor experto en estrategia de IA. Tu tarea es generar entre 6 y 8 objetivos SMART para una empresa basándote en su perfil, los resultados de sus diagnósticos de madurez y un prompt del usuario. Debes devolver SÓLO un objeto JSON válido con una clave "options" que contenga un array de objetos SMART. Cada objeto debe tener: id (un string único, ej: 'goal1'), title, y un objeto "smart" con claves: specific, measurable, achievable, relevant, timeBound. No incluyas texto, explicaciones o markdown fuera del objeto JSON.

**Perfil de Empresa:**
- Industria: ${currentState.profile.industry}
- Tamaño: ${currentState.profile.size} empleados
- Presupuesto IA: $${currentState.profile.iaBudgetUSD || 'No definido'} USD

**Resumen Diagnóstico ARES-AI:**
${aresSummary}

**Resumen Diagnóstico de Competencias:**
${compSummary}

**Objetivo Principal del Usuario:**
"${userPrompt}"

Basado en toda esta información, genera entre 6 y 8 objetivos SMART en el formato JSON solicitado.
    `;

    // Usar el formato correcto que espera la función de Vercel
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor experto en transformación digital con IA. Genera objetivos SMART, accionables y específicos en formato JSON válido.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      maxTokens: 2000,
      temperature: 0.7
    };
    
    try {
      const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload, { 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }));
      
      // Extraer el contenido de la respuesta de OpenAI
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('La respuesta de la IA no contiene contenido válido');
      }
      
      // Parsear el JSON de la respuesta
      const parsedResponse = JSON.parse(content);
      return parsedResponse as ObjectivesApiResponse;
      
    } catch (error) {
        if (error instanceof HttpErrorResponse) {
            console.error('Error de API:', error.message, error.error);
            throw new Error(`Error al contactar la API: ${error.statusText}. Revisa la consola del servidor (terminal) para más detalles.`);
        }
        throw error;
    }
  }

  // (El método generatePlan se mantiene igual, usando el mismo proxy)
  async generatePlan(
    currentState: DiagnosticState,
    aresScores: AresScores,
    compScores: CompScores
  ): Promise<ActionPlanApiResponse> {
      const fullPrompt = `
**Rol:** Eres un consultor de transformación digital especializado en IA. Tu tarea es crear un plan de acción estratégico. Basado en el perfil, diagnósticos y objetivos, genera un resumen ejecutivo y una lista de acciones. Debes devolver SÓLO un objeto JSON válido con una clave "summary" (string) y "items" (array de objetos). Cada "item" debe tener: id, area, suggestion, responsible (rol sugerido), y deadline (plazo sugerido).

**Perfil de Empresa:**
- Industria: ${currentState.profile.industry}
- Tamaño: ${currentState.profile.size} empleados
- Presupuesto IA: $${currentState.profile.iaBudgetUSD || 'No definido'} USD

**Resultados ARES-AI:**
${JSON.stringify(aresScores, null, 2)}

**Resultados de Competencias:**
${JSON.stringify(compScores, null, 2)}

**Objetivos Seleccionados:**
${currentState.selectedGoals.map(g => g.title).join(', ')}

Genera el plan de acción en JSON.
      `;
      
      // Usar el formato correcto que espera la función de Vercel
      const payload = {
        messages: [
          {
            role: 'system',
            content: 'Eres un asesor experto en transformación digital con IA. Genera planes de acción estratégicos en formato JSON válido.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        maxTokens: 2000,
        temperature: 0.7
      };
      
      try {
        const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload, { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }));
        
        // Extraer el contenido de la respuesta de OpenAI
        const content = response.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('La respuesta de la IA no contiene contenido válido');
        }
        
        // Parsear el JSON de la respuesta
        const parsedResponse = JSON.parse(content);
        return parsedResponse as ActionPlanApiResponse;
        
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          console.error('Error de API:', error.message, error.error);
          throw new Error(`Error al contactar la API: ${error.statusText}. Revisa la consola del servidor (terminal) para más detalles.`);
        }
        throw error;
      }
  }
}