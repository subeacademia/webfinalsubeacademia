import { Component, OnInit, inject } from '@angular/core';
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

  selectElement(element: FrameworkElement): void {
    this.activeElement = element;
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
}
