import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe],
  templateUrl: './step-objetivo.component.html',
})
export class StepObjetivoComponent implements OnInit {
  private fb = inject(FormBuilder);
  public state = inject(DiagnosticStateService);
  private generativeAi = inject(GenerativeAiService);

  objetivoForm!: FormGroup;
  isLoading = false;
  generatedObjectives: string[] = [];
  
  // Opciones predefinidas como fallback
  predefinedObjectives = [
    'Mejorar mis habilidades de liderazgo',
    'Desarrollar mi inteligencia emocional',
    'Aumentar mi productividad y gestión del tiempo',
    'Mejorar la comunicación con mi equipo',
    'Otra'
  ];

  constructor() {}

  ngOnInit(): void {
    this.objetivoForm = this.fb.group({
      descripcion: ['', Validators.required],
      objetivoSeleccionado: [this.state.form.get('objetivo')?.value || '', Validators.required],
    });

    // Si ya hay un objetivo, lo establece en el form
    const currentObjective = this.state.form.get('objetivo')?.value;
    if(currentObjective && !this.predefinedObjectives.includes(currentObjective)) {
        this.generatedObjectives.push(currentObjective);
    }
  }

  generateObjectives(): void {
    if (!this.objetivoForm.get('descripcion')?.value) {
      // Idealmente, mostrar un toast o mensaje al usuario.
      console.warn('La descripción no puede estar vacía para generar objetivos.');
      return;
    }

    this.isLoading = true;
    this.generatedObjectives = [];
    const context = this.state.getContextoData();
    const userDescription = this.objetivoForm.get('descripcion')?.value;

    const prompt = `
      Basado en el siguiente contexto de una organización, genera 3 objetivos de desarrollo claros, concisos y accionables.
      - Industria: ${context?.industria || 'No especificada'}
      - Tamaño: ${context?.tamano || 'No especificado'}
      - Presupuesto: ${context?.presupuesto || 'No especificado'}
      - Segmento: ${this.state.form.get('segmento')?.value || 'No especificado'}
      - Descripción del desafío o meta: "${userDescription}"

      Responde únicamente con los 3 objetivos, cada uno en una nueva línea, sin numeración ni introducciones. Por ejemplo:
      Desarrollar habilidades de negociación para cierre de contratos.
      Implementar una nueva metodología de gestión de proyectos ágiles.
      Mejorar la comunicación asertiva en reuniones de equipo.
    `;

    this.generativeAi.generateContent(prompt)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          // El texto viene separado por saltos de línea
          this.generatedObjectives = response.split('\n').filter(obj => obj.trim() !== '');
        },
        error: (err) => {
          console.error('Error al generar objetivos:', err);
          // En caso de error, podríamos mostrar un mensaje al usuario.
        }
      });
  }

  saveState(): void {
    const selected = this.objetivoForm.get('objetivoSeleccionado')?.value;
    if (selected) {
      this.state.form.patchValue({ objetivo: selected });
    }
  }

  onSelectionChange(): void {
    this.saveState();
  }
}
