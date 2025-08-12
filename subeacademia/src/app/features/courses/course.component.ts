import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { courseJsonLd } from '../../core/seo/jsonld';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [NgIf, NgFor, UpperCasePipe, RouterLink],
  template: `
    <div class="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200" *ngIf="course() as course">
      <!-- Encabezado del Curso -->
      <header class="bg-white dark:bg-gray-800 py-12 border-b dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a [routerLink]="['/', i18n.currentLang(), 'cursos']" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">&larr; Volver a Cursos</a>
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">{{ course.title }}</h1>
          <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">{{ course.description || course.summary }}</p>
        </div>
      </header>

      <!-- Contenido y Barra Lateral -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="lg:grid lg:grid-cols-12 lg:gap-12">
          <!-- Contenido Principal (Izquierda) -->
          <div class="lg:col-span-8">
            <div class="mb-8 rounded-lg overflow-hidden shadow-lg">
              <img [src]="course.image || course.coverUrl || '/assets/og-placeholder.svg'" [alt]="course.title" class="w-full object-cover">
            </div>
            <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white" i18n>Temario del Curso</h2>
            <!-- Acordeón del Temario -->
            <div class="space-y-4" *ngIf="course.modules?.length; else noModules">
              <div *ngFor="let module of course.modules; let i = index" class="border dark:border-gray-700 rounded-lg overflow-hidden">
                <button (click)="toggleModule(i)" class="w-full flex justify-between items-center p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <span class="text-lg font-semibold">{{ module.title }}</span>
                  <svg class="w-6 h-6 transition-transform" [class.rotate-180]="activeModule === i" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div *ngIf="activeModule === i" class="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <ul class="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                    <li *ngFor="let lesson of module.lessons">{{ lesson }}</li>
                  </ul>
                </div>
              </div>
            </div>
            <ng-template #noModules>
              <p class="text-gray-600 dark:text-gray-400" i18n>El temario estará disponible pronto.</p>
            </ng-template>

            <!-- Recursos -->
            <section *ngIf="course.resources?.length" class="mt-10">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4" i18n>Recursos</h3>
              <ul class="list-disc pl-6 space-y-2">
                <li *ngFor="let r of course.resources">
                  <a [href]="r.url" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                    {{ r.title || (r.type | uppercase) }}
                  </a>
                </li>
              </ul>
            </section>
          </div>

          <!-- Barra Lateral (Derecha) -->
          <aside class="lg:col-span-4 mt-12 lg:mt-0">
            <div class="sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4" i18n>Detalles del Curso</h3>
              <ul class="space-y-3 text-gray-600 dark:text-gray-400">
                <li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span><strong>Duración:</strong> {{ course.duration || (course.durationHours ? course.durationHours + ' h' : '—') }}</span></li>
                <li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> <span><strong>Lecciones:</strong> {{ course.lessonCount || '—' }}</span></li>
                <li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg> <span><strong>Nivel:</strong> {{ course.level }}</span></li>
              </ul>
              <button class="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors" i18n>Inscribirse Ahora</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly content = inject(ContentService);
  protected readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly course = signal<Course | null>(null);
  public activeModule: number | null = 0;

  toggleModule(index: number): void {
    this.activeModule = this.activeModule === index ? null : index;
  }

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const lang = this.i18n.currentLang();
    this.content.getCourseBySlug(lang, slug).then((c) => {
      if (!c) return;
      const titleI18n: any = (c as any).titleI18n || {};
      const summaryI18n: any = (c as any).summaryI18n || {};
      const localizedTitle = titleI18n[lang] || titleI18n['es'] || c.title;
      const localizedSummary = summaryI18n[lang] || summaryI18n['es'] || c.summary;
      this.course.set({ ...(c as any), title: localizedTitle, summary: localizedSummary });
      const title = c.seo?.title ?? localizedTitle;
      const description = c.seo?.description ?? localizedSummary;
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

