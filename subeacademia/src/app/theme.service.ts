import { Injectable } from '@angular/core';

const KEY = 'pref-theme'; // 'dark' | 'light'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private current: 'dark' | 'light' = 'dark';
  private readonly isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  constructor() {
    const saved = this.readStoredTheme() || 'dark';
    this.current = saved;
    if (this.isBrowser) {
      this.apply(saved);
    }
  }

  apply(mode: 'dark' | 'light') {
    this.current = mode;
    if (this.isBrowser) {
      try { localStorage.setItem(KEY, mode); } catch {}
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light');
      root.classList.add(mode === 'dark' ? 'theme-dark' : 'theme-light');
      // Compatibilidad con Tailwind y data-theme
      root.classList.toggle('dark', mode === 'dark');
      root.setAttribute('data-theme', mode);
    }
  }

  toggle() { this.apply(this.current === 'dark' ? 'light' : 'dark'); }
  isDark() { return this.current === 'dark'; }

  private readStoredTheme(): 'dark' | 'light' | null {
    if (!this.isBrowser) return null;
    try {
      const v = localStorage.getItem(KEY) as 'dark' | 'light' | null;
      return v === 'dark' || v === 'light' ? v : null;
    } catch { return null; }
  }
}

