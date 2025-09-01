import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of, throwError, timeout, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ARES_ITEMS } from '../data/ares-items';
import { COMPETENCIAS } from '../data/competencias';

export interface GeneratedReport {
  analysis: string;
  actionPlan: ActionPlanItem[];
  isFromAPI: boolean;
  error?: string;
}

export interface ActionPlanItem {
  objetivo: string;
  acciones: string[];
  competencia: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  tiempoEstimado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportGeneratorService {
  private http = inject(HttpClient);
  
  private readonly API_TIMEOUT = 30000; // 30 segundos
  private readonly MAX_RETRIES = 2;

  /**
   * Genera un reporte completo del diagnóstico con fallback local
   */
  async generateReport(diagnosticData: any): Promise<GeneratedReport> {
    console.log('🚀 ReportGeneratorService: Iniciando generación de reporte');
    
    // Intentar primero con la API
    try {
      const apiReport = await this.generateWithAPI(diagnosticData);
      if (apiReport) {
        console.log('✅ Reporte generado exitosamente con API');
        return apiReport;
      }
    } catch (error) {
      console.warn('⚠️ Error con API, usando fallback local:', error);
    }

    // Fallback: generar reporte local
    console.log('🔄 Generando reporte local como fallback');
    return this.generateLocalReport(diagnosticData);
  }

  /**
   * Intenta generar el reporte usando la API de Vercel
   */
  private async generateWithAPI(diagnosticData: any): Promise<GeneratedReport | null> {
    const context = `
Eres un experto coach en desarrollo profesional y transformación digital para la era de la IA. Tu análisis debe basarse estrictamente en dos documentos rectores:
1. La metodología 'ARES-AI Framework', que significa Agile (Ágil), Responsible (Responsable), Ethical (Ético) y Sustainable (Sostenible).
2. Las '13 Competencias de SUBE Academia para la era de la IA'.

Tu objetivo es generar un reporte con dos secciones claras en formato JSON: 'analysis' y 'actionPlan'.

Para el 'analysis', debes ofrecer un resumen conciso de las fortalezas y áreas de oportunidad del usuario, mencionando explícitamente 2 o 3 de las 13 competencias más relevantes según sus respuestas.

Para el 'actionPlan', debes crear una lista de 3 a 5 pasos concretos y accionables. Cada paso debe estar directamente vinculado a mejorar una de las competencias identificadas y debe seguir los principios ARES: ser práctico (Ágil), consciente de su impacto (Responsable y Ético) y enfocado en el crecimiento a largo plazo (Sostenible).
`;

    const payload = {
      diagnosticData,
      context,
    };

    try {
      const response = await firstValueFrom(
        this.http.post<any>(environment.backendIaUrl, payload).pipe(
          timeout(this.API_TIMEOUT),
          catchError((err: HttpErrorResponse) => {
            console.error('❌ Error en API:', err);
            throw err;
          })
        )
      );

      if (response && response.analysis && response.actionPlan) {
        return {
          analysis: response.analysis,
          actionPlan: response.actionPlan,
          isFromAPI: true
        };
      } else {
        throw new Error('Respuesta de API inválida');
      }
    } catch (error) {
      console.error('❌ Error al llamar a la API:', error);
      throw error;
    }
  }

  /**
   * Genera un reporte local cuando la API no está disponible
   */
  private generateLocalReport(diagnosticData: any): GeneratedReport {
    console.log('🏠 Generando reporte local...');

    const aresScores = this.calculateARESScores(diagnosticData);
    const competencyScores = this.calculateCompetencyScores(diagnosticData);
    
    const analysis = this.generateLocalAnalysis(diagnosticData, aresScores, competencyScores);
    const actionPlan = this.generateLocalActionPlan(diagnosticData, aresScores, competencyScores);

    return {
      analysis,
      actionPlan,
      isFromAPI: false
    };
  }

  /**
   * Calcula los puntajes del framework ARES
   */
  private calculateARESScores(diagnosticData: any): Record<string, number> {
    const scores: Record<string, number> = {};
    
    if (diagnosticData.ares?.respuestas) {
      Object.entries(diagnosticData.ares.respuestas).forEach(([key, value]) => {
        const item = ARES_ITEMS.find(i => i.id === key);
        if (item) {
          scores[item.labelKey] = (value as number) * 20; // Convertir de 1-5 a 0-100
        }
      });
    }
    
    return scores;
  }

  /**
   * Calcula los puntajes de competencias
   */
  private calculateCompetencyScores(diagnosticData: any): Record<string, number> {
    const scores: Record<string, number> = {};
    
    if (diagnosticData.competencias?.niveles) {
      Object.entries(diagnosticData.competencias.niveles).forEach(([key, value]) => {
        const competency = COMPETENCIAS.find(c => c.id === key);
        if (competency) {
          const nivel = value as string;
          const nivelScore = this.getNivelScore(nivel);
          scores[competency.nameKey] = nivelScore;
        }
      });
    }
    
    return scores;
  }

  /**
   * Convierte el nivel de competencia a puntaje numérico
   */
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

  /**
   * Genera análisis local basado en los datos del diagnóstico
   */
  private generateLocalAnalysis(diagnosticData: any, aresScores: Record<string, number>, competencyScores: Record<string, number>): string {
    const industria = diagnosticData.contexto?.industria || 'No especificado';
    const tamano = diagnosticData.contexto?.tamanoEquipo || diagnosticData.contexto?.tamanoEmpresa || 'No especificado';
    const objetivo = diagnosticData.objetivo || 'No especificado';

    // Calcular promedios
    const aresAverage = Object.values(aresScores).reduce((sum, score) => sum + score, 0) / Object.keys(aresScores).length || 0;
    const competencyAverage = Object.values(competencyScores).reduce((sum, score) => sum + score, 0) / Object.keys(competencyScores).length || 0;

    // Identificar fortalezas y debilidades
    const topCompetencies = Object.entries(competencyScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    const weakCompetencies = Object.entries(competencyScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3)
      .map(([name]) => name);

    // Determinar nivel de madurez
    let nivelMadurez = 'Inicial';
    if (aresAverage >= 70 && competencyAverage >= 70) {
      nivelMadurez = 'Avanzado';
    } else if (aresAverage >= 50 && competencyAverage >= 50) {
      nivelMadurez = 'Intermedio';
    }

    return `
## Diagnóstico de Madurez en IA

**Análisis General:**
Basado en el análisis de su organización en ${industria} con un equipo de ${tamano}, su nivel de madurez en IA se encuentra en una etapa **${nivelMadurez.toLowerCase()}**. El objetivo principal identificado es: "${objetivo}".

**Nivel de Madurez ARES-AI:**
Su puntuación promedio en el framework ARES-AI es de ${Math.round(aresAverage)}/100. Esto indica que su organización tiene una base ${aresAverage >= 60 ? 'sólida' : 'en desarrollo'} para implementar IA de manera ágil, responsable, ética y sostenible.

**Nivel de Competencias para la IA:**
Su puntuación promedio en las 13 competencias clave es de ${Math.round(competencyAverage)}/100. Las competencias más desarrolladas son: ${topCompetencies.join(', ')}. Las áreas con mayor oportunidad de mejora son: ${weakCompetencies.join(', ')}.

**Recomendación Principal:**
Para alcanzar su objetivo de "${objetivo}", es fundamental fortalecer las competencias identificadas como áreas de oportunidad, especialmente ${weakCompetencies[0]} y ${weakCompetencies[1]}, mientras se mantiene el desarrollo de sus fortalezas actuales.
`;
  }

  /**
   * Genera plan de acción local basado en los datos del diagnóstico
   */
  private generateLocalActionPlan(diagnosticData: any, aresScores: Record<string, number>, competencyScores: Record<string, number>): ActionPlanItem[] {
    const actionPlan: ActionPlanItem[] = [];

    // Identificar las 3 competencias más débiles
    const weakCompetencies = Object.entries(competencyScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    // Generar acciones para cada competencia débil
    weakCompetencies.forEach(([competencyName, score], index) => {
      const prioridad = index === 0 ? 'Alta' : index === 1 ? 'Media' : 'Baja';
      const tiempoEstimado = index === 0 ? '1-2 meses' : index === 1 ? '2-3 meses' : '3-6 meses';
      
      const acciones = this.getActionsForCompetency(competencyName, score);
      
      actionPlan.push({
        objetivo: `Fortalecer ${competencyName}`,
        acciones,
        competencia: competencyName,
        prioridad,
        tiempoEstimado
      });
    });

    // Agregar objetivo general de ARES si es necesario
    const aresAverage = Object.values(aresScores).reduce((sum, score) => sum + score, 0) / Object.keys(aresScores).length || 0;
    if (aresAverage < 60) {
      actionPlan.push({
        objetivo: 'Mejorar la madurez organizacional ARES-AI',
        acciones: [
          'Establecer un comité de ética de IA',
          'Implementar procesos ágiles para proyectos de IA',
          'Desarrollar políticas de responsabilidad y sostenibilidad',
          'Crear métricas de seguimiento para iniciativas de IA'
        ],
        competencia: 'Liderazgo e Influencia Social',
        prioridad: 'Alta',
        tiempoEstimado: '2-4 meses'
      });
    }

    return actionPlan.slice(0, 5); // Máximo 5 objetivos
  }

  /**
   * Obtiene acciones específicas para una competencia
   */
  private getActionsForCompetency(competencyName: string, score: number): string[] {
    const actionMap: Record<string, string[]> = {
      'Pensamiento Crítico y Resolución de Problemas': [
        'Implementar sesiones de análisis de casos de IA',
        'Desarrollar metodologías de resolución de problemas complejos',
        'Crear espacios de debate sobre dilemas éticos de IA'
      ],
      'Adaptabilidad y Aprendizaje Continuo': [
        'Establecer programa de actualización mensual en IA',
        'Crear biblioteca de recursos y casos de estudio',
        'Implementar sistema de mentoría entre pares'
      ],
      'Colaboración y Trabajo en Equipo': [
        'Organizar workshops interdepartamentales sobre IA',
        'Crear equipos multidisciplinarios para proyectos de IA',
        'Implementar herramientas de colaboración digital'
      ],
      'Comunicación Efectiva': [
        'Desarrollar habilidades de presentación de conceptos de IA',
        'Crear plantillas de comunicación para stakeholders',
        'Implementar sesiones de storytelling con datos'
      ],
      'Liderazgo e Influencia Social': [
        'Desarrollar visión estratégica de IA para la organización',
        'Crear programa de liderazgo en transformación digital',
        'Establecer métricas de impacto social de la IA'
      ],
      'Creatividad e Innovación': [
        'Implementar sesiones de brainstorming sobre aplicaciones de IA',
        'Crear laboratorio de experimentación con IA',
        'Desarrollar cultura de innovación y experimentación'
      ],
      'Gestión de Datos y Privacidad': [
        'Establecer políticas de gobernanza de datos',
        'Implementar herramientas de protección de privacidad',
        'Crear protocolos de auditoría de datos'
      ],
      'Pensamiento Sistémico': [
        'Desarrollar mapas de procesos organizacionales',
        'Implementar análisis de impacto sistémico de IA',
        'Crear modelos de interdependencias organizacionales'
      ],
      'Inteligencia Emocional': [
        'Desarrollar habilidades de gestión del cambio',
        'Implementar programas de bienestar digital',
        'Crear espacios de reflexión sobre el impacto humano de la IA'
      ],
      'Pensamiento Computacional': [
        'Desarrollar habilidades de programación básica',
        'Implementar herramientas de visualización de datos',
        'Crear comprensión de algoritmos y su funcionamiento'
      ],
      'Alfabetización Digital': [
        'Actualizar herramientas y plataformas digitales',
        'Implementar formación en nuevas tecnologías',
        'Crear protocolos de seguridad digital'
      ],
      'Pensamiento Ético': [
        'Desarrollar marco ético para decisiones de IA',
        'Implementar comités de revisión ética',
        'Crear protocolos de transparencia y explicabilidad'
      ],
      'Sostenibilidad y Responsabilidad Social': [
        'Implementar métricas de impacto ambiental de IA',
        'Desarrollar políticas de responsabilidad social corporativa',
        'Crear iniciativas de IA para el bien común'
      ]
    };

    return actionMap[competencyName] || [
      'Desarrollar competencias específicas en esta área',
      'Buscar formación especializada',
      'Implementar prácticas de mejora continua'
    ];
  }
}
