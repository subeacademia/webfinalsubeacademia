import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { AresAiGraphComponent } from './components/ares-ai-graph/ares-ai-graph.component';
import { CompetencyModalComponent } from '../../shared/ui/competency-modal/competency-modal.component';
import { COMPETENCIAS_COMPLETAS, Competency } from '../diagnostico/data/competencias';

@Component({
  selector: 'app-methodology',
  standalone: true,
  imports: [
    CommonModule, 
    I18nTranslatePipe, 
    PageHeaderComponent, 
    AresAiGraphComponent,
    CompetencyModalComponent
  ],
  templateUrl: './methodology.component.html',
  styleUrls: ['./methodology.component.css']
})
export class MethodologyComponent {
  competencies = COMPETENCIAS_COMPLETAS;
  
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
}


