import { ChangeDetectionStrategy, Component, Signal, WritableSignal, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { I18nService } from '../../../i18n/i18n.service';
import { LocalSettingsService, LocalSiteSettings } from '../../../services/local-settings.service';
import { ThemeService } from '../../../../shared/theme.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '@angular/fire/auth';
import { ThemeToggleComponent } from '../../../../shared/ui/theme-toggle/theme-toggle.component';
import { FlagSelectorComponent } from '../../../../shared/ui/flag-selector/flag-selector.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe, ThemeToggleComponent, FlagSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[var(--panel)]/70 backdrop-blur" role="banner">
        <nav class="container mx-auto max-w-7xl flex items-center justify-between h-16 px-4 md:px-6" role="navigation" aria-label="Navegación principal">
           <a [routerLink]="['/', currentLang()]" 
              class="font-grotesk text-lg tracking-tight flex items-center gap-2 mr-4 md:mr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)]"
               [attr.aria-label]="'Ir a página de inicio - ' + brandName()">
          <img *ngIf="logoUrl()" [src]="logoUrl()!" [alt]="'Logo de ' + brandName()" class="h-7 w-7 md:h-8 md:w-8 rounded"/>
          <span>{{ brandName() }}</span>
        </a>

        <!-- Botones móviles con mejor accesibilidad -->
        <div class="md:hidden flex items-center gap-2">
          <button class="nav-toggle p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                  (click)="toggleNav()" 
                  [attr.aria-expanded]="navOpen()"
                  [attr.aria-controls]="navOpen() ? 'mobile-nav' : null"
                  aria-label="Abrir menú de navegación">
            <span class="sr-only">Menú</span>
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <app-theme-toggle></app-theme-toggle>
          
          <app-flag-selector></app-flag-selector>
        </div>

        <!-- Navegación principal desktop -->
        <ul class="nav hidden md:flex items-center gap-2 flex-1 ml-4 md:ml-8" role="menubar">
          <li role="none">
            <a [routerLink]="['/', currentLang()]"
               routerLinkActive="text-[var(--accent)]"
               [routerLinkActiveOptions]="{ exact: true }"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               role="menuitem"
               aria-label="Ir a Inicio">
              Home
            </a>
          </li>
          <li role="none">
            <a [routerLink]="['/', currentLang(), 'productos']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               role="menuitem"
               aria-label="Ir a Productos">
              Productos
            </a>
          </li>
          <li role="none">
            <a [routerLink]="['/', currentLang(), 'nosotros']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               role="menuitem"
               aria-label="Ir a Nosotros">
              Nosotros
            </a>
          </li>
          <li role="none">
            <a [routerLink]="['/', currentLang(), 'metodologia']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               role="menuitem"
               aria-label="Ir a Metodología">
              Metodología
            </a>
          </li>
          <li role="none">
            <a [routerLink]="['/', currentLang(), 'blog']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               role="menuitem"
               aria-label="Ir a Blog">
              Blog
            </a>
          </li>
          
          <li role="none">
            <a [routerLink]="['/', currentLang(), 'contacto']"
               routerLinkActive="text-[var(--accent)]"
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
               role="menuitem"
               aria-label="Ir a Contacto">
              Contacto
            </a>
          </li>
          <li role="none">
            <a routerLink="/admin" 
               class="btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
               role="menuitem"
               aria-label="Ir a Panel de Administración">
              Admin
            </a>
          </li>
        </ul>

        <!-- Acciones persistentes a la derecha (desktop) -->
        <div class="hidden md:flex items-center gap-2 ml-2" role="group" aria-label="Acciones del sitio">


          <app-theme-toggle></app-theme-toggle>
          
          <app-flag-selector></app-flag-selector>
        </div>
      </nav>

      <!-- Navegación móvil con mejor accesibilidad -->
      <div [class.nav--open]="navOpen()" 
           class="md:hidden border-t border-white/10 bg-[var(--panel)]/95 backdrop-blur nav" 
           *ngIf="navOpen()"
           id="mobile-nav"
           role="navigation"
           aria-label="Menú móvil">
        <div class="container mx-auto max-w-7xl py-4 px-4 space-y-2">
          <a (click)="closeNav()" 
             [routerLink]="['/', currentLang()]" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Inicio">
             Home
          </a>
          <a (click)="closeNav()" 
             [routerLink]="['/', currentLang(), 'productos']" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Productos">
             Productos
          </a>
          <a (click)="closeNav()" 
             [routerLink]="['/', currentLang(), 'nosotros']" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Nosotros">
             Nosotros
          </a>
          <a (click)="closeNav()" 
             [routerLink]="['/', currentLang(), 'metodologia']" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Metodología">
             Metodología
          </a>
          <a (click)="closeNav()" 
             [routerLink]="['/', currentLang(), 'blog']" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Blog">
             Blog
          </a>
          
          <a (click)="closeNav()" 
             [routerLink]="['/', currentLang(), 'contacto']" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Contacto">
             Contacto
          </a>
          <a (click)="closeNav()" 
             routerLink="/admin" 
             class="block btn w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             role="menuitem"
             aria-label="Ir a Panel de Administración">
             Admin
          </a>

          <!-- Botones de autenticación móviles -->
          <div *ngIf="!(currentUser$ | async)" class="pt-2">
            <button type="button" 
                    (click)="loginWithGoogle(); closeNav()" 
                    class="w-full btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    aria-label="Iniciar sesión con Google">
              <span class="mr-2">🔐</span>
              Iniciar Sesión con Google
            </button>
          </div>
          
          <div *ngIf="currentUser$ | async as user" class="pt-2 space-y-2">
            <a routerLink="/dashboard" 
               (click)="closeNav()"
               class="block w-full btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-center"
               aria-label="Ir al dashboard">
              <span class="mr-2">👤</span>
              {{ user.displayName || 'Dashboard' }}
            </a>
            <button type="button" 
                    (click)="logout(); closeNav()" 
                    class="w-full btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    aria-label="Cerrar sesión">
              <span class="mr-1">🚪</span>
              Cerrar Sesión
            </button>
          </div>

          <div class="pt-2">
            <app-flag-selector></app-flag-selector>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto max-w-7xl pt-20 md:pt-24 pb-8 px-4 md:px-6" id="main-content" role="main">
      <ng-content />
    </main>

    <footer class="mt-10 border-t border-white/10 bg-[var(--panel)]/40" role="contentinfo">
      <div class="container mx-auto max-w-7xl py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-[var(--muted)]">
        <span>© {{ brandName() }}</span>
        <nav class="flex items-center gap-4" aria-label="Enlaces del pie de página">
          <a [routerLink]="['/', currentLang(), 'contacto']" 
             class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             aria-label="Ir a página de contacto">
             Política de Privacidad
          </a>
          <a href="https://twitter.com" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             aria-label="Abrir Twitter en nueva ventana">
             Twitter
          </a>
          <a href="https://www.linkedin.com" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             aria-label="Abrir LinkedIn en nueva ventana">
             LinkedIn
          </a>
          <a href="https://www.youtube.com" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" 
             aria-label="Abrir YouTube en nueva ventana">
             YouTube
          </a>
        </nav>
      </div>
    </footer>
    

  `,
})
export class AppShellComponent {
  protected navOpen: WritableSignal<boolean> = signal(false);

  readonly currentLang: () => string;

  brandName = signal<string>('Sube Academ-IA');
  logoUrl = signal<string | null>(null);
  private readonly authService = inject(AuthService);

  // Observable del usuario actual para la UI
  readonly currentUser$ = this.authService.currentUser$;

  constructor(readonly router: Router, public readonly i18n: I18nService, private readonly settings: LocalSettingsService) {
    this.currentLang = this.i18n.currentLang as unknown as () => string;
    try {
      this.settings.get().subscribe((s: LocalSiteSettings) => {
        console.log('🏷️ Configuraciones recibidas en AppShell:', s);
        if (s.brandName) {
          this.brandName.set(s.brandName);
          console.log('✅ Nombre de marca actualizado en navegación:', s.brandName);
        }
        this.logoUrl.set(s.logoUrl || null);
        if (s.logoUrl) {
          console.log('✅ Logo URL actualizado en navegación:', s.logoUrl);
        }
      });
    } catch (error) {
      console.error('❌ Error cargando configuraciones en AppShell:', error);
    }
    // Settings initialization
  }

  toggleNav() { 
    this.navOpen.set(!this.navOpen()); 
  }

  closeNav() { 
    this.navOpen.set(false); 
  }



  async loginWithGoogle(): Promise<void> {
    try {
      console.log('🔑 [AppShell] Intentando login con Google...');
      await this.authService.loginWithGoogle();
      console.log('✅ [AppShell] Login exitoso');
    } catch (error) {
      console.error('❌ [AppShell] Error en login:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 [AppShell] Intentando logout...');
      await this.authService.logout();
      console.log('✅ [AppShell] Logout exitoso');
    } catch (error) {
      console.error('❌ [AppShell] Error en logout:', error);
    }
  }

  // Theme management is now handled by ThemeToggleComponent
}

