import { Component, Input } from '@angular/core';
import { StrategicInsight } from '../../../data/report.model';

@Component({
  selector: 'app-strategic-insights',
  standalone: true,
  imports: [],
  templateUrl: './strategic-insights.html',
  styleUrl: './strategic-insights.css'
})
export class StrategicInsightsComponent {
  @Input() insights: StrategicInsight[] = [];

  getInsightIcon(type: string): string {
    switch (type) {
      case 'Fortaleza Clave': return '🛡️';
      case 'Riesgo Crítico': return '⚠️';
      case 'Oportunidad Oculta': return '🚀';
      default: return '💡';
    }
  }

  getInsightColor(type: string): string {
    switch (type) {
      case 'Fortaleza Clave': return 'text-green-600';
      case 'Riesgo Crítico': return 'text-red-600';
      case 'Oportunidad Oculta': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }

  getInsightBgColor(type: string): string {
    switch (type) {
      case 'Fortaleza Clave': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'Riesgo Crítico': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'Oportunidad Oculta': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  }

  getInsightBorderColor(type: string): string {
    switch (type) {
      case 'Fortaleza Clave': return 'border-l-green-500';
      case 'Riesgo Crítico': return 'border-l-red-500';
      case 'Oportunidad Oculta': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  }
}