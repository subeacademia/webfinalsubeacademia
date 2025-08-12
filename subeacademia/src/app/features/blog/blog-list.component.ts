import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../core/data/content.service';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '../../core/models/post.model';
import { SeoService } from '../../core/seo/seo.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LogService } from '../../core/log.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DatePipe, NgTemplateOutlet],
  templateUrl: './blog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent {
  private readonly content = inject(ContentService);
  private readonly data = inject(FirebaseDataService);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly log = inject(LogService);

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

  public getTranslatedPost(post: Post) {
    const langCode = this.currentLang();
    const titleFromI18n = (post as any)?.titleI18n?.[langCode];
    const titleFromSuffix = (post as any)?.[`title_${langCode}`];
    const title = titleFromI18n || titleFromSuffix || post.title;

    const summaryFromI18n = (post as any)?.summaryI18n?.[langCode];
    const summaryFromSuffix = (post as any)?.[`summary_${langCode}`];
    const excerpt = summaryFromI18n || summaryFromSuffix || (post as any)?.excerpt || post.summary || '';

    return { ...post, title, excerpt } as Post & { excerpt: string };
  }

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
          const isIndex = this.log.indexNeeded({ area: 'posts', details: { lang } }, err);
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

