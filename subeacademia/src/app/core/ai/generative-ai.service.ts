import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AsistenteIaService } from '../../shared/ui/chatbot/asistente-ia.service';
import { AIMonitoringService } from './ai-monitoring.service';
import { ApiHealthService, ApiRequestProgress } from './api-health.service';
import { AI_CONFIG } from './ai-config';

// Interfaz para los datos de entrada, mantenemos la estructura
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
    // 1. CONSTRUCCIÓN DEL PROMPT DE SISTEMA (LAS INSTRUCCIONES)
    // Este prompt es más detallado y le da a la IA un formato de salida claro.
    const systemPrompt = `
      Actúa como un coach ejecutivo y experto en desarrollo de talento para la empresa Sube Academia.
      Tu tono debe ser inspirador, profesional, constructivo y altamente personalizado.
      Tu misión es analizar los datos del diagnóstico de un usuario y generar un informe narrativo conciso y poderoso en formato Markdown.
      El informe debe tener exactamente 3 secciones: "Tus Superpoderes", "Tu Próximo Nivel" y "Plan de Acción Estratégico".
      Utiliza negritas para resaltar conceptos clave.
    `;

    // 2. CONSTRUCCIÓN DEL PROMPT DE USUARIO (LOS DATOS A ANALIZAR)
    // Presentamos los datos del usuario de forma clara y estructurada.
    const userPrompt = `
      Por favor, genera el informe de diagnóstico para el siguiente perfil:

      **Datos del Usuario:**
      - **Nombre:** ${data.userName}
      - **Rol Actual:** ${data.userRole}
      - **Industria:** ${data.userIndustry}

      **Resultados del Diagnóstico:**
      - **Competencias Destacadas (Fortalezas):**
        ${data.topCompetencies.map(c => `- ${c.name} (Puntaje: ${c.score}/100)`).join('\n')}
      
      - **Áreas de Oportunidad (Para Crecer):**
        ${data.lowestCompetencies.map(c => `- ${c.name} (Puntaje: ${c.score}/100)`).join('\n')}

      Genera el informe siguiendo estrictamente las 3 secciones y el tono definidos en tus instrucciones de sistema.
    `;

    // 3. CONSTRUCCIÓN DEL PAYLOAD CORRECTO
    // Esta es la corrección clave: enviamos un mensaje de sistema y uno de usuario.
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 1200, // Aumentamos para asegurar un análisis completo
      temperature: 0.7
    };

    // 4. LLAMADA A LA API Y MANEJO DE RESPUESTA
    return this.asistenteIaService.generarTextoAzure(payload).pipe(
      map((res: any) => {
        // Extraemos el contenido de la respuesta de la IA
        if (res && res.choices && res.choices[0]?.message?.content) {
          return res.choices[0].message.content;
        }
        // Fallback por si la estructura de la respuesta cambia
        if (res && res.text) return res.text;
        if (typeof res === 'string') return res;
        
        // Si no se encuentra contenido, lanzamos un error manejable
        throw new Error('Respuesta de la IA inválida o vacía.');
      }),
      catchError(err => {
        console.error('Error al generar el análisis del diagnóstico:', err);
        // Devolvemos un mensaje de error amigable para mostrar en la UI
        return of('Lo sentimos, no hemos podido generar tu análisis personalizado en este momento. Por favor, intenta recargar la página.');
      })
    );
  }

  generateActionPlanWithAI(data: DiagnosticAnalysisData): Observable<string> {
    // 1. CONSTRUCCIÓN DEL PROMPT DE SISTEMA (LAS INSTRUCCIONES)
    const systemPrompt = `
      Actúa como un coach ejecutivo y experto en desarrollo de talento para la empresa Sube Academia.
      Tu tono debe ser inspirador, profesional y constructivo.
      Genera un plan de acción personalizado, detallado y altamente accionable en formato Markdown.
      El plan debe tener exactamente 3 secciones: "Acción Inmediata", "Acción de Medio Plazo" y "Acción de Largo Plazo".
      Utiliza negritas para resaltar conceptos clave y emojis para hacer el contenido más atractivo.
    `;

    // 2. CONSTRUCCIÓN DEL PROMPT DE USUARIO (LOS DATOS A ANALIZAR)
    const userPrompt = `
      Por favor, genera el plan de acción personalizado para el siguiente perfil:

      **Datos del Usuario:**
      - **Nombre:** ${data.userName}
      - **Rol Actual:** ${data.userRole}
      - **Industria:** ${data.userIndustry}

      **Resultados del Diagnóstico:**
      - **Competencias Destacadas (Fortalezas):**
        ${data.topCompetencies.map(c => `- ${c.name} (Puntaje: ${c.score}/100)`).join('\n')}
      
      - **Áreas de Oportunidad (Para Crecer):**
        ${data.lowestCompetencies.map(c => `- ${c.name} (Puntaje: ${c.score}/100)`).join('\n')}

      Genera el plan siguiendo estrictamente las 3 secciones y el tono definidos en tus instrucciones de sistema.
    `;

    // 3. CONSTRUCCIÓN DEL PAYLOAD CORRECTO
    const payload = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 1500,
      temperature: 0.7
    };

    // 4. LLAMADA A LA API Y MANEJO DE RESPUESTA
    return this.asistenteIaService.generarTextoAzure(payload).pipe(
      map((res: any) => {
        // Extraemos el contenido de la respuesta de la IA
        if (res && res.choices && res.choices[0]?.message?.content) {
          return res.choices[0].message.content;
        }
        // Fallback por si la estructura de la respuesta cambia
        if (res && res.text) return res.text;
        if (typeof res === 'string') return res;
        
        // Si no se encuentra contenido, lanzamos un error manejable
        throw new Error('Respuesta de la IA inválida o vacía.');
      }),
      catchError(err => {
        console.error('Error al generar el plan de acción con IA:', err);
        // Devolvemos un mensaje de error amigable para mostrar en la UI
        return of('Lo sentimos, no hemos podido generar tu plan de acción personalizado en este momento. Por favor, intenta recargar la página.');
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
