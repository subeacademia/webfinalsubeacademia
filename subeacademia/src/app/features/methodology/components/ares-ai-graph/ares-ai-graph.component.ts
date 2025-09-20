import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FrameworkElement {
  id: string;
  type: 'phase' | 'principle';
  name: string;
  summary: string;
  details: string[];
  color: string;
  startAngle: number;
  endAngle: number;
  icon?: string;
}

@Component({
  selector: 'app-ares-ai-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ares-ai-graph.component.html',
  styleUrls: ['./ares-ai-graph.component.css']
})
export class AresAiGraphComponent implements OnInit {
  activeElement: FrameworkElement | null = null;
  showModal = signal<boolean>(false);
  modalContent = signal<FrameworkElement | null>(null);
  
  frameworkElements: FrameworkElement[] = [
    // --- FASES ---
    {
      id: 'phase1',
      type: 'phase',
      name: 'Preparación y Evaluación',
      summary: 'Análisis de viabilidad, definición de objetivos, evaluación de riesgos y alineación estratégica.',
      details: [
        'Definir el caso de negocio y los KPIs.',
        'Evaluar la calidad y disponibilidad de los datos.',
        'Identificar riesgos éticos y legales iniciales.',
        'Formar el equipo multidisciplinario.'
      ],
      color: '#3B82F6',
      startAngle: 0,
      endAngle: 72
    },
    {
      id: 'phase2',
      type: 'phase',
      name: 'Diseño y Prototipado',
      summary: 'Creación de prototipos funcionales y validación temprana de la solución de IA con stakeholders.',
      details: [
        'Diseño de la arquitectura del sistema.',
        'Desarrollo de un Producto Mínimo Viable (MVP).',
        'Pruebas de concepto (PoC) con usuarios finales.',
        'Refinamiento de los requisitos del modelo.'
      ],
      color: '#8B5CF6',
      startAngle: 72,
      endAngle: 144
    },
    {
      id: 'phase3',
      type: 'phase',
      name: 'Desarrollo e Implementación',
      summary: 'Desarrollo del modelo de IA, integración con sistemas existentes y despliegue en producción.',
      details: [
        'Ingeniería y preprocesamiento de datos.',
        'Entrenamiento y validación del modelo.',
        'Integración continua y despliegue continuo (CI/CD).',
        'Implementación de monitoreo inicial.'
      ],
      color: '#06B6D4',
      startAngle: 144,
      endAngle: 216
    },
    {
      id: 'phase4',
      type: 'phase',
      name: 'Monitoreo y Optimización',
      summary: 'Seguimiento continuo del rendimiento, detección de desviaciones (drift) y optimización de algoritmos.',
      details: [
        'Monitorización de la precisión y el rendimiento.',
        'Detección y mitigación de sesgos (bias).',
        'Reentrenamiento periódico del modelo.',
        'Análisis de feedback de usuario.'
      ],
      color: '#10B981',
      startAngle: 216,
      endAngle: 288
    },
    {
      id: 'phase5',
      type: 'phase',
      name: 'Escalado y Sostenibilidad',
      summary: 'Planificación para el crecimiento, asegurando la mantenibilidad a largo plazo y la gobernanza del ciclo de vida.',
      details: [
        'Optimización de la infraestructura para la escala.',
        'Documentación y transferencia de conocimiento.',
        'Establecimiento de un gobierno de IA a largo plazo.',
        'Evaluación del impacto social y ambiental.'
      ],
      color: '#F59E0B',
      startAngle: 288,
      endAngle: 360
    },
    // --- PRINCIPIOS ---
    {
      id: 'principle1',
      type: 'principle',
      name: 'Agilidad',
      summary: 'Enfoque iterativo e incremental que permite la adaptación continua y la entrega de valor temprana.',
      details: [
        'Ciclos de desarrollo cortos (Sprints).',
        'Feedback constante con el negocio.',
        'Flexibilidad para pivotar según los resultados.',
        'Colaboración multifuncional del equipo.'
      ],
      color: '#EF4444',
      startAngle: 0,
      endAngle: 90,
      icon: '⚡'
    },
    {
      id: 'principle2',
      type: 'principle',
      name: 'Responsabilidad',
      summary: 'Garantizar la rendición de cuentas, la explicabilidad de los modelos (XAI) y la supervisión humana.',
      details: [
        'Roles y responsabilidades claramente definidos.',
        'Auditorías periódicas del sistema de IA.',
        'Mecanismos para la interpretabilidad de decisiones.',
        'Protocolos de intervención humana.'
      ],
      color: '#8B5CF6',
      startAngle: 90,
      endAngle: 180,
      icon: '⚖️'
    },
    {
      id: 'principle3',
      type: 'principle',
      name: 'Ética',
      summary: 'Asegurar que los sistemas de IA respeten los principios morales, evitando sesgos y garantizando la equidad.',
      details: [
        'Evaluación de impacto ético (EIA).',
        'Técnicas de mitigación de sesgos en datos y modelos.',
        'Transparencia en el uso de la IA.',
        'Protección de la privacidad y datos personales.'
      ],
      color: '#10B981',
      startAngle: 180,
      endAngle: 270,
      icon: '🎯'
    },
    {
      id: 'principle4',
      type: 'principle',
      name: 'Sostenibilidad',
      summary: 'Considerar el impacto ambiental y social a largo plazo, promoviendo una IA beneficiosa.',
      details: [
        'Optimización del consumo energético (Green AI).',
        'Evaluación del ciclo de vida del producto de IA.',
        'Alineación con los Objetivos de Desarrollo Sostenible (ODS).',
        'Impacto a largo plazo en el empleo y la sociedad.'
      ],
      color: '#F59E0B',
      startAngle: 270,
      endAngle: 360,
      icon: '🌱'
    }
  ];

