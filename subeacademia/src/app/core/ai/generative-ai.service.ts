import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DiagnosticAnalysisData {
  diagnosticData: any;
  competencyScores: any[];
  aresScores: any;
  leadInfo: any;
}

export interface DiagnosticAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  actionPlan: ActionPlanItem[];
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  timeframe: string;
  impact: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class GenerativeAiService {
  private readonly http = inject(HttpClient);
  
  // Usar la API configurada en environment
  private readonly apiUrl = environment.backendIaUrl;
  
  // Configuración de la API
  private readonly defaultConfig = {
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000, // 30 segundos
    retryAttempts: 2
  };

  /**
   * Genera análisis completo del diagnóstico usando IA
   */
  generateDiagnosticAnalysis(data: DiagnosticAnalysisData): Observable<DiagnosticAnalysis> {
    const prompt = this.buildDiagnosticPrompt(data);
    
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un consultor experto en transformación digital y madurez organizacional. Analiza los datos del diagnóstico y genera un análisis completo con plan de acción personalizado.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: this.defaultConfig.maxTokens,
      temperature: this.defaultConfig.temperature
    };

    return this.http.post<any>(this.apiUrl, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      timeout(this.defaultConfig.timeout),
      retry(this.defaultConfig.retryAttempts),
      map(response => this.processDiagnosticResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Genera plan de acción personalizado
   */
  generateActionPlan(data: DiagnosticAnalysisData): Observable<ActionPlanItem[]> {
    const prompt = this.buildActionPlanPrompt(data);
    
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un coach de transformación digital. Genera un plan de acción específico, medible y accionable basado en los resultados del diagnóstico.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 1500,
      temperature: 0.6
    };

    return this.http.post<any>(this.apiUrl, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      timeout(this.defaultConfig.timeout),
      retry(this.defaultConfig.retryAttempts),
      map(response => this.processActionPlanResponse(response)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Construye el prompt para análisis de diagnóstico
   */
  private buildDiagnosticPrompt(data: DiagnosticAnalysisData): string {
    const { diagnosticData, competencyScores, aresScores, leadInfo } = data;
    
    return `Analiza los siguientes datos de diagnóstico organizacional y genera un análisis completo:

CONTEXTO DEL CLIENTE:
- Nombre: ${leadInfo?.name || 'No disponible'}
- Industria: ${diagnosticData?.contexto?.industria || 'No disponible'}
- Tamaño: ${diagnosticData?.contexto?.tamano || 'No disponible'}

RESULTADOS DE COMPETENCIAS:
${competencyScores.map(comp => `- ${comp.name}: ${comp.score}/100`).join('\n')}

RESULTADOS ARES:
- Análisis: ${aresScores?.analisis || 0}/100
- Responsabilidad: ${aresScores?.responsabilidad || 0}/100
- Estrategia: ${aresScores?.estrategia || 0}/100
- Sistemas: ${aresScores?.sistemas || 0}/100

Genera un análisis que incluya:
1. Resumen ejecutivo (2-3 frases)
2. 3-4 fortalezas principales
3. 3-4 áreas de mejora
4. 2-3 oportunidades de desarrollo
5. 2-3 amenazas o riesgos
6. 3-4 recomendaciones clave
7. Plan de acción con 5-6 acciones específicas

Formato de respuesta: JSON válido con la estructura solicitada.`;
  }

  /**
   * Construye el prompt para plan de acción
   */
  private buildActionPlanPrompt(data: DiagnosticAnalysisData): string {
    const { competencyScores, aresScores } = data;
    
    const lowestCompetencies = competencyScores
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    
    const lowestAres = Object.entries(aresScores || {})
      .sort(([,a], [,b]) => (a as number) - (b as number))
      .slice(0, 2);

    return `Basándote en estos resultados, genera un plan de acción específico:

ÁREAS MÁS DÉBILES:
Competencias: ${lowestCompetencies.map(c => `${c.name} (${c.score}/100)`).join(', ')}
ARES: ${lowestAres.map(([key, value]) => `${key}: ${value}/100`).join(', ')}

Genera 6 acciones específicas que:
- Sean medibles y accionables
- Tengan prioridad (alta/media/baja)
- Incluyan timeframe realista
- Especifiquen impacto esperado
- Se categorizen por área

Formato: Array JSON con estructura de ActionPlanItem.`;
  }

  /**
   * Procesa la respuesta del análisis de diagnóstico
   */
  private processDiagnosticResponse(response: any): DiagnosticAnalysis {
    try {
      // Intentar extraer el contenido de la respuesta
      const content = response?.choices?.[0]?.message?.content || 
                     response?.content || 
                     response?.message || 
                     response;

      // Si es string, intentar parsear como JSON
      if (typeof content === 'string') {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      // Si es objeto, usarlo directamente
      if (typeof content === 'object') {
        return content as DiagnosticAnalysis;
      }

      // Fallback: análisis básico
      return this.generateFallbackAnalysis();
    } catch (error) {
      console.error('Error procesando respuesta de IA:', error);
      return this.generateFallbackAnalysis();
    }
  }

  /**
   * Procesa la respuesta del plan de acción
   */
  private processActionPlanResponse(response: any): ActionPlanItem[] {
    try {
      const content = response?.choices?.[0]?.message?.content || 
                     response?.content || 
                     response?.message || 
                     response;

      if (typeof content === 'string') {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      if (Array.isArray(content)) {
        return content as ActionPlanItem[];
      }

      return this.generateFallbackActionPlan();
    } catch (error) {
      console.error('Error procesando plan de acción:', error);
      return this.generateFallbackActionPlan();
    }
  }

  /**
   * Genera análisis de fallback si la IA falla
   */
  private generateFallbackAnalysis(): DiagnosticAnalysis {
    return {
      summary: "Análisis generado localmente basado en los resultados del diagnóstico.",
      strengths: [
        "Tienes competencias sólidas en áreas clave",
        "Tu organización muestra madurez en ciertos aspectos",
        "Existe potencial para desarrollo y mejora"
      ],
      weaknesses: [
        "Identificamos oportunidades de mejora en competencias específicas",
        "Algunas áreas del framework ARES requieren atención",
        "Hay espacio para optimización de procesos"
      ],
      opportunities: [
        "Desarrollo de competencias clave",
        "Implementación de mejores prácticas",
        "Optimización de procesos organizacionales"
      ],
      threats: [
        "Riesgo de quedarse atrás en transformación digital",
        "Posible pérdida de competitividad",
        "Ineficiencias operativas"
      ],
      recommendations: [
        "Priorizar el desarrollo de competencias más débiles",
        "Implementar un plan de mejora gradual",
        "Establecer métricas de seguimiento"
      ],
      actionPlan: this.generateFallbackActionPlan()
    };
  }

  /**
   * Genera plan de acción de fallback
   */
  private generateFallbackActionPlan(): ActionPlanItem[] {
    return [
      {
        id: 'fallback-1',
        title: 'Evaluación de Competencias',
        description: 'Realizar una evaluación detallada de las competencias identificadas como débiles',
        priority: 'alta',
        timeframe: '1-2 meses',
        impact: 'Identificación clara de áreas de mejora',
        category: 'Evaluación'
      },
      {
        id: 'fallback-2',
        title: 'Plan de Desarrollo',
        description: 'Crear un plan de desarrollo personalizado para las competencias clave',
        priority: 'alta',
        timeframe: '2-3 meses',
        impact: 'Mejora medible en competencias',
        category: 'Desarrollo'
      },
      {
        id: 'fallback-3',
        title: 'Implementación de Mejoras',
        description: 'Implementar mejoras graduales en los procesos identificados',
        priority: 'media',
        timeframe: '3-6 meses',
        impact: 'Optimización de procesos operativos',
        category: 'Implementación'
      }
    ];
  }

  /**
   * Maneja errores de la API
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en servicio de IA generativa:', error);
    
    if (error.name === 'TimeoutError') {
      return throwError(() => new Error('La solicitud a la IA tardó demasiado. Intenta nuevamente.'));
    }
    
    if (error.status === 429) {
      return throwError(() => new Error('Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.'));
    }
    
    if (error.status >= 500) {
      return throwError(() => new Error('Error del servidor de IA. Intenta nuevamente más tarde.'));
    }
    
    return throwError(() => new Error('Error al generar análisis con IA. Usando análisis local.'));
  }
}
