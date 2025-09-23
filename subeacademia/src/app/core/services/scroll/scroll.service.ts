import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);

  constructor() {
    this.initScrollToTop();
  }

  /**
   * Inicializa el scroll automático al cambiar de ruta
   */
  private initScrollToTop(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        delay(100) // Pequeño delay para asegurar que el DOM se haya renderizado
      )
      .subscribe((event: NavigationEnd) => {
        // Hacer scroll automático especialmente para navegaciones del diagnóstico
        if (this.isDiagnosticNavigation(event.urlAfterRedirects)) {
          console.log('🎯 Navegación del diagnóstico detectada, haciendo scroll automático');
          this.scrollToTop();
        } else {
          // Para otras navegaciones, usar el comportamiento normal
          this.scrollToTop();
        }
      });
  }

  /**
   * Verifica si la URL corresponde a una navegación del diagnóstico
   */
  private isDiagnosticNavigation(url: string): boolean {
    return url.includes('/diagnostico/') && (
      url.includes('/contexto') ||
      url.includes('/ares') ||
      url.includes('/competencias') ||
      url.includes('/objetivo') ||
      url.includes('/finalizar') ||
      url.includes('/resultados')
    );
  }

  /**
   * Hace scroll suave hacia la parte superior de la página
   */
  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      // Usar scrollTo con comportamiento suave
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Hace scroll instantáneo hacia la parte superior de la página
   */
  scrollToTopInstant(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  /**
   * Hace scroll hacia un elemento específico
   * @param elementId ID del elemento al que hacer scroll
   * @param offset Offset adicional desde la parte superior
   */
  scrollToElement(elementId: string, offset: number = 0): void {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  /**
   * Hace scroll hacia la parte superior del contenido principal
   * Útil para cuando hay un header fijo
   */
  scrollToMainContent(): void {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      this.scrollToElement('main-content', 80); // Offset para el header fijo
    } else {
      this.scrollToTop();
    }
  }

  /**
   * Método específico para hacer scroll automático en navegaciones del diagnóstico
   * Se puede llamar explícitamente desde los componentes del diagnóstico
   */
  scrollToTopForDiagnostic(): void {
    console.log('🎯 Scroll automático para diagnóstico activado');
    if (typeof window !== 'undefined') {
      // Scroll suave hacia arriba con un pequeño delay para asegurar que el contenido esté renderizado
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 150);
    }
  }
}