  ngOnInit(): void {
    // Estado inicial: mostrar el logo ARES AI
  }

  clearSelection(): void {
    this.activeElement = null;
  }

  // Métodos para calcular coordenadas SVG
  getPhasePath(element: FrameworkElement): string {
    const centerX = 300;
    const centerY = 300;
    const outerRadius = 240;
    const innerRadius = 140;
    
    const startRad = (element.startAngle - 90) * Math.PI / 180;
    const endRad = (element.endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);
    
    const largeArcFlag = element.endAngle - element.startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${centerX} ${centerY} Z`;
  }

  getPrinciplePath(element: FrameworkElement): string {
    const centerX = 300;
    const centerY = 300;
    const outerRadius = 100;
    const innerRadius = 60;
    
    const startRad = (element.startAngle - 90) * Math.PI / 180;
    const endRad = (element.endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);
    
    const largeArcFlag = element.endAngle - element.startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${centerX} ${centerY} Z`;
  }

  getPhaseLabelPosition(element: FrameworkElement): { x: number; y: number } {
    const centerX = 300;
    const centerY = 300;
    const labelRadius = 190;
    const midAngle = (element.startAngle + element.endAngle) / 2;
    const midRad = (midAngle - 90) * Math.PI / 180;
    
    return {
      x: centerX + labelRadius * Math.cos(midRad),
      y: centerY + labelRadius * Math.sin(midRad)
    };
  }

  getPrincipleLabelPosition(element: FrameworkElement): { x: number; y: number } {
    const centerX = 300;
    const centerY = 300;
    const labelRadius = 80;
    const midAngle = (element.startAngle + element.endAngle) / 2;
    const midRad = (midAngle - 90) * Math.PI / 180;
    
    return {
      x: centerX + labelRadius * Math.cos(midRad),
      y: centerY + labelRadius * Math.sin(midRad)
    };
  }

  getPhases(): FrameworkElement[] {
    return this.frameworkElements.filter(el => el.type === 'phase');
  }

  getPrinciples(): FrameworkElement[] {
    return this.frameworkElements.filter(el => el.type === 'principle');
  }

