import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
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

    // Signal para notificar cambios en el progreso
    private readonly _progressChanged = signal(0);
    readonly progressChanged = this._progressChanged.asReadonly();

    // Formularios
    readonly form: FormGroup = this.fb.group({
        segmento: this.fb.control<Segment | null>(null),
        objetivo: this.fb.array([]),
    });

	readonly contextoControls: Record<string, FormControl<any>> = {} as Record<string, FormControl<any>>;
    readonly aresForm: FormGroup = this.fb.group({});
    readonly competenciasForm: FormGroup = this.fb.group({});
	readonly leadForm: FormGroup = this.fb.group({
		nombre: this.fb.control<string | null>(null, { validators: [Validators.required] }),
		email: this.fb.control<string | null>(null, { validators: [Validators.required, Validators.email] }),
		telefono: this.fb.control<string | null>(null),
		aceptaComunicaciones: this.fb.control<boolean | null>(false),
	});

	// Estado central basado en BehaviorSubject
	private readonly _state$ = new BehaviorSubject<any>(null);
	readonly state$ = this._state$.asObservable();

    constructor() {
        this.initializeForms();
        this.loadFromStorage();
        this.setupFormSubscriptions();
        this.emitState();
    }

    private initializeForms(): void {
        // Construcción dinámica de controles base
        for (const item of this.aresItems) {
            this.ensureAresControl(item.id);
        }
        for (const comp of this.competencias) {
            this.ensureCompetenciaControl(comp.id);
        }
        
        // Inicializar controles de contexto general
        this.contextoControls['industria'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        this.contextoControls['tamano'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        this.contextoControls['presupuesto'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        
        // Asegurar que los controles estén disponibles
        console.log('Controles de contexto inicializados:', Object.keys(this.contextoControls));
    }

    private setupFormSubscriptions(): void {
        // Persistencia en localStorage
        this.form.valueChanges.subscribe(() => {
            this.saveToStorage();
            this.notifyProgressChange();
            this.emitState();
        });
        this.aresForm.valueChanges.subscribe(() => {
            this.saveToStorage();
            this.notifyProgressChange();
            this.emitState();
        });
        this.competenciasForm.valueChanges.subscribe(() => {
            this.saveToStorage();
            this.notifyProgressChange();
            this.emitState();
        });
        this.leadForm.valueChanges.subscribe(() => {
            this.saveToStorage();
            this.notifyProgressChange();
            this.emitState();
        });
        
        // Suscripción a los controles de contexto
        Object.values(this.contextoControls).forEach(control => {
            if (control instanceof FormControl) {
                control.valueChanges.subscribe(() => {
                    this.saveToStorage();
                    this.notifyProgressChange();
                    this.emitState();
                });
            }
        });
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
        // Limpiar solo los controles específicos del segmento, no los de contexto general
        const segmentControlKeys = Object.keys(this.contextoControls).filter(key => 
            key !== 'industria' && key !== 'tamano' && key !== 'presupuesto'
        );
        
        segmentControlKeys.forEach(key => {
            delete this.contextoControls[key];
        });

        // Agregar controles específicos del segmento
        const segmentControls = COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO[segment] || [];
        
        segmentControls.forEach(compId => {
            this.contextoControls[compId] = this.fb.control<number | null>(null, { validators: [Validators.required] });
        });
    }

    private ensureAresControl(itemId: string): void {
        if (!this.aresForm.contains(itemId)) {
            this.aresForm.addControl(itemId, this.fb.control<number>(1, { validators: [Validators.required] }));
        }
    }

    private ensureCompetenciaControl(compId: string): void {
        if (!this.competenciasForm.contains(compId)) {
            this.competenciasForm.addControl(compId, this.fb.control<number>(1, { validators: [Validators.required] }));
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
        console.log('saveContextoData llamado con:', data);
        console.log('Controles de contexto disponibles:', Object.keys(this.contextoControls));
        
        // Asegurar que los controles existan
        if (!this.contextoControls['industria']) {
            this.contextoControls['industria'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        }
        if (!this.contextoControls['tamano']) {
            this.contextoControls['tamano'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        }
        if (!this.contextoControls['presupuesto']) {
            this.contextoControls['presupuesto'] = this.fb.control<string | null>(null, { validators: [Validators.required] });
        }
        
        // Establecer valores
        this.contextoControls['industria'].setValue(data.industria);
        this.contextoControls['tamano'].setValue(data.tamano);
        this.contextoControls['presupuesto'].setValue(data.presupuesto);
        
        // Actualizar el segmento basado en la industria
        if (data.industria) {
            console.log('Actualizando segmento basado en industria:', data.industria);
            this.setSegmentFromIndustry(data.industria);
        }
        
        // Guardar en localStorage inmediatamente
        this.saveToStorage();
        
        console.log('Estado final de controles de contexto:', {
            industria: this.contextoControls['industria']?.value,
            tamano: this.contextoControls['tamano']?.value,
            presupuesto: this.contextoControls['presupuesto']?.value
        });
    }

    // Métodos para guardar datos de ARES
    saveAresData(data: any): void {
        console.log('saveAresData llamado con:', data);
        this.aresForm.patchValue(data);
        this.saveToStorage();
        this.emitState();
        console.log('✅ Datos ARES guardados en el estado global');
    }

    // Métodos para guardar datos de competencias
    saveCompetenciasData(data: any): void {
        console.log('saveCompetenciasData llamado con:', data);
        this.competenciasForm.patchValue(data);
        this.saveToStorage();
        this.emitState();
        console.log('✅ Datos de competencias guardados en el estado global');
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
        this.emitState();
    }

    // Método para calcular el progreso basado en la ruta y el estado de los formularios
    getProgressForRoute(currentRoute: string): number {
        // Extraer la parte del diagnóstico de la ruta
        const diagnosticoMatch = currentRoute.match(/\/diagnostico(\/.*)?$/);
        if (!diagnosticoMatch) return 0;
        
        const path = diagnosticoMatch[1] || '';
        
        // Calcular progreso base por ruta
        const routeProgress: Record<string, number> = {
            '': 0,
            '/inicio': 0,
            '/contexto': 16.67,
            '/ares': 33.33,
            '/ares/F1': 33.33,
            '/ares/F2': 41.67,
            '/ares/F3': 50,
            '/ares/F4': 58.33,
            '/competencias': 66.67,
            '/competencias/1': 66.67,
            '/competencias/2': 75,
            '/competencias/3': 83.33,
            '/objetivo': 91.67,
            '/lead': 95.83,
            '/resultados': 100
        };
        
        let baseProgress = routeProgress[path] || 0;
        
        // Ajustar progreso basado en el estado de los formularios
        if (path === '/ares' || path.startsWith('/ares/')) {
            const aresCompletion = this.getAresFormCompletion();
            baseProgress = 33.33 + (aresCompletion * 25); // 33.33% base + hasta 25% por completitud
        } else if (path === '/competencias' || path.startsWith('/competencias/')) {
            const competenciasCompletion = this.getCompetenciasFormCompletion();
            baseProgress = 66.67 + (competenciasCompletion * 16.67); // 66.67% base + hasta 16.67% por completitud
        }
        
        return Math.min(baseProgress, 100);
    }
    
    // Método para calcular la completitud del formulario ARES
    private getAresFormCompletion(): number {
        const aresData = this.aresForm.value;
        const totalItems = this.aresItems.length;
        if (totalItems === 0) return 0;
        
        const completedItems = Object.values(aresData).filter(value => 
            value !== null && value !== undefined && value !== '' && typeof value === 'number' && value > 0
        ).length;
        
        return completedItems / totalItems;
    }
    
    // Método para calcular la completitud del formulario de competencias
    private getCompetenciasFormCompletion(): number {
        const competenciasData = this.competenciasForm.value;
        const totalCompetencias = this.competencias.length;
        if (totalCompetencias === 0) return 0;
        
        const completedCompetencias = Object.values(competenciasData).filter(value => 
            value !== null && value !== undefined && value !== '' && typeof value === 'number' && value > 0
        ).length;
        
        return completedCompetencias / totalCompetencias;
    }

    // Métodos para navegación entre pasos
    getNextStepLink(currentRoute: string): string | null {
        const path = this.extractDiagnosticoPath(currentRoute);
        console.log(`🔍 getNextStepLink - Path extraído: "${path}"`);
        
        const stepFlow: Record<string, string> = {
            '': 'inicio',  // 🔧 SOLUCIÓN: Agregar caso para ruta base
            'inicio': 'contexto',
            'contexto': 'ares/F1',
            'ares/F1': 'ares/F2',
            'ares/F2': 'ares/F3',
            'ares/F3': 'ares/F4',
            'ares/F4': 'competencias/1',
            'competencias/1': 'competencias/2',
            'competencias/2': 'competencias/3',
            'competencias/3': 'objetivo',
            'objetivo': 'lead',
            'lead': 'resultados'
        };
        
        const nextStep = stepFlow[path] || null;
        console.log(`🔍 getNextStepLink - Siguiente paso: "${nextStep}"`);
        return nextStep;
    }

    getPreviousStepLink(currentRoute: string): string | null {
        const path = this.extractDiagnosticoPath(currentRoute);
        console.log(`🔍 getPreviousStepLink - Path extraído: "${path}"`);
        
        const stepFlow: Record<string, string> = {
            'inicio': '',  // 🔧 SOLUCIÓN: Agregar caso para volver a ruta base
            'contexto': 'inicio',
            'ares/F1': 'contexto',
            'ares/F2': 'ares/F1',
            'ares/F3': 'ares/F2',
            'ares/F4': 'ares/F3',
            'competencias/1': 'ares/F4',
            'competencias/2': 'competencias/1',
            'competencias/3': 'competencias/2',
            'objetivo': 'competencias/3',
            'lead': 'objetivo',
            'resultados': 'lead'
        };
        
        const prevStep = stepFlow[path] || null;
        console.log(`🔍 getPreviousStepLink - Paso anterior: "${prevStep}"`);
        return prevStep;
    }

    private extractDiagnosticoPath(route: string): string {
        // 🔧 SOLUCIÓN: Mejorar la extracción del path para manejar rutas con idioma
        console.log(`🔍 Extrayendo path de ruta: ${route}`);
        
        // Manejar rutas con idioma como /es/diagnostico/contexto
        const matchWithLang = route.match(/\/[a-z]{2}\/diagnostico(\/.*)?$/);
        if (matchWithLang) {
            const path = matchWithLang[1] || '';
            console.log(`🔍 Path extraído (con idioma): "${path}"`);
            return path;
        }
        
        // Manejar rutas sin idioma como /diagnostico/contexto
        const matchWithoutLang = route.match(/\/diagnostico(\/.*)?$/);
        if (matchWithoutLang) {
            const path = matchWithoutLang[1] || '';
            console.log(`🔍 Path extraído (sin idioma): "${path}"`);
            return path;
        }
        
        // 🔧 SOLUCIÓN: Manejar rutas que terminan en /diagnostico sin path adicional
        if (route.endsWith('/diagnostico') || route.endsWith('/diagnostico/')) {
            console.log(`🔍 Path extraído (ruta base): ""`);
            return '';
        }
        
        console.log(`🔍 No se pudo extraer path de: ${route}`);
        return '';
    }

    // Método para verificar si un paso está completo
    isStepComplete(step: string): boolean {
        console.log(`🔍 Verificando paso: ${step}`);
        
        switch (step) {
            case 'contexto':
                const contextoData = this.getContextoData();
                const hasContexto = !!contextoData && Object.keys(contextoData).length > 0;
                console.log(`🔍 Contexto: ${hasContexto ? '✅' : '❌'}`, contextoData);
                return hasContexto;
                
            case 'ares':
                const aresData = this.aresForm.value;
                const hasAres = Object.keys(aresData).length > 0 && 
                       Object.values(aresData).every(value => 
                           value !== null && value !== undefined && value !== '' && 
                           typeof value === 'number' && value >= 1 && value <= 5
                       );
                console.log(`🔍 ARES: ${hasAres ? '✅' : '❌'}`, aresData);
                return hasAres;
                
            case 'competencias':
                const competenciasData = this.competenciasForm.value;
                const hasCompetencias = Object.keys(competenciasData).length > 0 && 
                       Object.values(competenciasData).every(value => 
                           value !== null && value !== undefined && value !== '' && 
                           typeof value === 'number' && value >= 1 && value <= 5
                       );
                console.log(`🔍 Competencias: ${hasCompetencias ? '✅' : '❌'}`, competenciasData);
                return hasCompetencias;
                
            case 'objetivo':
                const objetivoCtrl = this.form.get('objetivo');
                let hasObjetivo = false;
                if (objetivoCtrl instanceof FormArray) {
                    hasObjetivo = Array.isArray(objetivoCtrl.value) && objetivoCtrl.value.length > 0;
                } else {
                    const valor = objetivoCtrl?.value;
                    hasObjetivo = Array.isArray(valor) ? valor.length > 0 : !!valor;
                }
                console.log(`🔍 Objetivo: ${hasObjetivo ? '✅' : '❌'}`, objetivoCtrl?.value);
                return hasObjetivo;
                
            case 'lead':
                const leadData = this.leadForm.value;
                const hasLead = leadData.nombre && leadData.email;
                console.log(`🔍 Lead: ${hasLead ? '✅' : '❌'}`, leadData);
                return hasLead;
                
            default:
                console.log(`🔍 Paso desconocido: ${step}`);
                return false;
        }
    }

    // Método para verificar si el diagnóstico está completamente terminado
    isDiagnosticComplete(): boolean {
        console.log('🔍 isDiagnosticComplete() llamado');
        
        // Si estamos en la página de resultados, considerar el diagnóstico como completo
        if (window.location.pathname.includes('/resultados')) {
            console.log('✅ En página de resultados - diagnóstico considerado completo');
            return true;
        }
        
        const allSteps = ['contexto', 'ares', 'competencias', 'objetivo', 'lead'];
        const stepResults = allSteps.map(step => {
            const isComplete = this.isStepComplete(step);
            console.log(`🔍 Paso ${step}: ${isComplete ? '✅' : '❌'}`);
            return isComplete;
        });
        
        const allComplete = stepResults.every(result => result);
        console.log(`🔍 Diagnóstico completo: ${allComplete ? '✅' : '❌'}`);
        
        return allComplete;
    }

    // Método para obtener el progreso general del diagnóstico
    getDiagnosticProgress(): number {
        const allSteps = ['contexto', 'ares', 'competencias', 'objetivo', 'lead'];
        const completedSteps = allSteps.filter(step => this.isStepComplete(step));
        return Math.round((completedSteps.length / allSteps.length) * 100);
    }

    // Métodos de persistencia
    private saveToStorage(): void {
        try {
            // Extraer solo los valores de los controles de contexto para evitar referencias circulares
            const contextoValues: Record<string, any> = {};
            Object.keys(this.contextoControls).forEach(key => {
                const control = this.contextoControls[key];
                if (control instanceof FormControl) {
                    contextoValues[key] = control.value;
                }
            });

            const data = {
                form: this.form.value,
                aresForm: this.aresForm.value,
                competenciasForm: this.competenciasForm.value,
                leadForm: this.leadForm.value,
                contextoValues: contextoValues, // Solo los valores, no los controles
                isCompleted: this._isCompleted()
            };
            
            console.log('💾 Guardando en sessionStorage:', data);
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.warn('No se pudo guardar en sessionStorage:', error);
        }
    }

    private loadFromStorage(): void {
        try {
            const stored = sessionStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                
                if (data.form) {
                    // Restaurar 'segmento'
                    if (Object.prototype.hasOwnProperty.call(data.form, 'segmento')) {
                        this.form.patchValue({ segmento: data.form.segmento });
                    }
                    // Restaurar 'objetivo' como FormArray (compatibilidad con string)
                    const objetivoCtrl = this.form.get('objetivo');
                    if (objetivoCtrl instanceof FormArray) {
                        objetivoCtrl.clear();
                        const rawObjetivo = data.form.objetivo;
                        if (Array.isArray(rawObjetivo)) {
                            rawObjetivo.forEach((val: any) => objetivoCtrl.push(this.fb.control(val)));
                        } else if (typeof rawObjetivo === 'string' && rawObjetivo) {
                            objetivoCtrl.push(this.fb.control(rawObjetivo));
                        }
                    }
                }
                
                // Cargar datos ARES con validación de valores
                if (data.aresForm) {
                    Object.keys(data.aresForm).forEach(key => {
                        const value = data.aresForm[key];
                        if (value !== null && value !== undefined && typeof value === 'number' && value >= 1 && value <= 5) {
                            this.aresForm.patchValue({ [key]: value });
                        } else {
                            // Si el valor no es válido, establecer el valor por defecto
                            this.aresForm.patchValue({ [key]: 1 });
                        }
                    });
                }
                
                // Cargar datos de competencias con validación de valores
                if (data.competenciasForm) {
                    Object.keys(data.competenciasForm).forEach(key => {
                        const value = data.competenciasForm[key];
                        if (value !== null && value !== undefined && typeof value === 'number' && value >= 1 && value <= 5) {
                            this.competenciasForm.patchValue({ [key]: value });
                        } else {
                            // Si el valor no es válido, establecer el valor por defecto
                            this.competenciasForm.patchValue({ [key]: 1 });
                        }
                    });
                }
                
                if (data.leadForm) this.leadForm.patchValue(data.leadForm);
                if (data.isCompleted) this._isCompleted.set(data.isCompleted);
                
                // Restaurar controles de contexto si existen
                if (data.contextoValues) {
                    Object.keys(data.contextoValues).forEach(key => {
                        if (data.contextoValues[key] !== null && data.contextoValues[key] !== undefined) {
                            // Asegurar que el control existe
                            if (!this.contextoControls[key]) {
                                this.contextoControls[key] = this.fb.control(data.contextoValues[key]);
                            } else {
                                this.contextoControls[key].setValue(data.contextoValues[key]);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar desde sessionStorage:', error);
        }
    }

    // Método para limpiar el estado
    clearState(): void {
        const objetivoCtrl = this.form.get('objetivo');
        if (objetivoCtrl instanceof FormArray) {
            objetivoCtrl.clear();
        }
        this.form.reset();
        this.aresForm.reset();
        this.competenciasForm.reset();
        this.leadForm.reset();
        this._isCompleted.set(false);
        
        // Limpiar controles de contexto
        Object.keys(this.contextoControls).forEach(key => {
            delete this.contextoControls[key];
        });
        
        sessionStorage.removeItem(this.STORAGE_KEY);
        this.emitState();
    }

    // Método para obtener todos los datos del diagnóstico
    getDiagnosticData(): any {
        const data = {
            contexto: this.getContextoData(),
            ares: this.aresForm.value,
            competencias: this.competenciasForm.value,
            objetivo: this.form.get('objetivo')?.value,
            lead: this.leadForm.value,
            segmento: this.form.get('segmento')?.value
        };
        
        console.log('🔍 getDiagnosticData() llamado');
        console.log('🔍 Datos del contexto:', data.contexto);
        console.log('🔍 Datos ARES:', data.ares);
        console.log('🔍 Datos competencias:', data.competencias);
        console.log('🔍 Datos completos:', data);
        
        return data;
    }

    // Método para notificar cambios en el progreso
    private notifyProgressChange(): void {
        this._progressChanged.set(this._progressChanged() + 1);
    }

	// Emitir el estado centralizado
	private emitState(): void {
		const state = {
			form: this.form.value,
			contexto: this.getContextoData(),
			ares: this.aresForm.value,
			competencias: this.competenciasForm.value,
			lead: this.leadForm.value,
			isCompleted: this._isCompleted(),
			progress: this.getDiagnosticProgress()
		};
		this._state$.next(state);
	}

	// Utilidades públicas para navegación/gating desde componentes de UI
	getCurrentStepKeyFromRoute(currentRoute: string): 'inicio' | 'contexto' | 'ares' | 'competencias' | 'objetivo' | 'lead' | 'resultados' {
		// 🔧 SOLUCIÓN: Usar el mismo método extractDiagnosticoPath para consistencia
		const path = this.extractDiagnosticoPath(currentRoute);
		console.log(`🔍 getCurrentStepKeyFromRoute - Path: "${path}"`);
		
		if (path.includes('resultados')) return 'resultados';
		if (path.includes('lead')) return 'lead';
		if (path.includes('objetivo')) return 'objetivo';
		if (path.includes('competencias')) return 'competencias';
		if (path.includes('ares')) return 'ares';
		if (path.includes('contexto')) return 'contexto';
		if (path.includes('inicio') || path === '') return 'inicio';
		
		console.log(`🔍 getCurrentStepKeyFromRoute - No se pudo determinar el paso, usando 'inicio'`);
		return 'inicio';
	}

	canProceedFromRoute(currentRoute: string): boolean {
		const key = this.getCurrentStepKeyFromRoute(currentRoute);
		switch (key) {
			case 'contexto':
				return this.isStepComplete('contexto');
			case 'ares': {
				// Permitir avanzar entre subpasos F1-F4 sin bloquear, pero exigir completitud al salir de F4
				const isAtF4 = /\/ares\/F4$/.test(currentRoute);
				return isAtF4 ? this.isStepComplete('ares') : true;
			}
			case 'competencias': {
				// Permitir avanzar entre subpasos 1-3 sin bloquear, pero exigir completitud al salir de 3
				const isAtLast = /\/competencias\/3$/.test(currentRoute);
				return isAtLast ? this.isStepComplete('competencias') : true;
			}
			case 'objetivo':
				return this.isStepComplete('objetivo');
			case 'lead':
				return this.isStepComplete('lead');
			case 'resultados':
				return true;
			default:
				return true;
		}
	}
}


