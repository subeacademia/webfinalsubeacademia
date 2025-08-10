import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SkeletonCardComponent } from '../../core/ui/skeleton-card/skeleton-card.component';
import { ContentService } from '../../core/data/content.service';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

      <div *ngIf="indexErrorUrl(); else okIndex" class="mt-4 p-4 border border-amber-300 bg-amber-50 rounded">
        <div class="text-amber-800 text-sm">
          Falta un índice de Firestore para esta consulta.
        </div>
        <a class="inline-block mt-2 px-3 py-1 bg-amber-600 text-white rounded text-sm" [href]="indexErrorUrl()" target="_blank" rel="noopener">Crear índice</a>
      </div>
      <ng-template #okIndex></ng-template>

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

      <section class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div *ngIf="!loading() && posts().length === 0 && !errorMessage()" class="mt-10 border rounded-lg p-6 text-center text-muted">
        No hay resultados
      </div>
      <div *ngIf="!!errorMessage()" class="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
        {{ errorMessage() }}
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly content = inject(ContentService);
  private readonly data = inject(FirebaseDataService);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly log = inject((await import('../../core/log.service')).LogService);

  protected readonly currentLang = this.i18n.currentLang;
  protected readonly posts = signal<any[]>([]);
  private readonly rawPosts = signal<any[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly indexErrorUrl = signal<string>('');
  protected readonly errorMessage = signal<string>('');
  private lastCursor: any | null = null;
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
      // Evitar consultas innecesarias: si ya tenemos base (status+publishedAt), sólo filtramos
      if (this.rawPosts().length) this.applyFilters(); else this.load();
    });
  }

  onCategoryChange(v: string) { this.filterCategory.set(v || ''); this.load(); }
  onQueryChange(v: string) { this.filterQuery.set(v || ''); this.load(); }

  private load() {
    this.loading.set(true);
    this.errorMessage.set('');
    const lang = this.route.snapshot.paramMap.get('lang') || this.currentLang();
    this.data.getPublishedPosts({ lang, queryText: this.filterQuery(), limit: 12 })
      .pipe(takeUntilDestroyed())
      .subscribe({
      next: (list: any[]) => {
        this.indexErrorUrl.set('');
        const mapped = (list || []).map((item:any)=> {
        const base = item?.languageFallback || 'es';
        const trans = item?.translations?.[lang] || item?.translations?.[base] || null;
        return trans ? { ...item, ...trans } : item;
      });
        this.rawPosts.set(mapped);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err: any) => {
        try {
          const url = this.extractCreateIndexUrl(err?.message || String(err || ''));
          if (url) this.indexErrorUrl.set(url);
          const isIndex = this.log.indexNeeded('posts', err, { lang });
          if (!isIndex) this.log.error('[BlogList] Error al cargar posts', err);
          this.errorMessage.set('Error al cargar publicaciones');
        } finally {
          this.loading.set(false);
          this.posts.set([]);
        }
      }
    });
  }

  private applyFilters() {
    const category = this.filterCategory().toLowerCase();
    const q = this.filterQuery().toLowerCase();
    let filtered = this.rawPosts();
    if (category) filtered = filtered.filter((p) => (p.categories || []).some((c: string) => (c || '').toLowerCase().includes(category)));
    if (q) filtered = filtered.filter((p) => (p.title || '').toLowerCase().includes(q) || (p.summary || '').toLowerCase().includes(q) || (p.tags || []).some((t: string) => (t || '').toLowerCase().includes(q)));
    this.posts.set(filtered);
  }

  private extractCreateIndexUrl(message: string): string {
    try {
      const match = message.match(/https?:\/\/[^\s]*create_composite[^\s]*/i);
      return match ? match[0] : '';
    } catch { return ''; }
  }
}

