import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { AresAiGraphComponent } from './components/ares-ai-graph/ares-ai-graph.component';
import { UiModalComponent } from '../../shared/ui-kit/modal/modal';
import { competencias, Competency } from '../diagnostico/data/competencias';

@Component({
  selector: 'app-methodology',
  standalone: true,
  imports: [
    CommonModule, 
    I18nTranslatePipe, 
    PageHeaderComponent, 
    AresAiGraphComponent,
    UiModalComponent
  ],
  templateUrl: './methodology.component.html',
  styleUrls: ['./methodology.component.css']
})
export class MethodologyComponent {
  competencies = competencias;
  
  // Estado del modal
  isModalOpen = false;
  selectedCompetency: Competency | null = null;

  openCompetencyModal(competency: Competency): void {
    console.log('Abriendo modal para:', competency.name);
    this.selectedCompetency = competency;
    this.isModalOpen = true;
  }

  onCloseModal(): void {
    console.log('Cerrando modal');
    this.isModalOpen = false;
    this.selectedCompetency = null;
  }

  trackByIndex(index: number, item: Competency): string {
    return item.id;
  }

  getCompetencyIcon(competency: Competency): string {
    const icons = [
      '🚀', '💡', '🔧', '📊', '🎯', '🌐', '⚡', '🔄', 
      '📈', '🎨', '🔒', '📱', '🌟'
    ];
    return icons[parseInt(competency.id) - 1] || '📋';
  }

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      'Explorador': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Aprendiz': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Practicante': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'Avanzado': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Experto': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'Maestro': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
}


