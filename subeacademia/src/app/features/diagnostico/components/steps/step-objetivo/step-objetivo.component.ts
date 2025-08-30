import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { AsistenteIaService } from '../../../../../shared/ui/chatbot/asistente-ia.service';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-objetivo.component.html',
})
export class StepObjetivoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly state = inject(DiagnosticStateService);
  private readonly generativeAi = inject(AsistenteIaService);

  // Formulario local para capturar la descripción libre del usuario
  uiForm!: FormGroup;

  // FormArray referenciado directamente al estado global para los objetivos seleccionados
  selectedObjectives!: FormArray<FormControl<string>>;

  // UI state
  isLoading = false;
  errorMsg: string | null = null;
  suggestions: string[] = [];
  
  // Opciones predefinidas como fallback
  readonly predefinedObjectives: string[] = [
    'Optimizar procesos con IA (automatización y eficiencia)',
    'Formar al equipo en competencias clave de IA',
    'Implementar analítica avanzada para toma de decisiones',
    'Mejorar la experiencia del cliente con IA generativa',
    'Fortalecer la gobernanza y ética de datos',
  ];

  ngOnInit(): void {
    // Enlazar el FormArray del estado global
    const fa = this.state.form.get('objetivo');
    this.selectedObjectives = (fa instanceof FormArray) ? fa as FormArray<FormControl<string>> : this.fb.array([]) as FormArray<FormControl<string>>;

    // Formulario de UI
    this.uiForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Si ya había objetivos seleccionados, asegurar unicidad
    this.deduplicateSelected();
  }

  // Construye un prompt inteligente con el contexto, ARES y competencias
  private buildPrompt(userDescription: string): string {
    const contexto = this.state.getContextoData();
    const segmento = this.state.form.get('segmento')?.value ?? 'No especificado';

    const aresValues = this.state.aresForm.value as Record<string, number>;
    const competenciasValues = this.state.competenciasForm.value as Record<string, number>;

    // Extraer top debilidades y fortalezas ARES
    const aresArray = Object.entries(aresValues)
      .filter(([, v]) => typeof v === 'number')
      .map(([id, v]) => ({ id, score: v as number }));
    const weakestAres = [...aresArray].sort((a, b) => a.score - b.score).slice(0, 3).map(x => this.labelFromAresId(x.id));
    const strongestAres = [...aresArray].sort((a, b) => b.score - a.score).slice(0, 3).map(x => this.labelFromAresId(x.id));

    // Extraer competencias más bajas
    const compArray = Object.entries(competenciasValues)
      .filter(([, v]) => typeof v === 'number')
      .map(([id, v]) => ({ id, score: v as number }));
    const lowestCompetencias = [...compArray].sort((a, b) => a.score - b.score).slice(0, 4).map(x => this.labelFromCompetenciaId(x.id));

    return `Eres un asesor experto en transformación con IA.
Genera entre 5 y 7 objetivos SMART, accionables y específicos, alineados al contexto y carencias detectadas. Devuelve SOLO la lista, una línea por objetivo, sin numeración ni texto adicional.

Contexto:
- Industria: ${contexto?.industria ?? 'No especificada'}
- Tamaño: ${contexto?.tamano ?? 'No especificado'}
- Presupuesto: ${contexto?.presupuesto ?? 'No especificado'}
- Segmento: ${segmento}
- Descripción del usuario: "${userDescription}"

Hallazgos ARES:
- Áreas más débiles: ${weakestAres.join(', ') || 'No disponible'}
- Áreas más fuertes: ${strongestAres.join(', ') || 'No disponible'}

Competencias más bajas: ${lowestCompetencias.join(', ') || 'No disponible'}`;
  }

  private labelFromAresId(id: string): string {
    const item = this.state.aresItems?.find(x => x.id === id);
    return item?.labelKey ?? id;
  }

  private labelFromCompetenciaId(id: string): string {
    const comp = this.state.competencias?.find(x => x.id === id);
    return comp?.nameKey ?? id;
  }

  // Generar sugerencias con IA
  async onGenerate(): Promise<void> {
    if (this.uiForm.invalid) {
      this.uiForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMsg = null;
    this.suggestions = [];

    const desc = (this.uiForm.get('descripcion') as FormControl<string>).value ?? '';
    const prompt = this.buildPrompt(desc);
    const payload: any = {
      messages: [
        { role: 'system', content: 'Eres un asistente que genera listas de objetivos en texto plano, uno por línea.' },
        { role: 'user', content: prompt }
      ],
      maxTokens: 400,
      temperature: 0.6
    };
    (this.generativeAi as AsistenteIaService).generarTextoAzure(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          const raw = res?.choices?.[0]?.message?.content ?? '';
          const lines = raw.split(/\r?\n/)
            .map((s: string) => s.trim())
            .map((s: string) => s.replace(/^[-*\d.\)\]]+\s*/, ''))
            .filter((s: string) => s.length > 0);
          this.suggestions = this.unique([...lines]).slice(0, 10);
          if (this.suggestions.length === 0) {
            this.suggestions = [...this.predefinedObjectives];
          }
        },
        error: (err) => {
          console.error('Error IA (objetivos):', err);
          this.errorMsg = 'No se pudieron generar sugerencias. Usa las opciones predefinidas o intenta nuevamente.';
          this.suggestions = [...this.predefinedObjectives];
        }
      });
  }

  // Checkbox change handler
  onToggle(option: string, checked: boolean): void {
    if (checked) {
      this.addSelection(option);
    } else {
      this.removeSelection(option);
    }
  }

  isSelected(option: string): boolean {
    const values = (this.selectedObjectives.value || []) as string[];
    return values.includes(option);
  }

  private addSelection(option: string): void {
    const values = (this.selectedObjectives.value || []) as string[];
    if (!values.includes(option)) {
      this.selectedObjectives.push(new FormControl<string>(option, { nonNullable: true }));
    }
  }

  private removeSelection(option: string): void {
    const idx = (this.selectedObjectives.value as string[]).findIndex(v => v === option);
    if (idx >= 0) {
      this.selectedObjectives.removeAt(idx);
    }
  }

  private deduplicateSelected(): void {
    const seen = new Set<string>();
    const toKeep: string[] = [];
    for (const v of (this.selectedObjectives.value as string[])) {
      if (!seen.has(v)) {
        seen.add(v);
        toKeep.push(v);
      }
    }
    if (toKeep.length !== this.selectedObjectives.length) {
      this.selectedObjectives.clear();
      toKeep.forEach(v => this.selectedObjectives.push(new FormControl<string>(v, { nonNullable: true })));
    }
  }

  get selectedCount(): number {
    return this.selectedObjectives?.length ?? 0;
  }

  // Navegación
  goNext(): void {
    if (this.selectedCount === 0) return;
    const next = this.state.getNextStepLink(this.router.url);
    if (next) {
      const base = this.router.url.split('/').slice(0, -1).join('/');
      this.router.navigate([`${base}/${next}`]).catch(err => console.error('Error navegación next:', err));
    }
  }

  goPrevious(): void {
    const prev = this.state.getPreviousStepLink(this.router.url);
    if (prev) {
      const base = this.router.url.split('/').slice(0, -1).join('/');
      this.router.navigate([`${base}/${prev}`]).catch(err => console.error('Error navegación prev:', err));
    }
  }

  // Utilidad para deduplicar arrays
  private unique(arr: string[]): string[] {
    return Array.from(new Set(arr.map(s => s.trim())));
  }
}
