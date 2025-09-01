import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DiagnosticoFormValue } from '../../features/diagnostico/data/diagnostic.models';
import { ARES_ITEMS } from '../../features/diagnostico/data/ares-items';
import { COMPETENCIAS } from '../../features/diagnostico/data/competencias';
import { ARES_FRAMEWORK_SUMMARY, COMPETENCIAS_ERA_IA_SUMMARY } from './methodology-data';

interface VercelApiResponse {
  result: string;
}

@Injectable({
  providedIn: 'root',
})
export class GenerativeAiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';

  // 🔍 SISTEMA DE LOGGING COMPLETO
  private logPrefix = '🤖 [GenerativeAI]';
  private requestId = 0;

  async generateActionPlan(diagnosticData: DiagnosticoFormValue): Promise<string> {
    const currentRequestId = ++this.requestId;
    
    this.logInfo(`[${currentRequestId}] Iniciando generación de plan de acción`, {
      requestId: currentRequestId,
      timestamp: new Date().toISOString(),
      hasLeadData: !!diagnosticData.lead,
      hasContextData: !!diagnosticData.contexto,
      hasAresData: !!diagnosticData.ares,
      hasCompetenciasData: !!diagnosticData.competencias,
      hasObjetivo: !!diagnosticData.objetivo
    });

    try {
      // 🔍 PASO 1: Validación de datos de entrada
      this.logInfo(`[${currentRequestId}] Validando datos de entrada...`);
      const validationResult = this.validateDiagnosticData(diagnosticData);
      
      if (!validationResult.isValid) {
        this.logError(`[${currentRequestId}] Datos de diagnóstico inválidos`, {
          errors: validationResult.errors,
          requestId: currentRequestId
        });
        throw new Error(`Datos de diagnóstico inválidos: ${validationResult.errors.join(', ')}`);
      }

      this.logInfo(`[${currentRequestId}] Datos de diagnóstico validados correctamente`);

      // 🔍 PASO 2: Construcción del prompt
      this.logInfo(`[${currentRequestId}] Construyendo prompt para la IA...`);
      const prompt = this.constructPrompt(diagnosticData);
      
      this.logInfo(`[${currentRequestId}] Prompt construido exitosamente`, {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 200) + '...'
      });

      // 🔍 PASO 3: Preparación de la petición HTTP
      this.logInfo(`[${currentRequestId}] Preparando petición HTTP...`);
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const body = { prompt };
      
      this.logInfo(`[${currentRequestId}] Petición HTTP preparada`, {
        url: this.apiUrl,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        bodySize: JSON.stringify(body).length,
        requestId: currentRequestId
      });

      // 🔍 PASO 4: Llamada a la API
      this.logInfo(`[${currentRequestId}] Enviando petición a la API de Vercel...`);
      const startTime = Date.now();
      
      const response = await firstValueFrom(
        this.http.post<VercelApiResponse>(this.apiUrl, body, { headers })
      );
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      this.logInfo(`[${currentRequestId}] Respuesta recibida exitosamente`, {
        responseTime: `${responseTime}ms`,
        responseType: typeof response,
        hasResult: !!response?.result,
        resultType: typeof response?.result,
        resultLength: response?.result?.length || 0,
        requestId: currentRequestId
      });

      // 🔍 PASO 5: Validación de la respuesta
      this.logInfo(`[${currentRequestId}] Validando respuesta de la API...`);
      
      if (!response) {
        throw new Error('La respuesta de la API está vacía');
      }
      
      if (typeof response.result !== 'string') {
        this.logError(`[${currentRequestId}] Formato de respuesta inválido`, {
          expectedType: 'string',
          actualType: typeof response.result,
          response: response,
          requestId: currentRequestId
        });
        throw new Error(`La respuesta de la API no tiene el formato esperado. Tipo recibido: ${typeof response.result}`);
      }

      if (!response.result.trim()) {
        throw new Error('La respuesta de la API está vacía o solo contiene espacios en blanco');
      }

      this.logInfo(`[${currentRequestId}] Respuesta validada correctamente`, {
        resultLength: response.result.length,
        resultPreview: response.result.substring(0, 100) + '...',
        requestId: currentRequestId
      });

      // 🔍 PASO 6: Retorno del resultado
      this.logInfo(`[${currentRequestId}] Generación de plan de acción completada exitosamente`, {
        finalResultLength: response.result.length,
        requestId: currentRequestId
      });

      return response.result;

    } catch (error) {
      // 🔍 MANEJO DETALLADO DE ERRORES
      this.handleError(error, currentRequestId, diagnosticData);
      
      // Retornar mensaje de fallback
      return this.generateFallbackMessage(diagnosticData, currentRequestId);
    }
  }

  private validateDiagnosticData(data: DiagnosticoFormValue): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar datos del lead
    if (!data.lead?.nombre) {
      errors.push('Nombre del lead no especificado');
    }
    if (!data.lead?.email) {
      errors.push('Email del lead no especificado');
    }

    // Validar datos de contexto
    if (!data.contexto?.industria) {
      errors.push('Industria no especificada');
    }

    // Validar datos de ARES
    if (!data.ares?.respuestas || Object.keys(data.ares.respuestas).length === 0) {
      errors.push('No hay respuestas del framework ARES');
    }

    // Validar datos de competencias
    if (!data.competencias?.niveles || Object.keys(data.competencias.niveles).length === 0) {
      errors.push('No hay niveles de competencias especificados');
    }

    // Validar objetivo
    if (!data.objetivo) {
      errors.push('Objetivo principal no especificado');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private handleError(error: any, requestId: number, diagnosticData: DiagnosticoFormValue): void {
    let errorType = 'Unknown';
    let errorDetails: any = {};

    if (error instanceof HttpErrorResponse) {
      errorType = 'HttpErrorResponse';
      errorDetails = {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error,
        headers: 'Headers disponibles',
        requestId
      };
      
      this.logError(`[${requestId}] Error HTTP en la API de Vercel`, errorDetails);
      
      // Log específico según el código de estado
      if (error.status === 500) {
        this.logError(`[${requestId}] Error 500 - Problema interno del servidor de Vercel`, {
          ...errorDetails,
          recommendation: 'Verificar logs del servidor de Vercel y estado de la función'
        });
      } else if (error.status === 404) {
        this.logError(`[${requestId}] Error 404 - Endpoint no encontrado`, {
          ...errorDetails,
          recommendation: 'Verificar que la URL de la API sea correcta'
        });
      } else if (error.status === 0) {
        this.logError(`[${requestId}] Error 0 - Problema de conectividad o CORS`, {
          ...errorDetails,
          recommendation: 'Verificar conectividad de red y configuración CORS'
        });
      }
      
    } else if (error instanceof Error) {
      errorType = 'Error';
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        requestId
      };
      this.logError(`[${requestId}] Error de JavaScript`, errorDetails);
      
    } else if (typeof error === 'string') {
      errorType = 'StringError';
      errorDetails = {
        message: error,
        requestId
      };
      this.logError(`[${requestId}] Error de tipo string`, errorDetails);
      
    } else {
      errorDetails = {
        errorType: typeof error,
        error: error,
        requestId
      };
      this.logError(`[${requestId}] Error de tipo desconocido`, errorDetails);
    }

    // Log del contexto del error
    this.logError(`[${requestId}] Contexto del error`, {
      errorType,
      requestId,
      diagnosticDataSummary: {
        hasLead: !!diagnosticData.lead,
        hasContext: !!diagnosticData.contexto,
        hasAres: !!diagnosticData.ares,
        hasCompetencias: !!diagnosticData.competencias,
        hasObjetivo: !!diagnosticData.objetivo
      },
      timestamp: new Date().toISOString()
    });
  }

  private generateFallbackMessage(diagnosticData: DiagnosticoFormValue, requestId: number): string {
    this.logInfo(`[${requestId}] Generando mensaje de fallback...`);
    
    const leadName = diagnosticData.lead?.nombre || 'Usuario';
    const industry = diagnosticData.contexto?.industria || 'su industria';
    
    const fallbackMessage = `### Error al Generar tu Reporte

Hola, ${leadName}. Lamentamos informarte que ocurrió un problema al intentar generar tu diagnóstico personalizado para ${industry}.

**¿Qué pasó?**
- Nuestro sistema de IA experimentó un problema técnico
- La conexión con nuestro servicio de análisis no pudo completarse

**¿Qué puedes hacer?**
1. **Intenta de nuevo:** A veces los problemas son temporales
2. **Verifica tu conexión:** Asegúrate de tener una conexión estable a internet
3. **Contacta soporte:** Si el problema persiste, nuestro equipo puede ayudarte

**Información del error:**
- ID de solicitud: ${requestId}
- Fecha: ${new Date().toLocaleString('es-ES')}
- Estado: Error de conexión con la API

Mientras tanto, puedes revisar los resultados numéricos de tu diagnóstico que se muestran arriba.`;

    this.logInfo(`[${requestId}] Mensaje de fallback generado`, {
      messageLength: fallbackMessage.length,
      requestId
    });

    return fallbackMessage;
  }

  private constructPrompt(data: DiagnosticoFormValue): string {
    this.logInfo('Construyendo prompt para la IA...', {
      hasAresData: !!data.ares?.respuestas,
      hasCompetenciasData: !!data.competencias?.niveles,
      aresCount: Object.keys(data.ares?.respuestas || {}).length,
      competenciasCount: Object.keys(data.competencias?.niveles || {}).length
    });

    // Construir análisis detallado de ARES por dimensiones
    const aresByDimension = this.groupAresByDimension(data.ares?.respuestas || {});
    const aresResults = Object.entries(aresByDimension)
      .map(([dimension, items]) => {
        const dimensionName = this.getDimensionName(dimension);
        const itemsList = items.map(([key, value]) => {
          const item = ARES_ITEMS.find((i) => i.id === key);
          return `    - ${item?.labelKey || key}: ${value}/5`;
        }).join('\n');
        return `**${dimensionName}:**\n${itemsList}`;
      })
      .join('\n\n');

    // Construir análisis detallado de competencias
    const competenciasResults = Object.entries(data.competencias?.niveles || {})
      .map(([key, value]) => {
        const item = COMPETENCIAS.find((c) => c.id === key);
        const nivel = value as string;
        const nivelScore = this.getNivelScore(nivel);
        return `- **${item?.nameKey || key}:** ${nivel} (${nivelScore}%)`;
      })
      .join('\n');

    // Calcular métricas clave
    const aresScores = Object.values(data.ares?.respuestas || {}).filter(v => v !== null) as number[];
    const aresAverage = aresScores.length > 0 ? aresScores.reduce((sum, score) => sum + score, 0) / aresScores.length : 0;
    
    const competenciaScores = Object.values(data.competencias?.niveles || {})
      .map(nivel => this.getNivelScore(nivel as string))
      .filter(score => score > 0);
    const competenciaAverage = competenciaScores.length > 0 ? competenciaScores.reduce((sum, score) => sum + score, 0) / competenciaScores.length : 0;

    this.logInfo('Prompt construido exitosamente', {
      aresResultsCount: aresResults.split('\n').length,
      competenciasResultsCount: competenciasResults.split('\n').length,
      aresAverage,
      competenciaAverage,
      totalPromptLength: aresResults.length + competenciasResults.length
    });

    return `
**Rol y Objetivo:** Eres un consultor experto en transformación digital e IA de SUBE AcademIA, especializado en el "ARES-AI Framework" y en las "13 Competencias para la era de la IA". Tu objetivo es analizar los datos de un diagnóstico completado por un usuario y generar un reporte de madurez y un plan de acción que sea personalizado, accionable y de alto valor para **${data.lead?.nombre || 'Usuario'}** de la empresa **${data.contexto?.industria || 'su industria'}**. El tono debe ser profesional, alentador y experto.

**Contexto de la Metodología (DEBES BASARTE EN ESTO):**
1. **${ARES_FRAMEWORK_SUMMARY.title}:** ${ARES_FRAMEWORK_SUMMARY.description}
   - **Ágil:** ${ARES_FRAMEWORK_SUMMARY.pillars.find(p => p.key === 'agile')?.description}
   - **Responsable:** ${ARES_FRAMEWORK_SUMMARY.pillars.find(p => p.key === 'responsible')?.description}
   - **Ético:** ${ARES_FRAMEWORK_SUMMARY.pillars.find(p => p.key === 'ethical')?.description}
   - **Sostenible:** ${ARES_FRAMEWORK_SUMMARY.pillars.find(p => p.key === 'sustainable')?.description}

2. **${COMPETENCIAS_ERA_IA_SUMMARY.title}:** ${COMPETENCIAS_ERA_IA_SUMMARY.description}

**Datos del Diagnóstico del Usuario a Analizar:**

- **Nombre del Contacto:** ${data.lead?.nombre || 'No especificado'}
- **Email:** ${data.lead?.email || 'No especificado'}
- **Industria:** ${data.contexto?.industria || 'No especificado'}
- **Tamaño de la Empresa:** ${data.contexto?.tamanoEquipo || data.contexto?.tamanoEmpresa || data.contexto?.numEmpleados || 'No especificado'}
- **Objetivo Principal con la IA:** ${data.objetivo || 'No especificado'}

**Resultados Cuantitativos del Diagnóstico:**

**Framework ARES-AI (Puntaje promedio: ${aresAverage.toFixed(1)}/5):**
${aresResults}

**13 Competencias Clave (Puntaje promedio: ${competenciaAverage.toFixed(1)}%):**
${competenciasResults}

**Tarea y Formato de Salida Obligatorio (Markdown):**

Basándote **estrictamente** en los datos proporcionados, genera un informe completo y visualmente claro en formato MARKDOWN. No inventes información. Tu análisis debe reflejar directamente los puntajes y el contexto del usuario. Utiliza el siguiente formato EXACTO:

### Hola, ${data.lead?.nombre || 'Usuario'}! Aquí está tu Diagnóstico de Madurez en IA

**Análisis General para ${data.contexto?.industria || 'tu empresa'}:**
Basado en tu diagnóstico, tu organización muestra un nivel de madurez en IA de **${this.getMaturityLevel((aresAverage + competenciaAverage / 20) / 2)}**. Con un puntaje promedio de ${aresAverage.toFixed(1)}/5 en el framework ARES y ${competenciaAverage.toFixed(1)}% en competencias clave, tu empresa se encuentra en una posición ${this.getPositionDescription((aresAverage + competenciaAverage / 20) / 2)} para alcanzar tu objetivo de "${data.objetivo || 'implementar IA'}".

**Fortalezas y Oportunidades Clave:**

**Fortalezas Principales:**
${this.getTopStrengths(data.ares?.respuestas || {}, data.competencias?.niveles || {})}

**Áreas de Mayor Oportunidad:**
${this.getTopOpportunities(data.ares?.respuestas || {}, data.competencias?.niveles || {})}

### Plan de Acción Personalizado

**Objetivo Estratégico 1: Fortalecer la Gobernanza y Ética en IA**
- **Acciones Recomendadas:**
  - Establecer un comité de ética en IA con representantes de diferentes áreas
  - Desarrollar políticas claras de uso responsable de IA
  - Implementar auditorías regulares de algoritmos y datos
  - Crear protocolos de transparencia y explicabilidad
- **Competencias a Desarrollar:** Ética y Responsabilidad, Gobernanza
- **Prioridad:** Alta
- **Tiempo Estimado:** 3-4 meses

**Objetivo Estratégico 2: Desarrollar Capacidades Técnicas y de Talento**
- **Acciones Recomendadas:**
  - Crear un programa de capacitación en IA para todo el equipo
  - Contratar o desarrollar talento especializado en IA
  - Establecer alianzas con universidades o centros de investigación
  - Implementar herramientas de desarrollo y MLOps
- **Competencias a Desarrollar:** Liderazgo en IA, Aprendizaje Continuo, Diseño Tecnológico
- **Prioridad:** Alta
- **Tiempo Estimado:** 4-6 meses

**Objetivo Estratégico 3: Implementar Soluciones de IA de Alto Impacto**
- **Acciones Recomendadas:**
  - Identificar 2-3 casos de uso prioritarios basados en tu objetivo de "${data.objetivo || 'implementar IA'}"
  - Desarrollar prototipos y pruebas de concepto
  - Establecer métricas de éxito y KPIs específicos
  - Crear un roadmap de implementación por fases
- **Competencias a Desarrollar:** Resolución de Problemas Complejos, Automatización y Agentes IA
- **Prioridad:** Media
- **Tiempo Estimado:** 6-8 meses

**Recomendaciones Específicas por Industria:**
${this.getIndustryRecommendations(data.contexto?.industria || '')}

**Próximos Pasos Inmediatos:**
1. Revisar y aprobar este plan de acción con el equipo directivo
2. Asignar responsables y recursos para cada objetivo
3. Establecer reuniones de seguimiento mensuales
4. Considerar la contratación de un consultor especializado en IA

**Recursos Adicionales:**
- Curso "Fundamentos de IA para Líderes" de SUBE AcademIA
- Certificación en "Ética y Gobernanza de IA"
- Consultoría especializada en implementación de IA
    `;
  }

  private groupAresByDimension(respuestas: Record<string, number | null>): Record<string, [string, number][]> {
    const grouped: Record<string, [string, number][]> = {};
    
    Object.entries(respuestas).forEach(([key, value]) => {
      if (value !== null) {
        const item = ARES_ITEMS.find((i) => i.id === key);
        if (item) {
          if (!grouped[item.dimension]) {
            grouped[item.dimension] = [];
          }
          grouped[item.dimension].push([key, value]);
        }
      }
    });
    
    return grouped;
  }

  private getDimensionName(dimension: string): string {
    const dimensionNames: Record<string, string> = {
      'adopcion': 'Adopción y Escalamiento',
      'riesgos': 'Gestión de Riesgos',
      'etica': 'Ética y Responsabilidad',
      'seguridad': 'Seguridad y Privacidad',
      'capacidad': 'Capacidades de Desarrollo',
      'datos': 'Gobierno de Datos',
      'gobernanza': 'Gobernanza ARES',
      'valor': 'Métricas de Valor',
      'operacion': 'Operación y Monitoreo',
      'talento': 'Gestión del Talento',
      'tecnologia': 'Arquitectura Tecnológica',
      'integracion': 'Integración de Sistemas',
      'cumplimiento': 'Cumplimiento Normativo',
      'transparencia': 'Transparencia y Explicabilidad',
      'sostenibilidad': 'Sostenibilidad'
    };
    return dimensionNames[dimension] || dimension;
  }

  private getNivelScore(nivel: string): number {
    const nivelMap: Record<string, number> = {
      'incipiente': 20,
      'basico': 40,
      'intermedio': 60,
      'avanzado': 80,
      'lider': 100
    };
    return nivelMap[nivel] || 0;
  }

  private getMaturityLevel(score: number): string {
    if (score >= 4) return 'Líder';
    if (score >= 3) return 'Avanzado';
    if (score >= 2) return 'Intermedio';
    if (score >= 1) return 'Básico';
    return 'Incipiente';
  }

  private getPositionDescription(score: number): string {
    if (score >= 4) return 'excelente';
    if (score >= 3) return 'sólida';
    if (score >= 2) return 'prometedora';
    if (score >= 1) return 'inicial';
    return 'incipiente';
  }

  private getTopStrengths(aresRespuestas: Record<string, number | null>, competenciasNiveles: Record<string, string | null>): string {
    const aresScores = Object.entries(aresRespuestas)
      .filter(([_, value]) => value !== null && value >= 4)
      .map(([key, value]) => {
        const item = ARES_ITEMS.find((i) => i.id === key);
        return `- **${item?.labelKey || key}** (${value}/5)`;
      });

    const competenciaScores = Object.entries(competenciasNiveles)
      .filter(([_, value]) => value && ['avanzado', 'lider'].includes(value))
      .map(([key, value]) => {
        const item = COMPETENCIAS.find((c) => c.id === key);
        return `- **${item?.nameKey || key}** (${value})`;
      });

    const strengths = [...aresScores, ...competenciaScores].slice(0, 3);
    return strengths.length > 0 ? strengths.join('\n') : '- Áreas de oportunidad identificadas para desarrollo';
  }

  private getTopOpportunities(aresRespuestas: Record<string, number | null>, competenciasNiveles: Record<string, string | null>): string {
    const aresScores = Object.entries(aresRespuestas)
      .filter(([_, value]) => value !== null && value <= 2)
      .map(([key, value]) => {
        const item = ARES_ITEMS.find((i) => i.id === key);
        return `- **${item?.labelKey || key}** (${value}/5)`;
      });

    const competenciaScores = Object.entries(competenciasNiveles)
      .filter(([_, value]) => value && ['incipiente', 'basico'].includes(value))
      .map(([key, value]) => {
        const item = COMPETENCIAS.find((c) => c.id === key);
        return `- **${item?.nameKey || key}** (${value})`;
      });

    const opportunities = [...aresScores, ...competenciaScores].slice(0, 3);
    return opportunities.length > 0 ? opportunities.join('\n') : '- Continuar fortaleciendo las áreas ya identificadas';
  }

  private getIndustryRecommendations(industria: string): string {
    const recommendations: Record<string, string> = {
      'Biotecnología': 'En biotecnología, enfócate en la ética de IA para investigación médica, cumplimiento regulatorio y análisis de datos genómicos.',
      'Tecnología': 'Para empresas de tecnología, prioriza la escalabilidad, la innovación continua y el desarrollo de productos basados en IA.',
      'Finanzas': 'En el sector financiero, es crucial la seguridad, el cumplimiento normativo y la detección de fraudes con IA.',
      'Salud': 'En salud, enfócate en la privacidad de datos, la precisión diagnóstica y el cumplimiento de regulaciones médicas.',
      'Educación': 'En educación, prioriza la personalización del aprendizaje, la accesibilidad y la evaluación ética de estudiantes.',
      'Manufactura': 'En manufactura, enfócate en la automatización inteligente, la predicción de mantenimiento y la optimización de procesos.'
    };
    
    return recommendations[industria] || 'Considera las regulaciones específicas de tu industria y las mejores prácticas del sector para la implementación de IA.';
  }

  // 🔍 MÉTODOS DE LOGGING
  private logInfo(message: string, data?: any): void {
    console.log(`${this.logPrefix} ℹ️ ${message}`, data || '');
  }

  private logError(message: string, data?: any): void {
    console.error(`${this.logPrefix} ❌ ${message}`, data || '');
  }

  private logWarning(message: string, data?: any): void {
    console.warn(`${this.logPrefix} ⚠️ ${message}`, data || '');
  }

  private logSuccess(message: string, data?: any): void {
    console.log(`${this.logPrefix} ✅ ${message}`, data || '');
  }

  // 🔍 MÉTODO PARA DIAGNÓSTICO DEL SERVICIO
  public diagnoseService(): void {
    this.logInfo('=== DIAGNÓSTICO DEL SERVICIO GENERATIVE AI ===');
    this.logInfo('Configuración actual:', {
      apiUrl: this.apiUrl,
      logPrefix: this.logPrefix,
      requestId: this.requestId
    });
    
    // Verificar conectividad básica
    this.testConnectivity();
  }

  private async testConnectivity(): Promise<void> {
    this.logInfo('Probando conectividad básica...');
    
    try {
      const testResponse = await fetch(this.apiUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      this.logSuccess('Conectividad básica verificada', {
        url: this.apiUrl,
        status: 'HEAD request enviada'
      });
    } catch (error) {
      this.logError('Problema de conectividad detectado', {
        error: error,
        url: this.apiUrl
      });
    }
  }
}
