import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Logo } from '../../../core/models/logo.model';

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-carousel.component.html',
  styleUrls: ['./logo-carousel.component.css']
})
export class LogoCarouselComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() logos: Logo[] = [];
  @Input() direction: 'normal' | 'reverse' = 'normal';
  @Input() autoScroll: boolean = true;
  @Input() scrollSpeed: number = 1; // pixels per frame
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  displayLogos: Logo[] = [];
  isHovered = false;
  canScrollLeft = false;
  canScrollRight = true;
  
  private animationFrameId: number | null = null;
  private isAutoScrolling = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logos'] && this.logos.length > 0) {
      console.log('LogoCarousel: Logos recibidos:', this.logos.length, this.logos);
      this.prepareDisplayLogos();
      setTimeout(() => this.updateScrollButtons(), 100);
    }
  }

  ngAfterViewInit(): void {
    if (this.autoScroll && this.logos.length > 0) {
      // Ajustar velocidad según el tamaño de pantalla
      this.adjustScrollSpeedForDevice();
      setTimeout(() => this.startAutoScroll(), 1000);
    }
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  onMouseEnter(): void {
    this.isHovered = true;
    this.updateScrollButtons();
    this.pauseAutoScroll();
  }

  onMouseLeave(): void {
    this.isHovered = false;
    this.resumeAutoScroll();
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

  private prepareDisplayLogos(): void {
    if (this.logos.length === 0) {
      this.displayLogos = [];
      return;
    }

    // Para auto-scroll infinito, duplicamos los logos
    if (this.autoScroll) {
      // Triplicamos los logos para crear un efecto infinito suave
      this.displayLogos = [...this.logos, ...this.logos, ...this.logos];
    } else {
      this.displayLogos = [...this.logos];
    }
  }

  private adjustScrollSpeedForDevice(): void {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && this.scrollSpeed > 0.3) {
        // Reducir velocidad en móviles para mejor experiencia
        this.scrollSpeed = this.scrollSpeed * 0.7;
      }
    }
  }

  private startAutoScroll(): void {
    if (!this.autoScroll || this.isAutoScrolling) return;
    
    this.isAutoScrolling = true;
    this.autoScrollAnimation();
  }

  private stopAutoScroll(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isAutoScrolling = false;
  }

  private pauseAutoScroll(): void {
    this.stopAutoScroll();
  }

  private resumeAutoScroll(): void {
    if (this.autoScroll && !this.isAutoScrolling) {
      setTimeout(() => this.startAutoScroll(), 500);
    }
  }

  private autoScrollAnimation(): void {
    if (!this.scrollContainer?.nativeElement || !this.isAutoScrolling) return;

    const container = this.scrollContainer.nativeElement;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (maxScroll <= 0) {
      // No hay contenido para hacer scroll
      this.animationFrameId = requestAnimationFrame(() => this.autoScrollAnimation());
      return;
    }

    let currentScroll = container.scrollLeft;
    
    if (this.direction === 'reverse') {
      // Mover de derecha a izquierda (empresas)
      currentScroll -= this.scrollSpeed;
      
      // Para efecto infinito con logos triplicados
      if (currentScroll <= 0) {
        // Saltar al segundo conjunto (1/3 del contenido total)
        currentScroll = maxScroll / 3;
      }
    } else {
      // Mover de izquierda a derecha (instituciones educativas)
      currentScroll += this.scrollSpeed;
      
      // Para efecto infinito con logos triplicados
      if (currentScroll >= (maxScroll * 2 / 3)) {
        // Saltar de vuelta al primer conjunto
        currentScroll = maxScroll / 3;
      }
    }

    container.scrollLeft = currentScroll;
    this.updateScrollButtons();
    
    this.animationFrameId = requestAnimationFrame(() => this.autoScrollAnimation());
  }
}
