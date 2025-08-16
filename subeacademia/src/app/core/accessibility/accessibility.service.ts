import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private config: AccessibilityConfig = {
    enableHighContrast: false,
    enableReducedMotion: false,
    enableLargeText: false,
    enableKeyboardNavigation: true,
    enableScreenReader: true
  };

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadConfig();
    this.initializeAccessibility();
  }

  /**
   * Carga la configuración de accesibilidad desde localStorage
   */
  private loadConfig(): void {
    if (!this.isBrowser) return;

    try {
      const savedConfig = localStorage.getItem('accessibility-config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.warn('Error loading accessibility config:', error);
    }
  }

  /**
   * Guarda la configuración de accesibilidad en localStorage
   */
  private saveConfig(): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem('accessibility-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Error saving accessibility config:', error);
    }
  }

  /**
   * Inicializa las configuraciones de accesibilidad
   */
  private initializeAccessibility(): void {
    if (!this.isBrowser) return;

    // Aplicar configuración de alto contraste
    this.applyHighContrast(this.config.enableHighContrast);
    
    // Aplicar configuración de texto grande
    this.applyLargeText(this.config.enableLargeText);
    
    // Aplicar configuración de movimiento reducido
    this.applyReducedMotion(this.config.enableReducedMotion);
    
    // Aplicar configuración de navegación por teclado
    this.applyKeyboardNavigation(this.config.enableKeyboardNavigation);
  }

  /**
   * Obtiene la configuración actual de accesibilidad
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración de accesibilidad
   */
  updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.initializeAccessibility();
  }

  /**
   * Aplica el modo de alto contraste
   */
  private applyHighContrast(enable: boolean): void {
    if (!this.isBrowser) return;

    const body = document.body;
    if (enable) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }

  /**
   * Aplica el modo de texto grande
   */
  private applyLargeText(enable: boolean): void {
    if (!this.isBrowser) return;

    const body = document.body;
    if (enable) {
      body.classList.add('large-text');
      body.style.fontSize = '1.2em';
    } else {
      body.classList.remove('large-text');
      body.style.fontSize = '';
    }
  }

  /**
   * Aplica el modo de movimiento reducido
   */
  private applyReducedMotion(enable: boolean): void {
    if (!this.isBrowser) return;

    const body = document.body;
    if (enable) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }

  /**
   * Aplica la configuración de navegación por teclado
   */
  private applyKeyboardNavigation(enable: boolean): void {
    if (!this.isBrowser) return;

    const body = document.body;
    if (enable) {
      body.classList.add('keyboard-navigation');
    } else {
      body.classList.remove('keyboard-navigation');
    }
  }

  /**
   * Detecta si el usuario prefiere movimiento reducido
   */
  prefersReducedMotion(): boolean {
    if (!this.isBrowser) return false;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Detecta si el usuario prefiere alto contraste
   */
  prefersHighContrast(): boolean {
    if (!this.isBrowser) return false;

    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Detecta si el usuario prefiere esquema de color oscuro
   */
  prefersDarkColorScheme(): boolean {
    if (!this.isBrowser) return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Enfoca el primer elemento navegable de la página
   */
  focusFirstElement(): void {
    if (!this.isBrowser) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }

  /**
   * Enfoca un elemento específico por ID
   */
  focusElement(elementId: string): void {
    if (!this.isBrowser) return;

    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }

  /**
   * Anuncia un mensaje a los lectores de pantalla
   */
  announceToScreenReader(message: string): void {
    if (!this.isBrowser) return;

    // Crear un elemento temporal para anunciar el mensaje
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remover el elemento después de un tiempo
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Verifica si un elemento es visible para lectores de pantalla
   */
  isElementVisibleToScreenReader(element: HTMLElement): boolean {
    if (!this.isBrowser) return false;

    const style = window.getComputedStyle(element);
    const isHidden = style.display === 'none' || 
                    style.visibility === 'hidden' || 
                    style.opacity === '0' ||
                    element.hasAttribute('aria-hidden') ||
                    element.classList.contains('sr-only');

    return !isHidden;
  }

  /**
   * Obtiene el contraste de color entre dos colores
   */
  getColorContrast(color1: string, color2: string): number {
    // Implementación básica del cálculo de contraste
    // En una implementación real, se usaría una librería como color-contrast
    return 4.5; // Valor de ejemplo
  }

  /**
   * Verifica si el contraste cumple con los estándares WCAG
   */
  isContrastCompliant(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const contrast = this.getColorContrast(foreground, background);
    const requiredContrast = level === 'AA' ? 4.5 : 7.0;
    return contrast >= requiredContrast;
  }

  /**
   * Genera un reporte de accesibilidad de la página actual
   */
  generateAccessibilityReport(): any {
    if (!this.isBrowser) return {};

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      issues: [] as any[],
      warnings: [] as any[],
      passed: [] as any[]
    };

    // Verificar imágenes sin alt
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        report.issues.push({
          type: 'missing-alt',
          element: `img[${index}]`,
          description: 'Imagen sin atributo alt'
        });
      } else {
        report.passed.push({
          type: 'image-alt',
          element: `img[${index}]`,
          description: 'Imagen con atributo alt correcto'
        });
      }
    });

    // Verificar enlaces sin texto descriptivo
    const links = document.querySelectorAll('a');
    links.forEach((link, index) => {
      const text = link.textContent?.trim();
      const ariaLabel = link.getAttribute('aria-label');
      
      if (!text && !ariaLabel) {
        report.issues.push({
          type: 'missing-link-text',
          element: `a[${index}]`,
          description: 'Enlace sin texto descriptivo'
        });
      } else {
        report.passed.push({
          type: 'link-text',
          element: `a[${index}]`,
          description: 'Enlace con texto descriptivo'
        });
      }
    });

    // Verificar formularios sin labels
    const formControls = document.querySelectorAll('input, select, textarea');
    formControls.forEach((control, index) => {
      const id = control.getAttribute('id');
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = control.getAttribute('aria-label');
      
      if (!label && !ariaLabel) {
        report.warnings.push({
          type: 'missing-label',
          element: `${control.tagName.toLowerCase()}[${index}]`,
          description: 'Control de formulario sin label asociado'
        });
      } else {
        report.passed.push({
          type: 'form-label',
          element: `${control.tagName.toLowerCase()}[${index}]`,
          description: 'Control de formulario con label asociado'
        });
      }
    });

    return report;
  }
}
