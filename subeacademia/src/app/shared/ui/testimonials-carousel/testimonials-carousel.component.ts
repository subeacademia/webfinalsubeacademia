import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsService } from '../../../core/data/testimonials.service';
import { Testimonial } from '../../../core/models/testimonial.model';
import { I18nTranslatePipe } from '../../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-testimonials-carousel',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe],
  template: `
    <div class="testimonials-carousel-container">
      <!-- Estado de carga o sin testimonios -->
      <div *ngIf="testimonials().length === 0" class="loading-state">
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p class="text-white/80 text-lg">Cargando testimonios...</p>
          <p class="text-white/60 text-sm mt-2">Si no aparecen testimonios, verifica la consola para más información</p>
        </div>
      </div>

      <!-- Carrusel principal -->
      <div *ngIf="testimonials().length > 0" class="carousel-wrapper">
        <div class="carousel-track" [style.transform]="'translateX(' + currentIndex() * -100 + '%)'">
          <div 
            *ngFor="let testimonial of testimonials(); let i = index" 
            class="testimonial-slide"
            [class.active]="i === currentIndex()"
            [class.prev]="i === getPrevIndex()"
            [class.next]="i === getNextIndex()">
            
            <!-- Contenido del testimonio -->
            <div class="testimonial-content">
              <!-- Foto de la persona -->
              <div class="testimonial-photo">
                <img 
                  [src]="getImageUrl(testimonial)" 
                  [alt]="testimonial.name"
                  class="photo-image"
                  (error)="onImageError($event, testimonial)"
                  (load)="onImageLoad($event, testimonial)">
              </div>
              
              <!-- Contenido del testimonio -->
              <div class="testimonial-text">
                <!-- Comillas decorativas -->
                <div class="quote-mark">"</div>
                
                <!-- Texto del testimonio -->
                <blockquote class="testimonial-quote">
                  {{ testimonial.testimonial }}
                </blockquote>
                
                <!-- Información de la persona -->
                <div class="testimonial-author">
                  <div class="author-name">{{ testimonial.name }}</div>
                  <div class="author-position" *ngIf="testimonial.position">{{ testimonial.position }}</div>
                  <div class="author-company">{{ testimonial.company }}</div>
                </div>
                
                <!-- Rating (opcional) -->
                <div class="testimonial-rating" *ngIf="testimonial.rating">
                  <div class="stars">
                    <span 
                      *ngFor="let star of getStars(testimonial.rating)" 
                      class="star"
                      [class.filled]="star">
                      ★
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Indicadores de posición -->
      <div class="carousel-indicators" *ngIf="testimonials().length > 1">
        <button 
          *ngFor="let testimonial of testimonials(); let i = index"
          class="indicator"
          [class.active]="i === currentIndex()"
          (click)="goToSlide(i)"
          [attr.aria-label]="('testimonials.go_to_testimonial' | i18nTranslate).replace('{index}', (i + 1).toString())">
        </button>
      </div>
      
      <!-- Controles de navegación -->
      <div class="carousel-controls" *ngIf="testimonials().length > 1">
        <button 
          class="control-btn prev-btn"
          (click)="previousSlide()"
          [disabled]="!autoPlay && testimonials().length <= 1"
          [attr.aria-label]="'testimonials.previous_testimonial' | i18nTranslate">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button 
          class="control-btn next-btn"
          (click)="nextSlide()"
          [disabled]="!autoPlay && testimonials().length <= 1"
          [attr.aria-label]="'testimonials.next_testimonial' | i18nTranslate">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .testimonials-carousel-container {
      @apply relative w-full overflow-hidden;
      min-height: 400px;
    }

    /* Dark mode support */
    .dark .testimonials-carousel-container {
      @apply text-white;
    }

    .loading-state {
      @apply flex items-center justify-center min-h-[400px];
    }

    .carousel-wrapper {
      @apply relative w-full h-full;
    }

    .carousel-track {
      @apply flex transition-transform duration-700 ease-in-out;
      will-change: transform;
    }

    .testimonial-slide {
      @apply flex-shrink-0 w-full h-full flex items-center justify-center;
      min-height: 400px;
    }

    .testimonial-content {
      @apply flex flex-col lg:flex-row items-center gap-8 max-w-6xl mx-auto px-6 py-12;
    }

    .testimonial-photo {
      @apply flex-shrink-0;
    }

    .photo-image {
      @apply w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-2xl;
      border: 4px solid rgba(255, 255, 255, 0.2);
    }

    .testimonial-text {
      @apply flex-1 text-center lg:text-left;
    }

    .quote-mark {
      @apply text-6xl lg:text-8xl text-white/20 dark:text-white/30 font-serif leading-none mb-4;
      font-family: 'Times New Roman', serif;
    }

    .testimonial-quote {
      @apply text-lg lg:text-xl text-white dark:text-white mb-8 leading-relaxed font-medium;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .testimonial-author {
      @apply space-y-2;
    }

    .author-name {
      @apply text-xl lg:text-2xl font-bold text-white dark:text-white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .author-company {
      @apply text-lg text-white/90 dark:text-white/90 font-semibold;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .author-position {
      @apply text-base text-white/80 dark:text-white/80;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .testimonial-rating {
      @apply mt-4;
    }

    .stars {
      @apply flex justify-center lg:justify-start gap-1;
    }

    .star {
      @apply text-2xl text-white/60;
      transition: color 0.2s ease;
    }

    .star.filled {
      @apply text-yellow-400;
    }

    .carousel-indicators {
      @apply flex justify-center gap-2 mt-8;
    }

    .indicator {
      @apply w-3 h-3 rounded-full bg-white/40 dark:bg-white/50 hover:bg-white/60 dark:hover:bg-white/70 transition-all duration-200;
    }

    .indicator.active {
      @apply bg-white dark:bg-white w-8;
    }

    .carousel-controls {
      @apply absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4;
      pointer-events: none;
    }

    .control-btn {
      @apply w-12 h-12 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 
             text-white dark:text-white flex items-center justify-center transition-all duration-200
             backdrop-blur-sm border border-white/20 dark:border-white/10;
      pointer-events: auto;
    }

    .control-btn:disabled {
      @apply opacity-50 cursor-not-allowed;
    }

    .control-btn:hover:not(:disabled) {
      @apply scale-110 bg-white/40;
    }

    /* Animaciones de entrada */
    .testimonial-slide {
      animation: fadeInUp 0.8s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .testimonial-content {
        @apply px-4 py-8;
      }
      
      .photo-image {
        @apply w-24 h-24;
      }
      
      .quote-mark {
        @apply text-4xl;
      }
      
      .testimonial-quote {
        @apply text-base;
      }
      
      .author-name {
        @apply text-lg;
      }
      
      .author-company {
        @apply text-base;
      }
    }
  `]
})
export class TestimonialsCarouselComponent implements OnInit, OnDestroy {
  @Input() autoPlay: boolean = true;
  @Input() interval: number = 5000; // 5 segundos por defecto

