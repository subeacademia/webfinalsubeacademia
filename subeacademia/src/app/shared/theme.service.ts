import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme'; // 'light' | 'dark'

  init(): void {
    try {
      const saved = (localStorage.getItem(this.storageKey) as 'light' | 'dark' | null);
      const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const theme: 'light' | 'dark' = saved ?? (prefersDark ? 'dark' : 'light');
      this.apply(theme);
    } catch {
      // noop
    }
  }

  toggle(): void {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    this.apply(isDark ? 'light' : 'dark');
  }

  apply(theme: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
      root.setAttribute('data-theme', theme);
    }
    try { localStorage.setItem(this.storageKey, theme); } catch {}
  }

  current(): 'light' | 'dark' {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
}

