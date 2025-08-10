import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { SeoService } from './core/seo/seo.service';
import { filter } from 'rxjs/operators';
import { AppShellComponent } from './core/ui/app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppShellComponent],
  template: `
    <app-shell>
      <router-outlet />
    </app-shell>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('subeacademia');
  constructor(
    private readonly router: Router,
    private readonly i18n: I18nService,
    private readonly seo: SeoService,
  ) {}
  ngOnInit() {
    // Inicializar lang y SEO según ruta
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
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
}
