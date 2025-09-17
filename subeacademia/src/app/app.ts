import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { SeoService } from './core/seo/seo.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { AppShellComponent } from './core/services/ui/app-shell/app-shell.component';
import { ToastContainerComponent } from './core/services/ui/toast/toast.container';
import { ChatbotComponent } from './shared/ui/chatbot/chatbot.component';
import { ScrollToTopComponent } from './shared/ui/scroll-to-top/scroll-to-top.component';
import { ThemeService } from './shared/theme.service';
import { ScrollService } from './core/services/scroll/scroll.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent, ChatbotComponent, ScrollToTopComponent, CommonModule, ToastContainerComponent],
  template: `
    <app-shell>
      <router-outlet />
      <app-chatbot *ngIf="!isAdminRoute" />
      <app-toast-container />
      <app-scroll-to-top />
    </app-shell>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'subeacademia';
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);
  private readonly scrollService = inject(ScrollService);
  private readonly unsubscribe$ = new Subject<void>();
  isAdminRoute = false;
  
  constructor() {}
  ngOnInit() {
    // Inicializa el tema (lee almacenamiento y aplica clases)
    try { this.themeService.init(); } catch {}

    // Suscribirse a cambios de ruta para detectar rutas admin
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute = event.url.startsWith('/admin');
      console.log('🔍 [App] Ruta detectada:', event.url, '¿Es admin?:', this.isAdminRoute);
    });

    // Configurar SEO básico
    try {
      this.seo.updateTags({
        title: 'Sube Academia - Aprende IA, cursos y recursos',
        description: 'Aprende IA, cursos y recursos', 
        type: 'website' 
      });
    } catch {}
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
