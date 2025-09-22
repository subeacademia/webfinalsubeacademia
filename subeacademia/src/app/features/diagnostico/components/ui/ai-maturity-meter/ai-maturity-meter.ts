import { Component, Input } from '@angular/core';
import { AiMaturity } from '../../../data/report.model';

@Component({
  selector: 'app-ai-maturity-meter',
  standalone: true,
  imports: [],
  templateUrl: './ai-maturity-meter.html',
  styleUrl: './ai-maturity-meter.css'
})
export class AiMaturityMeterComponent {
  @Input() maturity!: AiMaturity;

  getMaturityColor(): string {
    const score = this.maturity?.score || 0;
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  }

  getMaturityBgColor(): string {
    const score = this.maturity?.score || 0;
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 20) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  }

  getMaturityIcon(): string {
    const level = this.maturity?.level || 'Incipiente';
    switch (level) {
      case 'Transformador': return '🚀';
      case 'Estratégico': return '🎯';
      case 'Establecido': return '⚡';
      case 'En Desarrollo': return '🌱';
      default: return '🌱';
    }
  }

  getMaturityDescription(): string {
    const level = this.maturity?.level || 'Incipiente';
    switch (level) {
      case 'Transformador': return 'Tu organización lidera la transformación digital con IA';
      case 'Estratégico': return 'Tienes una estrategia sólida de IA implementada';
      case 'Establecido': return 'Tienes bases sólidas para el crecimiento en IA';
      case 'En Desarrollo': return 'Estás construyendo las bases de tu estrategia de IA';
      default: return 'Es momento de comenzar tu viaje hacia la IA';
    }
  }
}