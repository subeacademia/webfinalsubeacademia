import { Injectable, signal } from '@angular/core';

export interface DiagnosticData {
  contexto?: {
    industria?: string;
    tamanoEquipo?: string;
    experienciaIA?: string;
  };
  ares?: {
    respuestas?: { [key: string]: number };
  };
  competencias?: {
    niveles?: { [key: string]: string };
  };
  objetivo?: string;
  lead?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  };
}

export interface DiagnosticScores {
  overall: number;
  governance: number;
  strategy: number;
  implementation: number;
  monitoring: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimpleDiagnosticService {
  private diagnosticData = signal<DiagnosticData | null>(null);

  constructor() {
    this.loadFromLocalStorage();
  }

  setDiagnosticData(data: DiagnosticData): void {
    this.diagnosticData.set(data);
    this.saveToLocalStorage(data);
  }

  getDiagnosticData(): DiagnosticData | null {
    return this.diagnosticData();
  }

  calculateScores(data: DiagnosticData): DiagnosticScores {
    const scores: DiagnosticScores = {
      overall: 50,
      governance: 50,
      strategy: 50,
      implementation: 50,
      monitoring: 50
    };

    // Calcular puntaje basado en respuestas ARES
    if (data.ares?.respuestas) {
      const aresAnswers = Object.values(data.ares.respuestas);
      if (aresAnswers.length > 0) {
        const aresAverage = aresAnswers.reduce((sum, val) => sum + val, 0) / aresAnswers.length;
        scores.overall = Math.round((aresAverage / 5) * 100);
        
        // Distribuir el puntaje en las diferentes áreas
        scores.governance = Math.round(scores.overall * 1.1);
        scores.strategy = Math.round(scores.overall * 0.9);
        scores.implementation = Math.round(scores.overall * 0.8);
        scores.monitoring = Math.round(scores.overall * 0.7);
      }
    }

    // Ajustar basado en competencias
    if (data.competencias?.niveles) {
      const competencyLevels = Object.values(data.competencias.niveles);
      const advancedCount = competencyLevels.filter(level => level === 'avanzado').length;
      const intermediateCount = competencyLevels.filter(level => level === 'intermedio').length;
      
      if (competencyLevels.length > 0) {
        const competencyScore = ((advancedCount * 100) + (intermediateCount * 60)) / competencyLevels.length;
        scores.strategy = Math.round((scores.strategy + competencyScore) / 2);
        scores.overall = Math.round((scores.overall + competencyScore) / 2);
      }
    }

    // Asegurar que los puntajes estén en el rango correcto
    Object.keys(scores).forEach(key => {
      scores[key as keyof DiagnosticScores] = Math.max(0, Math.min(100, scores[key as keyof DiagnosticScores]));
    });

    return scores;
  }

  generateReport(data: DiagnosticData): string {
    const scores = this.calculateScores(data);
    const leadName = data.lead?.nombre || 'Usuario';
    
    return `
      <div class="diagnostic-report">
        <h1>Diagnóstico de Madurez en IA</h1>
        <p><strong>Preparado para:</strong> ${leadName}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        
        <h2>Resumen Ejecutivo</h2>
        <p>Tu organización muestra un nivel de madurez en IA de <strong>${scores.overall}%</strong>, lo que indica ${this.getMaturityLevel(scores.overall)}.</p>
        
        <h3>Puntuaciones por Área</h3>
        <ul>
          <li><strong>Gobernanza:</strong> ${scores.governance}%</li>
          <li><strong>Estrategia:</strong> ${scores.strategy}%</li>
          <li><strong>Implementación:</strong> ${scores.implementation}%</li>
          <li><strong>Monitoreo:</strong> ${scores.monitoring}%</li>
        </ul>
        
        <h2>Análisis Detallado</h2>
        <p>Basado en tu evaluación, hemos identificado las siguientes fortalezas y áreas de oportunidad:</p>
        
        <h3>Fortalezas Identificadas</h3>
        <ul>
          <li>Comprensión sólida de los conceptos básicos de IA</li>
          <li>Interés genuino en adoptar tecnologías emergentes</li>
          <li>Capacidad de identificar oportunidades de mejora</li>
          <li>Enfoque en la formación del equipo</li>
        </ul>
        
        <h3>Áreas de Oportunidad</h3>
        <ul>
          <li>Desarrollo de políticas y procedimientos específicos para IA</li>
          <li>Implementación de sistemas de monitoreo y evaluación</li>
          <li>Fortalecimiento de la gobernanza de datos</li>
          <li>Creación de métricas de éxito claras</li>
        </ul>
        
        <h2>Plan de Acción Personalizado</h2>
        
        <div class="action-item">
          <h3>Objetivo 1: Establecer Gobernanza de IA</h3>
          <p><strong>Acciones Clave:</strong></p>
          <ul>
            <li>Crear un comité de ética de IA</li>
            <li>Desarrollar políticas de uso responsable</li>
            <li>Establecer protocolos de transparencia</li>
          </ul>
          <p><strong>Prioridad:</strong> <span class="priority-high">Alta</span></p>
          <p><strong>Tiempo Estimado:</strong> 2-3 meses</p>
        </div>
        
        <div class="action-item">
          <h3>Objetivo 2: Desarrollar Competencias del Equipo</h3>
          <p><strong>Acciones Clave:</strong></p>
          <ul>
            <li>Implementar programa de formación en IA</li>
            <li>Crear espacios de aprendizaje colaborativo</li>
            <li>Establecer mentorías entre pares</li>
          </ul>
          <p><strong>Prioridad:</strong> <span class="priority-medium">Media</span></p>
          <p><strong>Tiempo Estimado:</strong> 3-4 meses</p>
        </div>
        
        <div class="action-item">
          <h3>Objetivo 3: Mejorar la Implementación</h3>
          <p><strong>Acciones Clave:</strong></p>
          <ul>
            <li>Adoptar metodologías ágiles para proyectos de IA</li>
            <li>Implementar herramientas de MLOps</li>
            <li>Crear métricas de seguimiento</li>
          </ul>
          <p><strong>Prioridad:</strong> <span class="priority-low">Baja</span></p>
          <p><strong>Tiempo Estimado:</strong> 4-6 meses</p>
        </div>
        
        <div class="recommendations">
          <h3>Recomendaciones Adicionales</h3>
          <ul>
            <li>Considera contratar un consultor especializado en IA para acelerar el proceso</li>
            <li>Establece alianzas estratégicas con proveedores de tecnología</li>
            <li>Participa en comunidades y eventos de IA para mantenerte actualizado</li>
            <li>Desarrolla un roadmap de IA a largo plazo (12-24 meses)</li>
          </ul>
        </div>
      </div>
    `;
  }

  private getMaturityLevel(score: number): string {
    if (score >= 80) return 'un nivel avanzado';
    if (score >= 60) return 'un nivel intermedio';
    if (score >= 40) return 'un nivel básico';
    return 'un nivel inicial';
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('diagnostic-data');
      if (stored) {
        const data = JSON.parse(stored);
        this.diagnosticData.set(data);
      }
    } catch (error) {
      console.error('Error al cargar datos del localStorage:', error);
    }
  }

  private saveToLocalStorage(data: DiagnosticData): void {
    try {
      localStorage.setItem('diagnostic-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
    }
  }
}
