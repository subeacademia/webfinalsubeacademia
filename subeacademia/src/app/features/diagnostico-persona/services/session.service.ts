import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SessionData {
  id: string;
  edad: number;
  group: 'menor' | 'adulto';
  version: string;
  consent: {
    acepto: boolean;
    tutor?: string;
    asentimientoMenor?: boolean;
  };
  responses: Record<string, string>;
  createdAt: Date;
}

export interface QuestionItem {
  code: string;
  type: 'likert' | 'vf';
  text: string;
  reverse?: boolean;
  answerKey?: string; // Para preguntas V/F
}

export interface QuestionnaireData {
  version: string;
  groups: {
    menor: {
      scale: string;
      items: QuestionItem[];
      domains: Record<string, string[]>;
    };
    adulto: {
      items: QuestionItem[];
      domains: Record<string, string[]>;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private currentSession = signal<SessionData | null>(null);
  private responses = signal<Record<string, string>>({});

  // Señales computadas
  currentSessionData = computed(() => this.currentSession());
  currentResponses = computed(() => this.responses());

  // Datos del cuestionario (en un caso real, esto vendría de una API)
  private questionnaireData: QuestionnaireData = {
    version: 'v1',
    groups: {
      menor: {
        scale: 'likert_1_5',
        items: [
          { code: 'A1', type: 'likert', text: 'Los robots o dispositivos inteligentes pueden usar sensores para detectar cosas en su entorno.' },
          { code: 'A2', type: 'likert', text: 'Cuando una app o videojuego mejora con el tiempo, es porque aprende de cómo la uso.' },
          { code: 'A3', type: 'likert', text: 'Pienso en las instrucciones paso a paso que le doy a un robot o programa.' },
          { code: 'A4', type: 'likert', text: 'Cuando una app o chatbot me muestra una respuesta, siempre verifico si es correcta.' },
          { code: 'A5', type: 'likert', text: 'Puedo darme cuenta si una respuesta de un programa de IA es confiable o no.' },
          { code: 'A6', type: 'likert', text: 'Entiendo que no debo compartir mi nombre completo, dirección o teléfono con programas de IA.' },
          { code: 'A7', type: 'likert', text: 'Creo que los robots y los programas deben tratar a todas las personas por igual.' },
          { code: 'A8', type: 'likert', text: 'Me siento curioso(a) y motivado(a) cuando aprendo sobre nuevas tecnologías.' },
          { code: 'A9', type: 'likert', text: 'Me siento nervioso(a) o asustado(a) cuando uso programas de IA.', reverse: true },
          { code: 'A10', type: 'likert', text: 'Creo que puedo aprender nuevas tecnologías si me esfuerzo.' }
        ],
        domains: {
          conocimiento: ['A1', 'A2', 'A3'],
          indagacion_critica: ['A4', 'A5'],
          etica_seguridad: ['A6', 'A7'],
          actitudes_emociones: ['A8', 'A9', 'A10']
        }
      },
      adulto: {
        items: [
          { code: 'B1.1', type: 'vf', text: 'Las redes neuronales profundas pueden aprender patrones complejos de datos.', answerKey: 'V' },
          { code: 'B1.2', type: 'vf', text: 'Los modelos de lenguaje como ChatGPT generan textos completamente originales sin usar datos de entrenamiento.', answerKey: 'V' },
          { code: 'B1.3', type: 'vf', text: 'La IA generativa se limita a recombinar contenido existente sin crear nada nuevo.', answerKey: 'F' },
          { code: 'B1.4', type: 'vf', text: '"IA explicable" permite comprender por qué un modelo tomó una decisión específica.', answerKey: 'V' },
          { code: 'B2.1', type: 'likert', text: 'Sé ajustar mis preguntas o indicaciones para obtener mejores respuestas de la IA.' },
          { code: 'B2.2', type: 'likert', text: 'Uso ejemplos concretos o palabras clave específicas al interactuar con IA.' },
          { code: 'B2.3', type: 'likert', text: 'Practico la ingeniería de prompts para optimizar mis interacciones con IA.' },
          { code: 'B3.1', type: 'likert', text: 'Verifico la exactitud de las respuestas de la IA antes de usarlas.' },
          { code: 'B3.2', type: 'likert', text: 'Puedo identificar sesgos o alucinaciones en las respuestas de la IA.' },
          { code: 'B3.3', type: 'likert', text: 'Comprendo que las respuestas de la IA pueden contener errores o información incorrecta.' },
          { code: 'B4.1', type: 'likert', text: 'He utilizado herramientas de IA para crear contenidos (textos, imágenes, código).' },
          { code: 'B4.2', type: 'likert', text: 'Integro de forma eficaz herramientas de IA en mi trabajo diario.' },
          { code: 'B4.3', type: 'likert', text: 'Considero a la IA como un colaborador que puede potenciar mi creatividad.' },
          { code: 'B5.1', type: 'likert', text: 'Entiendo la importancia de proteger mis datos personales al usar IA.' },
          { code: 'B5.2', type: 'likert', text: 'Soy consciente de que las decisiones automatizadas pueden tener sesgos.' },
          { code: 'B5.3', type: 'likert', text: 'Creo que los modelos generativos deben usarse de manera responsable y ética.' },
          { code: 'B5.4', type: 'likert', text: 'Siempre cito o informo cuando un trabajo incluye contenido generado por IA.' },
          { code: 'B6.1', type: 'likert', text: 'Me siento confiado(a) al aprender nuevas tecnologías de IA.' },
          { code: 'B6.2', type: 'likert', text: 'Me preocupa que la IA sustituya mi trabajo en el futuro.', reverse: true },
          { code: 'B6.3', type: 'likert', text: 'Confío en las recomendaciones de la IA para decisiones importantes.' },
          { code: 'B6.4', type: 'likert', text: 'Creo que la IA puede ayudarme a ser más creativo(a) en mi trabajo.' },
          { code: 'B6.5', type: 'likert', text: 'Me inquieta que la IA cometa errores que puedan afectarme.', reverse: true },
          { code: 'B6.6', type: 'likert', text: 'Pienso que la IA traerá más beneficios que problemas a la sociedad.' }
        ],
        domains: {
          conocimiento_tecnico: ['B1.1', 'B1.2', 'B1.3', 'B1.4'],
          prompting: ['B2.1', 'B2.2', 'B2.3'],
          evaluacion_critica: ['B3.1', 'B3.2', 'B3.3'],
          aplicacion_innovadora: ['B4.1', 'B4.2', 'B4.3'],
          etica_regulacion: ['B5.1', 'B5.2', 'B5.3', 'B5.4'],
          actitudes_emociones: ['B6.1', 'B6.2', 'B6.3', 'B6.4', 'B6.5', 'B6.6']
        }
      }
    }
  };

  createSession(edad: number, group: 'menor' | 'adulto', consent: any): string {
    const sessionId = this.generateSessionId();
    const session: SessionData = {
      id: sessionId,
      edad,
      group,
      version: 'v1',
      consent,
      responses: {},
      createdAt: new Date()
    };
    
    this.currentSession.set(session);
    this.responses.set({});
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('diagnostico-persona-session', JSON.stringify(session));
    
    return sessionId;
  }

  updateResponse(itemCode: string, value: string): void {
    const current = this.responses();
    this.responses.set({ ...current, [itemCode]: value });
    
    // Actualizar sesión
    const session = this.currentSession();
    if (session) {
      session.responses = this.responses();
      this.currentSession.set({ ...session });
      localStorage.setItem('diagnostico-persona-session', JSON.stringify(session));
    }
  }

  getQuestionnaire(group: 'menor' | 'adulto'): any {
    return this.questionnaireData.groups[group];
  }

  getQuestions(group: 'menor' | 'adulto'): QuestionItem[] {
    return this.questionnaireData.groups[group].items;
  }

  getDomains(group: 'menor' | 'adulto'): Record<string, string[]> {
    return this.questionnaireData.groups[group].domains;
  }

  loadSessionFromStorage(): boolean {
    const stored = localStorage.getItem('diagnostico-persona-session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        this.currentSession.set(session);
        this.responses.set(session.responses || {});
        return true;
      } catch (error) {
        console.error('Error loading session from storage:', error);
        return false;
      }
    }
    return false;
  }

  clearSession(): void {
    this.currentSession.set(null);
    this.responses.set({});
    localStorage.removeItem('diagnostico-persona-session');
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
