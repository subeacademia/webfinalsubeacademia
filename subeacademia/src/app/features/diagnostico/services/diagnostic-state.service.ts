import { Injectable, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AresItem, DiagnosticoFormValue, NivelCompetencia, Segment } from '../data/diagnostic.models';
import { ARES_ITEMS } from '../data/ares-items';
import { COMPETENCIAS, COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO } from '../data/competencias';
import { INDUSTRIES } from '../data/industries';

export interface Question {
    id: string;
    type: 'select' | 'likert' | 'text';
    label: string;
    tooltip?: string;
    controlName: string;
    options?: any[];
    phase?: string;
    dimension?: string;
    required?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticStateService {
	private readonly fb = inject(FormBuilder);

	private readonly STORAGE_KEY = 'diagnostico.aresai.v1';

	readonly nivelesCompetencia: NivelCompetencia[] = ['incipiente','basico','intermedio','avanzado','lider'];

	// Datos base
    readonly aresItems: AresItem[] = ARES_ITEMS;
    readonly competencias: { id: string; nameKey: string }[] = COMPETENCIAS;
    readonly industries = INDUSTRIES;

    // Estado reactivo del wizard
    private readonly _currentQuestionIndex = signal(0);
    private readonly _flatQuestions = signal<Question[]>([]);
    private readonly _isCompleted = signal(false);

    // Signals públicos
    readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
    readonly flatQuestions = this._flatQuestions.asReadonly();
    readonly isCompleted = this._isCompleted.asReadonly();
    readonly totalQuestions = computed(() => this._flatQuestions().length);
    readonly currentQuestion = computed(() => this._flatQuestions()[this._currentQuestionIndex()] || null);
    readonly progress = computed(() => this.totalQuestions() ? (this._currentQuestionIndex() / this.totalQuestions()) * 100 : 0);
    readonly canGoNext = computed(() => this._currentQuestionIndex() < this.totalQuestions() - 1);
    readonly canGoPrevious = computed(() => this._currentQuestionIndex() > 0);

    // Formularios
    readonly form: FormGroup = this.fb.group({
        segmento: this.fb.control<Segment | null>(null),
        objetivo: this.fb.control<string | null>(null, { validators: [Validators.required] }),
    });

	readonly contextoControls: Record<string, FormControl<any>> = {} as any;
    readonly aresForm: FormGroup = this.fb.group({});
    readonly competenciasForm: FormGroup = this.fb.group({});
	readonly leadForm: FormGroup = this.fb.group({
		nombre: this.fb.control<string | null>(null, { validators: [Validators.required] }),
		email: this.fb.control<string | null>(null, { validators: [Validators.required, Validators.email] }),
		telefono: this.fb.control<string | null>(null),
		aceptaComunicaciones: this.fb.control<boolean | null>(false),
	});

    constructor() {
        this.initializeForms();
        this.loadFromStorage();
        this.setupFormSubscriptions();
    }

    private initializeForms(): void {
        // Construcción dinámica de controles base
        for (const item of this.aresItems) {
            this.ensureAresControl(item.id);
        }
        for (const comp of this.competencias) {
            this.ensureCompetenciaControl(comp.id);
        }
    }

    private setupFormSubscriptions(): void {
        // Persistencia en localStorage
        this.form.valueChanges.subscribe(() => this.saveToStorage());
        this.aresForm.valueChanges.subscribe(() => this.saveToStorage());
        this.competenciasForm.valueChanges.subscribe(() => this.saveToStorage());
        this.leadForm.valueChanges.subscribe(() => this.saveToStorage());
    }

    // Método principal para generar el cuestionario dinámico
    setSegmentFromIndustry(industry: string): void {
        const normalized = (industry || '').toLowerCase();
        let seg: Segment = 'empresa';
        
        if (normalized.includes('educación superior')) seg = 'educacion_superior';
        else if (normalized.includes('educación escolar')) seg = 'educacion_escolar';
        else if (normalized.includes('capacitaci') || normalized.includes('profesional')) seg = 'profesional_independiente';
        
        this.form.controls['segmento'].setValue(seg);
        this.updateContextControls(seg);
        this.buildFlatQuestions(seg);
        this._currentQuestionIndex.set(0);
        this._isCompleted.set(false);
    }

    private buildFlatQuestions(segment: Segment): void {
        const questions: Question[] = [];

        // 1. Pregunta de industria (ya seleccionada, pero la mantenemos para mostrar)
        questions.push({
            id: 'industria',
            type: 'select',
            label: 'diagnostico.contexto.startup.industria',
            controlName: 'industria',
            options: this.industries,
            required: true
        });

        // 2. Controles de contexto dinámicos (sin industria)
        const ctxKeys = Object.keys(this.contextoControls).filter(k => k !== 'industria');
        for (const key of ctxKeys) {
            questions.push({
                id: `contexto_${key}`,
                type: 'text',
                label: `diagnostico.contexto.${key}`,
                controlName: key,
                required: true
            });
        }

        // 3. Preguntas ARES (una a la vez)
        for (const item of this.aresItems) {
            questions.push({
                id: `ares_${item.id}`,
                type: 'likert',
                label: item.labelKey,
                tooltip: item.tooltip,
                controlName: item.id,
                phase: item.phase,
                dimension: item.dimension,
                required: true
            });
        }

        // 4. Competencias prioritarias por segmento (top 6)
        const competenciasPrioritarias = COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO[segment] || [];
        for (const compId of competenciasPrioritarias) {
            const comp = this.competencias.find(c => c.id === compId);
            if (comp) {
                questions.push({
                    id: `comp_${comp.id}`,
                    type: 'likert',
                    label: comp.nameKey,
                    controlName: compId,
                    required: true
                });
            }
        }

        // 5. Objetivo
        questions.push({
            id: 'objetivo',
            type: 'likert',
            label: 'diagnostico.objetivo.title',
            controlName: 'objetivo',
            required: true
        });

        // 6. Lead form
        questions.push(
            {
                id: 'lead_nombre',
                type: 'text',
                label: 'diagnostico.lead.nombre',
                controlName: 'nombre',
                required: true
            },
            {
                id: 'lead_email',
                type: 'text',
                label: 'diagnostico.lead.email',
                controlName: 'email',
                required: true
            },
            {
                id: 'lead_telefono',
                type: 'text',
                label: 'diagnostico.lead.telefono',
                controlName: 'telefono',
                required: false
            }
        );

        this._flatQuestions.set(questions);
    }

    // Navegación del wizard
    nextQuestion(): void {
        const currentIndex = this._currentQuestionIndex();
        if (currentIndex < this.totalQuestions() - 1) {
            this._currentQuestionIndex.set(currentIndex + 1);
        } else {
            this._isCompleted.set(true);
        }
    }

    previousQuestion(): void {
        const currentIndex = this._currentQuestionIndex();
        if (currentIndex > 0) {
            this._currentQuestionIndex.set(currentIndex - 1);
        }
    }

    goToQuestion(index: number): void {
        if (index >= 0 && index < this.totalQuestions()) {
            this._currentQuestionIndex.set(index);
        }
    }

    // Métodos auxiliares
    updateContextControls(segment: Segment): void {
        const controlsBySegment: any = {
            empresa: ['industria','tamanoEmpresa','facturacionAnual','zonaOperacion'],
            educacion_superior: ['industria','numEstudiantes','numDocentes','tipoInstitucion'],
            educacion_escolar: ['industria','numEstudiantes','niveles','dependencia'],
            profesional_independiente: ['industria','especialidad','anosExperiencia','zonaOperacion'],
        };
        const list: string[] = controlsBySegment[segment] || [];
        for (const key of list) {
            this.ensureContextControl(key);
        }
    }

	private resetContextControls(): void {
		for (const key of Object.keys(this.contextoControls)) {
			this.contextoControls[key].reset();
			delete this.contextoControls[key];
		}
	}

	private ensureContextControl(key: string): FormControl<any> {
		if (!this.contextoControls[key]) {
			this.contextoControls[key] = this.fb.control<any>(null);
		}
		return this.contextoControls[key];
	}

	private ensureAresControl(itemId: string): FormControl<any> {
		if (!this.aresForm.contains(itemId)) {
			this.aresForm.addControl(itemId, this.fb.control<number | null>(null));
		}
		return this.aresForm.controls[itemId] as FormControl<any>;
	}

	private ensureCompetenciaControl(compId: string): FormControl<any> {
		if (!this.competenciasForm.contains(compId)) {
			this.competenciasForm.addControl(compId, this.fb.control<NivelCompetencia | null>(null));
		}
		return this.competenciasForm.controls[compId] as FormControl<any>;
	}

    // Métodos de utilidad
    setAresAnswer(itemId: string, value: number): void {
        this.ensureAresControl(itemId);
        this.aresForm.controls[itemId]?.setValue(value);
    }

    setCompetenciaNivel(compId: string, nivel: NivelCompetencia): void {
        this.ensureCompetenciaControl(compId);
        this.competenciasForm.controls[compId]?.setValue(nivel);
    }

    // Métodos de persistencia
	private loadFromStorage(): void {
		try {
			const raw = localStorage.getItem(this.STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as Partial<DiagnosticoFormValue>;
			if (parsed.segmento) {
				this.form.controls['segmento'].setValue(parsed.segmento);
				this.updateContextControls(parsed.segmento);
			}
			if (parsed.contexto) {
				for (const [k, v] of Object.entries(parsed.contexto)) {
					this.ensureContextControl(k);
					this.contextoControls[k]?.setValue(v);
				}
			}
			if (parsed.objetivo) {
				this.form.controls['objetivo'].setValue(parsed.objetivo);
			}
			if (parsed.ares?.respuestas) {
				for (const [itemId, value] of Object.entries(parsed.ares.respuestas)) {
					this.ensureAresControl(itemId);
					this.aresForm.controls[itemId]?.setValue(value);
				}
			}
			if (parsed.competencias?.niveles) {
				for (const [compId, nivel] of Object.entries(parsed.competencias.niveles)) {
					this.ensureCompetenciaControl(compId);
					this.competenciasForm.controls[compId]?.setValue(nivel);
				}
			}
			if (parsed.lead) {
				this.leadForm.patchValue(parsed.lead);
			}
		} catch {
			// no-op
		}
	}

	private saveToStorage(): void {
		try {
			const payload: DiagnosticoFormValue = {
				segmento: this.form.controls['segmento'].value,
				contexto: Object.fromEntries(Object.keys(this.contextoControls).map(k => [k, this.contextoControls[k].value])),
				objetivo: this.form.controls['objetivo'].value,
				ares: { respuestas: Object.fromEntries(Object.keys(this.aresForm.controls).map(k => [k, this.aresForm.controls[k].value])) as any },
				competencias: { niveles: Object.fromEntries(Object.keys(this.competenciasForm.controls).map(k => [k, this.competenciasForm.controls[k].value])) as any },
				lead: this.leadForm.value,
			};
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
		} catch {
			// no-op
		}
	}

    getFullValue(): DiagnosticoFormValue {
        return {
            segmento: this.form.controls['segmento'].value,
            contexto: Object.fromEntries(Object.keys(this.contextoControls).map(k => [k, this.contextoControls[k].value])) as any,
            objetivo: this.form.controls['objetivo'].value,
            ares: { respuestas: Object.fromEntries(Object.keys(this.aresForm.controls).map(k => [k, this.aresForm.controls[k].value])) as any },
            competencias: { niveles: Object.fromEntries(Object.keys(this.competenciasForm.controls).map(k => [k, this.competenciasForm.controls[k].value])) as any },
            lead: this.leadForm.value,
        };
    }

    // Método para obtener respuestas ARES agrupadas por fase
    getAresByPhase(): Record<string, { score: number; total: number; items: AresItem[] }> {
        const result: Record<string, { score: number; total: number; items: AresItem[] }> = {};
        
        for (const item of this.aresItems) {
            const phase = item.phase || 'F1';
            if (!result[phase]) {
                result[phase] = { score: 0, total: 0, items: [] };
            }
            
            const value = this.aresForm.controls[item.id]?.value || 0;
            result[phase].score += value;
            result[phase].total += 1;
            result[phase].items.push(item);
        }
        
        return result;
    }

    // Método para obtener competencias con scores
    getCompetenciasScores(): { id: string; nameKey: string; score: number }[] {
        return this.competencias.map(comp => ({
            id: comp.id,
            nameKey: comp.nameKey,
            score: this.competenciasForm.controls[comp.id]?.value || 0
        }));
    }
}


