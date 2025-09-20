import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      type="button"
      (click)="toggleTheme()" 
      [class]="buttonClasses()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="isDark()"
      [attr.title]="tooltipText()"
      class="theme-toggle-btn">
      
      <!-- Contenedor del switch -->
      <div class="theme-toggle-track" [class.active]="isDark()">
        <!-- Indicador deslizante -->
        <div class="theme-toggle-thumb" [class.active]="isDark()">
          <!-- Icono del sol -->
          <svg 
            class="theme-icon sun-icon" 
            [class.active]="!isDark()"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          
          <!-- Icono de la luna -->
          <svg 
            class="theme-icon moon-icon" 
            [class.active]="isDark()"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
      </div>
      
      <!-- Texto opcional (solo visible en versión con texto) -->
      <span class="theme-toggle-text" *ngIf="showText">
        {{ isDark() ? 'Modo Oscuro' : 'Modo Claro' }}
      </span>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border: none;
      background: transparent;
      border-radius: 2rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      user-select: none;
    }
    
    .theme-toggle-btn:hover {
      background: var(--color-primary-light);
      transform: scale(1.05);
    }
    
    .theme-toggle-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }
    
    .theme-toggle-btn:active {
      transform: scale(0.95);
    }
    
    /* Track del switch */
    .theme-toggle-track {
      position: relative;
      width: 3.5rem;
      height: 2rem;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      border-radius: 1rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.1),
        0 2px 8px rgba(251, 191, 36, 0.3);
    }
    
    .theme-toggle-track.active {
      background: linear-gradient(135deg, #1e293b, #334155);
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.3),
        0 2px 8px rgba(30, 41, 59, 0.4);
    }
    
    /* Thumb deslizante */
    .theme-toggle-thumb {
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1.75rem;
      height: 1.75rem;
      background: white;
      border-radius: 50%;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.1),
        0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .theme-toggle-thumb.active {
      transform: translateX(1.5rem);
      background: #0f172a;
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    /* Iconos */
    .theme-icon {
      position: absolute;
      width: 1rem;
      height: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: scale(0.8) rotate(180deg);
    }
    
    .theme-icon.active {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    
    .sun-icon {
      color: #f59e0b;
    }
    
    .moon-icon {
      color: #60a5fa;
    }
    
    /* Texto opcional */
    .theme-toggle-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--fg);
      transition: color 0.3s ease;
      white-space: nowrap;
    }
    
    /* Variantes de tamaño */
    .theme-toggle-btn.compact .theme-toggle-track {
      width: 3rem;
      height: 1.75rem;
    }
    
    .theme-toggle-btn.compact .theme-toggle-thumb {
      width: 1.5rem;
      height: 1.5rem;
    }
    
    .theme-toggle-btn.compact .theme-toggle-thumb.active {
      transform: translateX(1.25rem);
    }
    
    .theme-toggle-btn.compact .theme-icon {
      width: 0.875rem;
      height: 0.875rem;
    }
    
    .theme-toggle-btn.large .theme-toggle-track {
      width: 4rem;
      height: 2.25rem;
    }
    
    .theme-toggle-btn.large .theme-toggle-thumb {
      width: 2rem;
      height: 2rem;
    }
    
    .theme-toggle-btn.large .theme-toggle-thumb.active {
      transform: translateX(1.75rem);
    }
    
    .theme-toggle-btn.large .theme-icon {
      width: 1.125rem;
      height: 1.125rem;
    }
    
    /* Animación de entrada */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .theme-toggle-btn {
      animation: slideIn 0.3s ease-out;
    }
    
    /* Efectos hover mejorados */
    .theme-toggle-btn:hover .theme-toggle-track {
      transform: scale(1.02);
    }
    
    .theme-toggle-btn:hover .theme-toggle-thumb {
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.15),
        0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    /* Modo de alto contraste */
    @media (prefers-contrast: high) {
      .theme-toggle-track {
        border: 2px solid var(--border);
      }
      
      .theme-toggle-thumb {
        border: 1px solid var(--border);
      }
    }
    
    /* Reducir movimiento si se prefiere */
    @media (prefers-reduced-motion: reduce) {
      .theme-toggle-btn,
      .theme-toggle-track,
      .theme-toggle-thumb,
      .theme-icon {
        transition: none !important;
        animation: none !important;
      }
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  
  // Props configurables
  showText = false;
  size: 'compact' | 'normal' | 'large' = 'normal';
  
  // Estado reactivo
  isDark = signal(this.themeService.current() === 'dark');
  
  // Computed properties
  buttonClasses = computed(() => {
    const classes = ['theme-toggle-btn'];
    if (this.size !== 'normal') {
      classes.push(this.size);
    }
    return classes.join(' ');
  });
  
  ariaLabel = computed(() => 
    this.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  );
  
  tooltipText = computed(() => 
    this.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'
  );
  
  constructor() {
    // Suscribirse a cambios del tema
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDark.set(isDark);
    });
  }
  
  toggleTheme(): void {
    this.themeService.toggle();
    
    // Feedback háptico en dispositivos compatibles
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Anunciar cambio para lectores de pantalla
    this.announceThemeChange();
  }
  
  private announceThemeChange(): void {
    const message = this.isDark() 
      ? 'Modo oscuro activado' 
      : 'Modo claro activado';
    
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
