import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { SeoService } from '../../core/seo/seo.service';
import { courseJsonLd } from '../../core/seo/jsonld';
import { Course } from '../../core/models/course.model';
import { CoursesService } from '../../core/data/courses.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, I18nTranslatePipe],
  templateUrl: './course.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesService = inject(CoursesService);
  protected readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly course = signal<Course | null>(null);
  public activeModule: number | null = 0;

  toggleModule(index: number): void {
    this.activeModule = this.activeModule === index ? null : index;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const lang = this.i18n.currentLang();
    // Obtener por slug desde CoursesService
    this.coursesService.getBySlug(slug).then((c) => {
      if (!c) return;
      const localizedTitle = (c as any)[`title_${lang}`] || (c as any).title || (c as any).titleI18n?.[lang] || '';
      const localizedDesc = (c as any)[`description_${lang}`] || (c as any).description || (c as any).summary || '';
      const image = (c as any).image || (c as any).coverUrl || '/assets/og-placeholder.svg';
      const modules = ((c as any).modules || []).map((m: any) => ({
        ...m,
        title: m?.[`title_${lang}`] || m?.title,
        lessons: m?.[`lessons_${lang}`] || m?.lessons || []
      }));

      this.course.set({ ...(c as any), title: localizedTitle, description: localizedDesc, image, modules } as Course);

      const title = (c as any).seo?.title ?? localizedTitle;
      const description = (c as any).seo?.description ?? localizedDesc;
      const og = (c as any).seo?.ogImage ?? image;
      this.seo.updateTags({ title, description, image: og, type: 'website' });
      this.seo.setJsonLd('course', courseJsonLd({
        name: localizedTitle,
        description,
        providerName: 'Sube Academ-IA',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        inLanguage: lang,
        offers: (c as any).price ? { price: (c as any).price, priceCurrency: 'USD' } : undefined,
      }));
    });
  }
}

