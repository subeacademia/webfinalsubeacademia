import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionCardComponent } from '../../ui/question-card/question-card.component';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { Question, Answer } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-competencias',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent],
  template: `
    <div class="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
        3. Diagnóstico de Competencias
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Evalúa las competencias clave para el éxito en la implementación de IA.
      </p>

      @if (questions$ | async; as questions) {
        <div class="space-y-8">
          @for (cluster of clusters; track cluster) {
            <div>
              <h3 class="text-xl font-semibold text-green-700 dark:text-green-400 border-b-2 border-green-200 dark:border-green-800 pb-2 mb-4">{{ cluster }}</h3>
              <div class="space-y-6">
                @for (q of filterByCluster(questions, cluster); track q.id) {
                  <app-question-card
                    [question]="q"
                    [initialAnswer]="getAnswer(q.id)"
                    (answerChange)="onAnswerChange(q.id, $event, questions)">
                  </app-question-card>
                }
              </div>
            </div>
          }
        </div>

        <div class="mt-8 flex justify-between items-center">
            <p class="text-sm text-gray-500">Progreso: {{ stateService.getCompProgress().answered }} / {{questions.length}}</p>
            <div>
              <button (click)="goToPrev()" class="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 mr-4">
                Anterior
              </button>
              <button (click)="goToNext()"
                      class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Siguiente
              </button>
            </div>
        </div>
      } @else {
        <p>Cargando preguntas...</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCompetenciasComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  public stateService = inject(DiagnosticStateService);

  questions$!: Observable<Question[]>;
  clusters: string[] = ['Cognitivo-Analítico', 'Técnico-Funcional', 'Interpersonal-Social', 'Gestión y Estrategia', 'Autogestión'];
  
  areCriticalsAnswered = signal(false);

  ngOnInit() {
    this.questions$ = this.http.get<Question[]>('/assets/data/comp-questions.json');
    this.questions$.subscribe(questions => {
      this.updateCriticalsStatus(questions);
    });
  }

  filterByCluster(questions: Question[], cluster: string): Question[] {
    return questions.filter(q => q.cluster === cluster);
  }

  getAnswer(questionId: string): Answer {
    return this.stateService.compAnswers()[questionId] || { value: null };
  }

  onAnswerChange(questionId: string, answer: Answer, questions: Question[]) {
    this.stateService.updateAnswer('comp', questionId, answer);
    this.updateCriticalsStatus(questions);
  }
  
  updateCriticalsStatus(questions: Question[]) {
     this.areCriticalsAnswered.set(this.stateService.areCriticalsAnswered(questions, 'comp'));
  }

  goToPrev() {
    this.router.navigate(['ares'], { relativeTo: this.route.parent });
  }

  goToNext() {
    this.router.navigate(['objetivo'], { relativeTo: this.route.parent });
  }
}