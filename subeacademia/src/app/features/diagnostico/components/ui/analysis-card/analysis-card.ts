import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CompetencyAnalysis {
  competencyId: string;
  competencyName: string;
  score: number;
  analysis: string;
}

@Component({
  selector: 'app-analysis-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border rounded-lg p-4 transition-all duration-200 hover:shadow-md" 
         [ngClass]="isStrength ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'">
      
      <!-- Header con icono y puntuación -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
               [ngClass]="isStrength ? 'bg-blue-500' : 'bg-red-500'">
            {{ isStrength ? '🚀' : '⚠️' }}
          </div>
          <h4 class="font-bold text-lg text-gray-800 dark:text-white">{{ analysis.competencyName }}</h4>
        </div>
        
        <!-- Puntuación con barra visual -->
        <div class="flex items-center space-x-2">
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {{ analysis.score }}/5
          </div>
          <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full transition-all duration-500 ease-out"
                 [ngClass]="isStrength ? 'bg-blue-500' : 'bg-red-500'"
                 [style.width.%]="(analysis.score / 5) * 100">
            </div>
          </div>
        </div>
      </div>

      <!-- Análisis detallado -->
      <div class="text-gray-700 dark:text-gray-300 leading-relaxed">
        <p class="text-sm">{{ analysis.analysis }}</p>
      </div>

      <!-- Indicador de nivel -->
      <div class="mt-3 flex justify-end">
        <span class="text-xs px-2 py-1 rounded-full font-medium"
              [ngClass]="isStrength ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'">
          {{ getScoreLabel(analysis.score) }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .hover\:shadow-md:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class AnalysisCardComponent {
  @Input() analysis!: CompetencyAnalysis;
  @Input() isStrength: boolean = false;

  getScoreLabel(score: number): string {
    if (score >= 4.5) return 'Excelente';
    if (score >= 3.5) return 'Bueno';
    if (score >= 2.5) return 'Regular';
    if (score >= 1.5) return 'Necesita Mejora';
    return 'Crítico';
  }
}