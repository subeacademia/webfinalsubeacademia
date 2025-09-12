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
      this.sugerencias.set(suggestions);
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
    this.isGenerating.set(true);
    
    try {
      const currentState = this.diagnosticState.state();
      const industry = this.form.get('industria')?.value || currentState.objetivo?.industria || 'negocios en general';
      const companySize = 'una PyME'; // Valor por defecto ya que no hay contexto específico de tamaño

      // --- Prompt de Alta Calidad ---
      const prompt = `
        Actúa como un consultor de estrategia de negocios especializado en transformación digital e IA.
        Para una empresa del sector "${industry}" y del tamaño de "${companySize}", genera 3 objetivos empresariales SMART (Específicos, Medibles, Alcanzables, Relevantes, con Plazo).
        Los objetivos deben ser concisos, inspiradores y orientados a resultados.
        Devuelve la respuesta EXCLUSIVAMENTE como un array JSON de strings. Ejemplo: ["Optimizar la eficiencia operativa en un 15% para el Q4 mediante la automatización de procesos.", "Aumentar la captación de clientes en un 20% en los próximos 6 meses.", "Mejorar la satisfacción del cliente a 9/10 para fin de año."]
      `;

      const response = await this.generativeAiService.generateText(prompt);
      
      // Limpiar y parsear la respuesta de la IA
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const objectives: string[] = JSON.parse(cleanedResponse);

      if (objectives && objectives.length > 0) {
        // Asignar el primer objetivo al campo del formulario
        this.form.controls['objetivo'].setValue(objectives[0]);
        // Opcional: guardar los otros objetivos en un estado para que el usuario elija
        this.sugerencias.set(objectives);
        this.toastService.show('success', 'Objetivos generados exitosamente con IA');
      } else {
        console.error('La IA no devolvió objetivos válidos.');
        this.toastService.show('error', 'No se pudieron generar objetivos válidos');
      }
    } catch (error) {
      console.error('Error al generar objetivos con IA:', error);
      this.toastService.show('error', 'Error al generar objetivos con IA. Inténtalo de nuevo.');
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