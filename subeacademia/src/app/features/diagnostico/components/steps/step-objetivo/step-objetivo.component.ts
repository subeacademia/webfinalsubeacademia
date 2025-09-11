import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { INDUSTRIES } from '../../../data/industries';
import { BesselAiService } from '../../../../../core/ai/bessel-ai.service';
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
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  industries = INDUSTRIES;
  sugerencias = signal<string[]>([]);
  isLoadingSuggestions = signal(false);

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

  next() {
    if (this.form.valid) {
      this.diagnosticState.updateData({ objetivo: this.form.value as any });
      this.diagnosticState.nextStep();
    } else {
      this.form.markAllAsTouched();
    }
  }
}