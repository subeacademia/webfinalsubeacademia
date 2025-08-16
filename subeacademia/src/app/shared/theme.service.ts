import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme'; // 'light' | 'dark'
  // Observable de tema actual para reactividad en componentes (e.g., Three.js)
  readonly isDarkTheme$ = new BehaviorSubject<boolean>(false);
  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedPref = (localStorage.getItem('pref-theme') as 'light' | 'dark' | null);
        const saved = (localStorage.getItem(this.storageKey) as 'light' | 'dark' | null) || savedPref;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const theme: 'light' | 'dark' = saved ?? (prefersDark ? 'dark' : 'light');
        
        console.log('[ThemeService] Inicializando tema:', { savedPref, saved, prefersDark, theme });
        
        this.apply(theme);
        this.isDarkTheme$.next(theme === 'dark');
      } catch (error) {
        console.error('[ThemeService] Error al inicializar tema:', error);
      }
    }
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    console.log('[ThemeService] Cambiando tema de', isDark ? 'dark' : 'light', 'a', newTheme);
    this.apply(newTheme);
  }

  apply(theme: 'light' | 'dark'): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      const wasDark = root.classList.contains('dark');
      
      root.classList.toggle('dark', theme === 'dark');
      root.setAttribute('data-theme', theme);
      // Compatibilidad con nuevo esquema basado en clases
      root.classList.remove('theme-dark', 'theme-light');
      root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
      
      console.log('[ThemeService] Aplicando tema:', theme, {
        'classList.contains(dark)': root.classList.contains('dark'),
        'data-theme': root.getAttribute('data-theme'),
        'theme-dark': root.classList.contains('theme-dark'),
        'theme-light': root.classList.contains('theme-light')
      });
      
      try {
        localStorage.setItem(this.storageKey, theme);
        localStorage.setItem('pref-theme', theme);
      } catch (error) {
        console.error('[ThemeService] Error al guardar tema en localStorage:', error);
      }
      // Notificar a suscriptores
      this.isDarkTheme$.next(theme === 'dark');
    }
  }

  current(): 'light' | 'dark' {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    const root = document.documentElement;
    const isDark = root.classList.contains('dark') || root.classList.contains('theme-dark');
    console.log('[ThemeService] Tema actual:', isDark ? 'dark' : 'light', {
      'classList.contains(dark)': root.classList.contains('dark'),
      'classList.contains(theme-dark)': root.classList.contains('theme-dark')
    });
    return isDark ? 'dark' : 'light';
  }
}

