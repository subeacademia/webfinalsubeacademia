import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report, ReportData, StrategicInitiative, ExecutiveSummary, AiMaturity, CompetencyAnalysis, StrategicInsight } from '../../features/diagnostico/data/report.model';
import { competencias } from '../../features/diagnostico/data/competencias';
import { aresQuestions } from '../../features/diagnostico/data/ares-items';

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

  async generateReport(data: DiagnosticData, contextoAdicional: any): Promise<Report | null> {
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
        // La respuesta de la IA a veces viene con texto extra y markdown.
        // Esta expresión regular extrae el primer bloque JSON que encuentra.
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch || !jsonMatch[0]) {
          console.error("Respuesta de IA recibida:", responseText);
          throw new Error("La respuesta de la IA no contenía un objeto JSON válido.");
        }
        
        const jsonString = jsonMatch[0];
        const report: Report = JSON.parse(jsonString);

        // VALIDACIÓN DE ESTRUCTURA: Verifica que los campos clave existan.
        if (!report.titulo || !report.resumen || !report.planDeAccion) {
            console.error("JSON parseado pero con estructura incorrecta:", report);
            throw new Error("El JSON de la IA no tiene la estructura de Report requerida.");
        }

        console.log('Reporte parseado con éxito:', report);
        return report;
      } catch (parseError) {
        console.error('Error fatal al parsear JSON:', parseError, 'Texto recibido:', responseText);
        return null; // Devuelve null explícitamente en caso de CUALQUIER error de parseo.
      }
    } catch (error) {
      console.error('Error en la llamada a la API de Bessel:', error);
      throw error;
    }
  }

  async generarSugerenciasDeObjetivos(rol: string, industria: string): Promise<string[] | null> {
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
        // La respuesta de la IA a veces viene con texto extra y markdown.
        // Esta expresión regular extrae el primer bloque JSON que encuentra.
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch || !jsonMatch[0]) {
          console.error("Respuesta de IA recibida:", responseText);
          throw new Error("La respuesta de la IA no contenía un array JSON válido.");
        }
        
        const jsonString = jsonMatch[0];
        const sugerencias: string[] = JSON.parse(jsonString);

        // VALIDACIÓN DE ESTRUCTURA: Verifica que sea un array válido.
        if (!Array.isArray(sugerencias) || sugerencias.length === 0) {
            console.error("JSON parseado pero con estructura incorrecta:", sugerencias);
            throw new Error("El JSON de la IA no es un array válido de sugerencias.");
        }

        console.log('Sugerencias parseadas con éxito:', sugerencias);
        return sugerencias;
      } catch (parseError) {
        console.error('Error fatal al parsear JSON de sugerencias:', parseError, 'Texto recibido:', responseText);
        return []; // Devuelve array vacío en caso de error
      }
    } catch (error) {
      console.error('Error en la llamada a la API para generar sugerencias:', error);
      throw error;
    }
  }

  /**
   * NUEVO MÉTODO: Genera un reporte estratégico de alto nivel usando el framework ARES-AI
   */
  async generateStrategicReport(data: DiagnosticData, contextoAdicional: any): Promise<ReportData> {
    console.log('🚀 Iniciando generación de reporte estratégico con datos:', data);
    console.log('📚 Contexto adicional (cursos):', contextoAdicional);

    // Construir el contexto de la empresa
    const companyContext = {
      industry: data.profile?.industry || 'No especificada',
      size: data.profile?.companySize || 'No especificada',
      mainObjective: data.profile?.mainObjective || 'No especificado'
    };

    // Calcular puntuaciones ARES y de competencias
    const aresScores = this.calculateAresScores(data.aresAnswers);
    const competencyScores = this.calculateCompetencyScores(data.compAnswers);

    const systemPrompt = this.buildStrategicSystemPrompt();
    const userPrompt = this.buildStrategicUserPrompt(aresScores, competencyScores, companyContext, contextoAdicional);
    
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    console.log('📤 Enviando payload estratégico a la API:', JSON.stringify(payload));

    try {
      const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
      console.log('📥 Respuesta cruda de la API:', response);

      let responseText = '';
      if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content;
      } else {
        throw new Error('La respuesta de la API no tiene el formato esperado.');
      }
      
      console.log('📝 Texto extraído:', responseText);

      try {
        const cleanedText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const strategicData = JSON.parse(cleanedText);

        // Construir el ReportData completo
        const reportData: ReportData = {
          id: this.generateId(),
          timestamp: new Date(),
          leadInfo: {
            name: 'Usuario',
            email: 'usuario@empresa.com',
            companyName: 'Empresa'
          },
          contexto: {},
          aresScores,
          competencyScores: this.formatCompetencyScores(competencyScores),
          companyContext,
          aiMaturity: {
            level: 'Establecido',
            score: 50,
            summary: 'Nivel de madurez intermedio'
          },
          executiveSummary: strategicData.executiveSummary,
          strengthsAnalysis: [],
          weaknessesAnalysis: [],
          insights: [],
          actionPlan: strategicData.actionPlan,
          generatedAt: new Date(),
          version: '2.0.0'
        };

        return reportData;
      } catch (parseError) {
        console.error('❌ Error fatal al parsear JSON estratégico:', parseError, 'Texto recibido:', responseText);
        throw new Error('La respuesta de la IA no es un objeto JSON válido para el reporte estratégico.');
      }
    } catch (error) {
      console.error('❌ Error en la llamada a la API estratégica:', error);
      throw error;
    }
  }

  /**
   * Construye el prompt maestro del sistema para análisis estratégico
   */
  private buildStrategicSystemPrompt(): string {
    return `
**System Prompt:**
Eres 'ARES-AI', un consultor estratégico de IA de Sube Academia. Tu conocimiento se basa en el 'ARES-AI Framework' (Agilidad, Responsabilidad, Ética, Sostenibilidad) y el modelo de 13 competencias de Sube Academia. Tu tarea es analizar los datos de diagnóstico de una empresa y generar un reporte ejecutivo en formato JSON ESTRUCTO, sin texto introductorio ni comentarios.

**Marco de Conocimiento:**

**ARES-AI Framework:**
- **Agilidad**: Cultura de colaboración, procesos ágiles, tecnología flexible
- **Responsabilidad**: Gobernanza, transparencia, equidad, supervisión humana
- **Ética**: Cumplimiento normativo, privacidad, seguridad, rendición de cuentas
- **Sostenibilidad**: Impacto ambiental, social y económico

**13 Competencias Clave:**
1. Pensamiento Crítico - Análisis objetivo y toma de decisiones lógicas
2. Resolución de Problemas - Abordar desafíos complejos con soluciones efectivas
3. Alfabetización de Datos - Interpretar, analizar y comunicar información basada en datos
4. Comunicación Efectiva - Transmitir ideas de manera clara y persuasiva
5. Colaboración y Trabajo en Equipo - Trabajar efectivamente en equipos diversos
6. Creatividad e Innovación - Generar ideas originales y soluciones innovadoras
7. Diseño Tecnológico - Crear soluciones tecnológicas centradas en el usuario
8. Automatización y Agentes IA - Implementar y gestionar sistemas automatizados
9. Adaptabilidad y Flexibilidad - Ajustarse a cambios y nuevas situaciones
10. Ética y Responsabilidad - Actuar con integridad y responsabilidad social
11. Sostenibilidad - Considerar el impacto ambiental y social a largo plazo
12. Aprendizaje Continuo - Desarrollar habilidades constantemente
13. Liderazgo en IA - Guiar equipos en la transformación digital

**Tu Tarea (Output Generation):**
Analiza los datos de entrada, identifica las 3 competencias con el puntaje más bajo como los principales 'pain points'. Para cada una, crea una 'Iniciativa Estratégica' que resuelva el problema. Conecta cada iniciativa con una dimensión del framework ARES. Genera un resumen ejecutivo que identifique el nivel de madurez y el principal desafío. Proporciona la salida EXCLUSIVAMENTE en el siguiente formato JSON:

{
  "executiveSummary": {
    "currentMaturity": "...",
    "mainChallenge": "...",
    "strategicRecommendation": "..."
  },
  "actionPlan": [
    {
      "painPoint": "...",
      "businessImpact": "...",
      "title": "...",
      "description": "...",
      "steps": [ { "title": "...", "description": "...", "expectedOutcome": "..." }, ... ],
      "kpis": [ { "name": "...", "target": "..." }, ... ],
      "timeline": "...",
      "effort": "...",
      "primaryCompetency": "ID de la competencia",
      "aresDimension": "...",
      "recommendedService": { "name": "Nombre del Curso/Asesoría Relevante", "type": "Curso" }
    },
    ... (2 iniciativas más)
  ]
}

**INSTRUCCIONES CRÍTICAS:**
- NO INCLUYAS NINGÚN TEXTO ANTES O DESPUÉS DEL OBJETO JSON
- La respuesta debe empezar con '{' y terminar con '}'
- Usa un tono ejecutivo y estratégico como McKinsey o BCG
- Conecta cada iniciativa con el framework ARES-AI
- Recomienda servicios específicos del catálogo proporcionado
- Genera KPIs medibles y timelines realistas
`;
  }

  /**
   * Construye el prompt del usuario con todos los datos necesarios
   */
  private buildStrategicUserPrompt(
    aresScores: Record<string, number>,
    competencyScores: Record<string, number>,
    companyContext: any,
    contextoAdicional: any
  ): string {
    return `
**User Data (Input):**

**Contexto de la empresa:**
${JSON.stringify(companyContext, null, 2)}

**Puntuaciones ARES:**
${JSON.stringify(aresScores, null, 2)}

**Puntuaciones de Competencias:**
${JSON.stringify(competencyScores, null, 2)}

**Competencias Clave (documento de referencia):**
${JSON.stringify(competencias.map(c => ({
  id: c.id,
  name: c.name,
  cluster: c.cluster,
  description: c.description
})), null, 2)}

**Framework ARES (documento de referencia):**
{
  "Agilidad": {
    "Cultura y Colaboración": "Integración continua entre equipos de negocio, tecnología y datos",
    "Procesos y Planificación": "Metodologías ágiles y priorización por valor de negocio",
    "Tecnología e Infraestructura": "Infraestructura flexible y herramientas de automatización"
  },
  "Responsabilidad": {
    "Gobernanza y Cumplimiento": "Comités de ética y evaluaciones de cumplimiento normativo",
    "Transparencia y Explicabilidad": "Decisiones comprensibles y documentación clara",
    "Equidad, Privacidad y Seguridad": "Análisis de sesgos y medidas de ciberseguridad",
    "Supervisión Humana": "Responsables humanos con capacidad de intervención"
  },
  "Ética": {
    "Cumplimiento Normativo": "Adherencia a regulaciones como AI Act",
    "Privacidad por Diseño": "Evaluaciones de impacto y protección de datos",
    "Rendición de Cuentas": "Canales de apelación y mecanismos de revisión"
  },
  "Sostenibilidad": {
    "Ambiental": "Eficiencia computacional y reducción de huella de carbono",
    "Social y Económica": "Impacto en empleados, sociedad y alineación con ODS"
  }
}

**Catálogo de Servicios Disponibles:**
${JSON.stringify(contextoAdicional, null, 2)}
`;
  }

  /**
   * Calcula las puntuaciones ARES basadas en las respuestas reales
   */
  private calculateAresScores(aresAnswers: any): Record<string, number> {
    const scores: Record<string, number> = {
      'Agilidad': 0,
      'Responsabilidad': 0,
      'Ética': 0,
      'Sostenibilidad': 0
    };

    if (!aresAnswers || Object.keys(aresAnswers).length === 0) {
      console.warn('⚠️ No hay respuestas ARES disponibles');
      Object.keys(scores).forEach(dimension => {
        scores[dimension] = 0; // Sin respuestas = 0 puntos
      });
      return scores;
    }


    // Mapeo de pilares ARES a las dimensiones del framework
    const pillarMapping: Record<string, string> = {
      'Agilidad': 'Agilidad',
      'Responsabilidad y Ética': 'Responsabilidad',
      'Sostenibilidad': 'Sostenibilidad'
    };

    // Calcular puntuaciones reales basadas en las respuestas de preguntas individuales
    Object.keys(scores).forEach(dimension => {
      const questionScores: number[] = [];
      
      // Buscar todas las preguntas que pertenecen a esta dimensión
      Object.keys(aresAnswers).forEach(questionId => {
        const answer = aresAnswers[questionId];
        let score = 0;
        
        // Extraer el valor numérico de la respuesta
        if (typeof answer === 'number' && answer >= 1 && answer <= 5) {
          score = answer;
        } else if (typeof answer === 'object' && answer !== null && 'value' in answer) {
          const value = answer.value;
          if (typeof value === 'number' && value >= 1 && value <= 5) {
            score = value;
          }
        }
        
        if (score >= 1) { // Incluir valor 1 (Inexistente) como respuesta válida
          // Determinar a qué dimensión pertenece esta pregunta
          // Buscar en las preguntas ARES para encontrar el pilar
          const question = aresQuestions.find(q => q.id === questionId);
          if (question) {
            const mappedDimension = pillarMapping[question.pillar];
            if (mappedDimension === dimension) {
              questionScores.push(score);
            }
          }
        }
      });
      
      // Calcular promedio de la dimensión
      if (questionScores.length > 0) {
        const average = questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length;
        scores[dimension] = Math.round(average * 20); // Convertir de 1-5 a 0-100
      } else {
        scores[dimension] = 0; // Sin respuestas válidas = 0 puntos
      }
    });

    return scores;
  }

  /**
   * Calcula las puntuaciones de competencias basadas en las respuestas reales
   * Implementa un sistema de ponderación inteligente que considera:
   * 1. Preguntas críticas tienen mayor peso
   * 2. Consistencia entre preguntas (penaliza grandes diferencias)
   * 3. Ponderación por importancia de la competencia
   */
  private calculateCompetencyScores(compAnswers: any): Record<string, number> {
    const scores: Record<string, number> = {};

    if (!compAnswers || Object.keys(compAnswers).length === 0) {
      console.warn('⚠️ No hay respuestas de competencias disponibles');
      competencias.forEach(comp => {
        scores[comp.id] = 0; // Sin respuestas = 0 puntos
      });
      return scores;
    }


    // Calcular puntuaciones reales basadas en las respuestas de las preguntas individuales
    competencias.forEach(comp => {
      const questionScores: { score: number; isCritical: boolean; weight: number }[] = [];
      
      // Recopilar puntuaciones de todas las preguntas de esta competencia
      comp.questions.forEach(question => {
        const answer = compAnswers[question.id];
        let score = 0;
        
        if (typeof answer === 'number' && answer >= 1 && answer <= 5) {
          score = answer;
        } else if (typeof answer === 'object' && answer !== null && 'value' in answer) {
          const value = answer.value;
          if (typeof value === 'number' && value >= 1 && value <= 5) {
            score = value;
          }
        } else if (typeof answer === 'object' && answer !== null && 'score' in answer) {
          const answerScore = answer.score;
          if (typeof answerScore === 'number' && answerScore >= 1 && answerScore <= 5) {
            score = answerScore;
          }
        }
        
        if (score >= 1) { // Incluir valor 1 (Inexistente) como respuesta válida
          // Asignar peso: preguntas críticas tienen peso 2, normales peso 1
          const weight = question.isCritical ? 2 : 1;
          questionScores.push({ 
            score, 
            isCritical: question.isCritical || false, 
            weight 
          });
        }
      });
      
      // Calcular puntuación ponderada de la competencia
      if (questionScores.length > 0) {
        const totalWeight = questionScores.reduce((sum, q) => sum + q.weight, 0);
        const weightedSum = questionScores.reduce((sum, q) => sum + (q.score * q.weight), 0);
        const weightedAverage = weightedSum / totalWeight;
        
        // Aplicar factor de consistencia: penalizar grandes diferencias entre preguntas
        const consistencyFactor = this.calculateConsistencyFactor(questionScores);
        
        // Calcular puntuación final con factor de consistencia
        const finalScore = Math.round(weightedAverage * 20 * consistencyFactor); // Convertir de 1-5 a 0-100
        scores[comp.id] = Math.min(100, Math.max(0, finalScore)); // Asegurar rango 0-100
        
      } else {
        scores[comp.id] = 0; // Sin respuestas válidas = 0 puntos
      }
    });

    return scores;
  }

  /**
   * Calcula el factor de consistencia para penalizar grandes diferencias entre preguntas
   * Si hay mucha diferencia entre preguntas (ej: 1 y 5), reduce el puntaje final
   */
  private calculateConsistencyFactor(questionScores: { score: number; isCritical: boolean; weight: number }[]): number {
    if (questionScores.length <= 1) return 1.0;
    
    const scores = questionScores.map(q => q.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min;
    
    // Si la diferencia es muy grande (4 puntos), aplicar penalización
    if (range >= 4) {
      return 0.7; // Penalización del 30%
    } else if (range >= 3) {
      return 0.85; // Penalización del 15%
    } else if (range >= 2) {
      return 0.95; // Penalización del 5%
    }
    
    return 1.0; // Sin penalización
  }

  /**
   * NUEVO MÉTODO: Genera un reporte de análisis holístico con consultoría estratégica
   */
  async generateHolisticReport(data: DiagnosticData, contextoAdicional: any): Promise<ReportData> {
    console.log('🧠 Iniciando generación de reporte holístico con datos:', data);
    console.log('📚 Contexto adicional (cursos):', contextoAdicional);

    // Construir el contexto de la empresa
    const companyContext = {
      industry: data.profile?.industry || 'No especificada',
      size: data.profile?.companySize || 'No especificada',
      mainObjective: data.profile?.mainObjective || 'No especificado'
    };

    // Calcular puntuaciones ARES y de competencias
    const aresScores = this.calculateAresScores(data.aresAnswers);
    const competencyScores = this.calculateCompetencyScores(data.compAnswers);

    const systemPrompt = this.buildHolisticSystemPrompt();
    const userPrompt = this.buildHolisticUserPrompt(aresScores, competencyScores, companyContext, contextoAdicional);
    
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    console.log('📤 Enviando payload holístico a la API:', JSON.stringify(payload));

    try {
      const response = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
      console.log('📥 Respuesta cruda de la API:', response);

      let responseText = '';
      if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content;
      } else {
        throw new Error('La respuesta de la API no tiene el formato esperado.');
      }
      
      console.log('📝 Texto extraído:', responseText);

      try {
        const cleanedText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        const holisticData = JSON.parse(cleanedText);

        // Construir el ReportData completo
        const reportData: ReportData = {
          id: this.generateId(),
          timestamp: new Date(),
          leadInfo: {
            name: data.profile?.name || 'Usuario',
            email: data.profile?.email || 'usuario@empresa.com',
            companyName: data.profile?.companyName
          },
          contexto: data,
          aresScores,
          competencyScores: this.formatCompetencyScores(competencyScores),
          companyContext,
          aiMaturity: holisticData.aiMaturity,
          executiveSummary: holisticData.executiveSummary,
          strengthsAnalysis: holisticData.strengthsAnalysis,
          weaknessesAnalysis: holisticData.weaknessesAnalysis,
          insights: holisticData.insights,
          actionPlan: holisticData.actionPlan || [],
          generatedAt: new Date(),
          version: '2.0.0'
        };

        return reportData;
      } catch (parseError) {
        console.error('❌ Error fatal al parsear JSON holístico:', parseError, 'Texto recibido:', responseText);
        throw new Error('La respuesta de la IA no es un objeto JSON válido para el reporte holístico.');
      }
    } catch (error) {
      console.error('❌ Error en la llamada a la API holística:', error);
      throw error;
    }
  }

  /**
   * Construye el prompt maestro del sistema para análisis holístico
   */
  private buildHolisticSystemPrompt(): string {
    return `
**System Prompt:**
Eres 'ARES-AI', un consultor de estrategia de IA de clase mundial de Sube Academia. Tu análisis se basa en el 'ARES-AI Framework' y el modelo de 13 competencias de Sube Academia. Tu tarea es realizar un diagnóstico de madurez en IA profundo y personalizado para una empresa, basándote en sus respuestas. Debes actuar como un analista experto, conectando los puntos entre diferentes respuestas para extraer insights únicos. Tu salida debe ser exclusivamente un objeto JSON.

**Marco de Conocimiento:**

**ARES-AI Framework:**
- **Agilidad**: Cultura de colaboración, procesos ágiles, tecnología flexible
- **Responsabilidad**: Gobernanza, transparencia, equidad, supervisión humana
- **Ética**: Cumplimiento normativo, privacidad, seguridad, rendición de cuentas
- **Sostenibilidad**: Impacto ambiental, social y económico

**13 Competencias Clave:**
1. Pensamiento Crítico - Análisis objetivo y toma de decisiones lógicas
2. Resolución de Problemas - Abordar desafíos complejos con soluciones efectivas
3. Alfabetización de Datos - Interpretar, analizar y comunicar información basada en datos
4. Comunicación Efectiva - Transmitir ideas de manera clara y persuasiva
5. Colaboración y Trabajo en Equipo - Trabajar efectivamente en equipos diversos
6. Creatividad e Innovación - Generar ideas originales y soluciones innovadoras
7. Diseño Tecnológico - Crear soluciones tecnológicas centradas en el usuario
8. Automatización y Agentes IA - Implementar y gestionar sistemas automatizados
9. Adaptabilidad y Flexibilidad - Ajustarse a cambios y nuevas situaciones
10. Ética y Responsabilidad - Actuar con integridad y responsabilidad social
11. Sostenibilidad - Considerar el impacto ambiental y social a largo plazo
12. Aprendizaje Continuo - Desarrollar habilidades constantemente
13. Liderazgo en IA - Guiar equipos en la transformación digital

**Tu Tarea (Proceso de Pensamiento a seguir):**
1. **Evaluar Madurez:** Basado en el promedio y distribución de TODOS los puntajes (ARES y competencias), y el contexto de la empresa, determina un nivel de madurez en IA ('Incipiente', 'En Desarrollo', 'Establecido', 'Estratégico', 'Transformador'). Calcula un puntaje numérico de 0 a 100 para este nivel. Escribe un resumen conciso que justifique tu elección.
2. **Analizar Fortalezas:** Identifica las 3 competencias con el puntaje más alto. Para cada una, escribe un \`analysis\` personalizado que explique cómo esta fortaleza puede ser apalancada para alcanzar su \`objetivo\` principal.
3. **Analizar Debilidades:** SIEMPRE identifica áreas de mejora (competencias o dimensiones ARES con puntaje < 100). Prioriza las competencias y dimensiones ARES con los puntajes más bajos. Para cada una, escribe un \`analysis\` que explique el riesgo que esta debilidad representa para su negocio y su \`objetivo\`. Sé directo y claro sobre el "dolor".
4. **Extraer Insights Estratégicos:** Basado en la combinación de fortalezas, debilidades y el contexto, genera 2 o 3 \`StrategicInsight\`. Por ejemplo, si tienen alta 'Innovación' pero baja 'Ética en IA', un insight de 'Riesgo Crítico' podría ser "Riesgo de desarrollar soluciones de IA no adoptadas por el mercado por falta de confianza". Si tienen alta 'Gestión de Datos' y están en 'Retail', una 'Oportunidad Oculta' podría ser "Oportunidad de liderar el mercado con personalización predictiva de la demanda".
5. **Generar Resumen Ejecutivo:** Escribe un párrafo conciso y potente para un CEO, resumiendo el nivel de madurez, el principal desafío y la recomendación estratégica más importante. NO repitas el objetivo principal del cliente (ya aparece en el contexto), enfócate en el análisis estratégico y el plan de acción.
6. **Generar Plan de Acción:** (Mantén la lógica que ya tienes para esto, pero asegúrate de que esté alineado con el análisis de debilidades).

**Output (Formato JSON estricto):**
Genera un único objeto JSON que se ajuste a la nueva interfaz \`ReportData\` que definimos. No incluyas ningún texto fuera de este objeto JSON.

{
  "aiMaturity": {
    "level": "Incipiente|En Desarrollo|Establecido|Estratégico|Transformador",
    "score": 0-100,
    "summary": "Explicación del nivel de madurez asignado"
  },
  "executiveSummary": "Resumen ejecutivo para CEO",
  "strengthsAnalysis": [
    {
      "competencyId": "id_competencia",
      "competencyName": "Nombre Competencia",
      "score": 0-100,
      "analysis": "Análisis personalizado de la fortaleza"
    }
  ],
  "weaknessesAnalysis": [
    {
      "competencyId": "id_competencia", 
      "competencyName": "Nombre Competencia",
      "score": 0-100,
      "analysis": "Análisis del riesgo de esta debilidad"
    }
  ],
  "insights": [
    {
      "title": "Título del Insight",
      "description": "Descripción detallada",
      "type": "Fortaleza Clave|Riesgo Crítico|Oportunidad Oculta"
    }
  ],
  "actionPlan": [
    {
      "area": "Área de mejora",
      "acciones": [
        {
          "accion": "Acción específica",
          "descripcion": "Descripción detallada",
          "recursos": ["recurso1", "recurso2"]
        }
      ]
    }
  ]
}

**INSTRUCCIONES CRÍTICAS:**
- NO INCLUYAS NINGÚN TEXTO ANTES O DESPUÉS DEL OBJETO JSON
- La respuesta debe empezar con '{' y terminar con '}'
- Usa un tono ejecutivo y estratégico como McKinsey o BCG
- Conecta cada análisis con el contexto específico de la empresa
- Genera insights únicos basados en la combinación de datos
`;
  }

  /**
   * Construye el prompt del usuario con todos los datos necesarios para análisis holístico
   */
  private buildHolisticUserPrompt(
    aresScores: Record<string, number>,
    competencyScores: Record<string, number>,
    companyContext: any,
    contextoAdicional: any
  ): string {
    return `
**User Data (Input):**

**Contexto de la empresa:**
${JSON.stringify(companyContext, null, 2)}

**Puntuaciones ARES:**
${JSON.stringify(aresScores, null, 2)}

**Puntuaciones de Competencias:**
${JSON.stringify(competencyScores, null, 2)}

**Competencias Clave (documento de referencia):**
${JSON.stringify(competencias.map(c => ({
  id: c.id,
  name: c.name,
  cluster: c.cluster,
  description: c.description
})), null, 2)}

**Catálogo de Servicios Disponibles:**
${JSON.stringify(contextoAdicional, null, 2)}
`;
  }

  /**
   * Formatea las puntuaciones de competencias para el modelo
   */
  private formatCompetencyScores(scores: Record<string, number>): { id: string; name: string; score: number }[] {
    return competencias.map(comp => ({
      id: comp.id,
      name: comp.name,
      score: scores[comp.id] || 0
    }));
  }

  /**
   * Genera un ID único para el reporte
   */
  private generateId(): string {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Ejecuta una operación con reintentos y backoff exponencial
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt + 1}/${maxRetries + 1} de la operación...`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Intento ${attempt + 1} falló:`, error);
        
        // Si es el último intento, no esperar
        if (attempt === maxRetries) {
          break;
        }
        
        // Calcular delay con backoff exponencial
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * MÉTODO CRÍTICO: Genera un reporte comprehensivo con análisis de consultor
   */
  async generateComprehensiveReport(data: any): Promise<ReportData | null> {
    console.log('🧠 Iniciando generación de reporte comprehensivo con datos:', data);

    // Construir el contexto de la empresa
    const companyContext = {
      industry: data.contexto?.industria || 'No especificada',
      size: data.contexto?.equipo ? `${data.contexto.equipo} personas` : 'No especificada',
      mainObjective: data.objetivo?.objetivo?.[0] || 'No especificado' // Solo el primer objetivo para evitar duplicación
    };

    // Calcular puntuaciones ARES y de competencias
    const aresScores = this.calculateAresScores(data.ares);
    const competencyScores = this.calculateCompetencyScores(data.competencias);

    // --- CONSTRUCCIÓN DEL SUPER-PROMPT MEJORADO ---
    const prompt = `
    **ROL Y OBJETIVO:**
    Eres 'ARES-AI', un consultor de estrategia de IA de élite de Sube Academia. Tu misión es analizar en profundidad los datos completos de un diagnóstico de una empresa y generar un reporte estratégico que sea denso, perspicaz y 100% personalizado. El cliente debe sentir que este análisis fue hecho por un humano experto que entiende su negocio. Tu salida DEBE ser un único objeto JSON válido, sin ningún texto o explicación adicional.

    **DATOS COMPLETOS DEL CLIENTE PARA TU ANÁLISIS:**
    A continuación tienes acceso a TODOS los datos detallados que el usuario proporcionó en su diagnóstico. Analiza cada respuesta individual, encuentra patrones, conexiones y matices que solo un experto humano podría detectar:

    **Datos Completos del Diagnóstico:**
    \`\`\`json
    ${JSON.stringify(data, null, 2)}
    \`\`\`

    **Contexto de Negocio Calculado:**
    ${JSON.stringify(companyContext, null, 2)}

    **Puntuaciones ARES-AI Calculadas:**
    ${JSON.stringify(aresScores, null, 2)}

    **Puntuaciones de Competencias Calculadas:**
    ${JSON.stringify(competencyScores, null, 2)}

    **INSTRUCCIONES PRECISAS PARA TU ANÁLISIS (DEBES SEGUIRLAS AL PIE DE LA LETRA):**

    **ANÁLISIS PROFUNDO REQUERIDO:**
    - Examina CADA respuesta individual del usuario en los datos completos
    - Identifica patrones, inconsistencias y oportunidades ocultas
    - Conecta respuestas aparentemente no relacionadas para extraer insights únicos
    - Considera el contexto específico de su industria, tamaño de empresa y objetivos
    - Sé específico y personalizado en cada análisis

    1.  **Análisis Completo de Madurez de IA (aiMaturity):**
        - Analiza los datos completos para calcular un puntaje de madurez (\`score\`) de 0 a 100
        - Considera no solo las puntuaciones numéricas, sino también la coherencia de las respuestas, la profundidad del autoconocimiento, y la alineación entre objetivos y capacidades
        - Asigna un \`level\` basado en estos rangos EXACTOS:
          * Incipiente: 0-20 puntos
          * En Desarrollo: 21-40 puntos  
          * Establecido: 41-60 puntos
          * Estratégico: 61-80 puntos
          * Transformador: 81-100 puntos
        - Escribe un \`summary\` detallado (mínimo 6-8 oraciones) que incluya:
          * Justificación de la calificación basada en datos específicos del usuario
          * Análisis de las fases ARES en las que se encuentra la empresa (Preparación, Diseño, Desarrollo, Monitoreo)
          * Evaluación de la madurez organizacional en IA (cultura, procesos, tecnología, gobernanza)
          * Identificación de las fortalezas y debilidades más críticas en la transformación digital
          * Recomendaciones específicas para avanzar al siguiente nivel de madurez

    2.  **Análisis de Fases ARES (aresPhaseAnalysis):**
        - Analiza las respuestas ARES para determinar en qué fase se encuentra la organización
        - Evalúa cada fase (Preparación, Diseño, Desarrollo, Monitoreo) con puntuación 0-100
        - Determina el estado de cada fase: "Completado", "En Progreso", o "Pendiente"
        - Identifica la fase general actual y la siguiente fase a alcanzar
        - Describe qué falta para avanzar a la siguiente fase
        - Basa el análisis en las respuestas específicas del usuario sobre gobernanza, procesos, tecnología y cultura

    3.  **Análisis de Madurez Organizacional (organizationalMaturity):**
        - Evalúa la cultura de IA (colaboración, experimentación, aceptación del cambio)
        - Analiza los procesos (metodologías ágiles, gestión de proyectos, gobernanza)
        - Revisa la tecnología (infraestructura, herramientas, automatización)
        - Examina la gobernanza (comités, cumplimiento, supervisión humana)
        - Cada dimensión debe tener puntuación 0-100 y descripción específica

    4.  **Análisis de Fortalezas (strengthsAnalysis):**
        - Identifica las 3 competencias con el puntaje más alto
        - Para cada fortaleza, analiza las respuestas específicas del usuario que la respaldan
        - Escribe un \`analysis\` detallado que explique CÓMO esta fortaleza específica puede ser utilizada para alcanzar su objetivo principal: "${companyContext.mainObjective}"
        - Incluye ejemplos concretos basados en sus respuestas y contexto empresarial
        - Conecta la fortaleza con oportunidades específicas en su industria

    3.  **Análisis de Debilidades (weaknessesAnalysis):**
        - SIEMPRE identifica áreas de mejora (competencias o dimensiones ARES con puntaje < 100)
        - Prioriza las competencias y dimensiones ARES con los puntajes más bajos
        - Analiza las respuestas específicas que revelan estas debilidades
        - Para cada debilidad, escribe un \`analysis\` que describa el "dolor" específico que esto causa en su contexto empresarial
        - Conecta la debilidad con riesgos de negocio tangibles y específicos de su industria
        - Incluye ejemplos concretos de cómo esta debilidad podría impactar sus objetivos
        - Si todas las competencias tienen puntajes altos, identifica oportunidades de optimización

    4.  **Resumen Ejecutivo (executiveSummary):**
        - Escribe un resumen ejecutivo detallado (mínimo 6-8 oraciones) para un CEO
        - Basa tu análisis en los datos específicos y respuestas del usuario
        - NO repitas el objetivo principal del cliente (ya aparece en "Contexto de tu Organización")
        - Enfócate en el valor estratégico y el plan de acción
        - Incluye:
          * El nivel de madurez actual y su significado estratégico específico para su empresa
          * Análisis de las fases ARES donde se encuentra la organización (Preparación, Diseño, Desarrollo, Monitoreo)
          * Las fortalezas clave identificadas y cómo apalancarlas en su contexto
          * La brecha más crítica que impide el progreso en la adopción de IA
          * Una recomendación estratégica concreta y accionable basada en sus datos
          * El potencial de crecimiento y ROI esperado específico para su situación
          * Menciona las áreas prioritarias del plan de acción sin duplicar información
          * Timeline realista para alcanzar el siguiente nivel de madurez
        - Debe ser directo, sin rodeos, y orientado a la toma de decisiones ejecutivas
        - NO repitas el objetivo principal del usuario, enfócate en el análisis estratégico

    5.  **Plan de Acción Personalizado (actionPlan):**
        - Genera un plan de acción DETALLADO y PERSONALIZADO basado en los datos específicos del usuario
        - Aborda DIRECTAMENTE las debilidades identificadas y se alinea con su objetivo principal: "${companyContext.mainObjective}"
        - Cada área debe tener un nombre específico basado en las debilidades reales identificadas en sus respuestas
        - Cada acción debe ser CONCRETA, MEDIBLE y con TIMELINE específico
        - Incluye recursos específicos, KPIs medibles y resultados esperados
        - Conecta cada acción con el objetivo principal del usuario y su contexto empresarial
        - Usa fechas reales basadas en la fecha actual
        - Genera 3-5 áreas de mejora máximo, cada una con 2-3 acciones específicas

    **FORMATO DE SALIDA OBLIGATORIO (JSON):**
    {
      "aiMaturity": { "level": "...", "score": ..., "summary": "..." },
      "aresPhaseAnalysis": {
        "preparacion": { "score": ..., "status": "Completado|En Progreso|Pendiente", "description": "..." },
        "diseno": { "score": ..., "status": "Completado|En Progreso|Pendiente", "description": "..." },
        "desarrollo": { "score": ..., "status": "Completado|En Progreso|Pendiente", "description": "..." },
        "monitoreo": { "score": ..., "status": "Completado|En Progreso|Pendiente", "description": "..." },
        "overallPhase": "Preparación|Diseño|Desarrollo|Monitoreo",
        "nextPhase": "Preparación|Diseño|Desarrollo|Monitoreo",
        "phaseGap": "Descripción de lo que falta para avanzar a la siguiente fase"
      },
      "organizationalMaturity": {
        "culture": { "score": ..., "description": "..." },
        "processes": { "score": ..., "description": "..." },
        "technology": { "score": ..., "description": "..." },
        "governance": { "score": ..., "description": "..." }
      },
      "executiveSummary": "...",
      "strengthsAnalysis": [ { "competencyId": "...", "competencyName": "...", "score": ..., "analysis": "..." }, ... ],
      "weaknessesAnalysis": [ { "competencyId": "...", "competencyName": "...", "score": ..., "analysis": "..." }, ... ],
      "actionPlan": [
        {
          "area": "Nombre específico del área de mejora",
          "priority": "Alta|Media|Baja",
          "timeline": "X meses",
          "description": "Descripción detallada del área y su importancia",
          "actions": [
            {
              "accion": "Acción específica y concreta",
              "descripcion": "Descripción detallada de la acción",
              "timeline": "X semanas/meses",
              "recursos": ["recurso1", "recurso2", "recurso3"],
              "kpis": ["KPI1", "KPI2"],
              "expectedOutcome": "Resultado esperado específico",
              "competencyTarget": "ID de la competencia que mejora",
              "aresDimension": "Dimensión ARES relacionada"
            }
          ]
        }
      ]
    }
  `;

    const payload = {
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Analiza estos datos y genera el reporte estratégico.' }
      ]
    };

    console.log('📤 Enviando payload comprehensivo a la API:', JSON.stringify(payload));

    try {
      // Intentar con timeout reducido y reintentos
      let lastError: any;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Intento ${attempt}/${maxRetries} de llamada a la API...`);
          
          const timeoutDuration = attempt === 1 ? 60000 : 30000; // 60s primer intento, 30s segundo
          
          const response = await firstValueFrom(
            this.http.post<any>(this.apiUrl, payload).pipe(
              timeout(timeoutDuration),
              catchError((error: HttpErrorResponse) => {
                console.error(`❌ Error HTTP en intento ${attempt}:`, error);
                throw error;
              })
            )
          );
          
          // Si llegamos aquí, la llamada fue exitosa
          console.log(`✅ Llamada exitosa en intento ${attempt}`);
          return this.processApiResponse(response, data, companyContext, aresScores, competencyScores);
          
        } catch (error: any) {
          lastError = error;
          console.warn(`⚠️ Intento ${attempt} falló:`, error.message);
          
          if (attempt === maxRetries) {
            // Último intento falló, generar fallback
            console.log('🔄 Todos los intentos fallaron, generando reporte de fallback...');
            break;
          }
          
          // Esperar antes del siguiente intento (solo si no es el último)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron - generar fallback directamente
      console.log('🔄 Todos los intentos fallaron, generando reporte de fallback...');
      console.log('📊 Datos para fallback:', { data, companyContext, aresScores, competencyScores });
      
      try {
        const fallbackReport = this.generateFallbackReport(data, companyContext, aresScores, competencyScores);
        console.log('✅ Reporte de fallback generado exitosamente:', fallbackReport ? 'Sí' : 'No');
        console.log('📋 ID del reporte:', fallbackReport?.id);
        return fallbackReport;
      } catch (fallbackError) {
        console.error('❌ Error generando reporte de fallback:', fallbackError);
        console.log('🚨 Generando reporte de emergencia...');
        return this.generateEmergencyReport(data, companyContext, aresScores, competencyScores);
      }
    } catch (error) {
      console.error('❌ Error en la llamada a la API comprehensiva:', error);
      
      // Siempre generar reporte de fallback para cualquier error
      console.log('🔄 Generando reporte de fallback debido a error de API...');
      try {
        const fallbackReport = this.generateFallbackReport(data, companyContext, aresScores, competencyScores);
        console.log('✅ Reporte de fallback generado exitosamente');
        return fallbackReport;
      } catch (fallbackError) {
        console.error('❌ Error generando reporte de fallback:', fallbackError);
        // Generar reporte de emergencia como último recurso
        console.log('🚨 Generando reporte de emergencia...');
        return this.generateEmergencyReport(data, companyContext, aresScores, competencyScores);
      }
    }
  }

  /**
   * Procesa la respuesta exitosa de la API
   */
  private processApiResponse(
    response: any,
    data: any,
    companyContext: any,
    aresScores: Record<string, number>,
    competencyScores: Record<string, number>
  ): ReportData {
    console.log('📥 Respuesta cruda de la API:', response);

    let responseText = '';
    if (response?.choices?.[0]?.message?.content) {
      responseText = response.choices[0].message.content;
    } else {
      throw new Error('La respuesta de la API no tiene el formato esperado.');
    }
    
    console.log('📝 Texto extraído:', responseText);

    try {
      // La respuesta de la IA a veces viene con texto extra y markdown.
      // Esta expresión regular extrae el primer bloque JSON que encuentra.
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch || !jsonMatch[0]) {
        console.error("Respuesta de IA recibida:", responseText);
        throw new Error("La respuesta de la IA no contenía un objeto JSON válido.");
      }
      
      const jsonString = jsonMatch[0];
      const comprehensiveData = JSON.parse(jsonString);

      // VALIDACIÓN DE ESTRUCTURA: Verifica que los campos clave existan.
      if (!comprehensiveData.aiMaturity || !comprehensiveData.executiveSummary || !comprehensiveData.actionPlan) {
          console.error("JSON parseado pero con estructura incorrecta:", comprehensiveData);
          throw new Error("El JSON de la IA no tiene la estructura de ReportData requerida.");
      }

      // Construir el ReportData completo
      const reportData: ReportData = {
        id: this.generateId(),
        timestamp: new Date(),
        leadInfo: {
          name: data.lead?.name || 'Usuario',
          email: data.lead?.email || 'usuario@empresa.com',
          companyName: data.lead?.companyName || 'Empresa'
        },
        contexto: data,
        aresScores,
        competencyScores: this.formatCompetencyScores(competencyScores),
        companyContext,
        aiMaturity: comprehensiveData.aiMaturity,
        executiveSummary: comprehensiveData.executiveSummary,
        strengthsAnalysis: comprehensiveData.strengthsAnalysis || [],
        weaknessesAnalysis: comprehensiveData.weaknessesAnalysis || [],
        insights: comprehensiveData.insights || [],
        actionPlan: comprehensiveData.actionPlan || [],
        generatedAt: new Date(),
        version: '3.0.0'
      };

      return reportData;
    } catch (parseError) {
      console.error('❌ Error fatal al parsear JSON comprehensivo:', parseError, 'Texto recibido:', responseText);
      console.log('🔄 Generando reporte de fallback debido a error de parseo...');
      throw parseError; // Re-lanzar para que el método principal maneje el fallback
    }
  }

  /**
   * Genera un reporte de emergencia cuando todo falla
   */
  private generateEmergencyReport(
    data: any,
    companyContext: any,
    aresScores: Record<string, number>,
    competencyScores: Record<string, number>
  ): ReportData {
    console.log('🚨 Generando reporte de emergencia...');
    
    return {
      id: 'emergency-' + Date.now(),
      timestamp: new Date(),
      leadInfo: {
        name: data.lead?.name || 'Usuario',
        email: data.lead?.email || 'usuario@empresa.com',
        companyName: data.lead?.companyName || 'Empresa'
      },
      contexto: data,
      aresScores,
      competencyScores: this.formatCompetencyScores(competencyScores),
      companyContext,
      aiMaturity: {
        level: 'En Desarrollo',
        score: 50,
        summary: 'Tu organización se encuentra en un nivel de desarrollo en IA. Recomendamos continuar con el plan de acción para mejorar las capacidades.'
      },
      executiveSummary: 'Hemos generado un reporte básico basado en tu información. Para obtener un análisis más detallado, por favor intenta nuevamente más tarde.',
      strengthsAnalysis: [],
      weaknessesAnalysis: [],
      insights: [{
        title: 'Sistema de Análisis Temporal',
        description: 'Este reporte fue generado usando nuestro sistema de respaldo. Para obtener un análisis completo, intenta nuevamente.',
        type: 'Fortaleza Clave'
      }],
      actionPlan: [{
        area: 'Desarrollo de Competencias en IA',
        priority: 'Alta',
        timeline: '3-6 meses',
        description: 'Enfócate en desarrollar competencias básicas en IA para tu organización.',
        actions: [{
          accion: 'Capacitación Básica en IA',
          descripcion: 'Inicia con cursos básicos de IA para tu equipo.',
          timeline: '1-2 meses',
          recursos: ['Cursos online', 'Material educativo'],
          kpis: ['Nivel de conocimiento', 'Aplicación práctica'],
          expectedOutcome: 'Equipo con conocimientos básicos en IA',
          painPoint: 'Falta de conocimiento básico en IA',
          aresDimension: 'Agilidad'
        }]
      }],
      generatedAt: new Date(),
      version: '3.0.0-emergency'
    };
  }

  /**
   * Genera un reporte de fallback cuando la API falla
   */
  private generateFallbackReport(
    data: any, 
    companyContext: any, 
    aresScores: Record<string, number>, 
    competencyScores: Record<string, number>
  ): ReportData {
    console.log('🔄 Generando reporte de fallback de alta calidad...');
    console.log('📊 Datos disponibles para fallback:', {
      competencias: Object.keys(competencyScores).length,
      ares: Object.keys(aresScores).length,
      contexto: !!companyContext,
      lead: !!data.lead
    });
    
    // Calcular nivel de madurez basado en puntuaciones reales
    const competencyValues = Object.values(competencyScores);
    const aresValues = Object.values(aresScores);
    const allScores = [...competencyValues, ...aresValues];
    
    // Evitar división por cero
    let avgScore = 0;
    if (allScores.length > 0) {
      avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    }
    
    // Determinar nivel de madurez basado en rangos correctos
    let maturityLevel: 'Incipiente' | 'En Desarrollo' | 'Establecido' | 'Estratégico' | 'Transformador';
    if (avgScore >= 81) {
      maturityLevel = 'Transformador';
    } else if (avgScore >= 61) {
      maturityLevel = 'Estratégico';
    } else if (avgScore >= 41) {
      maturityLevel = 'Establecido';
    } else if (avgScore >= 21) {
      maturityLevel = 'En Desarrollo';
    } else {
      maturityLevel = 'Incipiente';
    }
    
    // Identificar fortalezas y debilidades basadas en puntuaciones reales
    const competencyEntries = Object.entries(competencyScores);
    const sortedCompetencies = competencyEntries.sort((a, b) => b[1] - a[1]);
    
    // Fortalezas: competencias con puntaje más alto (pero solo si son realmente altas)
    const strengths = sortedCompetencies
      .filter(([id, score]) => score >= 60) // Solo competencias con puntaje alto
      .slice(0, 3)
      .map(([id, score]) => {
        const competency = competencias.find(c => c.id === id);
        return {
          competencyId: id,
          competencyName: competency?.name || 'Competencia',
          score: Math.round(score),
          analysis: `Tu competencia en ${competency?.name || 'esta área'} (${Math.round(score)}/100) es una fortaleza clave que puedes apalancar para alcanzar tu objetivo de ${companyContext.mainObjective}. Esta fortaleza te permite abordar desafíos complejos y tomar decisiones informadas en la implementación de IA.`
        };
      });
    
    // Debilidades: competencias con puntaje más bajo
    // Si no hay puntajes perfectos (100/100), siempre generar áreas de mejora
    const weaknesses = sortedCompetencies
      .filter(([id, score]) => score < 100) // Cualquier competencia que no sea perfecta
      .slice(-Math.min(3, sortedCompetencies.length)) // Tomar hasta 3, o todas si hay menos
      .map(([id, score]) => {
        const competency = competencias.find(c => c.id === id);
        const criticality = score < 40 ? 'crítica' : score < 60 ? 'importante' : 'oportunidad de optimización';
        const urgency = score < 40 ? 'urgente' : score < 60 ? 'prioritaria' : 'recomendada';
        
        return {
          competencyId: id,
          competencyName: competency?.name || 'Competencia',
          score: Math.round(score),
          analysis: `Tu puntaje en ${competency?.name || 'esta área'} (${Math.round(score)}/100) representa una mejora ${criticality} que puede ${score < 60 ? 'impedir' : 'optimizar'} el logro de tu objetivo de ${companyContext.mainObjective}. Es ${urgency} desarrollar esta competencia para ${score < 60 ? 'asegurar el éxito' : 'maximizar el impacto'} en la implementación de IA.`
        };
      });

    // Incluir dimensiones ARES en las áreas de mejora si tienen puntajes bajos
    const aresEntries = Object.entries(aresScores);
    const aresWeaknesses = aresEntries
      .filter(([dimension, score]) => score < 100) // Cualquier dimensión que no sea perfecta
      .sort((a, b) => a[1] - b[1]) // Ordenar de menor a mayor puntaje
      .slice(0, 2) // Tomar las 2 dimensiones con menor puntaje
      .map(([dimension, score]) => ({
        competencyId: `ares-${dimension.toLowerCase()}`,
        competencyName: `Dimensión ARES: ${dimension}`,
        score: Math.round(score),
        analysis: `La dimensión ${dimension} (${Math.round(score)}/100) requiere atención ${score < 40 ? 'crítica' : score < 60 ? 'prioritaria' : 'para optimización'} en el framework ARES-AI. Esta mejora es ${score < 60 ? 'fundamental' : 'recomendada'} para alcanzar tu objetivo de ${companyContext.mainObjective}.`
      }));

    // Combinar debilidades de competencias y ARES
    const allWeaknesses = [...weaknesses, ...aresWeaknesses]
      .sort((a, b) => a.score - b.score) // Ordenar por puntaje (menor primero)
      .slice(0, 3); // Tomar las 3 más críticas

    // Generar insights basados en el análisis real
    const insights: StrategicInsight[] = [];
    if (avgScore < 40) {
      insights.push({
        title: 'Riesgo Crítico de Implementación',
        description: `Con un puntaje de madurez de ${Math.round(avgScore)}/100, existe un alto riesgo de que las iniciativas de IA fracasen. Es crucial desarrollar competencias fundamentales antes de implementar soluciones complejas.`,
        type: 'Riesgo Crítico'
      });
    } else if (avgScore < 60) {
      insights.push({
        title: 'Oportunidad de Crecimiento',
        description: `Tu nivel actual de madurez en IA presenta potencial significativo de mejora que puede impactar directamente en ${companyContext.mainObjective}. Con el plan de acción adecuado, puedes alcanzar un nivel estratégico.`,
        type: 'Oportunidad Oculta'
      });
    } else {
      insights.push({
        title: 'Fortaleza Estratégica',
        description: `Tu nivel de madurez en IA te posiciona como una organización preparada para liderar la transformación digital. Puedes apalancar esta ventaja para superar a la competencia.`,
        type: 'Fortaleza Clave'
      });
    }

    return {
      id: this.generateId(),
      timestamp: new Date(),
      leadInfo: {
        name: data.lead?.name || 'Usuario',
        email: data.lead?.email || 'usuario@empresa.com',
        companyName: data.lead?.companyName || 'Empresa'
      },
      contexto: data,
      aresScores,
      competencyScores: this.formatCompetencyScores(competencyScores),
      companyContext,
      aiMaturity: {
        level: maturityLevel,
        score: Math.round(avgScore),
        summary: `Basado en el análisis de tus competencias y pilares ARES, tu nivel de madurez en IA es ${maturityLevel.toLowerCase()}. Tu puntaje promedio de ${Math.round(avgScore)}/100 indica ${avgScore >= 60 ? 'un buen nivel de preparación' : avgScore >= 40 ? 'áreas significativas de mejora' : 'necesidad crítica de desarrollo'} para implementar estrategias de IA efectivas.`
      },
      executiveSummary: this.generateExecutiveSummary(maturityLevel, avgScore, allWeaknesses, companyContext) + 
        '\n\n⚡ Nota: Este reporte fue generado usando nuestro sistema de análisis avanzado cuando la IA no estuvo disponible. ' +
        'Los resultados están basados en algoritmos probados y tu evaluación real, garantizando la precisión del diagnóstico.',
      strengthsAnalysis: strengths,
      weaknessesAnalysis: allWeaknesses,
      insights: insights,
      actionPlan: this.generateActionPlan(allWeaknesses, companyContext, avgScore),
      generatedAt: new Date(),
      version: '3.0.0-fallback'
    };
  }

  /**
   * Genera un resumen ejecutivo mejorado sin duplicidad de información
   */
  private generateExecutiveSummary(maturityLevel: string, avgScore: number, weaknesses: any[], companyContext: any): string {
    const score = Math.round(avgScore);
    
    // Determinar el enfoque estratégico basado en el nivel de madurez
    let strategicFocus = '';
    let recommendedApproach = '';
    let expectedOutcome = '';
    
    if (score < 40) {
      strategicFocus = 'establecimiento de competencias fundamentales';
      recommendedApproach = 'un programa de capacitación estructurado que desarrolle las bases necesarias';
      expectedOutcome = 'preparar a tu organización para futuras implementaciones de IA';
    } else if (score < 60) {
      strategicFocus = 'consolidación de capacidades existentes';
      recommendedApproach = 'una estrategia de desarrollo incremental que fortalezca las áreas débiles';
      expectedOutcome = 'elevar tu nivel de madurez a un estado más competitivo';
    } else if (score < 80) {
      strategicFocus = 'optimización y escalamiento';
      recommendedApproach = 'iniciativas de mejora continua y adopción de mejores prácticas';
      expectedOutcome = 'maximizar el ROI de tus inversiones en IA';
    } else {
      strategicFocus = 'liderazgo e innovación';
      recommendedApproach = 'estrategias avanzadas de transformación digital';
      expectedOutcome = 'mantener tu ventaja competitiva en el mercado';
    }
    
    // Identificar las áreas más críticas para mencionar en el plan de acción
    const criticalAreas = weaknesses.slice(0, 2).map(w => w.competencyName).join(' y ');
    const hasMultipleAreas = weaknesses.length > 2;
    
    return `Tu empresa se encuentra en un nivel de madurez ${maturityLevel.toLowerCase()} en IA con un puntaje de ${score}/100. ` +
           `Para alcanzar tu objetivo estratégico, recomendamos enfocarse en el ${strategicFocus} mediante ${recommendedApproach}. ` +
           `El plan de acción prioriza el desarrollo de ${criticalAreas}${hasMultipleAreas ? ` y otras áreas críticas` : ''}, ` +
           `con el objetivo de ${expectedOutcome}. ` +
           `Esta estrategia te permitirá avanzar sistemáticamente hacia una implementación exitosa de IA que impulse tu crecimiento empresarial.`;
  }

  /**
   * Genera un plan de acción detallado basado en las debilidades identificadas y fases ARES-AI
   */
  private generateActionPlan(weaknesses: any[], companyContext: any, avgScore: number): any[] {
    const actionPlan = [];
    
    // Determinar el nivel de madurez actual para personalizar el plan
    const maturityLevel = avgScore < 20 ? 'Incipiente' : 
                         avgScore < 40 ? 'En Desarrollo' :
                         avgScore < 60 ? 'Establecido' :
                         avgScore < 80 ? 'Estratégico' : 'Transformador';

    // FASE 1: FUNDAMENTOS CRÍTICOS (Para todos los niveles excepto Transformador)
    if (maturityLevel !== 'Transformador') {
      actionPlan.push({
        area: 'Fundamentos Críticos para IA',
        priority: 'Alta',
        timeline: '3-6 meses',
        description: this.getPainPointDescription(maturityLevel, 'fundamentos'),
        actions: this.generateFundamentalActions(weaknesses, companyContext, maturityLevel)
      });
    }

    // FASE 2: DESARROLLO DE COMPETENCIAS ESPECÍFICAS
    if (weaknesses.length > 0) {
      actionPlan.push({
        area: 'Desarrollo de Competencias Críticas',
        priority: 'Alta',
        timeline: '4-8 meses',
        description: this.getPainPointDescription(maturityLevel, 'competencias'),
        actions: this.generateCompetencyActions(weaknesses, companyContext)
      });
    }

    // FASE 3: IMPLEMENTACIÓN ARES-AI
    if (avgScore >= 30) {
      actionPlan.push({
        area: 'Implementación Framework ARES-AI',
        priority: avgScore >= 50 ? 'Alta' : 'Media',
        timeline: '6-12 meses',
        description: this.getPainPointDescription(maturityLevel, 'ares'),
        actions: this.generateAresActions(companyContext, maturityLevel, avgScore)
      });
    }

    // FASE 4: ESCALAMIENTO Y OPTIMIZACIÓN
    if (avgScore >= 50) {
      actionPlan.push({
        area: 'Escalamiento y Optimización',
        priority: 'Media',
        timeline: '6-18 meses',
        description: this.getPainPointDescription(maturityLevel, 'escalamiento'),
        actions: this.generateScalingActions(companyContext, maturityLevel)
      });
    }

    return actionPlan;
  }

  /**
   * Genera descripción del dolor específico según nivel de madurez
   */
  private getPainPointDescription(level: string, phase: string): string {
    const painPoints = {
      'fundamentos': {
        'Incipiente': 'Tu organización carece de las bases fundamentales para IA. Sin competencias básicas, cultura de datos y entendimiento de IA, cualquier implementación está destinada al fracaso, desperdiciando recursos y generando frustración en el equipo.',
        'En Desarrollo': 'Aunque tienes algunos conocimientos, las brechas fundamentales en competencias críticas están impidiendo que aproveches las oportunidades de IA, limitando tu competitividad y crecimiento.',
        'Establecido': 'Para alcanzar un nivel estratégico, necesitas consolidar competencias avanzadas que te permitan liderar la transformación digital en tu industria.',
        'Estratégico': 'Para mantener tu ventaja competitiva, debes optimizar y expandir tus capacidades de IA hacia nuevos horizontes estratégicos.'
      },
      'competencias': {
        'Incipiente': 'Las competencias críticas identificadas representan barreras insuperables que te impiden siquiera considerar implementaciones básicas de IA, bloqueando cualquier progreso digital.',
        'En Desarrollo': 'Las competencias débiles están creando cuellos de botella que limitan severamente el impacto y adopción de cualquier iniciativa de IA en tu organización.',
        'Establecido': 'Para avanzar al siguiente nivel, necesitas fortalecer competencias específicas que te permitan implementar estrategias de IA más sofisticadas y ambiciosas.',
        'Estratégico': 'La optimización de competencias clave te permitirá maximizar el ROI de tus inversiones en IA y mantener tu liderazgo en el mercado.'
      },
      'ares': {
        'Incipiente': 'Sin un framework estructurado como ARES-AI, tu organización navegará a ciegas en la implementación de IA, aumentando riesgos y reduciendo probabilidades de éxito.',
        'En Desarrollo': 'La falta de un framework ARES-AI está resultando en implementaciones fragmentadas y sin coordinación, desperdiciando esfuerzos y recursos.',
        'Establecido': 'Para alcanzar madurez estratégica, necesitas implementar el framework ARES-AI que garantice gobernanza, ética y sostenibilidad en todas tus iniciativas.',
        'Estratégico': 'El framework ARES-AI te permitirá escalar exitosamente tus iniciativas de IA manteniendo estándares de excelencia y responsabilidad.'
      },
      'escalamiento': {
        'Incipiente': 'No aplica en este nivel - enfócate primero en fundamentos.',
        'En Desarrollo': 'No aplica en este nivel - consolida primero las bases.',
        'Establecido': 'Sin un plan de escalamiento estructurado, tus iniciativas de IA se quedarán limitadas a proyectos aislados, perdiendo oportunidades de transformación organizacional.',
        'Estratégico': 'Para mantener el liderazgo, necesitas expandir tus capacidades de IA hacia nuevas áreas de negocio y mercados, maximizando el impacto estratégico.'
      }
    };

    return (painPoints as any)[phase]?.[level] || 'Desarrollo de capacidades específicas para tu nivel de madurez.';
  }

  /**
   * Genera acciones fundamentales según nivel de madurez
   */
  private generateFundamentalActions(weaknesses: any[], companyContext: any, level: string): any[] {
    const actions = [];

    if (level === 'Incipiente') {
      actions.push(
        {
          accion: 'Auditoría de Conocimientos Base en IA',
          descripcion: 'Realizar evaluación completa del nivel de conocimiento actual del equipo sobre IA, datos y transformación digital para identificar brechas críticas.',
          timeline: '2-3 semanas',
          recursos: ['Consultor especializado', 'Herramientas de evaluación', 'Tiempo del equipo'],
          kpis: ['Nivel de conocimiento actual', 'Brechas identificadas', 'Plan de capacitación'],
          expectedOutcome: 'Mapa claro de conocimientos y brechas fundamentales',
          painPoint: 'Sin conocimiento base, cualquier implementación de IA fracasará',
          aresDimension: 'Agilidad'
        },
        {
          accion: 'Creación de Cultura de Datos',
          descripcion: 'Implementar programa para desarrollar mentalidad basada en datos en toda la organización, desde toma de decisiones hasta análisis de resultados.',
          timeline: '2-3 meses',
          recursos: ['Capacitación especializada', 'Herramientas de visualización', 'Mentoría'],
          kpis: ['Adopción de métricas basadas en datos', 'Calidad de decisiones', 'Cultura organizacional'],
          expectedOutcome: 'Organización que piensa y actúa basada en datos',
          painPoint: 'Sin cultura de datos, las iniciativas de IA no tendrán adopción',
            aresDimension: 'Responsabilidad'
          },
          {
          accion: 'Definición de Estrategia de IA',
          descripcion: 'Desarrollar estrategia clara de IA alineada con objetivos de negocio, definiendo prioridades, recursos necesarios y roadmap de implementación.',
          timeline: '1-2 meses',
          recursos: ['Consultor estratégico', 'Equipo directivo', 'Análisis de mercado'],
          kpis: ['Estrategia documentada', 'Roadmap definido', 'Presupuesto asignado'],
          expectedOutcome: 'Hoja de ruta clara para la transformación digital',
          painPoint: 'Sin estrategia clara, los esfuerzos de IA serán dispersos e ineficientes',
          aresDimension: 'Ética'
        }
      );
    } else if (level === 'En Desarrollo') {
      actions.push(
        {
          accion: 'Fortalecimiento de Gobernanza de Datos',
          descripcion: 'Establecer políticas, procedimientos y roles claros para la gestión, calidad y seguridad de datos en la organización.',
          timeline: '2-3 meses',
          recursos: ['Especialista en gobernanza', 'Herramientas de gestión', 'Capacitación del equipo'],
          kpis: ['Políticas implementadas', 'Calidad de datos', 'Cumplimiento normativo'],
          expectedOutcome: 'Datos confiables y seguros para iniciativas de IA',
          painPoint: 'Sin gobernanza, los datos serán inconsistentes y riesgosos para IA',
          aresDimension: 'Responsabilidad'
        },
        {
          accion: 'Desarrollo de Capacidades Técnicas Básicas',
          descripcion: 'Capacitar al equipo en herramientas y tecnologías básicas de IA, incluyendo plataformas de datos, APIs y herramientas de automatización.',
            timeline: '3-4 meses',
          recursos: ['Cursos especializados', 'Plataformas de práctica', 'Mentoría técnica'],
          kpis: ['Competencias técnicas desarrolladas', 'Proyectos piloto exitosos', 'Autonomía del equipo'],
          expectedOutcome: 'Equipo capaz de manejar herramientas básicas de IA',
          painPoint: 'Sin capacidades técnicas, dependerás completamente de proveedores externos',
          aresDimension: 'Agilidad'
        }
      );
    }

    return actions;
  }

  /**
   * Genera acciones específicas para competencias críticas
   */
  private generateCompetencyActions(weaknesses: any[], companyContext: any): any[] {
    return weaknesses.slice(0, 3).map((weakness, index) => ({
      accion: `Desarrollo Intensivo: ${weakness.competencyName}`,
      descripcion: `Programa integral de desarrollo para ${weakness.competencyName} desde ${weakness.score}/100 hasta al menos 70/100, incluyendo teoría, práctica y aplicación en proyectos reales.`,
      timeline: `${3 + index} meses`,
      recursos: [
        'Curso especializado certificado',
        'Mentoría personalizada',
        'Proyectos prácticos reales',
        'Herramientas y plataformas específicas',
        'Evaluación continua y feedback'
      ],
      kpis: [
        `Puntaje de ${weakness.competencyName}`,
        'Proyectos prácticos completados',
        'Aplicación en contexto real',
        'Feedback del equipo y stakeholders'
      ],
      expectedOutcome: `Dominio sólido de ${weakness.competencyName} aplicable en contexto empresarial`,
      painPoint: `Esta debilidad está bloqueando ${companyContext.mainObjective}`,
      competencyTarget: weakness.competencyId,
      aresDimension: this.mapCompetencyToAres(weakness.competencyId)
    }));
  }

  /**
   * Genera acciones para implementación del framework ARES-AI
   */
  private generateAresActions(companyContext: any, level: string, avgScore: number): any[] {
    const actions = [];

    actions.push(
      {
        accion: 'Implementación de Agilidad en IA',
        descripcion: 'Establecer procesos ágiles para desarrollo, testing y deployment de soluciones de IA, permitiendo iteración rápida y adaptación continua.',
        timeline: '2-3 meses',
        recursos: ['Metodologías ágiles', 'Herramientas de gestión', 'Capacitación del equipo'],
        kpis: ['Velocidad de desarrollo', 'Tiempo de respuesta', 'Adaptabilidad'],
        expectedOutcome: 'Capacidad de desarrollo ágil para soluciones de IA',
        painPoint: 'Sin agilidad, tus proyectos de IA serán lentos y obsoletos antes de completarse',
        aresDimension: 'Agilidad'
      },
      {
        accion: 'Framework de Responsabilidad en IA',
        descripcion: 'Implementar políticas y procedimientos para asegurar que todas las iniciativas de IA sean responsables, transparentes y alineadas con valores organizacionales.',
        timeline: '3-4 meses',
        recursos: ['Consultor en ética de IA', 'Políticas documentadas', 'Sistemas de monitoreo'],
        kpis: ['Políticas implementadas', 'Casos de uso documentados', 'Auditorías de cumplimiento'],
        expectedOutcome: 'IA responsable y alineada con valores organizacionales',
        painPoint: 'Sin responsabilidad, tus iniciativas de IA pueden generar riesgos legales y de reputación',
        aresDimension: 'Responsabilidad'
      },
      {
        accion: 'Ética y Transparencia en IA',
        descripcion: 'Desarrollar y implementar principios éticos claros para el uso de IA, incluyendo transparencia, equidad y privacidad.',
        timeline: '2-3 meses',
        recursos: ['Especialista en ética', 'Marco ético documentado', 'Capacitación del equipo'],
        kpis: ['Principios éticos adoptados', 'Casos de uso evaluados', 'Transparencia implementada'],
        expectedOutcome: 'IA ética y transparente que genera confianza',
        painPoint: 'Sin ética clara, tu IA puede generar sesgos y pérdida de confianza',
            aresDimension: 'Ética'
      },
      {
        accion: 'Sostenibilidad en Iniciativas de IA',
        descripcion: 'Integrar consideraciones de sostenibilidad ambiental y social en todas las iniciativas de IA, optimizando recursos y minimizando impacto.',
        timeline: '3-4 meses',
        recursos: ['Consultor en sostenibilidad', 'Métricas de impacto', 'Herramientas de optimización'],
        kpis: ['Impacto ambiental medido', 'Eficiencia de recursos', 'Sostenibilidad documentada'],
        expectedOutcome: 'IA sostenible que contribuye positivamente al medio ambiente',
        painPoint: 'Sin sostenibilidad, tus iniciativas de IA pueden generar impacto ambiental negativo',
        aresDimension: 'Sostenibilidad'
      }
    );

    return actions;
  }

  /**
   * Genera acciones de escalamiento para niveles avanzados
   */
  private generateScalingActions(companyContext: any, level: string): any[] {
    if (level === 'Establecido') {
      return [
        {
          accion: 'Expansión de IA a Nuevas Áreas de Negocio',
          descripcion: `Identificar y priorizar nuevas áreas de negocio donde aplicar IA para maximizar el impacto en ${companyContext.mainObjective}.`,
          timeline: '4-6 meses',
          recursos: ['Análisis de mercado', 'Equipos especializados', 'Presupuesto de expansión'],
          kpis: ['Nuevas áreas identificadas', 'Pilotos implementados', 'ROI de expansión'],
          expectedOutcome: 'IA implementada en múltiples áreas de negocio',
          painPoint: 'Sin expansión, tu IA se limitará a áreas específicas perdiendo oportunidades',
          aresDimension: 'Agilidad'
        },
        {
          accion: 'Automatización Avanzada de Procesos',
          descripcion: 'Implementar automatización inteligente en procesos críticos para aumentar eficiencia y liberar recursos humanos para tareas estratégicas.',
          timeline: '6-8 meses',
          recursos: ['Plataformas de automatización', 'Especialistas en RPA', 'Integración de sistemas'],
          kpis: ['Procesos automatizados', 'Eficiencia ganada', 'Recursos liberados'],
          expectedOutcome: 'Procesos clave automatizados con IA',
          painPoint: 'Sin automatización, seguirás perdiendo eficiencia en procesos repetitivos',
          aresDimension: 'Responsabilidad'
        }
      ];
    } else if (level === 'Estratégico') {
      return [
        {
          accion: 'Liderazgo en Innovación de IA',
          descripcion: 'Posicionar a la organización como líder en innovación de IA en su industria, desarrollando capacidades únicas y diferenciadoras.',
          timeline: '8-12 meses',
          recursos: ['I+D especializado', 'Partnerships estratégicos', 'Inversión en innovación'],
          kpis: ['Patentes desarrolladas', 'Liderazgo reconocido', 'Innovaciones únicas'],
          expectedOutcome: 'Posición de liderazgo en IA en la industria',
          painPoint: 'Sin innovación, tus competidores te superarán en capacidades de IA',
          aresDimension: 'Agilidad'
        },
        {
          accion: 'Ecosistema de IA Integrado',
          descripcion: 'Crear un ecosistema completo de IA que integre todas las iniciativas, datos y capacidades en una plataforma unificada.',
          timeline: '12-18 meses',
          recursos: ['Arquitectura de datos', 'Plataformas integradas', 'Equipo de integración'],
          kpis: ['Ecosistema unificado', 'Sinergias identificadas', 'Eficiencia total'],
          expectedOutcome: 'Ecosistema de IA completamente integrado',
          painPoint: 'Sin integración, tus iniciativas de IA seguirán siendo fragmentadas',
          aresDimension: 'Responsabilidad'
        }
      ];
    }

    return [];
  }

  /**
   * Mapea competencias a dimensiones ARES
   */
  private mapCompetencyToAres(competencyId: string): string {
    const mapping: Record<string, string> = {
      'pensamiento_critico': 'Agilidad',
      'resolucion_problemas': 'Agilidad',
      'alfabetizacion_datos': 'Responsabilidad',
      'comunicacion': 'Responsabilidad',
      'colaboracion': 'Responsabilidad',
      'creatividad_innovacion': 'Agilidad',
      'diseno_tecnologico': 'Agilidad',
      'automatizacion_agentes_ia': 'Agilidad',
      'adaptabilidad_flexibilidad': 'Agilidad',
      'etica_responsabilidad': 'Ética',
      'sostenibilidad': 'Sostenibilidad',
      'aprendizaje_continuo': 'Agilidad',
      'liderazgo_ia': 'Responsabilidad'
    };

    return mapping[competencyId] || 'Agilidad';
  }
}