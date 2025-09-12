import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { INDUSTRIES } from '../../../data/industries';
import { BesselAiService } from '../../../../../core/ai/bessel-ai.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { ToastService, ToastKind } from '../../../../../core/ui/toast/toast.service';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-objetivo.component.html',
})
export class StepObjetivoComponent {
  private fb = inject(FormBuilder);
  public diagnosticState = inject(DiagnosticStateService);
  private besselAiService = inject(BesselAiService);
  private generativeAiService = inject(GenerativeAiService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);
  private router = inject(Router);

  industries = INDUSTRIES;
  sugerencias = signal<string[]>([]);
  isLoadingSuggestions = signal(false);
  isGenerating = signal(false); // Signal para el estado de carga de la nueva funcionalidad

  form = this.fb.group({
    rol: ['', Validators.required],
    industria: ['', Validators.required],
    objetivo: ['', Validators.required],
  });

  get allFieldsFilled(): boolean {
    return !!this.form.get('rol')?.value && !!this.form.get('industria')?.value;
  }

  async generarSugerencias() {
    if (this.isLoadingSuggestions() || !this.allFieldsFilled) return;
    this.isLoadingSuggestions.set(true);
    this.sugerencias.set([]);
    try {
      const suggestions = await this.besselAiService.generarSugerenciasDeObjetivos(this.form.value.rol!, this.form.value.industria!);
      if (suggestions) {
        this.sugerencias.set(suggestions);
      } else {
        this.toastService.show('error', 'No se pudieron generar las sugerencias.');
      }
    } catch (error) {
      console.error('Error al generar sugerencias:', error);
      this.toastService.show('error', 'No se pudieron generar las sugerencias.');
    } finally {
      this.isLoadingSuggestions.set(false);
    }
  }

  seleccionarSugerencia(sugerencia: string) {
    this.form.patchValue({ objetivo: sugerencia });
  }

  /**
   * Genera objetivos empresariales usando IA con contexto del usuario
   */
  async generateObjectivesWithAI(): Promise<void> {
    const userObjective = this.form.get('objetivo')?.value;
    if (!userObjective || userObjective.trim().length < 10) {
      this.toastService.show('warning', 'Por favor, escribe un objetivo más detallado para que la IA pueda ayudarte a mejorarlo.');
      return;
    }

    this.isGenerating.set(true);
    const industry = this.form.get('industria')?.value || this.diagnosticState.state().objetivo?.industria || 'una empresa';

    // --- PROMPT DE REFINAMIENTO DE ALTA PRECISIÓN v3 - ONE-SHOT PROMPTING ---
    const prompt = `
      **Rol:** Eres un Asistente de Estrategia de Negocios. Tu única tarea es refinar un objetivo de negocio dado por un cliente para que sea SMART.

      **Reglas Estrictas:**
      1.  Debes basarte 100% en la intención del objetivo proporcionado.
      2.  No puedes inventar temas nuevos. Si el objetivo es sobre "crecimiento", tus respuestas deben ser sobre crecimiento medible.
      3.  Tu respuesta debe ser un array JSON de 3 strings, y nada más.

      **Ejemplo de cómo debes trabajar:**
      * **Objetivo del Cliente:** "quiero crecer y posicionar mi marca"
      * **Tu Respuesta (JSON exacto):**
          [
            "Incrementar la cuota de mercado en un 5% y aumentar el reconocimiento de marca en un 10% (medido por encuestas) en los próximos 18 meses.",
            "Lograr un crecimiento de ingresos del 30% año contra año y asegurar 3 apariciones en medios de comunicación relevantes del sector antes de fin de año.",
            "Aumentar en un 40% la base de clientes del nuevo segmento de mercado y posicionar la marca como líder en sostenibilidad en nuestro informe anual."
          ]

      **Ahora, aplica estas reglas al siguiente objetivo:**
      * **Objetivo del Cliente:** "${userObjective}"
      * **Tu Respuesta (JSON exacto):**
    `;

    try {
      const response = await this.generativeAiService.generateText(prompt);
      
      // La respuesta de la IA a veces viene con texto extra y markdown.
      // Esta expresión regular extrae el primer bloque JSON que encuentra.
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch || !jsonMatch[0]) {
        console.error("Respuesta de IA recibida:", response);
        throw new Error("La respuesta de la IA no contenía un array JSON válido.");
      }
      
      const jsonString = jsonMatch[0];
      const objectives: string[] = JSON.parse(jsonString);

      // VALIDACIÓN DE ESTRUCTURA: Verifica que sea un array válido.
      if (!Array.isArray(objectives) || objectives.length === 0) {
          console.error("JSON parseado pero con estructura incorrecta:", objectives);
          throw new Error("El JSON de la IA no es un array válido de objetivos.");
      }

      if (objectives && objectives.length > 0) {
        this.form.controls['objetivo'].setValue(objectives[0]);
        this.sugerencias.set(objectives);
        this.toastService.show('success', 'Objetivo refinado con IA. Puedes editarlo si lo deseas.');
      } else {
        throw new Error("La IA devolvió una lista de objetivos vacía.");
      }
    } catch (error) {
      console.error('Error al procesar la respuesta de la IA para objetivos:', error);
      this.toastService.show('error', 'No pudimos refinar tu objetivo en este momento. Por favor, revisa que sea claro o inténtalo de nuevo.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  next() {
    if (this.form.valid) {
      this.diagnosticState.updateData({ objetivo: this.form.value as any });
      const currentUrl = this.router.url;
      const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
      this.router.navigate([`/${languagePrefix}/diagnostico/finalizar`]);
    } else {
      this.form.markAllAsTouched();
    }
  }

  previous() {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico/competencias`]);
  }
}