import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsistenteIaService } from '../../shared/ui/chatbot/asistente-ia.service';

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

  constructor(private asistenteIaService: AsistenteIaService) { }

  generateDiagnosticAnalysis(data: DiagnosticAnalysisData): Observable<string> {
    const systemPrompt = `Actúa como un coach ejecutivo y experto en desarrollo de talento para la empresa Sube Academia. Tu tono debe ser inspirador, profesional y constructivo. Genera un informe narrativo en 3 secciones, en formato Markdown, basado en los datos del usuario.

**Informe a Generar:**

### 1. Tus Superpoderes: Análisis de Fortalezas
Escribe un párrafo reconociendo las fortalezas de ${data.userName}. Explica cómo sus competencias destacadas (ej. ${data.topCompetencies[0]?.name || 'Liderazgo'}) son un activo invaluable en su rol de ${data.userRole} dentro de la industria de ${data.userIndustry}. Ofrece una sugerencia concreta sobre cómo puede utilizar una de estas fortalezas para liderar o innovar en su trabajo esta misma semana.

### 2. Tu Próximo Nivel: Oportunidades de Crecimiento
Escribe un párrafo empático y motivador sobre las áreas de oportunidad. Presenta estas competencias (ej. ${data.lowestCompetencies[0]?.name || 'Colaboración'}) no como debilidades, sino como las "llaves" que desbloquearán su siguiente nivel de crecimiento profesional. Explica brevemente un escenario laboral común donde mejorar esta área podría marcar una gran diferencia.

### 3. Plan de Acción Estratégico
Crea una lista con viñetas de 3 "micro-acciones" personalizadas y accionables para la próxima semana. Cada acción debe ser una combinación inteligente de sus fortalezas y áreas de oportunidad. Deben ser específicas y medibles. Por ejemplo: "Usa tu fortaleza en 'Pensamiento Analítico' para estructurar la agenda de una reunión, dedicando 10 minutos específicos a fomentar la 'Colaboración', tu área de oportunidad, pidiendo activamente la opinión de cada miembro."`;

    const payload = {
      messages: [{ role: 'system', content: systemPrompt }],
      maxTokens: 1024,
      temperature: 0.7
    };

    return this.asistenteIaService.generarTextoAzure(payload).pipe(
      map(res => {
        if (res && res.choices && res.choices[0]?.message?.content) {
          return res.choices[0].message.content;
        }
        return 'No se pudo generar el análisis en este momento. Por favor, inténtalo de nuevo más tarde.';
      })
    );
  }
}
