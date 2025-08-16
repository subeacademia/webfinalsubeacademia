import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SelectedElement = 'fase1' | 'fase2' | 'fase3' | 'fase4' | 'fase5' | 'agilidad' | 'responsabilidad' | 'etica' | 'sostenibilidad' | null;

export interface PhaseInfo {
  id: string;
  name: string;
  description: string;
  color: string;
  startAngle: number;
  endAngle: number;
}

export interface PrincipleInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-ares-ai-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ares-ai-graph.component.html',
  styleUrls: ['./ares-ai-graph.component.css']
})
export class AresAiGraphComponent {
  selectedElement: SelectedElement = null;

  phases: PhaseInfo[] = [
    {
      id: 'fase1',
      name: 'Preparación y Evaluación',
      description: 'Análisis de viabilidad, definición de objetivos, evaluación de riesgos éticos y alineación estratégica del proyecto de IA.',
      color: '#3B82F6',
      startAngle: 0,
      endAngle: 72
    },
    {
      id: 'fase2',
      name: 'Diseño y Prototipado',
      description: 'Creación de prototipos funcionales, diseño centrado en el usuario y validación temprana de la solución de IA con stakeholders.',
      color: '#8B5CF6',
      startAngle: 72,
      endAngle: 144
    },
    {
      id: 'fase3',
      name: 'Desarrollo e Implementación',
      description: 'Desarrollo del modelo de IA siguiendo prácticas de MLOps, integración con sistemas existentes y despliegue en un entorno de producción.',
      color: '#06B6D4',
      startAngle: 144,
      endAngle: 216
    },
    {
      id: 'fase4',
      name: 'Monitoreo y Optimización',
      description: 'Seguimiento continuo del rendimiento del modelo, detección de desviaciones (drift) y optimización de los algoritmos post-implementación.',
      color: '#10B981',
      startAngle: 216,
      endAngle: 288
    },
    {
      id: 'fase5',
      name: 'Escalado y Sostenibilidad',
      description: 'Planificación para el crecimiento del sistema, asegurando la mantenibilidad a largo plazo y la gobernanza del ciclo de vida de la IA.',
      color: '#F59E0B',
      startAngle: 288,
      endAngle: 360
    }
  ];

  principles: PrincipleInfo[] = [
    {
      id: 'agilidad',
      name: 'Agilidad',
      description: 'Adopción de un enfoque iterativo e incremental que permite la adaptación continua a los cambios y la entrega de valor de forma temprana.',
      icon: '⚡'
    },
    {
      id: 'responsabilidad',
      name: 'Responsabilidad',
      description: 'Garantizar la rendición de cuentas (accountability), la explicabilidad de los modelos (XAI) y la supervisión humana en todo el ciclo de vida de la IA.',
      icon: '⚖️'
    },
    {
      id: 'etica',
      name: 'Ética',
      description: 'Asegurar que los sistemas de IA respeten los principios morales, evitando sesgos, garantizando la equidad, la privacidad y la transparencia.',
      icon: '🎯'
    },
    {
      id: 'sostenibilidad',
      name: 'Sostenibilidad',
      description: 'Considerar el impacto ambiental (ej. consumo energético del entrenamiento) y social a largo plazo, promoviendo una IA beneficiosa para la humanidad.',
      icon: '🌱'
    }
  ];

  selectPhase(phaseId: string): void {
    this.selectedElement = phaseId as SelectedElement;
  }

  selectPrinciple(principleId: string): void {
    this.selectedElement = principleId as SelectedElement;
  }

  clearSelection(): void {
    this.selectedElement = null;
  }

  getSelectedInfo(): { title: string; description: string; icon?: string } | null {
    if (!this.selectedElement) return null;

    const phase = this.phases.find(p => p.id === this.selectedElement);
    if (phase) {
      return { title: phase.name, description: phase.description };
    }

    const principle = this.principles.find(p => p.id === this.selectedElement);
    if (principle) {
      return { title: principle.name, description: principle.description, icon: principle.icon };
    }

    return null;
  }

  isPhaseSelected(phaseId: string): boolean {
    return this.selectedElement === phaseId;
  }

  isPrincipleSelected(principleId: string): boolean {
    return this.selectedElement === principleId;
  }

  // Métodos para calcular coordenadas SVG
  getPhasePath(phase: PhaseInfo): string {
    const centerX = 250;
    const centerY = 250;
    const outerRadius = 200;
    const innerRadius = 120;
    
    const startRad = (phase.startAngle - 90) * Math.PI / 180;
    const endRad = (phase.endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);
    
    const largeArcFlag = phase.endAngle - phase.startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${centerX} ${centerY} Z`;
  }

  getPhaseLabelPosition(phase: PhaseInfo): { x: number; y: number } {
    const centerX = 250;
    const centerY = 250;
    const labelRadius = 160;
    const midAngle = (phase.startAngle + phase.endAngle) / 2;
    const midRad = (midAngle - 90) * Math.PI / 180;
    
    return {
      x: centerX + labelRadius * Math.cos(midRad),
      y: centerY + labelRadius * Math.sin(midRad)
    };
  }

  getPrinciplePosition(index: number): { x: number; y: number } {
    const centerX = 250;
    const centerY = 250;
    const radius = 60;
    const angle = (index * 90 - 45) * Math.PI / 180;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
}
