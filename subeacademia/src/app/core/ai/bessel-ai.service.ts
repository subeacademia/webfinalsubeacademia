import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report, ReportData, StrategicInitiative, ExecutiveSummary } from '../../features/diagnostico/data/report.model';
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
          aresScores,
          competencyScores,
          companyContext,
          executiveSummary: strategicData.executiveSummary,
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
}