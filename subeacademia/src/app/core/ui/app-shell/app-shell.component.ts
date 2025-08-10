import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';
import { SettingsService, SiteSettings } from '../../data/settings.service';

type Lang = 'es' | 'en' | 'pt';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-50 border-b border-white/10 bg-[var(--panel)]/70 backdrop-blur">
      <nav class="container flex items-center justify-between h-16" role="navigation" aria-label="Principal">
        <a [routerLink]="['/', currentLang()]" class="font-grotesk text-lg tracking-tight flex items-center gap-2">
          <img *ngIf="logoUrl()" [src]="logoUrl()!" alt="Logo" class="h-6 w-6 rounded"/>
          <span>{{ brandName() }}</span>
        </a>

        <button class="md:hidden btn" (click)="toggleNav()" aria-label="Abrir menú">☰</button>

        <ul class="nav hidden md:flex items-center gap-2">
          <li>
            <a [routerLink]="['/', currentLang()]"
               routerLinkActive="text-[var(--accent)]"
               [routerLinkActiveOptions]="{ exact: true }"
               class="btn"
               aria-label="Ir a Inicio">Home</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'blog']"
               routerLinkActive="text-[var(--accent)]"
               class="btn"
               aria-label="Ir a Blog">Blog</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'cursos']"
               routerLinkActive="text-[var(--accent)]"
               class="btn"
               aria-label="Ir a Cursos">Cursos</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'ia']"
               routerLinkActive="text-[var(--accent)]"
               class="btn"
               aria-label="Ir a IA">IA</a>
          </li>
          <li>
            <a [routerLink]="['/', currentLang(), 'contacto']"
               routerLinkActive="text-[var(--accent)]"
               class="btn"
               aria-label="Ir a Contacto">Contacto</a>
          </li>
          <li>
            <a routerLink="/admin" class="btn" aria-label="Ir a Admin">Admin</a>
          </li>

          <li>
            <label class="sr-only" for="langSelect">Cambiar idioma</label>
            <select id="langSelect" class="btn" [value]="currentLang()" (change)="onChangeLang($any($event.target).value)" aria-label="Cambiar idioma">
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="pt">PT</option>
            </select>
          </li>
        </ul>
      </nav>

      <div [class.nav--open]="navOpen()" class="md:hidden border-t border-white/10 bg-[var(--panel)]/90 nav" *ngIf="navOpen()">
        <div class="container py-3 space-y-2">
          <a (click)="closeNav()" [routerLink]="['/', currentLang()]" class="block btn w-full text-left" aria-label="Ir a Inicio">Home</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'blog']" class="block btn w-full text-left" aria-label="Ir a Blog">Blog</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'cursos']" class="block btn w-full text-left" aria-label="Ir a Cursos">Cursos</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'ia']" class="block btn w-full text-left" aria-label="Ir a IA">IA</a>
          <a (click)="closeNav()" [routerLink]="['/', currentLang(), 'contacto']" class="block btn w-full text-left" aria-label="Ir a Contacto">Contacto</a>
          <a (click)="closeNav()" routerLink="/admin" class="block btn w-full text-left" aria-label="Ir a Admin">Admin</a>

          <div class="pt-2">
            <select class="btn w-full" [value]="currentLang()" (change)="onChangeLang($any($event.target).value)" aria-label="Cambiar idioma">
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="pt">PT</option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <main class="container py-8">
      <ng-content />
    </main>

    <footer class="mt-10 border-t border-white/10 bg-[var(--panel)]/40">
      <div class="container py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>© Sube Academ-IA</span>
        <nav class="flex items-center gap-4" aria-label="Secundaria">
          <a href="#" class="hover:text-white">Política de Privacidad</a>
          <a href="#" class="hover:text-white">Twitter</a>
          <a href="#" class="hover:text-white">LinkedIn</a>
          <a href="#" class="hover:text-white">YouTube</a>
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

  constructor(private readonly router: Router, public readonly i18n: I18nService, private readonly settings: SettingsService) {
    this.currentLang = this.i18n.currentLang as unknown as () => Lang;
    this.settings.get().subscribe((s: SiteSettings | undefined) => {
      if (!s) return;
      if (s.brandName) this.brandName.set(s.brandName);
      this.logoUrl.set(s.logoUrl || null);
    });
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
}

