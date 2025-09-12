import { Component, Input } from '@angular/core';
import { CompetencyAnalysis } from '../../../data/report.model';

@Component({
  selector: 'app-competency-analysis',
  standalone: true,
  imports: [],
  templateUrl: './competency-analysis.html',
  styleUrl: './competency-analysis.css'
})
export class CompetencyAnalysisComponent {
  @Input() title: string = '';
  @Input() analyses: CompetencyAnalysis[] = [];
  @Input() type: 'strengths' | 'weaknesses' = 'strengths';

  getTypeColor(): string {
    return this.type === 'strengths' ? 'text-green-600' : 'text-red-600';
  }

  getTypeBgColor(): string {
    return this.type === 'strengths' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  }

  getTypeBorderColor(): string {
    return this.type === 'strengths' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  }

  getTypeIcon(): string {
    return this.type === 'strengths' ? '🛡️' : '⚠️';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  }

  getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 20) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  }
}