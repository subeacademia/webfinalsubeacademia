import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';

type Lang = 'es' | 'en' | 'pt';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-50 border-b border-white/10 bg-[var(--panel)]/70 backdrop-blur">
      <nav class="container flex items-center justify-between h-16" role="navigation" aria-label="Principal">
        <a [routerLink]="['/', currentLang()]" class="font-grotesk text-lg tracking-tight">Sube Academ-IA</a>

        <button class="md:hidden btn" (click)="toggleMobile()" aria-label="Abrir menú">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>
        </button>

        <ul class="hidden md:flex items-center gap-2">
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

          <li class="relative" (mouseenter)="teamOpen = true" (mouseleave)="teamOpen = false">
            <button class="btn" aria-haspopup="menu" [attr.aria-expanded]="teamOpen">Equipo</button>
            <div *ngIf="teamOpen" class="absolute right-0 mt-2 w-40 card p-2">
              <a [routerLink]="['/admin']" class="block px-3 py-2 rounded-lg hover:bg-white/10" aria-label="Ir a Admin">Admin</a>
            </div>
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

      <div *ngIf="mobileOpen()" class="md:hidden border-t border-white/10 bg-[var(--panel)]/90">
        <div class="container py-3 space-y-2">
          <a (click)="closeMobile()" [routerLink]="['/', currentLang()]" class="block btn w-full text-left" aria-label="Ir a Inicio">Home</a>
          <a (click)="closeMobile()" [routerLink]="['/', currentLang(), 'blog']" class="block btn w-full text-left" aria-label="Ir a Blog">Blog</a>
          <a (click)="closeMobile()" [routerLink]="['/', currentLang(), 'cursos']" class="block btn w-full text-left" aria-label="Ir a Cursos">Cursos</a>
          <a (click)="closeMobile()" [routerLink]="['/', currentLang(), 'ia']" class="block btn w-full text-left" aria-label="Ir a IA">IA</a>
          <a (click)="closeMobile()" [routerLink]="['/', currentLang(), 'contacto']" class="block btn w-full text-left" aria-label="Ir a Contacto">Contacto</a>
          <a (click)="closeMobile()" [routerLink]="['/admin']" class="block btn w-full text-left" aria-label="Ir a Admin">Admin</a>

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
  protected teamOpen = false;
  protected mobileOpen: WritableSignal<boolean> = signal(false);

  readonly currentLang: () => Lang;

  constructor(private readonly router: Router, public readonly i18n: I18nService) {
    this.currentLang = this.i18n.currentLang as unknown as () => Lang;
  }

  toggleMobile() { this.mobileOpen.set(!this.mobileOpen()); }
  closeMobile() { this.mobileOpen.set(false); }

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

