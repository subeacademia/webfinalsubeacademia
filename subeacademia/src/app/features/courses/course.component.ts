import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { courseJsonLd } from '../../core/seo/jsonld';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [NgIf, NgFor, UpperCasePipe],
  template: `
    <article class="container mx-auto p-6" *ngIf="course() as c">
      <header class="space-y-3">
        <h1 class="text-3xl font-bold">{{ c.title }}</h1>
        <p class="text-muted">{{ c.summary }}</p>
        <img *ngIf="c.coverUrl" [src]="c.coverUrl" [alt]="c.title" class="w-full max-h-96 object-cover rounded" />
        <div class="flex flex-wrap gap-2 text-xs text-primary">
          <span *ngFor="let t of c.topics" class="px-2 py-0.5 bg-primary/10 rounded">#{{ t }}</span>
        </div>
      </header>

      <section class="mt-6 grid grid-cols-1 gap-4 text-sm">
        <div><strong>Nivel:</strong> {{ c.level }}</div>
        <div *ngIf="c.durationHours"><strong>Duración:</strong> {{ c.durationHours }} h</div>
      </section>

      <section *ngIf="c.resources?.length" class="mt-8">
        <h2 class="text-xl font-semibold mb-3">Recursos</h2>
        <ul class="list-disc pl-6">
          <li *ngFor="let r of c.resources">
            <a [href]="r.url" target="_blank" class="underline">{{ r.title || (r.type | uppercase) }}</a>
          </li>
        </ul>
      </section>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly course = signal<Course | null>(null);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const lang = this.i18n.currentLang();
    this.content.getCourseBySlug(lang, slug).then((c) => {
      if (!c) return;
      this.course.set(c);
      const title = c.seo?.title ?? c.title;
      const description = c.seo?.description ?? c.summary;
      const image = c.seo?.ogImage ?? c.coverUrl;

      this.seo.updateTags({ title, description, image, type: 'website' });

      this.seo.setJsonLd('course', courseJsonLd({
        name: c.title,
        description,
        providerName: 'Sube Academ-IA',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        inLanguage: lang,
        offers: c.price ? { price: c.price, priceCurrency: 'USD' } : undefined,
      }));
    });
  }
}

