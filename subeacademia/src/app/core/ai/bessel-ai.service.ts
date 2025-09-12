import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report, ReportData, StrategicInitiative, ExecutiveSummary, AiMaturity, CompetencyAnalysis, StrategicInsight } from '../../features/diagnostico/data/report.model';
import { competencias } from '../../features/diagnostico/data/competencias';

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
        console.log('✅ Reporte estratégico parseado con éxito:', strategicData);

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
   * Calcula las puntuaciones ARES basadas en las respuestas
   */
  private calculateAresScores(aresAnswers: any): Record<string, number> {
    const scores: Record<string, number> = {
      'Agilidad': 0,
      'Responsabilidad': 0,
      'Ética': 0,
      'Sostenibilidad': 0
    };

    // Lógica para calcular puntuaciones ARES
    // Por ahora, valores de ejemplo - implementar lógica real
    Object.keys(scores).forEach(dimension => {
      scores[dimension] = Math.floor(Math.random() * 40) + 30; // 30-70
    });

    return scores;
  }

  /**
   * Calcula las puntuaciones de competencias basadas en las respuestas
   */
  private calculateCompetencyScores(compAnswers: any): Record<string, number> {
    const scores: Record<string, number> = {};

    // Mapear las competencias disponibles
    competencias.forEach(comp => {
      scores[comp.id] = Math.floor(Math.random() * 40) + 30; // 30-70
    });

    return scores;
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
        console.log('✅ Reporte holístico parseado con éxito:', holisticData);

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
3. **Analizar Debilidades:** Identifica las 3 competencias con el puntaje más bajo. Para cada una, escribe un \`analysis\` que explique el riesgo que esta debilidad representa para su negocio y su \`objetivo\`. Sé directo y claro sobre el "dolor".
4. **Extraer Insights Estratégicos:** Basado en la combinación de fortalezas, debilidades y el contexto, genera 2 o 3 \`StrategicInsight\`. Por ejemplo, si tienen alta 'Innovación' pero baja 'Ética en IA', un insight de 'Riesgo Crítico' podría ser "Riesgo de desarrollar soluciones de IA no adoptadas por el mercado por falta de confianza". Si tienen alta 'Gestión de Datos' y están en 'Retail', una 'Oportunidad Oculta' podría ser "Oportunidad de liderar el mercado con personalización predictiva de la demanda".
5. **Generar Resumen Ejecutivo:** Escribe un párrafo conciso y potente para un CEO, resumiendo el nivel de madurez, el principal desafío y la recomendación estratégica más importante.
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
   * MÉTODO CRÍTICO: Genera un reporte comprehensivo con análisis de consultor
   */
  async generateComprehensiveReport(data: any): Promise<ReportData | null> {
    console.log('🧠 Iniciando generación de reporte comprehensivo con datos:', data);

    // Construir el contexto de la empresa
    const companyContext = {
      industry: data.contexto?.industria || data.objetivo?.industria || 'No especificada',
      size: data.contexto?.equipo || 'No especificada',
      mainObjective: data.objetivo?.objetivo || 'No especificado'
    };

    // Calcular puntuaciones ARES y de competencias
    const aresScores = this.calculateAresScores(data.ares);
    const competencyScores = this.calculateCompetencyScores(data.competencias);

    // --- CONSTRUCCIÓN DEL SUPER-PROMPT ---
    const prompt = `
    **ROL Y OBJETIVO:**
    Eres 'ARES-AI', un consultor de estrategia de IA de élite de Sube Academia. Tu misión es analizar en profundidad los datos de un diagnóstico de una empresa y generar un reporte estratégico que sea denso, perspicaz y 100% personalizado. El cliente debe sentir que este análisis fue hecho por un humano experto que entiende su negocio. Tu salida DEBE ser un único objeto JSON válido, sin ningún texto o explicación adicional.

    **DATOS DEL CLIENTE PARA TU ANÁLISIS:**
    - **Contexto de Negocio:** ${JSON.stringify(companyContext)}
    - **Puntuaciones en Framework ARES-AI (de 1 a 5):** ${JSON.stringify(aresScores)}
    - **Puntuaciones en 13 Competencias Clave (de 1 a 5):** ${JSON.stringify(competencyScores)}

    **INSTRUCCIONES PRECISAS PARA TU ANÁLISIS (DEBES SEGUIRLAS AL PIE DE LA LETRA):**

    1.  **Cálculo y Justificación del Nivel de Madurez (aiMaturity):**
        - Calcula un puntaje de madurez (\`score\`) de 0 a 100. Basa tu cálculo en un promedio ponderado: las competencias valen un 60% y los pilares ARES un 40%. Un puntaje promedio de 1 en la escala de 1-5 equivale a un 0/100, y un 5 equivale a un 100/100.
        - Asigna un \`level\` ('Incipiente', 'En Desarrollo', 'Establecido', 'Estratégico', 'Transformador') basado en el score.
        - Escribe un \`summary\` que justifique tu calificación, mencionando específicamente los puntajes más bajos y cómo impactan la madurez general. Ejemplo: "Tu nivel es 'En Desarrollo' (45/100) principalmente porque, aunque tienes una base en Agilidad, tus bajas puntuaciones en 'Ética en IA' y 'Gestión de Datos' representan un riesgo fundamental que impide un avance sostenido."

    2.  **Análisis de Fortalezas (strengthsAnalysis):**
        - Identifica las 3 competencias con el puntaje más alto.
        - Para cada una, escribe un \`analysis\` detallado que explique CÓMO esta fortaleza específica puede ser utilizada para alcanzar su objetivo principal: "${companyContext.mainObjective}". Sé concreto. Ejemplo: "Tu alta competencia en 'Innovación y Creatividad' (4.5/5) es tu mayor activo. Deberías apalancarla para diseñar soluciones de IA disruptivas en la experiencia de cliente, lo que impactará directamente tu objetivo de diferenciarte de la competencia."

    3.  **Análisis de Debilidades (weaknessesAnalysis):**
        - Identifica las 3 competencias con el puntaje más bajo.
        - Para cada una, escribe un \`analysis\` que describa el "dolor" que esto causa. Conecta la debilidad con un riesgo de negocio tangible. Ejemplo: "Tu puntaje crítico en 'Gestión de Datos' (1.5/5) significa que cualquier iniciativa de IA fracasará por falta de 'combustible' de calidad. Esto se traduce en decisiones de negocio basadas en intuición y una alta probabilidad de invertir en tecnología que no podrán utilizar, impactando negativamente el ROI."

    4.  **Resumen Ejecutivo (executiveSummary):**
        - Escribe un párrafo potente para un CEO. Comienza con el nivel de madurez, menciona la brecha más importante (la debilidad que más choca con su objetivo) y finaliza con una recomendación estratégica de alto nivel. Debe ser directo, sin rodeos.

    5.  **Plan de Acción (actionPlan):**
        - Genera un plan de acción detallado como lo has hecho antes, pero asegúrate de que las iniciativas propuestas aborden DIRECTAMENTE las debilidades identificadas en el punto 3.

    **FORMATO DE SALIDA OBLIGATORIO (JSON):**
    {
      "aiMaturity": { "level": "...", "score": ..., "summary": "..." },
      "executiveSummary": "...",
      "strengthsAnalysis": [ { "competencyId": "...", "competencyName": "...", "score": ..., "analysis": "..." }, ... ],
      "weaknessesAnalysis": [ { "competencyId": "...", "competencyName": "...", "score": ..., "analysis": "..." }, ... ],
      "actionPlan": [ ... ]
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

        console.log('✅ Reporte comprehensivo parseado con éxito:', comprehensiveData);

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
        return null; // Devuelve null explícitamente en caso de CUALQUIER error de parseo.
      }
    } catch (error) {
      console.error('❌ Error en la llamada a la API comprehensiva:', error);
      throw error;
    }
  }
}