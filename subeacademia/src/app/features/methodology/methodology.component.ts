import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-methodology',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe, PageHeaderComponent],
  templateUrl: './methodology.component.html',
  styleUrls: ['./methodology.component.css']
})
export class MethodologyComponent {
  competencies = Array.from({ length: 13 }, (_, i) => i + 1);
  activeCard: number | null = null;

  toggleCard(cardIndex: number): void {
    if (this.activeCard === cardIndex) {
      this.activeCard = null;
    } else {
      this.activeCard = cardIndex;
    }
  }

  isCardActive(cardIndex: number): boolean {
    return this.activeCard === cardIndex;
  }

  trackByIndex(index: number, item: number): number {
    return item;
  }

  getCompetencyIcon(index: number): string {
    const icons = [
      '🚀', '💡', '🔧', '📊', '🎯', '🌐', '⚡', '🔄', 
      '📈', '🎨', '🔒', '📱', '🌟'
    ];
    return icons[index - 1] || '📋';
  }
}


