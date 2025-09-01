import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiagnosticoFormValue } from '../../features/diagnostico/data/diagnostic.models';
import { ARES_ITEMS } from '../../features/diagnostico/data/ares-items';
import { COMPETENCIAS } from '../../features/diagnostico/data/competencias';

// Interfaz para la respuesta esperada de la API de Vercel
interface VercelApiResponse {
  result: string;
}

@Injectable({
  providedIn: 'root',
})
export class GenerativeAiService {
  private http = inject(HttpClient);
  // URL de la API alojada en Vercel
  private apiUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';

  constructor() {}

  /**
   * Genera el plan de acción y el diagnóstico utilizando la IA.
   * @param diagnosticData Los datos completos del diagnóstico del usuario.
   * @returns Una promesa que se resuelve con el texto generado por la IA.
   */
  async generateActionPlan(diagnosticData: DiagnosticoFormValue): Promise<string> {
    console.log('🚀 GenerativeAiService: Iniciando generación de plan de acción');
    console.log('📊 Datos recibidos:', diagnosticData);

    // Validar datos de entrada
    if (!diagnosticData) {
      console.error('❌ No se proporcionaron datos de diagnóstico');
      throw new Error('No se proporcionaron datos de diagnóstico');
    }

    const prompt = this.constructPrompt(diagnosticData);
    console.log('📝 Prompt construido:', prompt.substring(0, 200) + '...');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = {
      prompt: prompt,
    };

    try {
      console.log('🌐 Enviando solicitud a la API de Vercel...');
      console.log('🔗 URL:', this.apiUrl);
      
      const response = await firstValueFrom(
        this.http.post<VercelApiResponse>(this.apiUrl, body, { 
          headers,
          timeout: 30000 // 30 segundos de timeout
        })
      );
      
      console.log('✅ Respuesta recibida de la API:', response);

      if (response && typeof response.result === 'string' && response.result.trim()) {
        console.log('🎉 Contenido generado exitosamente');
        return response.result;
      } else {
        console.warn('⚠️ Respuesta vacía o inválida de la API');
        throw new Error('La respuesta de la API está vacía o no tiene el formato esperado.');
      }
    } catch (error: any) {
      console.error('❌ Error al llamar a la API de Vercel:', error);
      
      // Proporcionar información más detallada del error
      if (error.status === 0) {
        console.error('🔌 Error de conexión - verificar conectividad');
        throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
      } else if (error.status === 404) {
        console.error('🔍 Endpoint no encontrado');
        throw new Error('El servicio de IA no está disponible temporalmente.');
      } else if (error.status >= 500) {
        console.error('🔥 Error del servidor');
        throw new Error('Error interno del servidor. Intenta de nuevo en unos minutos.');
      } else {
        console.error('❓ Error desconocido:', error.message);
        throw new Error(`Error al generar el plan de acción: ${error.message}`);
      }
    }
  }

  /**
   * Construye un prompt detallado y estructurado para la IA.
   * @param data Los datos del diagnóstico.
   * @returns Un string con el prompt completo.
   */
  private constructPrompt(data: DiagnosticoFormValue): string {
    const aresResults = Object.entries(data.ares.respuestas || {})
      .map(([key, value]) => {
        const item = ARES_ITEMS.find((i) => i.id === key);
        return `- ${item?.labelKey || key}: ${value}/5`;
      })
      .join('\n');

    const competenciasResults = Object.entries(data.competencias.niveles || {})
      .map(([key, value]) => {
        const item = COMPETENCIAS.find((c) => c.id === key);
        return `- ${item?.nameKey || key}: ${value}`;
      })
      .join('\n');

    return `
      **Rol:** Eres un consultor experto en transformación digital e inteligencia artificial, especializado en el marco de trabajo "ARES-AI Framework" y en el desarrollo de "Competencias para la era de la IA".

      **Contexto:** Un usuario ha completado un diagnóstico de madurez en IA. Debes analizar sus resultados y generar un informe completo y un plan de acción personalizado. El diagnóstico se basa en dos pilares:
      1.  **ARES-AI Framework:** Evalúa la madurez de la organización para implementar IA de forma Ágil, Responsable, Ética y Sostenible.
      2.  **13 Competencias de la Era de la IA:** Evalúa las habilidades del equipo para la era de la IA.

      **Datos del Diagnóstico del Usuario:**

      **1. Contexto Organizacional:**
      - Industria: ${data.contexto.industria || 'No especificado'}
      - Tamaño de la empresa: ${data.contexto.tamanoEquipo || data.contexto.tamanoEmpresa || data.contexto.numEmpleados || 'No especificado'}
      - Objetivo principal con la IA: ${data.objetivo || 'No especificado'}

      **2. Resultados del ARES-AI Framework (puntuación sobre 100):**
      ${aresResults}

      **3. Resultados de las 13 Competencias Clave (puntuación sobre 100):**
      ${competenciasResults}

      **Tarea y Formato de Salida Obligatorio:**

      Basándote en los datos proporcionados, genera un informe en formato MARKDOWN que contenga EXACTAMENTE las siguientes secciones:

      ###  Diagnóstico de Madurez en IA

      **Análisis General:**
      (Aquí, escribe un párrafo conciso de 2 o 3 líneas resumiendo el nivel de madurez general del usuario, combinando los resultados de ARES y las competencias. Identifica si está en una etapa inicial, intermedia o avanzada).

      **Nivel de Madurez ARES-AI:**
      (Analiza los puntajes del framework ARES. Destaca las áreas más fuertes y las más débiles. Proporciona una breve interpretación de lo que significan estos resultados para la organización).

      **Nivel de Competencias para la IA:**
      (Analiza los puntajes de las 13 competencias. Identifica las 3 competencias más desarrolladas y las 3 competencias con mayor oportunidad de mejora. Explica por qué estas brechas son importantes de cerrar dado su objetivo con la IA).

      ### Plan de Acción Personalizado

      (Crea una tabla en formato Markdown con 3 columnas: "Objetivo Estratégico", "Acciones Clave Recomendadas", y "Competencia Relacionada". El plan debe contener entre 3 y 5 objetivos estratégicos claros y accionables. Cada objetivo debe estar directamente relacionado con los puntos débiles identificados en el diagnóstico).

      **Ejemplo de la tabla (Usa este formato):**
      | Objetivo Estratégico | Acciones Clave Recomendadas | Competencia Relacionada |
      | :--- | :--- | :--- |
      | Fortalecer la Gobernanza Ética de la IA | - Crear un comité de ética de IA. <br>- Definir y comunicar principios éticos claros. <br>- Realizar auditorías de sesgo en los modelos actuales. | Liderazgo e Influencia Social |
      | Mejorar la Agilidad en Proyectos de IA | - Adoptar un ciclo de vida de proyectos de IA iterativo (CRISP-DM). <br>- Implementar herramientas de MLOps para automatizar despliegues. | Agilidad y Flexibilidad |
    `;
  }
}