  private testimonialsService = inject(TestimonialsService);
  
  testimonials = signal<Testimonial[]>([]);
  currentIndex = signal<number>(0);
  private intervalId?: number;

  ngOnInit() {
    this.loadTestimonials();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private loadTestimonials() {
    console.log('🔄 TestimonialsCarousel: Cargando testimonios...');
    
    this.testimonialsService.listActive().subscribe({
      next: (testimonials) => {
        console.log('✅ TestimonialsCarousel: Testimonios cargados:', testimonials);
        console.log('📊 TestimonialsCarousel: Cantidad de testimonios:', testimonials.length);
        
        // Limpiar auto-play anterior
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = undefined;
        }
        
        this.testimonials.set(testimonials);
        
        // Solo iniciar auto-play si hay más de 1 testimonio y está habilitado
        if (this.autoPlay && testimonials.length > 1) {
          console.log('🎠 TestimonialsCarousel: Iniciando auto-play');
          this.startAutoPlay();
        } else {
          console.log('⏸️ TestimonialsCarousel: Auto-play deshabilitado o menos de 2 testimonios');
        }
      },
      error: (error) => {
        console.error('❌ TestimonialsCarousel: Error al cargar testimonios:', error);
        console.warn('⚠️ TestimonialsCarousel: El servicio debería haber manejado este error con fallback');
        this.testimonials.set([]);
        // Limpiar auto-play en caso de error
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = undefined;
        }
      }
    });
  }

  private startAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = window.setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }

  nextSlide() {
    const total = this.testimonials().length;
    if (total === 0) {
      console.log('⚠️ TestimonialsCarousel: No hay testimonios para navegar');
      return;
    }
    
    if (total === 1) {
      console.log('⚠️ TestimonialsCarousel: Solo hay 1 testimonio, no se puede navegar');
      return;
    }
    
    const nextIndex = (this.currentIndex() + 1) % total;
    console.log(`➡️ TestimonialsCarousel: Navegando a slide ${nextIndex + 1}/${total}`);
    this.currentIndex.set(nextIndex);
  }

  previousSlide() {
    const total = this.testimonials().length;
    if (total === 0) {
      console.log('⚠️ TestimonialsCarousel: No hay testimonios para navegar');
      return;
    }
    
    if (total === 1) {
      console.log('⚠️ TestimonialsCarousel: Solo hay 1 testimonio, no se puede navegar');
      return;
    }
    
    const prevIndex = this.currentIndex() === 0 ? total - 1 : this.currentIndex() - 1;
    console.log(`⬅️ TestimonialsCarousel: Navegando a slide ${prevIndex + 1}/${total}`);
    this.currentIndex.set(prevIndex);
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.testimonials().length) {
      this.currentIndex.set(index);
    }
  }

  getPrevIndex(): number {
    const total = this.testimonials().length;
    return this.currentIndex() === 0 ? total - 1 : this.currentIndex() - 1;
  }

  getNextIndex(): number {
    const total = this.testimonials().length;
    return (this.currentIndex() + 1) % total;
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  onImageError(event: any, testimonial: Testimonial) {
    console.error('❌ Error al cargar imagen del testimonio:', testimonial.name, 'URL:', testimonial.photoUrl);
    // Mostrar imagen placeholder con la inicial del nombre
    const initial = testimonial.name.charAt(0).toUpperCase();
    event.target.src = `https://via.placeholder.com/160x160/4F46E5/FFFFFF?text=${initial}`;
    event.target.alt = `Avatar de ${testimonial.name}`;
  }

  onImageLoad(event: any, testimonial: Testimonial) {
    console.log('✅ Imagen cargada correctamente para:', testimonial.name, 'URL:', testimonial.photoUrl);
  }

  // Método para obtener la URL de la imagen o placeholder
  getImageUrl(testimonial: Testimonial): string {
    if (testimonial.photoUrl && testimonial.photoUrl.trim() !== '') {
      return testimonial.photoUrl;
    }
    // Si no hay URL, mostrar placeholder con la inicial
    const initial = testimonial.name.charAt(0).toUpperCase();
    return `https://via.placeholder.com/160x160/4F46E5/FFFFFF?text=${initial}`;
  }
}
