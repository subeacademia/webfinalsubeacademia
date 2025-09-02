import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ObjetivoGenerado {
  id: string;
  texto: string;
  categoria: string;
  prioridad: 'alta' | 'media' | 'baja';
  tiempoEstimado: string;
  impacto: string;
}

export interface ContextoCliente {
  industria: string;
  tamano: string;
  presupuesto: string;
  segmento: string;
  descripcionUsuario: string;
  aresDebilidades: string[];
  aresFortalezas: string[];
  competenciasBajas: string[];
}

export interface GeneracionObjetivosRequest {
  contexto: ContextoCliente;
  maxObjetivos?: number;
  enfoque?: 'procesos' | 'capacitacion' | 'analitica' | 'cx' | 'gobernanza' | 'innovacion' | 'general';
}

@Injectable({ providedIn: 'root' })
export class BesselAiService {
  private readonly http = inject(HttpClient);
  
  // Usar la API de Bessel configurada en environment
  private readonly apiUrl = environment.azureGenerateEndpoint || 'https://apisube-smoky.vercel.app/api/azure/generate';
  
  // Configuración de la API
  private readonly defaultConfig = {
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 30000, // 30 segundos
    retryAttempts: 2
  };

  /**
   * Genera objetivos personalizados usando la API de Bessel
   */
  generarObjetivos(request: GeneracionObjetivosRequest): Observable<ObjetivoGenerado[]> {
    const prompt = this.construirPromptInteligente(request);
    
    const payload = {
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor experto en transformación digital con IA. Genera objetivos SMART, accionables y específicos en formato JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: request.maxObjetivos ? Math.min(request.maxObjetivos * 150, this.defaultConfig.maxTokens) : this.defaultConfig.maxTokens,
      temperature: this.defaultConfig.temperature
    };

    return this.http.post<any>(this.apiUrl, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      timeout(this.defaultConfig.timeout),
      retry(this.defaultConfig.retryAttempts),
      map(response => this.procesarRespuestaObjetivos(response)),
      catchError(error => this.manejarError(error))
    );
  }

  /**
   * Construye un prompt inteligente basado en el contexto del cliente
   */
  private construirPromptInteligente(request: GeneracionObjetivosRequest): string {
    const { contexto, maxObjetivos = 6, enfoque = 'general' } = request;
    
    let prompt = `Eres un asesor experto en transformación digital con IA. 
Genera entre ${Math.max(4, maxObjetivos)} y ${Math.min(8, maxObjetivos + 2)} objetivos SMART, accionables y específicos, alineados al contexto y carencias detectadas.

Devuelve SOLO una lista JSON con este formato exacto:
[
  {
    "id": "obj-1",
    "texto": "Descripción del objetivo específico y medible",
    "categoria": "Categoría (Procesos/Capacitación/Analítica/CX/Gobernanza/Innovación)",
    "prioridad": "alta|media|baja",
    "tiempoEstimado": "X-Y meses",
    "impacto": "Descripción cuantificable del impacto esperado"
  }
]

Contexto del cliente:
- Industria: ${contexto.industria}
- Tamaño: ${contexto.tamano}
- Presupuesto: ${contexto.presupuesto}
- Segmento: ${contexto.segmento}
- Descripción del usuario: "${contexto.descripcionUsuario}"

Hallazgos del diagnóstico:
- Áreas más débiles (ARES): ${contexto.aresDebilidades.join(', ') || 'No disponible'}
- Áreas más fuertes (ARES): ${contexto.aresFortalezas.join(', ') || 'No disponible'}
- Competencias más bajas: ${contexto.competenciasBajas.join(', ') || 'No disponible'}

Enfoque solicitado: ${this.obtenerDescripcionEnfoque(enfoque)}

Genera objetivos que:
1. Sean específicos, medibles, alcanzables, relevantes y con tiempo definido (SMART)
2. Consideren el presupuesto y tamaño de la empresa
3. Aborden las debilidades detectadas en el diagnóstico
4. Aprovechen las fortalezas existentes
5. Sean realizables en el contexto actual
6. Tengan impacto medible y cuantificable
7. Se alineen con el enfoque solicitado

Prioriza objetivos de ${enfoque === 'general' ? 'alto impacto y rápida implementación' : 'la categoría solicitada'} según el contexto del cliente.`;

    return prompt;
  }

  /**
   * Obtiene la descripción del enfoque solicitado
   */
  private obtenerDescripcionEnfoque(enfoque: string): string {
    const enfoques: Record<string, string> = {
      'procesos': 'Optimización y automatización de procesos internos',
      'capacitacion': 'Desarrollo de competencias del equipo en IA',
      'analitica': 'Implementación de analítica avanzada y BI',
      'cx': 'Mejora de la experiencia del cliente con IA',
      'gobernanza': 'Gobernanza de datos y ética en IA',
      'innovacion': 'Innovación y desarrollo de nuevos productos/servicios',
      'general': 'Transformación digital integral con IA'
    };
    
    return enfoques[enfoque] || enfoques['general'];
  }

