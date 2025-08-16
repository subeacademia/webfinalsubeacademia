import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, catchError, timeout, retry, finalize, switchMap } from 'rxjs/operators';
import { AsistenteIaService } from '../../shared/ui/chatbot/asistente-ia.service';
import { AIMonitoringService } from './ai-monitoring.service';
import { ApiHealthService, ApiRequestProgress } from './api-health.service';
import { AI_CONFIG } from './ai-config';

export interface DiagnosticAnalysisData {
  userName: string;
  userRole: string;
  userIndustry: string;
  topCompetencies: { name: string; score: number }[];
  lowestCompetencies: { name: string; score: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class GenerativeAiService {

  constructor(
    private asistenteIaService: AsistenteIaService,
    private monitoringService: AIMonitoringService,
    private apiHealthService: ApiHealthService
  ) { }

  generateDiagnosticAnalysis(data: DiagnosticAnalysisData): Observable<string> {
    const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔍 Intentando conectar con API externa de IA...');

    // Crear el payload con el formato correcto que espera Vercel
    const payload = {
      messages: [
        { 
          role: 'system', 
          content: this.buildPrompt(data) 
        }
      ],
      maxTokens: 2048,
      temperature: 0.8,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1
    };

    // Hacer la llamada directa a la API
    return this.apiHealthService.sendRequestWithProgress(payload).pipe(
      timeout(30000), // 30 segundos máximo
      map((result) => {
        console.log('✅ Respuesta exitosa de API externa:', result);
        
        // Extraer la respuesta real
        if (result && result.response) {
          const apiResponse = result.response;
          console.log('📤 Respuesta de API recibida:', apiResponse);
          
          // Si la respuesta es directamente un string
          if (typeof apiResponse === 'string') {
            console.log('✅ Respuesta string recibida, longitud:', apiResponse.length);
            return apiResponse;
          }
          
          // Si la respuesta tiene estructura de OpenAI
          if (apiResponse && typeof apiResponse === 'object') {
            if ('choices' in apiResponse && Array.isArray(apiResponse.choices) && apiResponse.choices.length > 0) {
              const choice = apiResponse.choices[0];
              if ('message' in choice && 'content' in choice.message) {
                console.log('✅ Respuesta OpenAI recibida, longitud:', choice.message.content.length);
                return choice.message.content;
              }
            }
            // Si tiene estructura personalizada
            if ('content' in apiResponse) {
              console.log('✅ Respuesta con content recibida, longitud:', apiResponse.content.length);
              return apiResponse.content;
            }
            if ('message' in apiResponse) {
              console.log('✅ Respuesta con message recibida, longitud:', apiResponse.message.length);
              return apiResponse.message;
            }
          }
        }
        
        console.warn('⚠️ Estructura de respuesta inesperada, usando fallback:', result);
        return this.generateFallbackAnalysis(data);
      }),
      catchError((error) => {
        console.warn('⚠️ API externa no disponible, usando fallback local:', error.message);
        
        // Fallback inmediato a análisis local
        return of(this.generateFallbackAnalysis(data));
      })
    );
  }

  generateActionPlanWithAI(data: DiagnosticAnalysisData): Observable<string> {
    const requestId = `action_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔍 Generando plan de acción con IA...');

    // Crear el payload con el formato correcto que espera Vercel
    const payload = {
      messages: [
        { 
          role: 'system', 
          content: this.buildActionPlanPrompt(data) 
        }
      ],
      maxTokens: 1500,
      temperature: 0.8,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1
    };

    // Hacer la llamada directa a la API
    return this.apiHealthService.sendRequestWithProgress(payload).pipe(
      timeout(25000), // 25 segundos máximo
      map((result) => {
        console.log('✅ Plan de acción generado exitosamente:', result);
        
        // Extraer la respuesta real
        if (result && result.response) {
          const apiResponse = result.response;
          console.log('📤 Respuesta de API para plan de acción:', apiResponse);
          
          // Si la respuesta es directamente un string
          if (typeof apiResponse === 'string') {
            console.log('✅ Respuesta string recibida, longitud:', apiResponse.length);
            return apiResponse;
          }
          
          // Si la respuesta tiene estructura de OpenAI
          if (apiResponse && typeof apiResponse === 'object') {
            if ('choices' in apiResponse && Array.isArray(apiResponse.choices) && apiResponse.choices.length > 0) {
              const choice = apiResponse.choices[0];
              if ('message' in choice && 'content' in choice.message) {
                console.log('✅ Respuesta OpenAI recibida, longitud:', choice.message.content.length);
                return choice.message.content;
              }
            }
            // Si tiene estructura personalizada
            if ('content' in apiResponse) {
              console.log('✅ Respuesta con content recibida, longitud:', apiResponse.content.length);
              return apiResponse.content;
            }
            if ('message' in apiResponse) {
              console.log('✅ Respuesta con message recibida, longitud:', apiResponse.message.length);
              return apiResponse.message;
            }
          }
        }
        
        console.warn('⚠️ Estructura de respuesta inesperada para plan de acción, usando fallback:', result);
        return this.generateFallbackActionPlan(data);
      }),
      catchError((error) => {
        console.warn('⚠️ Error generando plan de acción con IA, usando fallback local:', error.message);
        
        return of(this.generateFallbackActionPlan(data));
      })
    );
  }

  private buildPrompt(data: DiagnosticAnalysisData): string {
    return `Actúa como un coach ejecutivo y experto en desarrollo de talento para la empresa Sube Academia. Tu tono debe ser inspirador, profesional y constructivo. Genera un informe narrativo detallado y completo en formato Markdown, basado en los datos del usuario.

**Informe a Generar:**

### 1. 🚀 Tus Superpoderes: Análisis de Fortalezas
Escribe un párrafo completo y detallado reconociendo las fortalezas de ${data.userName}. Explica cómo sus competencias destacadas (ej. ${data.topCompetencies[0]?.name || 'Liderazgo'}) son un activo invaluable en su rol de ${data.userRole} dentro de la industria de ${data.userIndustry}. 

**Incluye:**
- Ejemplos específicos de cómo estas fortalezas se manifiestan en el trabajo diario
- Beneficios concretos que aportan al equipo y la organización
- Una sugerencia específica y accionable sobre cómo puede utilizar una de estas fortalezas para liderar o innovar en su trabajo esta misma semana
- Métricas o indicadores que puede usar para medir el impacto

### 2. 🌱 Tu Próximo Nivel: Oportunidades de Crecimiento
Escribe un párrafo completo y empático sobre las áreas de oportunidad. Presenta estas competencias (ej. ${data.lowestCompetencies[0]?.name || 'Comunicación'}) no como debilidades, sino como las "llaves" que desbloquearán su siguiente nivel de crecimiento profesional.

**Incluye:**
- Explicación de por qué esta competencia es crucial en su rol actual
- Un escenario laboral específico y realista donde mejorar esta área podría marcar una gran diferencia
- Beneficios tangibles que obtendría al desarrollar esta competencia
- Obstáculos comunes y cómo superarlos
- Una historia de éxito de alguien que desarrolló esta competencia

### 3. 📋 Plan de Acción Estratégico Detallado
Crea una lista completa con 5 "micro-acciones" personalizadas y accionables para la próxima semana. Cada acción debe ser una combinación inteligente de sus fortalezas y áreas de oportunidad.

**Para cada acción incluye:**
- Descripción específica de la tarea
- Tiempo estimado requerido
- Recursos necesarios
- Criterios de éxito medibles
- Cómo combina fortalezas con desarrollo

**Ejemplo de estructura:**
- **🎯 Micro-acción 1**: [Descripción detallada con tiempo, recursos y criterios de éxito]
- **🎯 Micro-acción 2**: [Descripción detallada con tiempo, recursos y criterios de éxito]
- **🎯 Micro-acción 3**: [Descripción detallada con tiempo, recursos y criterios de éxito]
- **🎯 Micro-acción 4**: [Descripción detallada con tiempo, recursos y criterios de éxito]
- **🎯 Micro-acción 5**: [Descripción detallada con tiempo, recursos y criterios de éxito]

### 4. 💡 Recursos y Herramientas Específicas
- **Cursos Recomendados**: 3 cursos específicos de nuestra plataforma con duración y nivel
- **Lectura Complementaria**: 2 artículos o libros con resumen de beneficios
- **Prácticas Diarias**: 3 ejercicios de 5-10 minutos que puede hacer en su trabajo
- **Mentoría**: Cómo identificar y conectar con mentores en su área

**Instrucciones adicionales:**
- Mantén un tono motivador, constructivo y profesional
- Usa ejemplos específicos del contexto del usuario y su industria
- Haz que cada recomendación sea accionable inmediatamente
- Incluye métricas y KPIs para medir el progreso
- Usa lenguaje claro, directo y empoderador
- Limita cada sección principal a 2-3 párrafos para mantener el enfoque
- Agrega emojis estratégicamente para hacer el contenido más atractivo

Genera un análisis completo y detallado para ${data.userName}, ${data.userRole} en ${data.userIndustry}. Asegúrate de que sea personalizado, accionable y motivador.`;
  }

  private buildActionPlanPrompt(data: DiagnosticAnalysisData): string {
    return `Actúa como un coach ejecutivo y experto en desarrollo de talento para la empresa Sube Academia. Tu tono debe ser inspirador, profesional y constructivo. Genera un plan de acción personalizado, detallado y altamente accionable en formato Markdown.

**Plan de Acción a Generar:**

### 🎯 Plan de Acción Personalizado para ${data.userName}

**Contexto del Usuario:**
- **Rol**: ${data.userRole}
- **Industria**: ${data.userIndustry}
- **Fortaleza principal**: ${data.topCompetencies[0]?.name || 'Liderazgo'}
- **Área de oportunidad**: ${data.lowestCompetencies[0]?.name || 'Comunicación'}

**Estructura del Plan:**

#### 1. 🚀 Acción Inmediata (Esta Semana)
Escribe una acción específica, medible y accionable que el usuario puede realizar esta misma semana. Debe combinar inteligentemente su fortaleza principal con el desarrollo de su área de oportunidad.

**Incluye:**
- Descripción detallada de la tarea
- Tiempo estimado (máximo 2 horas)
- Recursos necesarios
- Criterios de éxito específicos
- Cómo combina fortalezas con desarrollo
- Obstáculos potenciales y cómo superarlos

#### 2. 📈 Acción de Medio Plazo (Próximo Mes)
Describe una meta más ambiciosa para el próximo mes que construya sobre la primera acción y genere momentum.

**Incluye:**
- Objetivo específico y medible
- Plan de implementación semanal
- Recursos y apoyo necesario
- Métricas de progreso
- Beneficios esperados
- Cómo se conecta con la acción inmediata

#### 3. 🎯 Acción de Largo Plazo (Próximos 3 Meses)
Define una transformación profesional significativa que el usuario puede lograr en los próximos 3 meses.

**Incluye:**
- Visión clara del resultado final
- Hitos intermedios mensuales
- Recursos y capacitación necesarios
- Impacto en su carrera y organización
- Cómo se conecta con las acciones anteriores
- Plan de contingencia

#### 4. 💡 Recursos y Herramientas Específicas
- **Cursos de la Plataforma**: 3 cursos específicos con duración, nivel y beneficios para su desarrollo
- **Lectura Recomendada**: 2 artículos o libros con resumen ejecutivo y aplicación práctica
- **Prácticas Diarias**: 3 ejercicios de 5-15 minutos que puede integrar en su rutina laboral
- **Mentoría y Networking**: Estrategias específicas para conectar con expertos en su área
- **Herramientas Digitales**: Apps o software que faciliten su desarrollo

#### 5. 📊 Sistema de Seguimiento y Medición
- **KPIs Semanales**: 3 indicadores clave para medir el progreso semanal
- **Revisión Mensual**: Proceso estructurado para evaluar avances y ajustar el plan
- **Celebración de Logros**: Cómo reconocer y celebrar cada paso completado
- **Ajustes del Plan**: Cuándo y cómo modificar el plan según los resultados

**Instrucciones Específicas:**
- Mantén un tono motivador, constructivo y empoderador
- Haz cada acción específica, medible, accionable, relevante y con tiempo definido (SMART)
- Usa el contexto del usuario para personalizar cada recomendación
- Incluye ejemplos concretos y escenarios realistas
- Limita cada sección a 3-4 oraciones para mantener el enfoque
- Usa emojis estratégicamente para hacer el contenido más atractivo
- Asegúrate de que cada acción sea realizable en el contexto laboral del usuario
- Incluye elementos de gamificación para mantener la motivación

**Formato de Salida:**
- Usa Markdown con encabezados claros
- Incluye listas con viñetas para acciones específicas
- Agrega bloques de código para métricas y KPIs
- Usa tablas para comparar opciones cuando sea apropiado
- Incluye enlaces simulados para recursos (ej: [Curso: Liderazgo Efectivo])

Genera un plan completo, detallado y altamente accionable para ${data.userName}, ${data.userRole} en ${data.userIndustry}. Asegúrate de que sea personalizado, realista y motivador.`;
  }

  private generateFallbackActionPlan(data: DiagnosticAnalysisData): string {
    const topComp = data.topCompetencies[0]?.name || 'Liderazgo';
    const lowComp = data.lowestCompetencies[0]?.name || 'Comunicación';
    
    return `## 🎯 Plan de Acción Personalizado Generado Localmente

### 🚀 Acción Inmediata (Esta Semana)
${data.userName}, esta semana dedica 30 minutos a aplicar tu fortaleza en **${topComp}** para mejorar en **${lowComp}**. Por ejemplo, si tu fortaleza es el análisis, estructura una presentación sobre ${lowComp.toLowerCase()} y compártela con tu equipo.

### 📈 Acción de Medio Plazo (Próximo Mes)
Durante el próximo mes, identifica 3 oportunidades semanales para practicar ${lowComp.toLowerCase()} en situaciones de bajo riesgo. Documenta tu progreso y celebra cada pequeño avance.

### 🎯 Acción de Largo Plazo (Próximos 3 Meses)
En los próximos 3 meses, busca un proyecto o iniciativa donde puedas liderar usando ${topComp.toLowerCase()} mientras desarrollas activamente ${lowComp.toLowerCase()}. Esto te posicionará como un profesional integral.

### 💡 Recursos y Herramientas
- **Curso Recomendado**: Busca en nuestra plataforma cursos sobre ${lowComp.toLowerCase()}
- **Práctica Diaria**: Dedica 10 minutos diarios a leer artículos sobre ${lowComp.toLowerCase()}
- **Mentoría**: Identifica un colega experto en ${lowComp.toLowerCase()} para intercambiar conocimientos

---

*💡 **Nota**: Este plan fue generado localmente para garantizar una experiencia inmediata. Los insights están basados en las mejores prácticas de desarrollo profesional.*`;
  }

  private generateFallbackAnalysis(data: DiagnosticAnalysisData): string {
    const topComp = data.topCompetencies[0]?.name || 'Liderazgo';
    const lowComp = data.lowestCompetencies[0]?.name || 'Comunicación';
    
    return `## 🎯 Análisis Personalizado Generado Localmente

### 1. 🚀 Tus Superpoderes: Análisis de Fortalezas
${data.userName}, tu competencia destacada en **${topComp}** es un activo invaluable en tu rol de ${data.userRole} dentro de la industria de ${data.userIndustry}. Esta fortaleza te permite destacarte en situaciones que requieren ${topComp.toLowerCase()} y te posiciona como un referente en tu equipo. 

**🎯 Esta semana**, identifica una reunión o proyecto donde puedas aplicar esta competencia de manera consciente para inspirar a otros. Por ejemplo, si tu fortaleza es el liderazgo, toma la iniciativa en una discusión de equipo y guía la conversación hacia soluciones constructivas.

### 2. 🌱 Tu Próximo Nivel: Oportunidades de Crecimiento
Tu área de oportunidad en **${lowComp}** no es una debilidad, sino la llave que desbloqueará tu siguiente nivel de crecimiento profesional. En el entorno laboral actual, mejorar en ${lowComp.toLowerCase()} puede marcar la diferencia entre ser un buen profesional y convertirte en un líder excepcional.

**🎯 Esta semana**, busca una situación donde normalmente te sientas menos cómodo con ${lowComp.toLowerCase()} y afróntala como una oportunidad de crecimiento. Por ejemplo, si es comunicación, practica presentando una idea en una reunión de equipo.

### 3. 📋 Plan de Acción Estratégico

- **🎯 Micro-acción 1**: Dedica 15 minutos esta semana a leer un artículo sobre ${lowComp.toLowerCase()} y aplica una técnica aprendida en tu trabajo diario. Documenta qué funcionó y qué podrías mejorar.

- **🎯 Micro-acción 2**: Usa tu fortaleza en ${topComp.toLowerCase()} para estructurar una tarea que requiera ${lowComp.toLowerCase()}, combinando ambas competencias. Por ejemplo, si eres bueno en análisis pero quieres mejorar la comunicación, estructura una presentación usando tu pensamiento analítico.

- **🎯 Micro-acción 3**: Programa una sesión de 30 minutos para revisar tu plan de desarrollo profesional, enfocándote en cómo tus fortalezas pueden acelerar el desarrollo de tus áreas de oportunidad. Establece 3 metas específicas para el próximo mes.

---

*💡 **Nota**: Este análisis fue generado localmente para garantizar una experiencia inmediata. Los insights están basados en las mejores prácticas de desarrollo profesional y coaching ejecutivo.*`;
  }
}
