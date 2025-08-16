import { ChangeDetectionStrategy, Component, Signal, WritableSignal, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';
import { SettingsService, SiteSettings } from '../../data/settings.service';
import { ThemeService } from '../../../shared/theme.service';

type Lang = 'es' | 'en' | 'pt';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[var(--panel)]/70 backdrop-blur">
        <nav class="container mx-auto max-w-7xl flex items-center justify-between h-16" role="navigation" aria-label="Principal">
           <a [routerLink]="['/', currentLang()]" class="font-grotesk text-lg tracking-tight flex items-center gap-2 mr-4 md:mr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]">
          <img *ngIf="logoUrl()" [src]="logoUrl()!" alt="Logo" class="h-7 w-7 md:h-8 md:w-8 rounded"/>
          <span>{{ brandName() }}</span>
        </a>

        <button class="md:hidden btn" (click)="toggleNav()" aria-label="Abrir menú">☰</button>
        <button class="md:hidden theme-toggle" (click)="toggleTheme()" aria-label="Cambiar tema">{{ themeDark() ? '🌙' : '☀️' }}</button>
        <select class="md:hidden btn ml-2" [value]="currentLang()" (change)="onChangeLang($any($event.target).value)" aria-label="Cambiar idioma móvil">
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="pt">PT</option>
        </select>

        <ul class="nav hidden md:flex items-center gap-2 flex-1 ml-4 md:ml-8">
          <li>
            <a [routerLink]="['/', currentLang()]"
               routerLinkActive="text-[var(--accent)]"
               [routerLinkActiveOptions]="{ exact: true }"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               aria-label="Ir a Inicio">Home</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'cursos']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               aria-label="Ir a Cursos">Cursos</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'nosotros']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               aria-label="Ir a Nosotros">Nosotros</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'metodologia']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               aria-label="Ir a Metodología">Metodología</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'blog']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               aria-label="Ir a Blog">Blog</a>
          </li>
          
          <li>
            <a [routerLink]="['/', currentLang(), 'contacto']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               aria-label="Ir a Contacto">Contacto</a>
          </li>
          <li>
            <a routerLink="/admin" class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Admin">Admin</a>
          </li>
        </ul>

        <!-- Acciones persistentes a la derecha (desktop) -->
        <div class="hidden md:flex items-center gap-2 ml-2">
          <button type="button" (click)="toggleTheme()" class="theme-toggle" aria-label="Cambiar tema" title="Cambiar tema">
            {{ themeDark() ? '🌙' : '☀️' }}
          </button>
          <label class="sr-only" for="langSelectDesktop">Cambiar idioma</label>
           <select id="langSelectDesktop" class="btn" [value]="currentLang()" (change)="onChangeLang($any($event.target).value)" aria-label="Cambiar idioma">
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="pt">PT</option>
          </select>
        </div>
      </nav>

      <div [class.nav--open]="navOpen()" class="md:hidden border-t border-white/10 bg-[var(--panel)]/90 nav" *ngIf="navOpen()">
        <div class="container mx-auto max-w-7xl py-3 space-y-2">
          <a (click)="closeNav()" [routerLink]="['/', currentLang()]" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Inicio">Home</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'cursos']" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Cursos">Cursos</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'nosotros']" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Nosotros">Nosotros</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'metodologia']" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Metodología">Metodología</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'blog']" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Blog">Blog</a>
          
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'contacto']" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Contacto">Contacto</a>
          <a (click)="closeNav()" routerLink="/admin" class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Admin">Admin</a>

          <div class="pt-2 flex gap-2">
            <select class="btn w-full" [value]="currentLang()" (change)="onChangeLang($any($event.target).value)" aria-label="Cambiar idioma">
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="pt">PT</option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto max-w-7xl pt-24 pb-8">
      <ng-content />
    </main>

    <footer class="mt-10 border-t border-white/10 bg-[var(--panel)]/40">
      <div class="container mx-auto max-w-7xl py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>© Sube Academ-IA</span>
        <nav class="flex items-center gap-4" aria-label="Secundaria">
          <a [routerLink]="['/', currentLang(), 'contacto']" class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Ir a Política de Privacidad">Política de Privacidad</a>
          <a href="https://twitter.com" target="_blank" rel="noopener" class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Abrir Twitter">Twitter</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener" class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Abrir LinkedIn">LinkedIn</a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener" class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" aria-label="Abrir YouTube">YouTube</a>
        </nav>
      </div>
    </footer>
    
  `,
})
export class AppShellComponent {
  protected navOpen: WritableSignal<boolean> = signal(false);

  readonly currentLang: () => Lang;

  brandName = signal<string>('Sube Academ-IA');
  logoUrl = signal<string | null>(null);
  private readonly themeService = inject(ThemeService);
  themeDark = signal<boolean>(this.themeService.current() === 'dark');

  constructor(readonly router: Router, public readonly i18n: I18nService, private readonly settings: SettingsService) {
    this.currentLang = this.i18n.currentLang as unknown as () => Lang;
    try {
      this.settings.get().subscribe((s: SiteSettings | undefined) => {
        if (!s) return;
        if (s.brandName) this.brandName.set(s.brandName);
        this.logoUrl.set(s.logoUrl || null);
      });
    } catch {}
    // Theme se aplica vía ThemeService en App init; mantenemos señal para UI
  }

  toggleNav() { this.navOpen.set(!this.navOpen()); }
  closeNav() { this.navOpen.set(false); }

  onChangeLang(lang: Lang) {
    const supported = new Set(['es', 'en', 'pt']);
    const current = this.router.url;
    const match = current.match(/^\/(es|en|pt)(\/|$)/);
    if (match) {
      const next = current.replace(/^\/(es|en|pt)/, '/' + lang);
      void this.router.navigateByUrl(next);
    } else {
      void this.router.navigate(['/', lang]);
    }
  }

  toggleTheme() { this.themeService.toggle(); this.themeDark.set(this.themeService.current() === 'dark'); }

  // Ya no gestionamos DOM aquí; lo hace ThemeService
}

