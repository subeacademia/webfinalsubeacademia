import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';

interface Language {
  code: 'es' | 'en' | 'pt';
  name: string;
  flag: string; // SVG content
}

@Component({
  selector: 'app-flag-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flag-selector">
      <button 
        *ngFor="let language of languages"
        type="button"
        (click)="selectLanguage(language.code)"
        [class]="getFlagButtonClasses(language.code)"
        [attr.aria-label]="'Cambiar a ' + language.name"
        [attr.title]="language.name">
        
        <span class="flag-emoji">{{ language.flag }}</span>
        <span class="flag-code">{{ language.code.toUpperCase() }}</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .flag-selector {
      display: flex !important;
      gap: 0.5rem !important;
      align-items: center !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .flag-button {
      position: relative !important;
      width: auto !important;
      height: 2.5rem !important;
      min-width: 3rem !important;
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      border-radius: 0.5rem !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      background: rgba(255, 255, 255, 0.1) !important;
      padding: 0.25rem 0.5rem !important;
      outline: none !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      gap: 0.125rem !important;
    }
    
    .flag-button:hover {
      transform: scale(1.1) !important;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
      border-color: #3b82f6 !important;
    }
    
    .flag-button:focus-visible {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
    }
    
    .flag-button:active {
      transform: scale(1.05) !important;
    }
    
    .flag-button.active {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
      transform: scale(1.05) !important;
    }
    
    .flag-emoji {
      font-size: 1.25rem !important;
      line-height: 1 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .flag-code {
      font-size: 0.625rem !important;
      font-weight: 600 !important;
      color: rgba(255, 255, 255, 0.8) !important;
      line-height: 1 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      text-transform: uppercase !important;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .flag-button {
        width: 1.75rem;
        height: 1.25rem;
      }
      
      .flag-selector {
        gap: 0.375rem;
      }
    }
    
    /* Modo de alto contraste */
    @media (prefers-contrast: high) {
      .flag-button {
        border-width: 2px;
        border-color: var(--border);
      }
      
      .flag-button.active {
        border-color: var(--primary);
        border-width: 3px;
      }
    }
    
    /* Reducir movimiento si se prefiere */
    @media (prefers-reduced-motion: reduce) {
      .flag-button {
        transition: none !important;
        transform: none !important;
      }
      
      .flag-button:hover {
        transform: none !important;
      }
      
      .flag-button.active {
        transform: none !important;
      }
    }
  `]
})
export class FlagSelectorComponent {
  private router = inject(Router);
  private i18nService = inject(I18nService);
  
  // Idiomas disponibles con emojis de banderas
  languages: Language[] = [
    {
      code: 'es',
      name: 'Español',
      flag: '🇪🇸'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'pt',
      name: 'Português',
      flag: '🇧🇷'
    }
  ];
  
  // Computed property para el idioma actual
  currentLanguage = computed(() => {
    const currentLang = this.i18nService.currentLang();
    return currentLang;
  });
  
  getFlagButtonClasses(langCode: string): string {
    const classes = ['flag-button'];
    if (this.currentLanguage() === langCode) {
      classes.push('active');
    }
    return classes.join(' ');
  }
  
  async selectLanguage(langCode: 'es' | 'en' | 'pt'): Promise<void> {
    if (langCode === this.currentLanguage()) {
      return; // Ya está seleccionado
    }
    
    // Cambiar idioma en el servicio
    await this.i18nService.ensureLoaded(langCode, true);
    await this.i18nService.setLang(langCode);
    
    // Actualizar la URL
    this.updateRoute(langCode);
    
    // Feedback háptico en dispositivos compatibles
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    // Anunciar cambio para lectores de pantalla
    this.announceLanguageChange(langCode);
  }
  
  private updateRoute(langCode: string): void {
    const current = this.router.url;
    const match = current.match(/^\/(es|en|pt)(\/|$)/);
    
    if (match) {
      const next = current.replace(/^\/(es|en|pt)/, '/' + langCode);
      void this.router.navigateByUrl(next);
    } else {
      void this.router.navigate(['/', langCode]);
    }
  }
  
  private announceLanguageChange(langCode: string): void {
    const language = this.languages.find(lang => lang.code === langCode);
    if (!language) return;
    
    const message = `Idioma cambiado a ${language.name}`;
    
    // Crear elemento temporal para anuncio
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remover después de un breve tiempo
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}
