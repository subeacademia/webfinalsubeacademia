import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SkeletonCardComponent } from '../../core/ui/skeleton-card/skeleton-card.component';
import { ContentService } from '../../core/services/content.service';
import { Post } from '../../core/models/post.model';
import { SeoService } from '../../core/seo/seo.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, SkeletonCardComponent],
  template: `
    <main class="container mx-auto p-6">
      <h1 class="text-3xl font-semibold">Blog</h1>
      <p class="text-muted mt-2">Explora artículos por categoría y etiqueta.</p>

      <div class="mt-4 flex flex-wrap gap-3 text-sm">
        <label>
          Categoría:
          <input #catInput class="border rounded px-2 py-1 ml-2" type="text" placeholder="p.ej. Educación" (change)="onCategoryChange(catInput.value)" />
        </label>
        <label>
          Buscar:
          <input #qInput class="border rounded px-2 py-1 ml-2" type="text" placeholder="título o tag" (input)="onQueryChange(qInput.value)" />
        </label>
      </div>

      <section class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ng-container *ngIf="loading(); else list">
          <app-skeleton-card />
          <app-skeleton-card />
          <app-skeleton-card />
        </ng-container>
        <ng-template #list>
          <a
            *ngFor="let post of posts()"
            [routerLink]="['/', currentLang(), 'blog', post.slug]"
            class="block border rounded-lg overflow-hidden hover:shadow-md transition bg-white"
          >
            <img *ngIf="post.coverUrl" [src]="post.coverUrl" [alt]="post.title" class="w-full h-40 object-cover" />
            <div class="p-4">
              <h3 class="text-lg font-semibold line-clamp-2">{{ post.title }}</h3>
              <p class="text-sm text-muted line-clamp-3 mt-2">{{ post.summary }}</p>
              <div class="mt-3 flex flex-wrap gap-2 text-xs text-primary">
                <span *ngFor="let tag of post.tags" class="px-2 py-0.5 bg-primary/10 rounded">#{{ tag }}</span>
              </div>
            </div>
          </a>
        </ng-template>
      </section>

      <p *ngIf="!loading() && posts().length === 0" class="mt-10 text-muted">No hay publicaciones.</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);

  protected readonly currentLang = this.i18n.currentLang;
  protected readonly posts = signal<Post[]>([]);
  protected readonly loading = signal<boolean>(true);
  private filterCategory = signal<string>('');
  private filterQuery = signal<string>('');

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      // SEO base para listado
      this.seo.updateTags({
        title: `Blog | Sube Academ-IA (${lang.toUpperCase()})`,
        description: 'Artículos y novedades sobre IA en educación.',
      });
    });

    // Filtros desde query params: category, tag
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category') || '';
      const q = params.get('q') || '';
      this.filterCategory.set(category);
      this.filterQuery.set(q);
      this.load();
    });
  }

  onCategoryChange(v: string) { this.filterCategory.set(v || ''); this.load(); }
  onQueryChange(v: string) { this.filterQuery.set(v || ''); this.load(); }

  private load() {
    this.loading.set(true);
    const lang = this.currentLang();
    this.content.getPostsByLangAndStatus(lang, 'published', 12).subscribe((list) => {
      const category = this.filterCategory().toLowerCase();
      const q = this.filterQuery().toLowerCase();
      let filtered = list;
      if (category) filtered = filtered.filter((p) => (p.categories || []).some((c) => c.toLowerCase().includes(category)));
      if (q) filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)));
      this.posts.set(filtered);
      this.loading.set(false);
    });
  }
}

