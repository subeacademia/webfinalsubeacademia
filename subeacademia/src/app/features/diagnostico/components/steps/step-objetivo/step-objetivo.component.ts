import { Component, inject, signal, ChangeDetectionStrategy, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { BesselAiService } from '../../../../../core/ai/bessel-ai.service';
import { ScoringService } from '../../../services/scoring.service';
import { SmartGoal, Question, ObjectivesApiResponse } from '../../../data/diagnostic.models';


@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-objetivo.component.html', 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepObjetivoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  public stateService = inject(DiagnosticStateService);
  private besselAiService = inject(BesselAiService);
  private scoringService = inject(ScoringService);

  userPrompt = signal('');
  generatedGoals = signal<SmartGoal[]>([]);
  selectedGoalsMap = signal<Record<string, boolean>>({});
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  private aresQuestions: Question[] = [];
  private compQuestions: Question[] = [];

  selectedGoals = computed(() => {
    const goals = this.generatedGoals();
    const map = this.selectedGoalsMap();
    const selected = goals.filter(g => map[g.id] === true);
    console.log('🔍 Debug selectedGoals:', { 
      goals: goals.length, 
      goalIds: goals.map(g => g.id), 
      mapKeys: Object.keys(map), 
      mapValues: Object.values(map),
      selected: selected.length,
      selectedIds: selected.map(g => g.id)
    });
    return selected;
  });
  
  ngOnInit(): void {
    forkJoin({
      ares: this.http.get<Question[]>('/assets/data/ares-questions.json'),
      comp: this.http.get<Question[]>('/assets/data/comp-questions.json')
    }).subscribe(({ ares, comp }) => {
      this.aresQuestions = ares;
      this.compQuestions = comp;
    });

    const initialSelected = this.stateService.state().selectedGoals;
    if (initialSelected.length > 0) {
      const map: Record<string, boolean> = {};
      initialSelected.forEach(g => map[g.id] = true);
      this.selectedGoalsMap.set(map);
    }
  }

  async generateObjectives() {
    if (!this.userPrompt().trim() || this.isLoading()) return;
    this.isLoading.set(true);
    this.generatedGoals.set([]);
    this.selectedGoalsMap.set({}); // Limpiar el mapa de selección
    this.errorMessage.set(null);
    
    try {
      // Obtener el perfil de la empresa para contexto
      const profile = this.stateService.profile();
      const industry = profile.industry || 'General';
      
      console.log('🤖 Generando objetivos para:', this.userPrompt(), 'en industria:', industry);
      
      // Usar el nuevo método del BesselAiService para generar sugerencias
      const suggestions = await this.besselAiService.generarSugerenciasDeObjetivos(this.userPrompt(), industry);
      
      console.log('✅ Sugerencias recibidas:', suggestions);
      
      // Validar que las sugerencias sean válidas
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('La IA no devolvió sugerencias válidas');
      }
      
      // Convertir las sugerencias en SmartGoals
      const goals: SmartGoal[] = suggestions.map((suggestion, index) => ({
        id: `goal-${Date.now()}-${index}`,
        title: suggestion,
        smart: {
          specific: suggestion,
          measurable: 'A definir según el objetivo específico',
          achievable: 'Basado en recursos y capacidades actuales',
          relevant: `Alineado con el objetivo de ${this.userPrompt()}`,
          timeBound: 'A definir según la complejidad del objetivo'
        }
      }));
      
      this.generatedGoals.set(goals);
      console.log('🎯 Objetivos generados:', goals);
      
      // Inicializar el mapa de selección con todos los objetivos deseleccionados
      const initialMap: Record<string, boolean> = {};
      goals.forEach(goal => {
        initialMap[goal.id] = false;
      });
      this.selectedGoalsMap.set(initialMap);

    } catch (error: any) {
      console.error('❌ Error al generar objetivos:', error);
      
      // Mensaje de error más específico
      let errorMessage = 'Hubo un error al generar los objetivos. ';
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage += 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else if (error.message?.includes('404')) {
        errorMessage += 'El servicio de IA no está disponible en este momento.';
      } else if (error.message?.includes('500')) {
        errorMessage += 'Error interno del servidor. Intenta de nuevo en unos minutos.';
      } else {
        errorMessage += error.message || 'Error desconocido. Por favor, intenta de nuevo.';
      }
      
      this.errorMessage.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  toggleGoalSelection(goalId: string) {
    console.log('🔄 Toggle goal selection:', goalId);
    const currentMap = this.selectedGoalsMap();
    const newMap = {...currentMap};
    const currentValue = newMap[goalId] || false;
    newMap[goalId] = !currentValue;
    console.log('📝 Updated map:', newMap, 'for goalId:', goalId, 'was:', currentValue, 'now:', newMap[goalId]);
    this.selectedGoalsMap.set(newMap);
  }

  goToPrev() {
    this.router.navigate(['competencias'], { relativeTo: this.route.parent }).then(() => {
      console.log('✅ Navegación exitosa a competencias');
    }).catch(error => {
      console.error('❌ Error en navegación relativa:', error);
      // Fallback: navegar usando la ruta completa con idioma
      this.router.navigate(['/es', 'diagnostico', 'competencias']).catch(fallbackErr => {
        console.error('❌ Error en fallback de navegación:', fallbackErr);
      });
    });
  }

  goToNext() {
    this.stateService.updateSelectedGoals(this.selectedGoals());
    this.router.navigate(['finalizar'], { relativeTo: this.route.parent }).then(() => {
      console.log('✅ Navegación exitosa a finalizar');
    }).catch(error => {
      console.error('❌ Error en navegación relativa:', error);
      // Fallback: navegar usando la ruta completa con idioma
      this.router.navigate(['/es', 'diagnostico', 'finalizar']).catch(fallbackErr => {
        console.error('❌ Error en fallback de navegación:', fallbackErr);
      });
    });
  }
}