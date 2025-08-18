import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MetricData {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  status: 'excellent' | 'good' | 'fair' | 'critical';
  description: string;
  trend?: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-advanced-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Métricas Avanzadas del Diagnóstico
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let metric of metrics" class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-700 dark:text-gray-300 text-sm">
              {{ metric.label }}
            </span>
            <div class="flex items-center space-x-2">
              <span class="text-lg font-bold" [ngClass]="getStatusColor(metric.status)">
                {{ metric.value }}{{ metric.unit }}
              </span>
              <div class="w-3 h-3 rounded-full" [ngClass]="getStatusIndicator(metric.status)"></div>
            </div>
          </div>
          
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
            <div class="h-2 rounded-full transition-all duration-500" 
                 [ngClass]="getProgressBarClass(metric.status)"
                 [style.width.%]="(metric.value / metric.maxValue) * 100"></div>
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0{{ metric.unit }}</span>
            <span>{{ metric.maxValue }}{{ metric.unit }}</span>
          </div>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
            {{ metric.description }}
          </p>
          
          <div *ngIf="metric.trend" class="flex items-center mt-2">
            <svg *ngIf="metric.trend === 'up'" class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <svg *ngIf="metric.trend === 'down'" class="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
            </svg>
            <svg *ngIf="metric.trend === 'stable'" class="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h8"></path>
            </svg>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ getTrendText(metric.trend) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm text-blue-800 dark:text-blue-200 font-medium">
            Estas métricas se actualizan en tiempo real basándose en tu diagnóstico y se comparan con benchmarks de la industria.
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      transition: all 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class AdvancedMetricsComponent {
  @Input() metrics: MetricData[] = [];

  getStatusColor(status: string): string {
    switch (status) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-yellow-600 dark:text-yellow-400';
      case 'fair': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }

  getStatusIndicator(status: string): string {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'fair': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getProgressBarClass(status: string): string {
    switch (status) {
      case 'excellent': return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'good': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'fair': return 'bg-gradient-to-r from-orange-500 to-orange-600';
      case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  }

  getTrendText(trend: string): string {
    switch (trend) {
      case 'up': return 'Tendencia positiva';
      case 'down': return 'Tendencia negativa';
      case 'stable': return 'Estable';
      default: return '';
    }
  }
}
