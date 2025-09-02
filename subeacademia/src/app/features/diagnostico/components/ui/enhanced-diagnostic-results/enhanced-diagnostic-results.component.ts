import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { ScoringService } from '../../../services/scoring.service';
import { PdfService } from '../../../services/pdf.service';
import { ToastService } from '../../../../../core/ui/toast/toast.service';
import { Router } from '@angular/router';
import { DiagnosticFlowLoggerService } from '../../../../../core/services/diagnostic-flow-logger.service';

interface AIAnalysis {
  analysis: string;
  actionPlan: ActionPlanItem[];
  isFromAPI: boolean;
  error?: string;
}

interface ActionPlanItem {
  objetivo: string;
  acciones: string[];
  competencia: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  tiempoEstimado: string;
}

@Component({
  selector: 'app-enhanced-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enhanced-diagnostic-results.component.html',
  styleUrls: ['./enhanced-diagnostic-results.component.css']
})
export class EnhancedDiagnosticResultsComponent implements OnInit {
  private diagnosticStateService = inject(DiagnosticStateService);
  private generativeAiService = inject(GenerativeAiService);
  private scoringService = inject(ScoringService);
  private pdfService = inject(PdfService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private flowLogger = inject(DiagnosticFlowLoggerService);

  // Signals para el estado del componente
  diagnosticData = signal<any>(null);
  aiAnalysis = signal<AIAnalysis | null>(null);
  isLoading = signal<boolean>(true);
  isGenerating = signal<boolean>(false);
  error = signal<string | null>(null);

  // Datos calculados
  aresScores = signal<Record<string, number>>({});
  competencyScores = signal<Record<string, number>>({});
  overallScore = signal<number>(0);
  maturityLevel = signal<string>('');
  leadName = signal<string>('');
  companyInfo = signal<string>('');

  // Estados de UI
  activeTab = signal<'overview' | 'analysis' | 'action-plan'>('overview');

  ngOnInit(): void {
    // 🔍 REGISTRAR INICIO DEL PASO DE RESULTADOS
    this.flowLogger.logStepStarted('resultados');
    console.log('🔍 EnhancedDiagnosticResults: Iniciando paso de resultados');
    
    this.loadDiagnosticData();
  }

  async loadDiagnosticData(): Promise<void> {
    try {
      this.isLoading.set(true);
      console.log('🔍 EnhancedDiagnosticResults: Cargando datos del diagnóstico...');
      
      // Obtener datos del diagnóstico
      const data = this.diagnosticStateService.getDiagnosticData();
      if (!data) {
        throw new Error('No se encontraron datos del diagnóstico');
      }

      // 🔍 LOG DE VALIDACIÓN DE DATOS
      this.flowLogger.logDataValidation('resultados', data, {
        hasData: !!data,
        dataKeys: Object.keys(data || {}),
        timestamp: new Date().toISOString()
      });

      this.diagnosticData.set(data);
      
      // Extraer información del lead
      const leadName = data.lead?.nombre || 'Usuario';
      this.leadName.set(leadName);
      
      // Construir información de la empresa
      const industry = data.contexto?.industria || 'No especificado';
      const size = data.contexto?.tamanoEquipo || data.contexto?.tamanoEmpresa || 'No especificado';
      this.companyInfo.set(`${industry} • ${size} empleados`);

      console.log('🔍 EnhancedDiagnosticResults: Datos del diagnóstico cargados', {
        leadName,
        industry,
        size,
        hasAresData: !!data.ares?.respuestas,
        hasCompetenciasData: !!data.competencias?.niveles
      });

      // Calcular puntajes detallados
      await this.calculateDetailedScores(data);
      
      // Generar análisis con IA
      await this.generateAIAnalysis(data);
      
      this.isLoading.set(false);
      this.cdr.detectChanges();
      
      // 🔍 REGISTRAR COMPLETACIÓN DEL PASO
      this.flowLogger.logStepCompleted('resultados', {
        scoresCalculated: true,
        aiAnalysisGenerated: !!this.aiAnalysis(),
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('🔍 EnhancedDiagnosticResults: Error al cargar datos del diagnóstico', error);
      this.error.set(error instanceof Error ? error.message : 'Error desconocido');
      this.isLoading.set(false);
      
      // 🔍 REGISTRAR ERROR
      this.flowLogger.logStepFailed('resultados', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Métodos para acceder a Object desde la plantilla
  getObjectKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj || {});
  }

  getObjectEntries(obj: Record<string, any>): [string, any][] {
    return Object.entries(obj || {});
  }

  // Métodos auxiliares para la UI
  getObjectLength(obj: any): number {
    return Object.keys(obj || {}).length;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  setActiveTab(tab: 'overview' | 'analysis' | 'action-plan'): void {
    this.activeTab.set(tab);
  }

  getAresDimensions(): Array<{name: string, score: number, description: string}> {
    const dimensions = [];
    for (const [key, score] of Object.entries(this.aresScores())) {
      if (key !== 'promedio') {
        dimensions.push({
          name: this.getDimensionDisplayName(key),
          score: score,
          description: this.getDimensionDescription(key)
        });
      }
    }
    return dimensions.sort((a, b) => b.score - a.score);
  }

  getCompetencyDetails(): Array<{name: string, score: number, level: string, description: string}> {
    const details = [];
    for (const [key, score] of Object.entries(this.competencyScores())) {
      const competency = this.getCompetencyById(key);
      if (competency) {
        details.push({
          name: competency.nameKey,
          score: score,
          level: this.getCompetencyLevel(score),
          description: this.getCompetencyDescription(key)
        });
      }
    }
    return details.sort((a, b) => b.score - a.score);
  }

  getAresAverage(): number {
    const scores = Object.values(this.aresScores()).filter(score => typeof score === 'number');
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  getCompetencyAverage(): number {
    const scores = Object.values(this.competencyScores());
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  getOverallMaturityScore(): number {
    const aresAvg = this.getAresAverage();
    const compAvg = this.getCompetencyAverage();
    return Math.round((aresAvg + compAvg) / 2);
  }

  getActionPlanLength(): number {
    return this.aiAnalysis()?.actionPlan?.length || 0;
  }

  getTotalActions(): number {
    const plan = this.aiAnalysis()?.actionPlan;
    if (!plan) return 0;
    return plan.reduce((total, item) => total + item.acciones.length, 0);
  }

  getHighPriorityActions(): number {
    const plan = this.aiAnalysis()?.actionPlan;
    if (!plan) return 0;
    return plan.filter(item => item.prioridad === 'Alta').length;
  }

  hasValidActionPlan(): boolean {
    const analysis = this.aiAnalysis();
    return !!(analysis?.actionPlan && analysis.actionPlan.length > 0);
  }

  getActionPlan(): ActionPlanItem[] {
    return this.aiAnalysis()?.actionPlan || [];
  }

  // Métodos para colores y estados
  getScoreColorClass(score: number): string {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  }

  getStatusColorClass(score: number): string {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  }

  getStatusText(score: number): string {
    if (score >= 80) return '🟢 Fortaleza';
    if (score >= 60) return '🟡 En desarrollo';
    if (score >= 40) return '🟠 Necesita atención';
    return '🔴 Área crítica';
  }

  getCompetencyLevelColor(level: string): string {
    const colorMap: Record<string, string> = {
      'incipiente': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      'basico': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'intermedio': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'avanzado': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'lider': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
    };
    return colorMap[level] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
  }

  getCompetencyStatusColor(score: number): string {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  }

  getCompetencyStatusText(score: number): string {
    if (score >= 80) return '🟢 Competencia sólida';
    if (score >= 60) return '🟡 En desarrollo';
    if (score >= 40) return '🟠 Necesita mejora';
    return '🔴 Requiere atención urgente';
  }

  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'Alta': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      'Media': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'Baja': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    };
    return colorMap[priority] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
  }

  // Métodos auxiliares para obtener información
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

  private getCompetencyById(id: string): any {
    // Aquí deberías importar y usar el array COMPETENCIAS
    const competencyMap: Record<string, any> = {
      'c1_pensamiento_critico': { nameKey: 'Pensamiento Crítico' },
      'c2_resolucion_problemas': { nameKey: 'Resolución de Problemas Complejos' },
      'c3_alfabetizacion_datos': { nameKey: 'Alfabetización de Datos' },
      'c4_comunicacion': { nameKey: 'Comunicación Efectiva' },
      'c5_colaboracion': { nameKey: 'Colaboración y Trabajo en Equipo' },
      'c6_creatividad': { nameKey: 'Creatividad e Innovación' },
      'c7_diseno_tecnologico': { nameKey: 'Diseño Tecnológico' },
      'c8_automatizacion_agentes': { nameKey: 'Automatización y Agentes IA' },
      'c9_seguridad_privacidad': { nameKey: 'Seguridad y Privacidad' },
      'c10_etica_responsabilidad': { nameKey: 'Ética y Responsabilidad' },
      'c11_sostenibilidad': { nameKey: 'Sostenibilidad' },
      'c12_aprendizaje_continuo': { nameKey: 'Aprendizaje Continuo' },
      'c13_liderazgo_ia': { nameKey: 'Liderazgo en IA' }
    };
    return competencyMap[id] || { nameKey: id };
  }

  private getCompetencyLevel(score: number): string {
    if (score >= 80) return 'lider';
    if (score >= 60) return 'avanzado';
    if (score >= 40) return 'intermedio';
    if (score >= 20) return 'basico';
    return 'incipiente';
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

  private async calculateDetailedScores(data: any): Promise<void> {
    try {
      console.log('🔍 EnhancedDiagnosticResults: Calculando puntajes detallados...');
      
      // Calcular puntajes ARES por dimensión
      const aresScores = this.scoringService.computeAresScore(data);
      this.aresScores.set(aresScores);
      
      // Calcular puntajes de competencias
      const competencyScores = this.scoringService.computeCompetencyScores(data);
      const competencyScoresMap: Record<string, number> = {};
      competencyScores.forEach(comp => {
        competencyScoresMap[comp.competenciaId] = comp.puntaje;
      });
      this.competencyScores.set(competencyScoresMap);
      
      // Calcular puntaje general
      const aresAverage = aresScores.promedio || 0;
      const competencyAverage = competencyScores.length > 0 
        ? competencyScores.reduce((sum, comp) => sum + comp.puntaje, 0) / competencyScores.length 
        : 0;
      
      const overallScore = Math.round((aresAverage + competencyAverage) / 2);
      this.overallScore.set(overallScore);
      
      // Determinar nivel de madurez
      const maturityLevel = this.getMaturityLevel(overallScore);
      this.maturityLevel.set(maturityLevel);
      
      console.log('🔍 EnhancedDiagnosticResults: Puntajes calculados', {
        aresScores,
        competencyScores,
        overallScore,
        maturityLevel
      });
      
    } catch (error) {
      console.error('🔍 EnhancedDiagnosticResults: Error al calcular puntajes', error);
      throw error;
    }
  }

  private getMaturityLevel(score: number): string {
    if (score >= 85) return 'Líder';
    if (score >= 70) return 'Avanzado';
    if (score >= 50) return 'Intermedio';
    if (score >= 30) return 'Básico';
    return 'Incipiente';
  }

  private async generateAIAnalysis(data: any): Promise<void> {
    try {
      this.isGenerating.set(true);
      console.log('🔍 EnhancedDiagnosticResults: Generando análisis con IA...');
      
      const aiContent = await this.generativeAiService.generateActionPlan(data);
      
      // Parsear el contenido de IA para extraer el plan de acción estructurado
      const actionPlan = this.parseAIActionPlan(aiContent);
      
      this.aiAnalysis.set({
        analysis: aiContent,
        actionPlan: actionPlan,
        isFromAPI: true
      });
      
      console.log('🔍 EnhancedDiagnosticResults: Análisis de IA generado exitosamente', {
        contentLength: aiContent.length,
        actionPlanItems: actionPlan.length
      });
      
    } catch (error) {
      console.error('🔍 EnhancedDiagnosticResults: Error al generar análisis de IA', error);
      
      // Generar plan de acción de fallback
      const fallbackPlan = this.generateFallbackActionPlan();
      
      this.aiAnalysis.set({
        analysis: 'Error al generar análisis con IA. Se muestra un plan de acción de respaldo.',
        actionPlan: fallbackPlan,
        isFromAPI: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      this.isGenerating.set(false);
    }
  }

  private parseAIActionPlan(aiContent: string): ActionPlanItem[] {
    try {
      // Buscar secciones de objetivos estratégicos en el contenido de IA
      const objectiveMatches = aiContent.match(/\*\*Objetivo Estratégico \d+: ([^*]+)\*\*/g);
      
      if (!objectiveMatches) {
        return this.generateFallbackActionPlan();
      }
      
      const actionPlan: ActionPlanItem[] = [];
      
      objectiveMatches.forEach((match, index) => {
        const objective = match.replace(/\*\*Objetivo Estratégico \d+: |\*\*/g, '');
        
        // Extraer información del objetivo del contenido de IA
        const objectiveSection = this.extractObjectiveSection(aiContent, index + 1);
        
        actionPlan.push({
          objetivo: objective,
          acciones: this.extractActions(objectiveSection),
          competencia: this.extractCompetencies(objectiveSection),
          prioridad: this.extractPriority(objectiveSection),
          tiempoEstimado: this.extractTimeline(objectiveSection)
        });
      });
      
      return actionPlan.length > 0 ? actionPlan : this.generateFallbackActionPlan();
      
    } catch (error) {
      console.error('🔍 EnhancedDiagnosticResults: Error al parsear plan de acción de IA', error);
      return this.generateFallbackActionPlan();
    }
  }

  private extractObjectiveSection(content: string, objectiveNumber: number): string {
    const startMarker = `**Objetivo Estratégico ${objectiveNumber}:`;
    const endMarker = objectiveNumber < 3 ? `**Objetivo Estratégico ${objectiveNumber + 1}:` : '**Recomendaciones Específicas por Industria:';
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return '';
    
    const endIndex = content.indexOf(endMarker, startIndex);
    const section = endIndex !== -1 
      ? content.substring(startIndex, endIndex)
      : content.substring(startIndex);
    
    return section;
  }

  private extractActions(section: string): string[] {
    const actionMatches = section.match(/- ([^-]+)/g);
    if (!actionMatches) return ['Identificar acciones específicas para este objetivo'];
    
    return actionMatches
      .map(action => action.replace('- ', '').trim())
      .filter(action => action.length > 10)
      .slice(0, 5); // Máximo 5 acciones
  }

  private extractCompetencies(section: string): string {
    const competencyMatch = section.match(/Competencias a Desarrollar: ([^\n]+)/);
    return competencyMatch ? competencyMatch[1].trim() : 'Competencias generales';
  }

  private extractPriority(section: string): 'Alta' | 'Media' | 'Baja' {
    if (section.includes('Prioridad: Alta')) return 'Alta';
    if (section.includes('Prioridad: Baja')) return 'Baja';
    return 'Media';
  }

  private extractTimeline(section: string): string {
    const timelineMatch = section.match(/Tiempo Estimado: ([^\n]+)/);
    return timelineMatch ? timelineMatch[1].trim() : '3-4 meses';
  }

  private generateFallbackActionPlan(): ActionPlanItem[] {
    return [
      {
        objetivo: 'Desarrollar Estrategia de IA',
        acciones: [
          'Evaluar estado actual de la organización en IA',
          'Definir objetivos estratégicos claros y medibles',
          'Crear roadmap de implementación por fases',
          'Establecer métricas de éxito y KPIs'
        ],
        competencia: 'Estrategia',
        prioridad: 'Alta',
        tiempoEstimado: '2-3 meses'
      },
      {
        objetivo: 'Fortalecer Capacidades del Equipo',
        acciones: [
          'Identificar brechas de competencias en el equipo',
          'Diseñar programa de capacitación personalizado',
          'Implementar sistema de certificaciones',
          'Crear centro de excelencia en IA'
        ],
        competencia: 'Talento',
        prioridad: 'Alta',
        tiempoEstimado: '3-4 meses'
      },
      {
        objetivo: 'Implementar Soluciones Piloto',
        acciones: [
          'Seleccionar casos de uso prioritarios',
          'Desarrollar prototipos y pruebas de concepto',
          'Establecer métricas de impacto y ROI',
          'Crear plan de escalamiento'
        ],
        competencia: 'Implementación',
        prioridad: 'Media',
        tiempoEstimado: '4-6 meses'
      }
    ];
  }



  async downloadPDF(): Promise<void> {
    try {
      await this.pdfService.generateDiagnosticPDF(
        this.diagnosticData(),
        this.aiAnalysis(),
        this.leadName()
      );
      this.toastService.show('success', 'PDF descargado exitosamente');
    } catch (err) {
      this.toastService.show('error', 'Error al descargar el PDF');
    }
  }

  // Métodos para obtener información específica de objetivos
  getResourcesForObjective(objetivo: string): string {
    const resourceMap: Record<string, string> = {
      'Fortalecer la Gobernanza y Ética en IA': 'Consultoría especializada, capacitación del equipo, herramientas de monitoreo',
      'Desarrollar Capacidades Técnicas y de Talento': 'Presupuesto de capacitación, tiempo del equipo, plataformas de aprendizaje',
      'Implementar Soluciones de IA de Alto Impacto': 'Equipo de desarrollo, infraestructura tecnológica, datos de calidad',
      'Desarrollar Estrategia de IA': 'Análisis de mercado, consultoría estratégica, tiempo de planificación',
      'Fortalecer Capacidades del Equipo': 'Programas de capacitación, mentores, recursos de aprendizaje',
      'Implementar Soluciones Piloto': 'Desarrolladores, infraestructura, datos de prueba'
    };
    return resourceMap[objetivo] || 'Recursos específicos a definir según el contexto';
  }

  getMetricsForObjective(objetivo: string): string {
    const metricsMap: Record<string, string> = {
      'Fortalecer la Gobernanza y Ética en IA': 'Reducción del 50% en incidentes éticos, 100% de transparencia',
      'Desarrollar Capacidades Técnicas y de Talento': '80% del equipo certificado, reducción del 40% en tiempo de implementación',
      'Implementar Soluciones de IA de Alto Impacto': 'ROI positivo en 12 meses, mejora del 30% en eficiencia',
      'Desarrollar Estrategia de IA': 'Plan estratégico aprobado, objetivos medibles definidos',
      'Fortalecer Capacidades del Equipo': 'Competencias evaluadas, plan de desarrollo implementado',
      'Implementar Soluciones Piloto': 'Prototipos funcionales, métricas de impacto establecidas'
    };
    return metricsMap[objetivo] || 'Métricas específicas a definir según el objetivo';
  }

  getRisksForObjective(objetivo: string): string {
    const risksMap: Record<string, string> = {
      'Fortalecer la Gobernanza y Ética en IA': 'Resistencia al cambio, falta de recursos, complejidad regulatoria',
      'Desarrollar Capacidades Técnicas y de Talento': 'Rotación de personal, costos elevados, tiempo de implementación',
      'Implementar Soluciones de IA de Alto Impacto': 'Falla técnica, resistencia del usuario, problemas de datos',
      'Desarrollar Estrategia de IA': 'Cambios en el mercado, falta de alineación ejecutiva, recursos limitados',
      'Fortalecer Capacidades del Equipo': 'Falta de compromiso, recursos insuficientes, expectativas irreales',
      'Implementar Soluciones Piloto': 'Problemas técnicos, falta de adopción, métricas inadecuadas'
    };
    return risksMap[objetivo] || 'Riesgos específicos a evaluar según el contexto';
  }



  // Método público para regenerar el reporte
  async regenerateReport(): Promise<void> {
    try {
      console.log('🔍 EnhancedDiagnosticResults: Regenerando reporte...');
      this.isGenerating.set(true);
      const data = this.diagnosticData();
      if (data) {
        await this.generateAIAnalysis(data);
        this.toastService.show('success', 'Reporte regenerado exitosamente');
      }
    } catch (err) {
      console.error('Error al regenerar reporte:', err);
      this.toastService.show('error', 'Error al regenerar el reporte');
    } finally {
      this.isGenerating.set(false);
    }
  }

  // Método para parsear el contenido de IA y convertirlo en HTML estructurado
  parseAIContentToHTML(content: string): string {
    if (!content) return '';
    
    // Convertir Markdown básico a HTML estructurado
    let html = content
      // Títulos
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4">$1</h3>')
      
      // Separadores
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300 dark:border-gray-600">')
      
      // Negritas
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>')
      
      // Listas con bullets
      .replace(/^• (.*$)/gim, '<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-700 dark:text-gray-300">$1</li>')
      
      // Párrafos (solo si no son títulos, listas o separadores)
      .replace(/^([^#\-\*•\n\r\|].*$)/gim, '<p class="text-gray-700 dark:text-gray-300 mb-3">$1</p>');
    
    // Envolver listas
    html = html.replace(/(<li.*?<\/li>)/gs, '<ul class="list-disc ml-6 mb-4">$1</ul>');
    
    // Manejar tablas de manera más robusta
    const tableRegex = /\| (.*?) \| (.*?) \| (.*?) \|/g;
    let tableMatch;
    let tableRows = [];
    
    while ((tableMatch = tableRegex.exec(content)) !== null) {
      tableRows.push({
        semana: tableMatch[1].trim(),
        accion: tableMatch[2].trim(),
        responsable: tableMatch[3].trim()
      });
    }
    
    if (tableRows.length > 0) {
      let tableHTML = '<div class="overflow-x-auto mb-6"><table class="w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">';
      tableHTML += '<thead><tr class="bg-gray-100 dark:bg-gray-800">';
      tableHTML += '<th class="px-4 py-3 border border-gray-300 dark:border-gray-600 font-semibold text-gray-900 dark:text-gray-100 text-left">Semana</th>';
      tableHTML += '<th class="px-4 py-3 border border-gray-300 dark:border-gray-600 font-semibold text-gray-900 dark:text-gray-100 text-left">Acción</th>';
      tableHTML += '<th class="px-4 py-3 border border-gray-300 dark:border-gray-600 font-semibold text-gray-900 dark:text-gray-100 text-left">Responsable</th>';
      tableHTML += '</tr></thead><tbody>';
      
      tableRows.forEach(row => {
        tableHTML += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-600">';
        tableHTML += `<td class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">${row.semana}</td>`;
        tableHTML += `<td class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">${row.accion}</td>`;
        tableHTML += `<td class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">${row.responsable}</td>`;
        tableHTML += '</tr>';
      });
      
      tableHTML += '</tbody></table></div>';
      
      // Reemplazar la tabla en el HTML
      html = html.replace(/\| (.*?) \| (.*?) \| (.*?) \|/g, tableHTML);
    }
    
    // Limpiar HTML duplicado y mejorar espaciado
    html = html
      .replace(/<p><\/p>/g, '') // Eliminar párrafos vacíos
      .replace(/\n\s*\n/g, '\n') // Limpiar líneas en blanco múltiples
      .replace(/<p class="text-gray-700 dark:text-gray-300 mb-3">\s*<\/p>/g, ''); // Eliminar párrafos con solo espacios
    
    return html;
  }
}
