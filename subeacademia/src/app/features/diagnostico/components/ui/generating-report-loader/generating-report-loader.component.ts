import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generating-report-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="text-center text-white p-8 rounded-lg">
        <!-- SVG animado con círculo que se dibuja -->
        <svg #loaderSvg class="mx-auto" width="120" height="120" viewBox="0 0 120 120">
          <!-- Círculo de fondo -->
          <circle cx="60" cy="60" r="50" stroke="#374151" stroke-width="4" fill="none" opacity="0.3"/>
          <!-- Círculo animado -->
          <circle 
            #progressCircle
            cx="60" 
            cy="60" 
            r="50" 
            stroke="#3B82F6" 
            stroke-width="4" 
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="314"
            stroke-dashoffset="314"
            transform="rotate(-90 60 60)"
          />
          <!-- Punto central -->
          <circle cx="60" cy="60" r="8" fill="#3B82F6" opacity="0.8"/>
        </svg>
        
        <!-- Texto de estado -->
        <div class="mt-6 space-y-2">
          <p class="text-xl font-semibold">Generando tu reporte con IA...</p>
          <p class="text-sm text-blue-200 opacity-80">Analizando respuestas y creando recomendaciones personalizadas</p>
        </div>
        
        <!-- Indicadores de progreso -->
        <div class="mt-6 flex justify-center space-x-2">
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
          <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .animate-pulse {
      animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class GeneratingReportLoaderComponent implements AfterViewInit {
  @ViewChild('loaderSvg') loaderSvg!: ElementRef;
  @ViewChild('progressCircle') progressCircle!: ElementRef;

  ngAfterViewInit(): void {
    this.animateLoader();
  }

  private animateLoader(): void {
    const anime = (window as any).anime;
    if (!anime) {
      console.warn('anime.js no está disponible');
      return;
    }

    // Animación del círculo de progreso
    anime({
      targets: this.progressCircle.nativeElement,
      strokeDashoffset: [314, 0],
      duration: 2000,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });

    // Animación de rotación del SVG completo
    anime({
      targets: this.loaderSvg.nativeElement,
      rotate: '360deg',
      duration: 4000,
      easing: 'linear',
      loop: true
    });

    // Animación de escala del punto central
    anime({
      targets: this.progressCircle.nativeElement,
      scale: [1, 1.1, 1],
      duration: 1500,
      easing: 'easeInOutSine',
      loop: true
    });
  }
}