  isActive(element: FrameworkElement): boolean {
    return this.activeElement?.id === element.id;
  }

  // Métodos para gestionar modales
  openModal(element: FrameworkElement): void {
    this.modalContent.set(element);
    this.showModal.set(true);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal.set(false);
    this.modalContent.set(null);
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Método para manejar click en el overlay
  onOverlayClick(event: Event): void {
    // Solo cerrar si el click fue en el overlay, no en el contenido
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Modificar selectElement para abrir modal además de mostrar en el centro
  selectElement(element: FrameworkElement): void {
    this.activeElement = element;
    // Abrir modal con información detallada
    this.openModal(element);
  }

  // Métodos auxiliares para contenido detallado de modales
  getPhaseTimeline(phase: FrameworkElement): string {
    const timelines: Record<string, string> = {
      'phase1': '2-4 semanas',
      'phase2': '3-6 semanas', 
      'phase3': '6-12 semanas',
      'phase4': '2-4 semanas',
      'phase5': 'Continuo'
    };
    return timelines[phase.id] || 'Variable según proyecto';
  }

  getPhaseDeliverables(phase: FrameworkElement): string {
    const deliverables: Record<string, string> = {
      'phase1': 'Business Case, Risk Assessment, Team Charter',
      'phase2': 'MVP, PoC, Technical Architecture',
      'phase3': 'Production Model, CI/CD Pipeline, Integration Tests',
      'phase4': 'Monitoring Dashboard, Performance Reports, User Training',
      'phase5': 'Optimization Reports, Continuous Improvement Plan'
    };
    return deliverables[phase.id] || 'Documentación específica del proyecto';
  }

  getPhaseStakeholders(phase: FrameworkElement): string {
    const stakeholders: Record<string, string> = {
      'phase1': 'C-Level, Product Managers, Data Scientists',
      'phase2': 'UX/UI Designers, Frontend/Backend Developers',
      'phase3': 'DevOps Engineers, QA Testers, Security Team',
      'phase4': 'End Users, Training Team, Support Team',
      'phase5': 'Analytics Team, Business Analysts, Stakeholders'
    };
    return stakeholders[phase.id] || 'Equipo multidisciplinario';
  }

  getPrincipleApplication(principle: FrameworkElement): string {
    const applications: Record<string, string> = {
      'principle1': 'Metodologías ágiles, sprints iterativos, feedback continuo',
      'principle2': 'Auditorías éticas, compliance frameworks, bias detection',
      'principle3': 'Green computing, efficient algorithms, carbon footprint reduction',
      'principle4': 'ROI measurement, KPI tracking, business impact assessment'
    };
    return applications[principle.id] || 'Aplicación transversal en todo el proyecto';
  }

  getPrincipleBenefits(principle: FrameworkElement): string {
    const benefits: Record<string, string> = {
      'principle1': 'Reducción de time-to-market, mayor adaptabilidad, menor riesgo',
      'principle2': 'Cumplimiento legal, confianza del usuario, reputación corporativa',
      'principle3': 'Reducción de costos operativos, sostenibilidad ambiental',
      'principle4': 'Justificación de inversión, escalabilidad demostrable'
    };
    return benefits[principle.id] || 'Beneficios específicos del principio';
  }

  getPrincipleMetrics(principle: FrameworkElement): string {
    const metrics: Record<string, string> = {
      'principle1': 'Velocity, Lead Time, Deployment Frequency',
      'principle2': 'Fairness Score, Bias Metrics, Compliance Rate',
      'principle3': 'Energy Efficiency, Carbon Footprint, Resource Utilization',
      'principle4': 'ROI, NPV, Payback Period, User Adoption Rate'
    };
    return metrics[principle.id] || 'Métricas específicas del principio';
  }

  getAcademicReferences(element: FrameworkElement): string[] {
    const references: Record<string, string[]> = {
      'phase1': [
        'Brynjolfsson & McAfee (2017) - The Business of Artificial Intelligence',
        'Davenport & Ronanki (2018) - Artificial Intelligence for the Real World',
        'Chen et al. (2019) - AI Strategy and Leadership'
      ],
      'phase2': [
        'Brown & Katz (2011) - Change by Design',
        'Ries (2011) - The Lean Startup Methodology',
        'Norman (2013) - The Design of Everyday Things'
      ],
      'phase3': [
        'Fowler & Highsmith (2001) - The Agile Manifesto',
        'Humble et al. (2010) - Continuous Delivery',
        'Kim et al. (2016) - The DevOps Handbook'
      ],
      'phase4': [
        'Provost & Fawcett (2013) - Data Science for Business',
        'Sculley et al. (2015) - Hidden Technical Debt in ML Systems',
        'Amershi et al. (2019) - Software Engineering for ML'
      ],
      'phase5': [
        'Kaplan & Norton (1996) - The Balanced Scorecard',
        'Deming (1986) - Out of the Crisis - PDCA Cycle',
        'Kotter (2012) - Leading Change'
      ],
      'principle1': [
        'Beck et al. (2001) - Manifesto for Agile Software Development',
        'Schwaber & Sutherland (2020) - The Scrum Guide',
        'Anderson (2010) - Kanban: Successful Evolutionary Change'
      ],
      'principle2': [
        'Floridi et al. (2018) - AI4People—An Ethical Framework for AI',
        'Jobin et al. (2019) - The Global Landscape of AI Ethics Guidelines',
        'IEEE (2019) - Ethically Aligned Design'
      ],
      'principle3': [
        'Strubell et al. (2019) - Energy and Policy Considerations for DL',
        'Henderson et al. (2020) - Towards the Systematic Reporting of Energy',
        'Schwartz et al. (2020) - Green AI'
      ],
      'principle4': [
        'Brynjolfsson et al. (2017) - Artificial Intelligence and the Modern Productivity',
        'McKinsey (2018) - The Age of AI: Artificial Intelligence and the Future of Work',
        'PwC (2019) - AI and Workforce Evolution'
      ]
    };
    return references[element.id] || ['Referencias académicas específicas'];
  }

  getSuccessCases(element: FrameworkElement): string[] {
    const cases: Record<string, string[]> = {
      'phase1': [
        'Netflix - Algoritmo de recomendación personalizada',
        'Amazon - Sistema de predicción de demanda',
        'Tesla - Autopilot development strategy'
      ],
      'phase2': [
        'Google - PageRank algorithm prototyping',
        'Spotify - Music recommendation MVP',
        'Uber - Dynamic pricing proof of concept'
      ],
      'phase3': [
        'Facebook - News Feed algorithm deployment',
        'Microsoft - Azure ML platform development',
        'Airbnb - Smart pricing system implementation'
      ],
      'phase4': [
        'LinkedIn - Professional network optimization',
        'Salesforce - Einstein AI monitoring',
        'Adobe - Creative Cloud AI performance tracking'
      ],
      'phase5': [
        'IBM Watson - Continuous learning optimization',
        'Apple Siri - Natural language improvement',
        'OpenAI GPT - Model evolution and scaling'
      ],
      'principle1': [
        'Spotify - Squad model for AI development',
        'ING Bank - Agile transformation with AI',
        'Haier - RenDanHeYi model with AI integration'
      ],
      'principle2': [
        'Microsoft - Responsible AI framework',
        'Google - AI Principles implementation',
        'IBM - AI Ethics Board establishment'
      ],
      'principle3': [
        'Google - Carbon-neutral AI operations',
        'Microsoft - Carbon negative by 2030',
        'Facebook - 100% renewable energy for data centers'
      ],
      'principle4': [
        'McKinsey - AI ROI measurement framework',
        'Deloitte - AI business value quantification',
        'BCG - AI transformation impact assessment'
      ]
    };
    return cases[element.id] || ['Casos de éxito específicos'];
  }
}
