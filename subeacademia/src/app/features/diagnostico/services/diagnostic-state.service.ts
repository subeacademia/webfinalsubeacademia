import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { CompanyProfile, Answer, RiskLevel, SmartGoal, UserLead } from '../data/diagnostic.models';
import { ToastService } from '../../../core/ui/toast/toast.service';
import { BesselAiService, DiagnosticData } from '../../../core/ai/bessel-ai.service';
import { CursosService } from '../../productos/services/cursos.service';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

const DIAGNOSTIC_STATE_KEY = 'inProgressDiagnosticState';

export interface DiagnosticState {
  user: UserLead;
  profile: CompanyProfile;
  aresAnswers: Record<string, Answer>;
  compAnswers: Record<string, Answer>;
  riskLevel: RiskLevel;
  lambdaComp: number;
  targetLevel: number;
  selectedGoals: SmartGoal[];
  diagnosticId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DiagnosticStateService {
  private toastService = inject(ToastService);
  private besselAiService = inject(BesselAiService);
  private cursosService = inject(CursosService);
  
  private initialState: DiagnosticState = {
    user: { name: '', email: ''},
    profile: { industry: '', size: '1-10', iaBudgetUSD: null },
    aresAnswers: {},
    compAnswers: {},
    riskLevel: null,
    lambdaComp: 0.4,
    targetLevel: 4,
    selectedGoals: [],
  };

  state = signal<DiagnosticState>(this.loadStateFromLocalStorage());
  isLoading = signal<boolean>(false);

  // --- SELECTORS ---
  profile = computed(() => this.state().profile);
  aresAnswers = computed(() => this.state().aresAnswers);
  compAnswers = computed(() => this.state().compAnswers);
  selectedGoals = computed(() => this.state().selectedGoals);
  riskLevel = computed(() => this.state().riskLevel);
  lambdaComp = computed(() => this.state().lambdaComp);
  targetLevel = computed(() => this.state().targetLevel);

  // *** NUEVO COMPUTED SIGNAL ***
  // Esta es la única fuente de verdad para saber si el diagnóstico está completo.
  isCompleted = computed(() => !!this.state().diagnosticId);

  constructor() {
    effect(() => {
      // Solo guardamos en localStorage si NO está completo.
      if (!this.isCompleted()) {
        this.saveStateToLocalStorage(this.state());
      }
    });
  }

  // --- ACCIONES ---
  updateProfile(profile: Partial<CompanyProfile>) {
    this.state.update(s => ({ ...s, profile: { ...s.profile, ...profile } }));
  }

  updateAnswer(questionSet: 'ares' | 'comp', questionId: string, answer: Answer) {
    const key = questionSet === 'ares' ? 'aresAnswers' : 'compAnswers';
    this.state.update(s => ({ ...s, [key]: { ...s[key], [questionId]: answer } }));
  }

  setUserDetails(user: UserLead) {
    this.state.update(s => ({...s, user}));
  }

  setDiagnosticId(id: string) {
    this.state.update(s => ({...s, diagnosticId: id}));
  }

  updateSelectedGoals(goals: SmartGoal[]) {
    this.state.update(s => ({...s, selectedGoals: goals}));
  }

  updateRiskLevel(riskLevel: RiskLevel) {
    this.state.update(s => ({ ...s, riskLevel }));
  }

  updateLambda(lambda: number) {
    this.state.update(s => ({...s, lambdaComp: lambda }));
  }

  updateTargetLevel(target: number) {
    this.state.update(s => ({...s, targetLevel: target }));
  }

  // Método para avanzar al siguiente paso
  nextStep() {
    // Este método puede ser usado por los componentes para avanzar al siguiente paso
    // La lógica de navegación se maneja en cada componente individual
    console.log('Avanzando al siguiente paso del diagnóstico');
  }

  // --- MANEJO DE PERSISTENCIA ---
  private saveStateToLocalStorage(state: DiagnosticState) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DIAGNOSTIC_STATE_KEY, JSON.stringify(state));
    }
  }

  private loadStateFromLocalStorage(): DiagnosticState {
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem(DIAGNOSTIC_STATE_KEY);
      return savedState ? JSON.parse(savedState) : this.initialState;
    }
    return this.initialState;
  }

  clearLocalStorageState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DIAGNOSTIC_STATE_KEY);
    }
  }

  // Inicia un nuevo diagnóstico, limpiando el estado.
  startNewDiagnostic() {
      this.clearLocalStorageState();
      this.state.set(this.initialState);
  }

  // --- MÉTODOS DE COMPATIBILIDAD ---
  
  getDiagnosticData(): any {
    return {
      profile: this.profile(),
      aresAnswers: this.aresAnswers(),
      compAnswers: this.compAnswers(),
      riskLevel: this.riskLevel(),
      lambdaComp: this.lambdaComp(),
      targetLevel: this.targetLevel(),
      selectedGoals: this.selectedGoals()
    };
  }

  // Computed progress helpers
  getAresProgress = computed(() => {
    const answers = this.aresAnswers();
    const answeredCount = Object.values(answers).filter(a => a.value != null).length;
    return { answered: answeredCount };
  });

  getCompProgress = computed(() => {
    const answers = this.compAnswers();
    const answeredCount = Object.values(answers).filter(a => a.value != null).length;
    return { answered: answeredCount };
  });

  areCriticalsAnswered(questions: any[], type: 'ares' | 'comp'): boolean {
    const answers = type === 'ares' ? this.aresAnswers() : this.compAnswers();
    const criticalQuestions = questions.filter(q => q.critical);
    if(criticalQuestions.length === 0) return true;
    return criticalQuestions.every(q => answers[q.id]?.value != null);
  }

  /**
   * Genera y guarda un reporte usando la API de IA con contexto de cursos
   */
  async generateAndSaveReport(): Promise<void> {
    this.isLoading.set(true);
    
    const diagnosticData = this.getDiagnosticData();
    
    try {
      // 1. Obtener el catálogo de cursos de Firebase
      const cursos = await firstValueFrom(this.cursosService.getCursos().pipe(take(1)));
      console.log('Cursos obtenidos para contexto:', cursos);
      
      // 2. Llamar al servicio de IA con los datos del diagnóstico Y el contexto de los cursos
      const report = await this.besselAiService.generateReport(diagnosticData, cursos);
      console.log('Reporte generado exitosamente:', report);
      
      // 3. Actualizar el estado con el reporte generado
      this.state.update(s => ({ 
        ...s, 
        diagnosticId: `report-${Date.now()}` // Simular ID de reporte
      }));
      
      // 4. Mostrar notificación de éxito
      this.toastService.show('success', 'Diagnóstico generado exitosamente');
      
    } catch (error: any) {
      console.error('Error al generar el reporte en DiagnosticStateService:', error);
      this.toastService.show('error', `No pudimos generar tu diagnóstico: ${error.message || 'Error desconocido'}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}