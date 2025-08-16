import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Competency } from '../../../features/diagnostico/data/competencias';

@Component({
  selector: 'app-competency-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competency-modal.component.html',
  styleUrls: ['./competency-modal.component.css']
})
export class CompetencyModalComponent implements OnInit, OnChanges {
  @Input() competency: Competency | null = null;
  @Output() closeModal = new EventEmitter<void>();

  isVisible = false;

  ngOnInit() {
    this.showModal();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['competency'] && changes['competency'].currentValue) {
      this.showModal();
    }
  }

  showModal() {
    if (this.competency) {
      // Pequeño delay para la animación de entrada
      setTimeout(() => {
        this.isVisible = true;
      }, 10);
    }
  }

  onClose() {
    this.isVisible = false;
    // Delay para permitir la animación de salida
    setTimeout(() => {
      this.closeModal.emit();
    }, 300);
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
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
