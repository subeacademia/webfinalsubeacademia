import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { articleJsonLd } from '../../core/seo/jsonld';
import { Post } from '../../core/models/post.model';
import { generateSlug } from '../../core/utils/slug.util';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  template: `
    <div class="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen" *ngIf="post() as p">
      <!-- Encabezado con Imagen de Portada -->
      <header class="relative h-96">
        <img [src]="p.coverUrl" [alt]="translatedTitle" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center p-4">
          <h1 class="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            {{ translatedTitle }}
          </h1>
          <p class="text-gray-300">
            <span i18n>Publicado el</span> {{ p.publishedAt | date:'longDate' }}
          </p>
        </div>
      </header>

      <div class="container mx-auto px-6 py-12 lg:grid lg:grid-cols-12 lg:gap-12">
        <!-- Columna Principal del Contenido -->
        <article class="lg:col-span-8">
          <div
            class="prose prose-lg dark:prose-invert max-w-none"
            [innerHTML]="translatedContent">
            <!-- El contenido del post se renderizará aquí -->
          </div>
        </article>

        <!-- Barra Lateral (Sidebar) -->
        <aside class="lg:col-span-4 mt-12 lg:mt-0 lg:sticky lg:top-24 h-fit">
          <!-- Tarjeta del Autor -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-xl font-bold mb-4" i18n>Sobre el Autor</h3>
            <div class="flex items-center">
              <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=Autor" alt="Autor" class="w-16 h-16 rounded-full mr-4">
              <div>
                <p class="font-semibold text-lg">{{ p.authors[0].name || 'Autor' }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ p.summary }}</p>
              </div>
            </div>
          </div>

          <!-- Tabla de Contenidos -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold mb-4" i18n>En este artículo</h3>
            <ul class="space-y-2">
              <li *ngFor="let item of tableOfContents">
                <a [href]="'#' + item.id" class="text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  {{ item.title }}
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly post = signal<Post | null>(null);
  public tableOfContents: { id: string; title: string }[] = [];
  private processedContent = '';

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const lang = this.i18n.currentLang();
    // Cargar post por slug; las traducciones se resolverán por locale en render
    this.content.getPostBySlug(lang, slug).then((p) => {
      if (!p) return;
      // mapear a traducción del locale con fallback
      const t = (p as any).translations || {};
      const base = (p as any).languageFallback || 'es';
      const view = t[lang] || t[base] || {};
      const mapped: any = { ...p, ...view };
      this.post.set(mapped);
      const initialContent = (mapped as any)[`content_${lang}`] || mapped.contentI18n?.[lang] || mapped.contentHtml || mapped.content || '';
      this.generateTableOfContents(initialContent);
      const titleI18n = (p as any).titleI18n || {};
      const summaryI18n = (p as any).summaryI18n || {};
      const title = p.seo?.title ?? (titleI18n[lang] || titleI18n['es'] || mapped.title);
      const description = p.seo?.description ?? (summaryI18n[lang] || summaryI18n['es'] || mapped.summary);
      const image = p.seo?.ogImage ?? p.coverUrl;

      this.seo.updateTags({ title, description, image, type: 'article' });

      const isScholarly = (p.categories || []).some((c) => c.toLowerCase().includes('científica'));
      this.seo.setJsonLd('post', articleJsonLd({
        headline: title,
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

  get translatedTitle(): string {
    const p = this.post();
    if (!p) return '';
    const lang = this.i18n.currentLang();
    return (p as any)[`title_${lang}`] || p.titleI18n?.[lang] || p.title;
  }

  get translatedContent(): string {
    const p = this.post();
    if (!p) return '';
    const lang = this.i18n.currentLang();
    const content = (p as any)[`content_${lang}`] || p.contentI18n?.[lang] || p.contentHtml || p.content || '';
    this.generateTableOfContents(content);
    return this.processedContent;
  }

  private generateTableOfContents(htmlContent: string): void {
    try {
      // SSR guard
      if (typeof window === 'undefined' || typeof (window as any).DOMParser === 'undefined') {
        this.tableOfContents = [];
        this.processedContent = htmlContent || '';
        return;
      }
      const parser = new (window as any).DOMParser();
      const doc = parser.parseFromString(htmlContent || '', 'text/html');
      const headings = Array.from(doc.querySelectorAll('h2')) as HTMLElement[];
      const usedIds = new Set<string>();
      const toc: { id: string; title: string }[] = [];

      for (const h2 of headings) {
        const rawTitle = (h2.textContent || '').trim();
        if (!rawTitle) continue;
        let id = generateSlug(rawTitle);
        let suffix = 2;
        while (usedIds.has(id) || (id && doc.getElementById(id))) {
          id = `${id.replace(/-\d+$/, '')}-${suffix++}`;
        }
        if (id) {
          h2.setAttribute('id', id);
          usedIds.add(id);
          toc.push({ id, title: rawTitle });
        }
      }

      this.tableOfContents = toc;
      // Serializar de vuelta el HTML procesado
      // Usamos body.innerHTML para preservar el contenido tal cual fue parseado
      this.processedContent = doc.body ? doc.body.innerHTML : htmlContent || '';
    } catch {
      this.tableOfContents = [];
      this.processedContent = htmlContent || '';
    }
  }
}

