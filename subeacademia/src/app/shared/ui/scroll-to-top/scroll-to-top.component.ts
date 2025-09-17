import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../../core/services/scroll/scroll.service';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="scrollToTop()"
      [class.opacity-0]="!isVisible()"
      [class.pointer-events-none]="!isVisible()"
      class="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Volver al inicio de la página"
      title="Volver al inicio">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    </button>
  `,
  styles: [`
    button {
      transform: translateY(0);
    }
    
    button.opacity-0 {
      transform: translateY(100px);
    }
  `]
})
export class ScrollToTopComponent {
  private scrollService = inject(ScrollService);
  isVisible = signal(false);

  constructor() {
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.isVisible.set(scrollTop > 300); // Mostrar cuando el scroll sea mayor a 300px
      });
    }
  }

  scrollToTop(): void {
    this.scrollService.scrollToTop();
  }
}
