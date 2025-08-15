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

export interface ContextoData {
    industria: string | null;
    tamano: string | null;
    presupuesto: string | null;
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
    private readonly _isCompleted = signal(false);

    // Signals públicos
    readonly isCompleted = this._isCompleted.asReadonly();

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
        
        if (normalized.includes('educacion') || normalized.includes('education') || normalized.includes('academico')) {
            seg = 'educacion_superior';
        } else if (normalized.includes('escolar') || normalized.includes('school')) {
            seg = 'educacion_escolar';
        } else if (normalized.includes('consultoria') || normalized.includes('consulting') || normalized.includes('servicios') || 
                   normalized.includes('profesional') || normalized.includes('independiente')) {
            seg = 'profesional_independiente';
        }
        // Por defecto usa 'empresa' para otros casos
        
        this.form.patchValue({ segmento: seg });
        this.updateContextControls(seg);
    }

    private updateContextControls(segment: Segment): void {
        // Limpiar controles existentes
        Object.keys(this.contextoControls).forEach(key => {
            delete this.contextoControls[key];
        });

        // Agregar controles específicos del segmento
        const segmentControls = COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO[segment] || [];
        
        segmentControls.forEach(compId => {
            this.contextoControls[compId] = this.fb.control<number | null>(null, { validators: [Validators.required] });
        });

        // Agregar controles de contexto general
        this.contextoControls['industria'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        this.contextoControls['tamano'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        this.contextoControls['presupuesto'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
    }

    private ensureAresControl(itemId: string): void {
        if (!this.aresForm.contains(itemId)) {
            this.aresForm.addControl(itemId, this.fb.control<number | null>(null, { validators: [Validators.required] }));
        }
    }

    private ensureCompetenciaControl(compId: string): void {
        if (!this.competenciasForm.contains(compId)) {
            this.competenciasForm.addControl(compId, this.fb.control<number | null>(null, { validators: [Validators.required] }));
        }
    }

    // Métodos para obtener controles específicos
    getAresControl(itemId: string): FormControl {
        this.ensureAresControl(itemId);
        return this.aresForm.get(itemId) as FormControl;
    }

    getCompetenciaControl(compId: string): FormControl {
        this.ensureCompetenciaControl(compId);
        return this.competenciasForm.get(compId) as FormControl;
    }

    // Métodos para el contexto
    saveContextoData(data: ContextoData): void {
        this.contextoControls['industria']?.setValue(data.industria);
        this.contextoControls['tamano']?.setValue(data.tamano);
        this.contextoControls['presupuesto']?.setValue(data.presupuesto);
        
        // Actualizar el segmento basado en la industria
        if (data.industria) {
            this.setSegmentFromIndustry(data.industria);
        }
    }

    getContextoData(): ContextoData | null {
        const industria = this.contextoControls['industria']?.value;
        const tamano = this.contextoControls['tamano']?.value;
        const presupuesto = this.contextoControls['presupuesto']?.value;
        
        if (industria && tamano && presupuesto) {
            return { industria, tamano, presupuesto };
        }
        return null;
    }

    // Método para marcar como completado
    markAsCompleted(): void {
        this._isCompleted.set(true);
        this.saveToStorage();
    }

    // Método para calcular el progreso basado en la ruta
    getProgressForRoute(currentRoute: string): number {
        const routeProgress: Record<string, number> = {
            '/diagnostico/inicio': 0,
            '/diagnostico/contexto': 16.67,
            '/diagnostico/ares/F1': 33.33,
            '/diagnostico/ares/F2': 41.67,
            '/diagnostico/ares/F3': 50,
            '/diagnostico/ares/F4': 58.33,
            '/diagnostico/competencias/1': 66.67,
            '/diagnostico/competencias/2': 75,
            '/diagnostico/competencias/3': 83.33,
            '/diagnostico/objetivo': 91.67,
            '/diagnostico/lead': 95.83,
            '/diagnostico/resultados': 100
        };
        
        return routeProgress[currentRoute] || 0;
    }

    // Métodos de persistencia
    private saveToStorage(): void {
        try {
            const data = {
                form: this.form.value,
                aresForm: this.aresForm.value,
                competenciasForm: this.competenciasForm.value,
                leadForm: this.leadForm.value,
                contextoControls: this.contextoControls,
                isCompleted: this._isCompleted()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('No se pudo guardar en localStorage:', error);
        }
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                
                if (data.form) this.form.patchValue(data.form);
                if (data.aresForm) this.aresForm.patchValue(data.aresForm);
                if (data.competenciasForm) this.competenciasForm.patchValue(data.competenciasForm);
                if (data.leadForm) this.leadForm.patchValue(data.leadForm);
                if (data.isCompleted) this._isCompleted.set(data.isCompleted);
                
                // Restaurar controles de contexto si existen
                if (data.contextoControls) {
                    Object.keys(data.contextoControls).forEach(key => {
                        if (data.contextoControls[key] && !this.contextoControls[key]) {
                            this.contextoControls[key] = this.fb.control(data.contextoControls[key]);
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar desde localStorage:', error);
        }
    }

    // Método para limpiar el estado
    clearState(): void {
        this.form.reset();
        this.aresForm.reset();
        this.competenciasForm.reset();
        this.leadForm.reset();
        this._isCompleted.set(false);
        
        // Limpiar controles de contexto
        Object.keys(this.contextoControls).forEach(key => {
            delete this.contextoControls[key];
        });
        
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Método para obtener todos los datos del diagnóstico
    getDiagnosticData(): any {
        return {
            contexto: this.getContextoData(),
            ares: this.aresForm.value,
            competencias: this.competenciasForm.value,
            objetivo: this.form.get('objetivo')?.value,
            lead: this.leadForm.value,
            segmento: this.form.get('segmento')?.value
        };
    }
}


