import { Injectable } from '@angular/core';

export interface ScoreResult {
  subescalas: Record<string, {
    value: number;
    band: 'bajo' | 'medio' | 'alto' | 'sin_datos';
  }>;
  competencias: Record<string, number>;
  ip_ia: number;
  explicaciones: Record<string, {
    texto: string;
    acciones: string[];
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  calculateScore(responses: Record<string, string>, group: 'menor' | 'adulto'): ScoreResult {
    if (group === 'menor') {
      return this.calculateMinorScore(responses);
    } else {
      return this.calculateAdultScore(responses);
    }
  }

  private calculateMinorScore(responses: Record<string, string>): ScoreResult {
    const domains = {
      conocimiento: ['A1', 'A2', 'A3'],
      indagacion_critica: ['A4', 'A5'],
      etica_seguridad: ['A6', 'A7'],
      actitudes_emociones: ['A8', 'A9', 'A10']
    };

    const reverseItems = new Set(['A9']);
    
    const calculateDomainScore = (items: string[]): { value: number; band: 'bajo' | 'medio' | 'alto' | 'sin_datos' } => {
      const values = items
        .map(code => {
          const response = responses[code];
          if (!response) return 0;
          
          const numValue = parseInt(response);
          if (isNaN(numValue)) return 0;
          
          // Aplicar reversión si es necesario
          return reverseItems.has(code) ? (6 - numValue) : numValue;
        })
        .filter(val => val > 0);
      
      if (values.length === 0) {
        return { value: 0, band: 'sin_datos' };
      }
      
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const band = this.getBand(average);
      
      return { value: average, band };
    };

    const subescalas: Record<string, { value: number; band: 'bajo' | 'medio' | 'alto' | 'sin_datos' }> = {};
    
    Object.entries(domains).forEach(([domain, items]) => {
      subescalas[domain] = calculateDomainScore(items);
    });

    // Calcular competencias SUBE (simplificado para menores)
    const competencias = this.calculateMinorCompetencies(subescalas);
    
    // IP-IA simplificado para menores
    const ip_ia = this.calculateMinorIPIA(subescalas);

    return {
      subescalas,
      competencias,
      ip_ia,
      explicaciones: this.generateMinorExplanations(subescalas)
    };
  }

  private calculateAdultScore(responses: Record<string, string>): ScoreResult {
    const domains = {
      conocimiento_tecnico: ['B1.1', 'B1.2', 'B1.3', 'B1.4'],
      prompting: ['B2.1', 'B2.2', 'B2.3'],
      evaluacion_critica: ['B3.1', 'B3.2', 'B3.3'],
      aplicacion_innovadora: ['B4.1', 'B4.2', 'B4.3'],
      etica_regulacion: ['B5.1', 'B5.2', 'B5.3', 'B5.4'],
      actitudes_emociones: ['B6.1', 'B6.2', 'B6.3', 'B6.4', 'B6.5', 'B6.6']
    };

    const reverseItems = new Set(['B6.2', 'B6.5']);
    const vfItems = ['B1.1', 'B1.2', 'B1.3', 'B1.4'];
    const vfAnswers = { 'B1.1': 'V', 'B1.2': 'V', 'B1.3': 'F', 'B1.4': 'V' };

    const calculateDomainScore = (items: string[]): { value: number; band: 'bajo' | 'medio' | 'alto' | 'sin_datos' } => {
      if (items.includes('B1.1')) {
        // Manejo especial para conocimiento técnico (V/F)
        const correctAnswers = items
          .filter(code => vfItems.includes(code))
          .map(code => {
            const response = responses[code];
            const correctAnswer = vfAnswers[code as keyof typeof vfAnswers];
            return response === correctAnswer ? 1 : 0;
          });
        
        const score = correctAnswers.reduce((sum: number, val: number) => sum + val, 0) / correctAnswers.length;
        const scaledScore = score * 5; // Escalar a 1-5
        return { value: scaledScore, band: this.getBand(scaledScore) };
      }

      const values = items
        .map(code => {
          const response = responses[code];
          if (!response) return 0;
          
          const numValue = parseInt(response);
          if (isNaN(numValue)) return 0;
          
          return reverseItems.has(code) ? (6 - numValue) : numValue;
        })
        .filter(val => val > 0);
      
      if (values.length === 0) {
        return { value: 0, band: 'sin_datos' };
      }
      
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const band = this.getBand(average);
      
      return { value: average, band };
    };

    const subescalas: Record<string, { value: number; band: 'bajo' | 'medio' | 'alto' | 'sin_datos' }> = {};
    
    Object.entries(domains).forEach(([domain, items]) => {
      subescalas[domain] = calculateDomainScore(items);
    });

    // Calcular competencias SUBE
    const competencias = this.calculateAdultCompetencies(subescalas);
    
    // Calcular IP-IA
    const ip_ia = this.calculateAdultIPIA(subescalas);

    return {
      subescalas,
      competencias,
      ip_ia,
      explicaciones: this.generateAdultExplanations(subescalas)
    };
  }

  private getBand(value: number): 'bajo' | 'medio' | 'alto' | 'sin_datos' {
    if (value === 0) return 'sin_datos';
    if (value <= 2.5) return 'bajo';
    if (value <= 3.5) return 'medio';
    return 'alto';
  }

  private calculateMinorCompetencies(subescalas: any): Record<string, number> {
    // Mapeo simplificado para menores
    return {
      pensamiento_analitico: subescalas.conocimiento.value * 0.4 + subescalas.indagacion_critica.value * 0.6,
      creatividad: subescalas.actitudes_emociones.value * 0.7 + subescalas.conocimiento.value * 0.3,
      etica_digital: subescalas.etica_seguridad.value,
      aprendizaje_activo: subescalas.actitudes_emociones.value * 0.8 + subescalas.conocimiento.value * 0.2,
      pensamiento_critico: subescalas.indagacion_critica.value,
      competencias_digitales: subescalas.conocimiento.value * 0.6 + subescalas.etica_seguridad.value * 0.4,
      resiliencia: subescalas.actitudes_emociones.value,
      inteligencia_emocional: subescalas.actitudes_emociones.value,
      comunicacion: subescalas.conocimiento.value * 0.5 + subescalas.actitudes_emociones.value * 0.5,
      conciencia_etica: subescalas.etica_seguridad.value,
      resolucion_problemas: subescalas.indagacion_critica.value * 0.7 + subescalas.conocimiento.value * 0.3,
      liderazgo: subescalas.actitudes_emociones.value * 0.6 + subescalas.etica_seguridad.value * 0.4,
      pensamiento_sistemico: subescalas.conocimiento.value * 0.5 + subescalas.indagacion_critica.value * 0.5
    };
  }

  private calculateAdultCompetencies(subescalas: any): Record<string, number> {
    // Mapeo completo para adultos según las 13 competencias SUBE
    return {
      pensamiento_analitico_innovacion: subescalas.evaluacion_critica.value * 0.3 + subescalas.aplicacion_innovadora.value * 0.4 + subescalas.prompting.value * 0.3,
      aprendizaje_activo_continuo: subescalas.prompting.value * 0.4 + subescalas.actitudes_emociones.value * 0.2 + subescalas.aplicacion_innovadora.value * 0.4,
      resolucion_problemas_complejos: subescalas.aplicacion_innovadora.value * 0.6 + subescalas.evaluacion_critica.value * 0.4,
      pensamiento_critico_analisis: subescalas.evaluacion_critica.value * 0.7 + subescalas.conocimiento_tecnico.value * 0.3,
      creatividad_originalidad: subescalas.aplicacion_innovadora.value * 0.7 + subescalas.prompting.value * 0.3,
      competencias_digitales: subescalas.conocimiento_tecnico.value * 0.4 + subescalas.aplicacion_innovadora.value * 0.6,
      programacion_diseno_tec: subescalas.aplicacion_innovadora.value,
      liderazgo_influencia: subescalas.aplicacion_innovadora.value * 0.4 + subescalas.actitudes_emociones.value * 0.3 + subescalas.etica_regulacion.value * 0.3,
      resiliencia_adaptabilidad: subescalas.actitudes_emociones.value,
      pensamiento_sistemico: subescalas.evaluacion_critica.value * 0.5 + subescalas.aplicacion_innovadora.value * 0.5,
      inteligencia_emocional_empatia: subescalas.actitudes_emociones.value,
      comunicacion_colaboracion: subescalas.aplicacion_innovadora.value * 0.6 + subescalas.prompting.value * 0.4,
      conciencia_etica_responsabilidad: subescalas.etica_regulacion.value
    };
  }

  private calculateMinorIPIA(subescalas: any): number {
    const alfabetizacion = (subescalas.conocimiento.value + subescalas.indagacion_critica.value + subescalas.etica_seguridad.value) / 3;
    const competencias = Object.values(this.calculateMinorCompetencies(subescalas)).reduce((sum: number, val: number) => sum + val, 0) / 13;
    return 0.6 * alfabetizacion + 0.4 * competencias;
  }

  private calculateAdultIPIA(subescalas: any): number {
    const alfabetizacion = (
      subescalas.conocimiento_tecnico.value * 0.2 +
      subescalas.prompting.value * 0.2 +
      subescalas.evaluacion_critica.value * 0.25 +
      subescalas.aplicacion_innovadora.value * 0.2 +
      subescalas.etica_regulacion.value * 0.15
    );
    const competencias = Object.values(this.calculateAdultCompetencies(subescalas)).reduce((sum: number, val: number) => sum + val, 0) / 13;
    return 0.6 * alfabetizacion + 0.4 * competencias;
  }

  private generateMinorExplanations(subescalas: any): Record<string, { texto: string; acciones: string[] }> {
    return {
      conocimiento: {
        texto: this.getExplanationText('conocimiento', subescalas.conocimiento.band),
        acciones: [
          'Explora videos educativos sobre cómo funciona la IA',
          'Practica con herramientas de IA diseñadas para tu edad',
          'Pregunta a adultos de confianza sobre tecnología'
        ]
      },
      indagacion_critica: {
        texto: this.getExplanationText('indagacion_critica', subescalas.indagacion_critica.band),
        acciones: [
          'Siempre pregunta "¿cómo lo sabes?" cuando uses IA',
          'Compara respuestas de diferentes fuentes',
          'Pide ayuda a un adulto para verificar información'
        ]
      },
      etica_seguridad: {
        texto: this.getExplanationText('etica_seguridad', subescalas.etica_seguridad.band),
        acciones: [
          'Nunca compartas información personal con programas de IA',
          'Habla con tus padres sobre las apps que usas',
          'Recuerda que los robots deben tratar a todos por igual'
        ]
      },
      actitudes_emociones: {
        texto: this.getExplanationText('actitudes_emociones', subescalas.actitudes_emociones.band),
        acciones: [
          'Mantén la curiosidad por aprender cosas nuevas',
          'No tengas miedo de probar nuevas tecnologías',
          'Pide ayuda cuando algo te parezca difícil'
        ]
      }
    };
  }

  private generateAdultExplanations(subescalas: any): Record<string, { texto: string; acciones: string[] }> {
    return {
      conocimiento_tecnico: {
        texto: this.getExplanationText('conocimiento_tecnico', subescalas.conocimiento_tecnico.band),
        acciones: [
          'Toma un curso introductorio sobre redes neuronales',
          'Lee artículos sobre cómo funcionan los modelos de lenguaje',
          'Experimenta con diferentes tipos de IA generativa'
        ]
      },
      prompting: {
        texto: this.getExplanationText('prompting', subescalas.prompting.band),
        acciones: [
          'Practica con diferentes estilos de prompts',
          'Usa ejemplos específicos en tus indicaciones',
          'Aprende técnicas de ingeniería de prompts'
        ]
      },
      evaluacion_critica: {
        texto: this.getExplanationText('evaluacion_critica', subescalas.evaluacion_critica.band),
        acciones: [
          'Siempre verifica las respuestas de la IA',
          'Aprende a identificar sesgos en los resultados',
          'Desarrolla tu pensamiento crítico digital'
        ]
      },
      aplicacion_innovadora: {
        texto: this.getExplanationText('aplicacion_innovadora', subescalas.aplicacion_innovadora.band),
        acciones: [
          'Integra IA en tus proyectos de trabajo',
          'Experimenta con herramientas creativas de IA',
          'Colabora con la IA como un compañero de equipo'
        ]
      },
      etica_regulacion: {
        texto: this.getExplanationText('etica_regulacion', subescalas.etica_regulacion.band),
        acciones: [
          'Mantén la transparencia sobre el uso de IA',
          'Protege los datos personales en tus proyectos',
          'Sigue las mejores prácticas de IA responsable'
        ]
      },
      actitudes_emociones: {
        texto: this.getExplanationText('actitudes_emociones', subescalas.actitudes_emociones.band),
        acciones: [
          'Mantén una actitud positiva hacia el aprendizaje',
          'No temas experimentar con nuevas tecnologías',
          'Desarrolla confianza en tus capacidades'
        ]
      }
    };
  }

  private getExplanationText(domain: string, band: string): string {
    const explanations: Record<string, Record<string, string>> = {
      conocimiento: {
        bajo: 'Tienes conocimientos básicos sobre IA. Te recomendamos explorar más sobre cómo funcionan estas tecnologías.',
        medio: 'Tienes un buen nivel de conocimiento sobre IA. Puedes profundizar en conceptos más avanzados.',
        alto: 'Excelente nivel de conocimiento técnico sobre IA. Eres capaz de entender conceptos complejos.'
      },
      indagacion_critica: {
        bajo: 'Es importante desarrollar tu capacidad de análisis crítico al usar IA.',
        medio: 'Tienes buenas habilidades de análisis, pero puedes mejorarlas aún más.',
        alto: 'Excelente capacidad de análisis crítico. Sabes evaluar la información de manera efectiva.'
      },
      etica_seguridad: {
        bajo: 'Es fundamental que aprendas sobre seguridad digital y ética en el uso de IA.',
        medio: 'Tienes buenas bases en ética digital, pero puedes fortalecerlas.',
        alto: 'Excelente comprensión de la ética y seguridad en el uso de IA.'
      },
      actitudes_emociones: {
        bajo: 'Mantén una actitud positiva hacia el aprendizaje de nuevas tecnologías.',
        medio: 'Tienes una buena actitud hacia la IA. Sigue explorando y aprendiendo.',
        alto: 'Excelente actitud hacia la IA. Eres un aprendiz activo y motivado.'
      },
      conocimiento_tecnico: {
        bajo: 'Te recomendamos fortalecer tu comprensión técnica sobre cómo funciona la IA.',
        medio: 'Tienes buenos conocimientos técnicos. Puedes profundizar en áreas específicas.',
        alto: 'Excelente nivel de conocimiento técnico. Dominas los conceptos fundamentales de IA.'
      },
      prompting: {
        bajo: 'Practica más la comunicación efectiva con sistemas de IA.',
        medio: 'Tienes buenas habilidades de prompting. Puedes refinarlas aún más.',
        alto: 'Excelente dominio de la ingeniería de prompts. Sabes comunicarte efectivamente con la IA.'
      },
      evaluacion_critica: {
        bajo: 'Desarrolla tu capacidad de evaluar críticamente las respuestas de la IA.',
        medio: 'Tienes buenas habilidades de evaluación. Continúa mejorándolas.',
        alto: 'Excelente capacidad de evaluación crítica. Sabes analizar la información de manera efectiva.'
      },
      aplicacion_innovadora: {
        bajo: 'Explora más formas de integrar la IA en tu trabajo y proyectos.',
        medio: 'Tienes buenas habilidades de aplicación. Puedes ser más innovador.',
        alto: 'Excelente capacidad de aplicación e innovación con IA. Eres un usuario avanzado.'
      },
      etica_regulacion: {
        bajo: 'Es importante que aprendas más sobre el uso ético y responsable de la IA.',
        medio: 'Tienes buenas bases en ética de IA. Puedes profundizar en regulaciones.',
        alto: 'Excelente comprensión de la ética y regulaciones en IA. Eres un usuario responsable.'
      }
    };

    return explanations[domain]?.[band] || 'Continúa desarrollando tus competencias en esta área.';
  }
}
