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
        hasCompetenciasData: !!data.competencias?.niveles,
        hasLeadData: !!data.lead,
        hasContextData: !!data.contexto,
        hasObjetivo: !!data.objetivo
      });

      // Calcular puntajes
      this.calculateScores(data);
      
      // Generar análisis con IA
      await this.generateAIAnalysis(data);
      
      // 🔍 REGISTRAR COMPLETACIÓN EXITOSA DEL PASO
      this.flowLogger.logStepCompleted('resultados', {
        scoresCalculated: true,
        aiAnalysisGenerated: !!this.aiAnalysis(),
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      this.error.set(errorMessage);
      
      // 🔍 REGISTRAR FALLO DEL PASO
      this.flowLogger.logStepFailed('resultados', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      console.error('🔍 EnhancedDiagnosticResults: Error al cargar datos del diagnóstico', {
        error: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  // Métodos para acceder a Object desde la plantilla
  getObjectKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj || {});
  }

  getObjectEntries(obj: Record<string, any>): [string, any][] {
    return Object.entries(obj || {});
  }

  getObjectLength(obj: Record<string, any>): number {
    return Object.keys(obj || {}).length;
  }

  private calculateScores(data: any): void {
    // Calcular puntajes ARES
    const aresScores: Record<string, number> = {};
    if (data.ares?.respuestas) {
      Object.entries(data.ares.respuestas).forEach(([key, value]) => {
        aresScores[key] = (value as number) * 20; // Convertir de 1-5 a 0-100
      });
    }
    this.aresScores.set(aresScores);

    // Calcular puntajes de competencias
    const competencyScores: Record<string, number> = {};
    if (data.competencias?.niveles) {
      Object.entries(data.competencias.niveles).forEach(([key, value]) => {
        const nivel = value as string;
        competencyScores[key] = this.getNivelScore(nivel);
      });
    }
    this.competencyScores.set(competencyScores);

    // Calcular puntaje general
    const allScores = [...Object.values(aresScores), ...Object.values(competencyScores)];
    const average = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;
    this.overallScore.set(Math.round(average));

    // Determinar nivel de madurez
    this.maturityLevel.set(this.getMaturityLevel(average));
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
    if (score >= 80) return 'Líder';
    if (score >= 60) return 'Avanzado';
    if (score >= 40) return 'Intermedio';
    if (score >= 20) return 'Básico';
    return 'Incipiente';
  }

  public async generateAIAnalysis(data: any): Promise<void> {
    try {
      this.isGenerating.set(true);
      console.log('🔍 EnhancedDiagnosticResults: Iniciando generación de análisis con IA...');
      
      // 🔍 LOG DE INICIO DE LLAMADA A API
      this.flowLogger.logApiCall('resultados', {
        url: 'https://apisube-smoky.vercel.app/api/azure/generate',
        method: 'POST',
        requestSize: JSON.stringify(data).length
      });
      
      const startTime = Date.now();
      const analysis = await this.generativeAiService.generateActionPlan(data);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('🔍 EnhancedDiagnosticResults: Análisis de IA generado exitosamente', {
        responseTime: `${responseTime}ms`,
        analysisLength: analysis.length,
        timestamp: new Date().toISOString()
      });
      
      // 🔍 LOG DE LLAMADA A API EXITOSA
      this.flowLogger.logApiCall('resultados', {
        url: 'https://apisube-smoky.vercel.app/api/azure/generate',
        method: 'POST',
        requestSize: JSON.stringify(data).length
      }, {
        responseTime,
        analysisLength: analysis.length,
        success: true
      });
      
      // Parsear la respuesta de la IA (asumiendo que devuelve markdown)
      const actionPlan = this.parseActionPlanFromMarkdown(analysis);
      
      this.aiAnalysis.set({
        analysis: analysis,
        actionPlan: actionPlan,
        isFromAPI: true
      });
      
      console.log('🔍 EnhancedDiagnosticResults: Plan de acción parseado', {
        actionPlanItems: actionPlan.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('🔍 EnhancedDiagnosticResults: Error generando análisis con IA:', {
        error: err,
        errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // 🔍 LOG DE ERROR EN LLAMADA A API
      this.flowLogger.logApiCall('resultados', {
        url: 'https://apisube-smoky.vercel.app/api/azure/generate',
        method: 'POST',
        requestSize: JSON.stringify(data).length
      }, undefined, {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      this.aiAnalysis.set({
        analysis: 'Error al generar análisis con IA. Por favor, intenta de nuevo.',
        actionPlan: [],
        isFromAPI: false,
        error: 'Error de conexión con IA'
      });
    } finally {
      this.isGenerating.set(false);
    }
  }

  private parseActionPlanFromMarkdown(markdown: string): ActionPlanItem[] {
    const actionPlan: ActionPlanItem[] = [];
    
    // Buscar objetivos en el markdown
    const objectiveRegex = /\*\*Objetivo (\d+):\s*([^*]+)\*\*/g;
    let match;
    
    while ((match = objectiveRegex.exec(markdown)) !== null) {
      const objectiveNumber = match[1];
      const objectiveTitle = match[2].trim();
      
      // Buscar acciones clave para este objetivo
      const actions: string[] = [];
      const actionsRegex = new RegExp(`\\*\\*Objetivo ${objectiveNumber}:[^*]*\\*\\*[\\s\\S]*?\\*\\*Acciones Clave:\\*\\*([\\s\\S]*?)(?=\\*\\*Objetivo|\\*\\*Prioridad|\\*\\*Recomendaciones|$)`);
      const actionsMatch = markdown.match(actionsRegex);
      
      if (actionsMatch && actionsMatch[1]) {
        const actionsText = actionsMatch[1];
        const actionItems = actionsText.match(/- ([^-]+)/g);
        if (actionItems) {
          actionItems.forEach(item => {
            actions.push(item.replace('- ', '').trim());
          });
        }
      }
      
      // Buscar prioridad
      const priorityRegex = new RegExp(`\\*\\*Objetivo ${objectiveNumber}:[^*]*\\*\\*[\\s\\S]*?\\*\\*Prioridad:\\*\\*\\s*(Alta|Media|Baja)`);
      const priorityMatch = markdown.match(priorityRegex);
      const priority = priorityMatch ? (priorityMatch[1] as 'Alta' | 'Media' | 'Baja') : 'Media';
      
      // Buscar tiempo estimado
      const timeRegex = new RegExp(`\\*\\*Objetivo ${objectiveNumber}:[^*]*\\*\\*[\\s\\S]*?\\*\\*Tiempo Estimado:\\*\\*\\s*([^*]+)`);
      const timeMatch = markdown.match(timeRegex);
      const tiempoEstimado = timeMatch ? timeMatch[1].trim() : '3-6 meses';
      
      // Determinar competencia basada en el título del objetivo
      let competencia = 'General';
      if (objectiveTitle.toLowerCase().includes('gobernanza') || objectiveTitle.toLowerCase().includes('ética')) {
        competencia = 'Gobernanza';
      } else if (objectiveTitle.toLowerCase().includes('competencias') || objectiveTitle.toLowerCase().includes('equipo') || objectiveTitle.toLowerCase().includes('formación')) {
        competencia = 'Desarrollo de Talento';
      } else if (objectiveTitle.toLowerCase().includes('implementación') || objectiveTitle.toLowerCase().includes('metodologías') || objectiveTitle.toLowerCase().includes('herramientas')) {
        competencia = 'Implementación';
      }
      
      actionPlan.push({
        objetivo: objectiveTitle,
        acciones: actions.length > 0 ? actions : ['Acción específica a definir'],
        competencia,
        prioridad: priority,
        tiempoEstimado: tiempoEstimado
      });
    }
    
    // Si no se encontraron objetivos estructurados, crear uno genérico
    if (actionPlan.length === 0) {
      actionPlan.push({
        objetivo: 'Desarrollar Estrategia de IA',
        acciones: ['Evaluar estado actual', 'Definir objetivos', 'Crear roadmap'],
        competencia: 'Estrategia',
        prioridad: 'Alta',
        tiempoEstimado: '2-3 meses'
      });
    }
    
    return actionPlan;
  }

  async regenerateReport(): Promise<void> {
    try {
      this.isGenerating.set(true);
      const data = this.diagnosticData();
      if (data) {
        await this.generateAIAnalysis(data);
        this.toastService.show('success', 'Reporte regenerado exitosamente');
      }
    } catch (err) {
      this.toastService.show('error', 'Error al regenerar el reporte');
    } finally {
      this.isGenerating.set(false);
    }
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

  setActiveTab(tab: 'overview' | 'analysis' | 'action-plan'): void {
    this.activeTab.set(tab);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getCurrentDate(): Date {
    return new Date();
  }

  // Método helper para verificar si el análisis de IA está disponible
  hasValidActionPlan(): boolean {
    const analysis = this.aiAnalysis();
    return !!(analysis?.actionPlan && analysis.actionPlan.length > 0);
  }

  // Método helper para obtener el plan de acción de forma segura
  getActionPlan(): ActionPlanItem[] {
    const analysis = this.aiAnalysis();
    return analysis?.actionPlan || [];
  }

  // Métodos para el framework ARES
  getAresDimensions(): Array<{name: string, score: number, description: string}> {
    const dimensions: Record<string, {name: string, scores: number[], description: string}> = {
      'adopcion': { name: 'Adopción y Escalamiento', scores: [], description: 'Capacidad de adoptar y escalar IA en la organización' },
      'riesgos': { name: 'Gestión de Riesgos', scores: [], description: 'Identificación y mitigación de riesgos de IA' },
      'etica': { name: 'Ética y Responsabilidad', scores: [], description: 'Principios éticos y responsabilidad en el uso de IA' },
      'seguridad': { name: 'Seguridad y Privacidad', scores: [], description: 'Protección de datos y sistemas de IA' },
      'capacidad': { name: 'Capacidades de Desarrollo', scores: [], description: 'Habilidades técnicas para desarrollar IA' },
      'datos': { name: 'Gobierno de Datos', scores: [], description: 'Gestión y calidad de datos para IA' },
      'gobernanza': { name: 'Gobernanza ARES', scores: [], description: 'Estructura de gobierno para IA' },
      'valor': { name: 'Métricas de Valor', scores: [], description: 'Medición del valor generado por IA' },
      'operacion': { name: 'Operación y Monitoreo', scores: [], description: 'Operación y monitoreo de sistemas de IA' },
      'talento': { name: 'Gestión del Talento', scores: [], description: 'Desarrollo y retención de talento en IA' },
      'tecnologia': { name: 'Arquitectura Tecnológica', scores: [], description: 'Infraestructura tecnológica para IA' },
      'integracion': { name: 'Integración de Sistemas', scores: [], description: 'Integración de IA con sistemas existentes' },
      'cumplimiento': { name: 'Cumplimiento Normativo', scores: [], description: 'Cumplimiento de regulaciones de IA' },
      'transparencia': { name: 'Transparencia y Explicabilidad', scores: [], description: 'Transparencia en decisiones de IA' },
      'sostenibilidad': { name: 'Sostenibilidad', scores: [], description: 'Impacto ambiental y social de IA' }
    };

    // Agrupar puntajes por dimensión
    const data = this.diagnosticData();
    if (data?.ares?.respuestas) {
      Object.entries(data.ares.respuestas).forEach(([key, value]) => {
        if (value !== null && typeof value === 'number') {
          // Buscar la dimensión del item
          const item = this.findAresItem(key);
          if (item && dimensions[item.dimension]) {
            dimensions[item.dimension].scores.push(value * 20); // Convertir de 1-5 a 0-100
          }
        }
      });
    }

    // Calcular promedio por dimensión
    return Object.entries(dimensions).map(([key, dim]) => ({
      name: dim.name,
      score: dim.scores.length > 0 ? Math.round(dim.scores.reduce((sum, score) => sum + score, 0) / dim.scores.length) : 0,
      description: dim.description
    })).filter(dim => dim.score > 0);
  }

  private findAresItem(id: string): any {
    // Importar ARES_ITEMS desde el servicio o crear una referencia local
    const aresItems = [
      { id: 'adopcion_01', dimension: 'adopcion' },
      { id: 'adopcion_02', dimension: 'adopcion' },
      { id: 'riesgos_01', dimension: 'riesgos' },
      { id: 'etica_01', dimension: 'etica' },
      { id: 'seguridad_01', dimension: 'seguridad' },
      { id: 'capacidad_01', dimension: 'capacidad' },
      { id: 'datos_01', dimension: 'datos' },
      { id: 'gobernanza_01', dimension: 'gobernanza' },
      { id: 'valor_01', dimension: 'valor' },
      { id: 'operacion_01', dimension: 'operacion' },
      { id: 'talento_01', dimension: 'talento' },
      { id: 'tecnologia_01', dimension: 'tecnologia' },
      { id: 'integracion_01', dimension: 'integracion' },
      { id: 'cumplimiento_01', dimension: 'cumplimiento' },
      { id: 'transparencia_01', dimension: 'transparencia' },
      { id: 'sostenibilidad_01', dimension: 'sostenibilidad' }
    ];
    return aresItems.find(item => item.id === id);
  }

  // Métodos para competencias
  getCompetencyDetails(): Array<{name: string, level: string, score: number, description: string}> {
    const competencies = [
      { id: 'c1_pensamiento_critico', name: 'Pensamiento Crítico y Análisis', description: 'Capacidad de analizar problemas complejos y generar soluciones innovadoras' },
      { id: 'c2_resolucion_problemas', name: 'Resolución de Problemas Complejos', description: 'Habilidad para abordar desafíos multidimensionales' },
      { id: 'c3_alfabetizacion_datos', name: 'Alfabetización de Datos', description: 'Capacidad para interpretar y analizar información basada en datos' },
      { id: 'c4_comunicacion', name: 'Comunicación Efectiva', description: 'Habilidad para transmitir ideas complejas de manera clara' },
      { id: 'c5_colaboracion', name: 'Colaboración y Trabajo en Equipo', description: 'Capacidad para trabajar en equipos diversos y multidisciplinarios' },
      { id: 'c6_creatividad', name: 'Creatividad e Innovación', description: 'Habilidad para generar ideas originales y soluciones innovadoras' },
      { id: 'c7_diseno_tecnologico', name: 'Diseño Tecnológico', description: 'Capacidad para crear soluciones tecnológicas centradas en el usuario' },
      { id: 'c8_automatizacion_agentes', name: 'Automatización y Agentes IA', description: 'Habilidad para diseñar e implementar sistemas automatizados' },
      { id: 'c9_seguridad_privacidad', name: 'Seguridad y Privacidad', description: 'Comprensión de principios de seguridad digital y protección de datos' },
      { id: 'c10_etica_responsabilidad', name: 'Ética y Responsabilidad', description: 'Comprensión de principios éticos en el desarrollo de tecnologías' },
      { id: 'c11_sostenibilidad', name: 'Sostenibilidad', description: 'Comprensión de principios de desarrollo sostenible en proyectos tecnológicos' },
      { id: 'c12_aprendizaje_continuo', name: 'Aprendizaje Continuo', description: 'Compromiso con el desarrollo profesional continuo' },
      { id: 'c13_liderazgo_ia', name: 'Liderazgo en IA', description: 'Capacidad para liderar equipos en la adopción de IA' }
    ];

    const data = this.diagnosticData();
    const competencyScores = this.competencyScores();

    return competencies.map(comp => {
      const level = data?.competencias?.niveles?.[comp.id] as string || 'incipiente';
      const score = competencyScores[comp.id] || 0;
      return {
        name: comp.name,
        level: level,
        score: score,
        description: comp.description
      };
    }).filter(comp => comp.score > 0);
  }

  getCompetencyLevelColor(level: string): string {
    switch (level) {
      case 'lider': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'avanzado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'intermedio': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'basico': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'incipiente': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  // Métodos para cálculos de promedios
  getAresAverage(): number {
    const aresScores = this.aresScores();
    const scores = Object.values(aresScores);
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  getCompetencyAverage(): number {
    const competencyScores = this.competencyScores();
    const scores = Object.values(competencyScores);
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  getOverallMaturityScore(): number {
    const aresAvg = this.getAresAverage();
    const competencyAvg = this.getCompetencyAverage();
    return Math.round((aresAvg + competencyAvg) / 2);
  }

  // Métodos para cálculos del plan de acción
  getTotalActions(): number {
    const actionPlan = this.getActionPlan();
    return actionPlan.reduce((sum, item) => sum + item.acciones.length, 0);
  }

  getHighPriorityActions(): number {
    const actionPlan = this.getActionPlan();
    return actionPlan.filter(item => item.prioridad === 'Alta').length;
  }

  getActionPlanLength(): number {
    return this.getActionPlan().length;
  }
}
