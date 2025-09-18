import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Logo } from '../../../core/models/logo.model';

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-carousel.component.html',
  styleUrls: ['./logo-carousel.component.css']
})
export class LogoCarouselComponent implements OnChanges, OnDestroy {
  @Input() logos: Logo[] = [];
  @Input() direction: 'normal' | 'reverse' = 'normal';
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  isHovered = false;
  canScrollLeft = false;
  canScrollRight = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logos'] && this.logos.length > 0) {
      console.log('LogoCarousel: Logos recibidos:', this.logos.length, this.logos);
      setTimeout(() => this.updateScrollButtons(), 100);
    }
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  onMouseEnter(): void {
    this.isHovered = true;
    this.updateScrollButtons();
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  scrollLeft(): void {
    if (this.scrollContainer?.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      const scrollAmount = container.clientWidth * 0.8; // 80% del ancho visible
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  scrollRight(): void {
    if (this.scrollContainer?.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      const scrollAmount = container.clientWidth * 0.8; // 80% del ancho visible
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  private updateScrollButtons(): void {
    if (this.scrollContainer?.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      const hasOverflow = container.scrollWidth > container.clientWidth;
      
      if (!hasOverflow) {
        // Si no hay overflow, no mostrar botones
        this.canScrollLeft = false;
        this.canScrollRight = false;
      } else {
        // Si hay overflow, verificar posición
        this.canScrollLeft = container.scrollLeft > 0;
        this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      }
    }
  }

  onScroll(): void {
    this.updateScrollButtons();
  }

  trackByLogoId(index: number, logo: Logo): string {
    return logo.id || index.toString();
  }
}
