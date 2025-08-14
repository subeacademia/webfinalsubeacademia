import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AresItem, DiagnosticoFormValue, NivelCompetencia, Segment } from '../data/diagnostic.models';

@Injectable({ providedIn: 'root' })
export class DiagnosticStateService {
	private readonly fb = inject(FormBuilder);

	private readonly STORAGE_KEY = 'diagnostico.aresai.v1';

	readonly nivelesCompetencia: NivelCompetencia[] = ['incipiente','basico','intermedio','avanzado','lider'];

	// Datos base (se poblarán luego desde data files)
	readonly aresItems: AresItem[] = [];
	readonly competencias: { id: string; nameKey: string }[] = [];

	readonly form: FormGroup = this.fb.group({
		segmento: this.fb.control<Segment | null>(null, { validators: [Validators.required] }),
		// contexto: controles dinámicos se agregan según segmento
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
		this.loadFromStorage();

		// Persistencia en localStorage
		this.form.valueChanges.subscribe(() => this.saveToStorage());
		this.aresForm.valueChanges.subscribe(() => this.saveToStorage());
		this.competenciasForm.valueChanges.subscribe(() => this.saveToStorage());
		this.leadForm.valueChanges.subscribe(() => this.saveToStorage());
	}

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

	onSegmentChanged(segment: Segment): void {
		this.form.controls['segmento'].setValue(segment);
		this.resetContextControls();
		this.updateContextControls(segment);
	}

	updateContextControls(segment: Segment): void {
		const controlsBySegment: Record<Segment, string[]> = {
			startup: ['industria','tamanoEquipo','antiguedadMeses','modeloNegocio'],
			pyme: ['industria','tamanoEmpresa','facturacionAnual','zonaOperacion'],
			corporativo: ['industria','numEmpleados','presupuestoInnovacion','presenciaRegional'],
		};
		for (const key of controlsBySegment[segment]) {
			this.ensureContextControl(key);
		}
	}

	private resetContextControls(): void {
		for (const key of Object.keys(this.contextoControls)) {
			this.contextoControls[key].reset();
			delete this.contextoControls[key];
		}
	}

	private ensureContextControl(key: string): void {
		if (!this.contextoControls[key]) {
			this.contextoControls[key] = this.fb.control<any>(null);
		}
	}

	private ensureAresControl(itemId: string): void {
		if (!this.aresForm.contains(itemId)) {
			this.aresForm.addControl(itemId, this.fb.control<number | null>(null));
		}
	}

	setAresAnswer(itemId: string, value: number): void {
		this.ensureAresControl(itemId);
		this.aresForm.controls[itemId]?.setValue(value);
	}

	private ensureCompetenciaControl(compId: string): void {
		if (!this.competenciasForm.contains(compId)) {
			this.competenciasForm.addControl(compId, this.fb.control<NivelCompetencia | null>(null));
		}
	}

	setCompetenciaNivel(compId: string, nivel: NivelCompetencia): void {
		this.ensureCompetenciaControl(compId);
		this.competenciasForm.controls[compId]?.setValue(nivel);
	}
}


