import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { articleJsonLd } from '../../core/seo/jsonld';
import { Post } from '../../core/models/post.model';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [NgIf, NgFor, MarkdownModule],
  template: `
    <article class="container mx-auto p-6" *ngIf="post() as p">
      <header class="space-y-3">
        <h1 class="text-3xl font-bold">{{ p.title }}</h1>
        <p class="text-muted">{{ p.summary }}</p>
        <img *ngIf="p.coverUrl" [src]="p.coverUrl" [alt]="p.title" class="w-full max-h-96 object-cover rounded" />
        <div class="flex flex-wrap gap-2 text-xs text-primary">
          <span *ngFor="let tag of p.tags" class="px-2 py-0.5 bg-primary/10 rounded">#{{ tag }}</span>
        </div>
        <div *ngIf="p.authors?.length" class="text-sm text-muted">
          Autor(es):
          <ng-container *ngFor="let a of p.authors; let last = last">
            <a *ngIf="a.url; else plain" [href]="a.url" rel="author" class="underline">{{ a.name }}</a><ng-container *ngIf="!last">, </ng-container>
            <ng-template #plain>{{ a.name }}<ng-container *ngIf="!last">, </ng-container></ng-template>
          </ng-container>
        </div>
      </header>

      <section class="prose max-w-none mt-6">
        <markdown [data]="p.content"></markdown>
      </section>

      <section *ngIf="p.media?.length" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <figure *ngFor="let m of p.media" class="border rounded overflow-hidden bg-white">
          <img *ngIf="m.type === 'image'" [src]="m.url" [alt]="m.title || p.title" class="w-full h-48 object-cover" />
          <div class="p-3 text-sm" *ngIf="m.title">{{ m.title }}</div>
        </figure>
      </section>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly post = signal<Post | null>(null);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const lang = this.i18n.currentLang();
    // Cargar post por slug e idioma
    this.content.getPostBySlug(lang, slug).then((p) => {
      if (!p) return;
      this.post.set(p);
      const title = p.seo?.title ?? p.title;
      const description = p.seo?.description ?? p.summary;
      const image = p.seo?.ogImage ?? p.coverUrl;

      this.seo.updateTags({ title, description, image, type: 'article' });

      const isScholarly = (p.categories || []).some((c) => c.toLowerCase().includes('científica'));
      this.seo.setJsonLd('post', articleJsonLd({
        headline: p.title,
        description,
        image: image ? [image] : undefined,
        datePublished: p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined,
        dateModified: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
        authorName: p.authors?.[0]?.name,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        scholarly: isScholarly,
      }));
    });
  }
}

