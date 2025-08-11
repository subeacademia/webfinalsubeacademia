import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme'; // 'light' | 'dark'
  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const savedPref = (localStorage.getItem('pref-theme') as 'light' | 'dark' | null);
        const saved = (localStorage.getItem(this.storageKey) as 'light' | 'dark' | null) || savedPref;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const theme: 'light' | 'dark' = saved ?? (prefersDark ? 'dark' : 'light');
        this.apply(theme);
      } catch {
        // noop
      }
    }
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const isDark = document.documentElement.classList.contains('dark');
    this.apply(isDark ? 'light' : 'dark');
  }

  apply(theme: 'light' | 'dark'): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
      root.setAttribute('data-theme', theme);
      // Compatibilidad con nuevo esquema basado en clases
      root.classList.remove('theme-dark', 'theme-light');
      root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
      try {
        localStorage.setItem(this.storageKey, theme);
        localStorage.setItem('pref-theme', theme);
      } catch {}
    }
  }

  current(): 'light' | 'dark' {
    if (!isPlatformBrowser(this.platformId)) return 'light';
    const root = document.documentElement;
    return (root.classList.contains('dark') || root.classList.contains('theme-dark')) ? 'dark' : 'light';
  }
}

