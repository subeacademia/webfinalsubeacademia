import { Component, OnDestroy, OnInit, isDevMode, signal, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { SeoService } from './core/seo/seo.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { AppShellComponent } from './core/ui/app-shell/app-shell.component';
import { ThemeService } from './theme.service';
import { FirebaseDataService } from './core/firebase-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent],
  template: `
    <app-shell>
      <router-outlet />
    </app-shell>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('subeacademia');
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);
  private readonly data = inject(FirebaseDataService);
  private readonly unsubscribe$ = new Subject<void>();
  constructor() {}
  ngOnInit() {
    // ThemeService aplica el tema en el constructor (persistente)
    if (isDevMode()) {
      try {
        const hints = this.data.getIndexHints();
        // eslint-disable-next-line no-console
        console.log('[Indices] Recomendados:', hints);
      } catch {}
    }
    // Inicializar lang y SEO según ruta
    this.router.events
      .pipe(filter((e: any) => e instanceof NavigationEnd), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        const urlTree = this.router.parseUrl(this.router.url);
        const first = urlTree.root.children['primary']?.segments[0]?.path as
          | 'es'
          | 'en'
          | 'pt'
          | undefined;
        if (first) void this.i18n.setLang(first);

        const url = this.router.url;
        if (url.includes('/blog')) {
          this.seo.updateTags({ title: 'Blog · Sube Academia', description: 'Publicaciones y novedades', type: 'website' });
        } else if (url.includes('/cursos')) {
          this.seo.updateTags({ title: 'Cursos · Sube Academia', description: 'Cursos y rutas de aprendizaje', type: 'website' });
        } else {
          this.seo.updateTags({ title: 'Sube Academia', description: 'Aprende IA, cursos y recursos', type: 'website' });
        }
      });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
