import { Injectable } from '@angular/core';
import { DiagnosticoFormValue } from '../data/diagnostic.models';
import { GenerativeAiService } from '../../../core/ai/generative-ai.service';
import { ScoringService } from './scoring.service';

export interface DetailedAnalysis {
  overview: {
    overallScore: number;
    maturityLevel: string;
    positionDescription: string;
    industryInsights: string;
  };
  aresAnalysis: {
    dimensions: Array<{
      name: string;
      score: number;
      status: string;
      description: string;
      recommendations: string[];
    }>;
    average: number;
    strengths: string[];
    weaknesses: string[];
  };
  competencyAnalysis: {
    competencies: Array<{
      name: string;
      level: string;
      score: number;
      status: string;
      description: string;
      developmentAreas: string[];
    }>;
    average: number;
    topStrengths: string[];
    topOpportunities: string[];
  };
  actionPlan: {
    objectives: Array<{
      title: string;
      description: string;
      priority: 'Alta' | 'Media' | 'Baja';
      timeline: string;
      actions: string[];
      competencies: string[];
      resources: string[];
      metrics: string[];
      risks: string[];
    }>;
    summary: {
      totalObjectives: number;
      totalActions: number;
      highPriorityCount: number;
      estimatedTimeline: string;
    };
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    industrySpecific: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosticAnalysisService {
  constructor(
    private generativeAiService: GenerativeAiService,
    private scoringService: ScoringService
  ) {}

  async generateDetailedAnalysis(diagnosticData: DiagnosticoFormValue): Promise<DetailedAnalysis> {
    try {
      // Generar análisis con IA
      const aiContent = await this.generativeAiService.generateActionPlan(diagnosticData);
      
      // Calcular puntajes
      const aresScores = this.scoringService.computeAresScore(diagnosticData);
      const competencyScores = this.scoringService.computeCompetencyScores(diagnosticData);
      
      // Construir análisis detallado
      const analysis: DetailedAnalysis = {
        overview: this.buildOverview(diagnosticData, aresScores, competencyScores),
        aresAnalysis: this.buildAresAnalysis(aresScores),
        competencyAnalysis: this.buildCompetencyAnalysis(competencyScores),
        actionPlan: this.buildActionPlan(aiContent, diagnosticData),
        recommendations: this.buildRecommendations(diagnosticData, aresScores, competencyScores)
      };
      
      return analysis;
      
    } catch (error) {
      console.error('Error generando análisis detallado:', error);
      return this.generateFallbackAnalysis(diagnosticData);
    }
  }

  private buildOverview(data: DiagnosticoFormValue, aresScores: any, competencyScores: any[]) {
    const aresAverage = aresScores.promedio || 0;
    const competencyAverage = competencyScores.length > 0 
      ? competencyScores.reduce((sum, comp) => sum + comp.puntaje, 0) / competencyScores.length 
      : 0;
    
    const overallScore = Math.round((aresAverage + competencyAverage) / 2);
    const maturityLevel = this.getMaturityLevel(overallScore);
    const positionDescription = this.getPositionDescription(overallScore);
    
    return {
      overallScore,
      maturityLevel,
      positionDescription,
      industryInsights: this.getIndustryInsights(data.contexto?.industria || '')
    };
  }

  private buildAresAnalysis(aresScores: any) {
    const dimensions = [];
    const strengths = [];
    const weaknesses = [];
    
    for (const [key, score] of Object.entries(aresScores)) {
      if (key !== 'promedio' && typeof score === 'number') {
        const dimension = {
          name: this.getDimensionDisplayName(key),
          score: score,
          status: this.getAresStatus(score),
          description: this.getDimensionDescription(key),
          recommendations: this.getAresRecommendations(key, score)
        };
        
        dimensions.push(dimension);
        
        if (score >= 80) {
          strengths.push(dimension.name);
        } else if (score <= 40) {
          weaknesses.push(dimension.name);
        }
      }
    }
    
    return {
      dimensions: dimensions.sort((a, b) => b.score - a.score),
      average: aresScores.promedio || 0,
      strengths,
      weaknesses
    };
  }

  private buildCompetencyAnalysis(competencyScores: any[]) {
    const competencies = [];
    const topStrengths = [];
    const topOpportunities = [];
    
    for (const comp of competencyScores) {
      const competency = {
        name: this.getCompetencyDisplayName(comp.competenciaId),
        level: comp.nivel,
        score: comp.puntaje,
        status: this.getCompetencyStatus(comp.puntaje),
        description: this.getCompetencyDescription(comp.competenciaId),
        developmentAreas: this.getCompetencyDevelopmentAreas(comp.competenciaId, comp.puntaje)
      };
      
      competencies.push(competency);
      
      if (comp.puntaje >= 80) {
        topStrengths.push(competency.name);
      } else if (comp.puntaje <= 40) {
        topOpportunities.push(competency.name);
      }
    }
    
    const average = competencyScores.length > 0 
      ? Math.round(competencyScores.reduce((sum, comp) => sum + comp.puntaje, 0) / competencyScores.length)
      : 0;
    
    return {
      competencies: competencies.sort((a, b) => b.score - a.score),
      average,
      topStrengths: topStrengths.slice(0, 3),
      topOpportunities: topOpportunities.slice(0, 3)
    };
  }

  private buildActionPlan(aiContent: string, data: DiagnosticoFormValue) {
    // Parsear el contenido de IA para extraer objetivos
    const objectives = this.parseObjectivesFromAI(aiContent);
    
    const summary = {
      totalObjectives: objectives.length,
      totalActions: objectives.reduce((sum, obj) => sum + obj.actions.length, 0),
      highPriorityCount: objectives.filter(obj => obj.priority === 'Alta').length,
      estimatedTimeline: this.estimateOverallTimeline(objectives)
    };
    
    return { objectives, summary };
  }

  private buildRecommendations(data: DiagnosticoFormValue, aresScores: any, competencyScores: any[]) {
    const aresAverage = aresScores.promedio || 0;
    const competencyAverage = competencyScores.length > 0 
      ? competencyScores.reduce((sum, comp) => sum + comp.puntaje, 0) / competencyScores.length 
      : 0;
    
    return {
      immediate: this.getImmediateRecommendations(aresAverage, competencyAverage),
      shortTerm: this.getShortTermRecommendations(aresAverage, competencyAverage),
      longTerm: this.getLongTermRecommendations(aresAverage, competencyAverage),
      industrySpecific: this.getIndustrySpecificRecommendations(data.contexto?.industria || '')
    };
  }

  // Métodos auxiliares
  private getMaturityLevel(score: number): string {
    if (score >= 85) return 'Líder';
    if (score >= 70) return 'Avanzado';
    if (score >= 50) return 'Intermedio';
    if (score >= 30) return 'Básico';
    return 'Incipiente';
  }

  private getPositionDescription(score: number): string {
    if (score >= 85) return 'excelente';
    if (score >= 70) return 'sólida';
    if (score >= 50) return 'prometedora';
    if (score >= 30) return 'inicial';
    return 'incipiente';
  }

  private getAresStatus(score: number): string {
    if (score >= 80) return '🟢 Fortaleza';
    if (score >= 60) return '🟡 En desarrollo';
    if (score >= 40) return '🟠 Necesita atención';
    return '🔴 Área crítica';
  }

  private getCompetencyStatus(score: number): string {
    if (score >= 80) return '🟢 Competencia sólida';
    if (score >= 60) return '🟡 En desarrollo';
    if (score >= 40) return '🟠 Necesita mejora';
    return '🔴 Requiere atención urgente';
  }

  private getDimensionDisplayName(dimension: string): string {
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

  private getDimensionDescription(dimension: string): string {
    const descriptions: Record<string, string> = {
      'adopcion': 'Capacidad para implementar y escalar soluciones de IA',
      'riesgos': 'Identificación y gestión de riesgos asociados a la IA',
      'etica': 'Uso responsable y ético de la IA en la organización',
      'seguridad': 'Protección de datos y sistemas de IA',
      'capacidad': 'Habilidades técnicas para desarrollar soluciones de IA',
      'datos': 'Calidad y gobernanza de los datos utilizados en IA',
      'gobernanza': 'Marco de control y supervisión de iniciativas de IA',
      'valor': 'Medición del impacto y ROI de las soluciones de IA',
      'operacion': 'Monitoreo y mantenimiento de sistemas de IA',
      'talento': 'Desarrollo y retención de talento especializado en IA',
      'tecnologia': 'Infraestructura y arquitectura tecnológica para IA',
      'integracion': 'Integración de IA con sistemas existentes',
      'cumplimiento': 'Cumplimiento de regulaciones y estándares',
      'transparencia': 'Explicabilidad y transparencia de decisiones de IA',
      'sostenibilidad': 'Impacto ambiental y social de las soluciones de IA'
    };
    return descriptions[dimension] || 'Descripción no disponible';
  }

  private getAresRecommendations(dimension: string, score: number): string[] {
    if (score >= 80) {
      return [
        'Mantener el alto nivel de madurez',
        'Documentar mejores prácticas',
        'Compartir conocimiento con otras áreas'
      ];
    } else if (score >= 60) {
      return [
        'Identificar oportunidades de mejora incremental',
        'Establecer métricas de seguimiento',
        'Implementar procesos de mejora continua'
      ];
    } else if (score >= 40) {
      return [
        'Desarrollar plan de mejora específico',
        'Asignar recursos y responsables',
        'Implementar pilotos de mejora'
      ];
    } else {
      return [
        'Priorizar como área crítica',
        'Desarrollar plan de acción urgente',
        'Considerar consultoría especializada'
      ];
    }
  }

  private getCompetencyDisplayName(id: string): string {
    const competencyNames: Record<string, string> = {
      'c1_pensamiento_critico': 'Pensamiento Crítico',
      'c2_resolucion_problemas': 'Resolución de Problemas Complejos',
      'c3_alfabetizacion_datos': 'Alfabetización de Datos',
      'c4_comunicacion': 'Comunicación Efectiva',
      'c5_colaboracion': 'Colaboración y Trabajo en Equipo',
      'c6_creatividad': 'Creatividad e Innovación',
      'c7_diseno_tecnologico': 'Diseño Tecnológico',
      'c8_automatizacion_agentes': 'Automatización y Agentes IA',
      'c9_seguridad_privacidad': 'Seguridad y Privacidad',
      'c10_etica_responsabilidad': 'Ética y Responsabilidad',
      'c11_sostenibilidad': 'Sostenibilidad',
      'c12_aprendizaje_continuo': 'Aprendizaje Continuo',
      'c13_liderazgo_ia': 'Liderazgo en IA'
    };
    return competencyNames[id] || id;
  }

  private getCompetencyDescription(id: string): string {
    const descriptions: Record<string, string> = {
      'c1_pensamiento_critico': 'Análisis crítico y evaluación de información',
      'c2_resolucion_problemas': 'Resolución de problemas complejos y toma de decisiones',
      'c3_alfabetizacion_datos': 'Interpretación y análisis de datos',
      'c4_comunicacion': 'Comunicación clara y efectiva',
      'c5_colaboracion': 'Trabajo en equipo y colaboración efectiva',
      'c6_creatividad': 'Generación de ideas innovadoras',
      'c7_diseno_tecnologico': 'Diseño de soluciones tecnológicas',
      'c8_automatizacion_agentes': 'Automatización de procesos con IA',
      'c9_seguridad_privacidad': 'Protección de datos y sistemas',
      'c10_etica_responsabilidad': 'Uso ético y responsable de la tecnología',
      'c11_sostenibilidad': 'Desarrollo de soluciones sostenibles',
      'c12_aprendizaje_continuo': 'Actualización constante de conocimientos',
      'c13_liderazgo_ia': 'Liderazgo en iniciativas de IA'
    };
    return descriptions[id] || 'Descripción no disponible';
  }

  private getCompetencyDevelopmentAreas(id: string, score: number): string[] {
    if (score >= 80) {
      return [
        'Mentorear a otros en esta competencia',
        'Compartir mejores prácticas',
        'Contribuir al desarrollo organizacional'
      ];
    } else if (score >= 60) {
      return [
        'Identificar áreas específicas de mejora',
        'Buscar oportunidades de práctica',
        'Solicitar feedback de colegas'
      ];
    } else if (score >= 40) {
      return [
        'Desarrollar plan de mejora personalizado',
        'Buscar mentoría o coaching',
        'Participar en programas de capacitación'
      ];
    } else {
      return [
        'Priorizar como competencia crítica',
        'Buscar desarrollo intensivo',
        'Considerar certificaciones'
      ];
    }
  }

  private parseObjectivesFromAI(aiContent: string): any[] {
    // Implementar parsing del contenido de IA
    // Por ahora retornar objetivos de ejemplo
    return [
      {
        title: 'Fortalecer la Gobernanza y Ética en IA',
        description: 'Desarrollar un marco robusto de gobernanza',
        priority: 'Alta' as const,
        timeline: '3-4 meses',
        actions: [
          'Establecer comité de ética en IA',
          'Desarrollar políticas claras',
          'Implementar auditorías regulares'
        ],
        competencies: ['Ética y Responsabilidad', 'Gobernanza'],
        resources: 'Consultoría especializada, capacitación del equipo',
        metrics: 'Reducción del 50% en incidentes éticos',
        risks: 'Resistencia al cambio, falta de recursos'
      }
    ];
  }

  private estimateOverallTimeline(objectives: any[]): string {
    const timelines = objectives.map(obj => {
      const match = obj.timeline.match(/(\d+)-(\d+)/);
      if (match) {
        return Math.max(parseInt(match[1]), parseInt(match[2]));
      }
      return 3;
    });
    
    const maxMonths = Math.max(...timelines);
    return `${maxMonths} meses`;
  }

  private getImmediateRecommendations(aresAverage: number, competencyAverage: number): string[] {
    const recommendations = [];
    
    if (aresAverage < 50) {
      recommendations.push('Realizar evaluación detallada de capacidades ARES');
    }
    
    if (competencyAverage < 50) {
      recommendations.push('Identificar competencias críticas para desarrollo inmediato');
    }
    
    recommendations.push('Establecer comité de transformación digital');
    recommendations.push('Definir presupuesto inicial para iniciativas de IA');
    
    return recommendations;
  }

  private getShortTermRecommendations(aresAverage: number, competencyAverage: number): string[] {
    const recommendations = [];
    
    if (aresAverage < 60) {
      recommendations.push('Implementar programa de mejora de capacidades ARES');
    }
    
    if (competencyAverage < 60) {
      recommendations.push('Desarrollar plan de capacitación del equipo');
    }
    
    recommendations.push('Crear roadmap de implementación de IA');
    recommendations.push('Establecer métricas de seguimiento');
    
    return recommendations;
  }

  private getLongTermRecommendations(aresAverage: number, competencyAverage: number): string[] {
    const recommendations = [];
    
    recommendations.push('Desarrollar centro de excelencia en IA');
    recommendations.push('Implementar arquitectura de IA escalable');
    recommendations.push('Establecer cultura de innovación continua');
    recommendations.push('Crear ecosistema de partners tecnológicos');
    
    return recommendations;
  }

  private getIndustryInsights(industry: string): string {
    const insights: Record<string, string> = {
      'Biotecnología': 'Enfoque en ética de IA para investigación médica y cumplimiento regulatorio',
      'Tecnología': 'Priorizar innovación continua y desarrollo de productos basados en IA',
      'Finanzas': 'Enfoque en seguridad, cumplimiento normativo y detección de fraudes',
      'Salud': 'Priorizar privacidad de datos y precisión diagnóstica',
      'Educación': 'Enfoque en personalización del aprendizaje y evaluación ética',
      'Manufactura': 'Priorizar automatización inteligente y optimización de procesos'
    };
    
    return insights[industry] || 'Considerar regulaciones específicas de la industria';
  }

  private getIndustrySpecificRecommendations(industry: string): string[] {
    const recommendations: Record<string, string[]> = {
      'Biotecnología': [
        'Implementar protocolos de ética en investigación con IA',
        'Desarrollar sistemas de cumplimiento regulatorio',
        'Establecer auditorías de algoritmos médicos'
      ],
      'Tecnología': [
        'Crear cultura de innovación rápida',
        'Implementar MLOps y CI/CD para IA',
        'Desarrollar capacidades de escalamiento'
      ],
      'Finanzas': [
        'Implementar sistemas de detección de fraudes',
        'Desarrollar capacidades de cumplimiento normativo',
        'Establecer protocolos de seguridad avanzados'
      ],
      'Salud': [
        'Implementar sistemas de privacidad de datos',
        'Desarrollar capacidades de diagnóstico asistido',
        'Establecer protocolos de validación clínica'
      ],
      'Educación': [
        'Implementar sistemas de aprendizaje personalizado',
        'Desarrollar capacidades de evaluación adaptativa',
        'Establecer protocolos de equidad educativa'
      ],
      'Manufactura': [
        'Implementar sistemas de mantenimiento predictivo',
        'Desarrollar capacidades de optimización de procesos',
        'Establecer protocolos de calidad automatizada'
      ]
    };
    
    return recommendations[industry] || [
      'Identificar casos de uso específicos de la industria',
      'Desarrollar capacidades de cumplimiento regulatorio',
      'Establecer alianzas con expertos del sector'
    ];
  }

  private generateFallbackAnalysis(data: DiagnosticoFormValue): DetailedAnalysis {
    return {
      overview: {
        overallScore: 0,
        maturityLevel: 'Incipiente',
        positionDescription: 'incipiente',
        industryInsights: 'Análisis no disponible'
      },
      aresAnalysis: {
        dimensions: [],
        average: 0,
        strengths: [],
        weaknesses: []
      },
      competencyAnalysis: {
        competencies: [],
        average: 0,
        topStrengths: [],
        topOpportunities: []
      },
      actionPlan: {
        objectives: [],
        summary: {
          totalObjectives: 0,
          totalActions: 0,
          highPriorityCount: 0,
          estimatedTimeline: 'No disponible'
        }
      },
      recommendations: {
        immediate: ['Regenerar el reporte para obtener análisis detallado'],
        shortTerm: [],
        longTerm: [],
        industrySpecific: []
      }
    };
  }
}
