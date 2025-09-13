import { Component, OnInit, signal, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ToastService } from '../../../../../core/services/ui/toast/toast.service';
import { Subscription } from 'rxjs';

/**
 * NOTA DE ARQUITECTURA (VERSIÓN FINAL):
 * Este componente ha sido reescrito para garantizar la máxima robustez y corregir todos los errores previos.
 * 1.  **FormArray Robusto:** La lógica de `onCheckboxChange` y `isChecked` es ahora infalible.
 * 2.  **Sin `ExpressionChangedAfterItHasBeenCheckedError`:** Se elimina el `cdr.detectChanges()` problemático y se gestiona el estado de forma reactiva.
 * 3.  **Prompt de IA de Precisión Quirúrgica:** El prompt es ahora extremadamente específico para forzar la coherencia.
 * 4.  **Soporte para Dark Mode:** El HTML asociado utiliza clases de Tailwind `dark:` para una correcta visualización.
 * 5.  **Gestión de Subscripciones:** Se implementa OnDestroy para limpiar subscripciones y evitar fugas de memoria.
 */
@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-objetivo.component.html',
})
export class StepObjetivoComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isGenerating = signal(false);
  suggestedObjectives = signal<string[]>([]);
  private formChangesSubscription: Subscription | undefined;

  public diagnosticStateService = inject(DiagnosticStateService);
  private generativeAiService = inject(GenerativeAiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  constructor() {
    this.form = this.fb.group({
      objetivoPrincipal: ['', [Validators.required, Validators.minLength(15)]],
      selectedObjectives: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    const currentState = this.diagnosticStateService.state().objetivo;
    if (currentState?.objetivo && currentState.objetivo.length > 0) {
      this.form.patchValue({ objetivoPrincipal: currentState.objetivo.join(', ') });
      this.selectedObjectives.clear();
      currentState.objetivo.forEach(obj => this.selectedObjectives.push(new FormControl(obj)));
      this.suggestedObjectives.set(currentState.objetivo);
    }

    // Escuchamos los cambios en el FormArray para forzar la re-evaluación del estado del formulario.
    this.formChangesSubscription = this.selectedObjectives.valueChanges.subscribe(() => {
        this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
      this.formChangesSubscription?.unsubscribe();
  }

  get selectedObjectives(): FormArray {
    return this.form.get('selectedObjectives') as FormArray;
  }

  isChecked(objective: string): boolean {
    return this.selectedObjectives.value.includes(objective);
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedObjectives.push(new FormControl(checkbox.value));
      } else {
      const index = this.selectedObjectives.controls.findIndex(x => x.value === checkbox.value);
      if (index > -1) {
        this.selectedObjectives.removeAt(index);
      }
    }
    this.selectedObjectives.markAsTouched();
    this.selectedObjectives.markAsDirty();
  }

  async generateObjectivesWithAI(): Promise<void> {
    const objetivoPrincipalControl = this.form.get('objetivoPrincipal');
    if (objetivoPrincipalControl?.invalid) {
      objetivoPrincipalControl.markAsTouched();
      alert('Por favor, escribe un objetivo más detallado (mínimo 15 caracteres) para que la IA pueda ayudarte a refinarlo.');
      return;
    }
    const userObjective = objetivoPrincipalControl?.value || '';

    this.isGenerating.set(true);
    this.suggestedObjectives.set([]);
    this.selectedObjectives.clear();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const nextYear = currentYear + 1;
    
    const prompt = `Eres un consultor de estrategia. Refina este objetivo de negocio para que sea SMART. 

OBJETIVO: "${userObjective}"

IMPORTANTE: Estamos en ${currentMonth}/${currentYear}. Genera objetivos con fechas realistas y actuales.

RESPUESTA REQUERIDA: Solo devuelve un array JSON con exactamente 3 objetivos SMART. No incluyas texto adicional, explicaciones, ni formato markdown.

FORMATO:
["objetivo SMART 1", "objetivo SMART 2", "objetivo SMART 3"]

EJEMPLO (fechas actuales para ${currentYear}):
["Incrementar ventas en 25% para diciembre de ${currentYear}", "Reducir costos operativos en 15% para Q4 de ${currentYear}", "Aumentar satisfacción del cliente a 90% para marzo de ${nextYear}"]`;

    try {
      const response = await this.generativeAiService.generateText(prompt);
      console.log('Respuesta completa de la IA:', response);
      
      let objectives: string[] = [];
      
      try {
        // Primero intentar parsear la respuesta completa como JSON
        const fullResponse = JSON.parse(response);
        console.log('Respuesta parseada como JSON completo:', fullResponse);
        
        // Si es un objeto con choices, extraer el contenido
        if (fullResponse.choices && fullResponse.choices[0] && fullResponse.choices[0].message) {
          const content = fullResponse.choices[0].message.content;
          console.log('Contenido extraído de choices:', content);
          
          // El contenido puede ser un string que contiene el array JSON
          if (typeof content === 'string') {
            const arrayMatch = content.match(/\[[\s\S]*?\]/);
            if (arrayMatch) {
              objectives = JSON.parse(arrayMatch[0]);
            } else {
              // Si no hay array, intentar parsear el contenido directamente
              objectives = JSON.parse(content);
            }
          } else {
            objectives = content;
          }
        } else if (Array.isArray(fullResponse)) {
          objectives = fullResponse;
        } else {
          throw new Error("Estructura de respuesta no reconocida");
        }
      } catch (jsonError) {
        console.log('No es JSON completo, intentando extracción con regex...');
        
        // Si no es JSON completo, usar regex para extraer el array
        const arrayMatch = response.match(/\[[\s\S]*?\]/);
        if (arrayMatch) {
          let jsonString = arrayMatch[0];
          console.log('JSON extraído con regex:', jsonString);
          
          // Limpiar caracteres problemáticos
          jsonString = jsonString.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ');
          
          try {
            objectives = JSON.parse(jsonString);
          } catch (parseError) {
            console.error('Error al parsear JSON extraído:', parseError);
            
            // Último recurso: extraer strings manualmente
            const stringMatches = jsonString.match(/"([^"]+)"/g);
            if (stringMatches && stringMatches.length >= 2) {
              objectives = stringMatches.map(match => match.replace(/"/g, ''));
              console.log('Objetivos extraídos manualmente:', objectives);
            } else {
              throw new Error("No se pudieron extraer objetivos válidos");
            }
          }
        } else {
          throw new Error("No se encontró un array JSON en la respuesta");
        }
      }
      
      // Validar que sea un array con al menos 2 elementos
      if (!Array.isArray(objectives) || objectives.length < 2) {
        throw new Error("La IA no devolvió un array válido de objetivos");
      }
      
      // Limpiar cada objetivo
      objectives = objectives.map(obj => obj.trim()).filter(obj => obj.length > 10);
      
      if (objectives.length === 0) {
        throw new Error("No se encontraron objetivos válidos después de la limpieza");
      }
      
      console.log('Objetivos finales:', objectives);
      this.suggestedObjectives.set(objectives);
      this.toastService.show('success', `Se generaron ${objectives.length} objetivos SMART para tu meta.`);
      
    } catch (error) {
      console.error('Error al refinar objetivos con IA:', error);
      this.toastService.show('error', 'La IA no pudo generar sugerencias. Por favor, revisa que tu objetivo sea claro o inténtalo de nuevo.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  next(): void {
    if (this.form.valid) {
      this.diagnosticStateService.updateObjetivo(this.selectedObjectives.value);
      this.diagnosticStateService.nextStep();
    } else {
      this.form.markAllAsTouched();
      if (this.selectedObjectives.length === 0) {
        alert('Debes generar y seleccionar al menos un objetivo para poder continuar.');
      }
    }
  }
}