  /**
   * Procesa la respuesta de la API y la convierte en objetivos estructurados
   */
  private procesarRespuestaObjetivos(response: any): ObjetivoGenerado[] {
    try {
      const raw = response?.choices?.[0]?.message?.content ?? '';
      console.log('Respuesta API Bessel:', raw);
      
      // Intentar extraer JSON de la respuesta
      let parsedObjectives: any[] = [];
      
      try {
        // Buscar arrays JSON en la respuesta
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedObjectives = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Error parseando JSON de Bessel:', parseError);
        return [];
      }

      // Validar y limpiar objetivos
      return this.validarYLimpiarObjetivos(parsedObjectives);
      
    } catch (error) {
      console.error('Error procesando respuesta de Bessel:', error);
      return [];
    }
  }

  /**
   * Valida y limpia los objetivos generados
   */
  private validarYLimpiarObjetivos(objectives: any[]): ObjetivoGenerado[] {
    const valid: ObjetivoGenerado[] = [];
    
    for (const obj of objectives) {
      if (obj && typeof obj === 'object' && obj.texto && obj.categoria) {
        valid.push({
          id: obj.id || `bessel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          texto: obj.texto.trim(),
          categoria: obj.categoria || 'General',
          prioridad: ['alta', 'media', 'baja'].includes(obj.prioridad) ? obj.prioridad : 'media',
          tiempoEstimado: obj.tiempoEstimado || '3-6 meses',
          impacto: obj.impacto || 'Mejora en eficiencia y resultados'
        });
      }
    }
    
    return valid.slice(0, 8); // Máximo 8 objetivos
  }

  /**
   * Maneja errores de la API
   */
  private manejarError(error: any): Observable<ObjetivoGenerado[]> {
    console.error('Error en API de Bessel:', error);
    
    let errorMessage = 'Error desconocido en la generación de objetivos';
    
    if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servicio de IA. Verifica tu conexión a internet.';
    } else if (error.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';
    } else if (error.status >= 500) {
      errorMessage = 'Error interno del servicio de IA. Intenta nuevamente más tarde.';
    } else if (error.status >= 400) {
      errorMessage = 'Error en la solicitud. Verifica que la información sea válida.';
    }
    
    // Retornar objetivos de fallback en lugar de array vacío
    console.log('🔄 Usando objetivos de fallback debido a error en API');
    return of(this.generarObjetivosFallback());
  }

  /**
   * Genera objetivos de fallback cuando la API no está disponible
   */
  private generarObjetivosFallback(): ObjetivoGenerado[] {
    return [
      {
        id: 'fallback-1',
        texto: 'Implementar herramientas básicas de automatización para optimizar procesos operativos',
        categoria: 'Procesos',
        prioridad: 'alta',
        tiempoEstimado: '2-3 meses',
        impacto: 'Mejora del 20% en eficiencia operativa y reducción de errores manuales'
      },
      {
        id: 'fallback-2',
        texto: 'Capacitar al equipo en competencias digitales fundamentales y herramientas de IA',
        categoria: 'Capacitación',
        prioridad: 'alta',
        tiempoEstimado: '1-2 meses',
        impacto: 'Mejora del 30% en competencias digitales del equipo y mayor adopción tecnológica'
      },
      {
        id: 'fallback-3',
        texto: 'Establecer un sistema básico de análisis de datos para mejorar la toma de decisiones',
        categoria: 'Analítica',
        prioridad: 'media',
        tiempoEstimado: '3-4 meses',
        impacto: 'Mejora del 25% en precisión de decisiones y optimización de recursos'
      },
      {
        id: 'fallback-4',
        texto: 'Mejorar la experiencia del cliente mediante canales digitales y atención automatizada',
        categoria: 'CX',
        prioridad: 'media',
        tiempoEstimado: '2-3 meses',
        impacto: 'Aumento del 20% en satisfacción del cliente y reducción del 30% en tiempo de respuesta'
      },
      {
        id: 'fallback-5',
        texto: 'Implementar políticas básicas de seguridad de datos y privacidad',
        categoria: 'Gobernanza',
        prioridad: 'alta',
        tiempoEstimado: '1-2 meses',
        impacto: 'Cumplimiento normativo básico y reducción del 40% en riesgos de seguridad'
      },
      {
        id: 'fallback-6',
        texto: 'Explorar oportunidades de innovación con tecnologías emergentes',
        categoria: 'Innovación',
        prioridad: 'baja',
        tiempoEstimado: '4-6 meses',
        impacto: 'Identificación de nuevas oportunidades de negocio y diferenciación competitiva'
      }
    ];
  }

  /**
   * Verifica el estado de salud de la API
   */
  verificarSaludApi(): Observable<boolean> {
    const testPayload = {
      messages: [{ role: 'system', content: 'Test connection' }],
      maxTokens: 10,
      temperature: 0.1
    };

    return this.http.post<any>(this.apiUrl, testPayload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      timeout(10000),
      map(() => true),
      catchError(() => of(false))
    );
  }
}
