import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { SeoService } from './core/seo/seo.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
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
        if (first) this.i18n.setDocumentLang(first);

        const url = this.router.url;
        if (url.includes('/blog')) {
          this.seo.updateTags({ title: 'Blog · Sube Academia', description: 'Publicaciones y novedades' });
        } else if (url.includes('/cursos')) {
          this.seo.updateTags({ title: 'Cursos · Sube Academia', description: 'Cursos y rutas de aprendizaje' });
        } else {
          this.seo.updateTags({ title: 'Sube Academia', description: 'Aprende IA, cursos y recursos' });
        }
      });
  }
}
