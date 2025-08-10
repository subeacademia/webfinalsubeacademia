import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SkeletonCardComponent } from '../../core/ui/skeleton-card/skeleton-card.component';
import { ContentService } from '../../core/data/content.service';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Course } from '../../core/models/course.model';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, SkeletonCardComponent],
  template: `
    <main class="container mx-auto p-6">
      <h1 class="text-3xl font-semibold">Cursos</h1>
      <p class="text-muted mt-2">Aprende IA aplicada a educación.</p>

      <div *ngIf="indexErrorUrl(); else okIndex" class="mt-4 p-4 border border-amber-300 bg-amber-50 rounded">
        <div class="text-amber-800 text-sm">
          Falta un índice de Firestore para esta consulta.
        </div>
        <a class="inline-block mt-2 px-3 py-1 bg-amber-600 text-white rounded text-sm" [href]="indexErrorUrl()" target="_blank" rel="noopener">Crear índice</a>
      </div>
      <ng-template #okIndex></ng-template>

      <div class="mt-4 flex flex-wrap gap-3 text-sm">
        <label>
          Nivel:
          <select #levelSel class="border rounded px-2 py-1 ml-2" (change)="onLevelChange(levelSel.value)">
            <option value="">Todos</option>
            <option value="intro">Intro</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </label>
        <label>
          Tema:
          <input #topicInput class="border rounded px-2 py-1 ml-2" type="text" placeholder="p.ej. LLMs" (change)="onTopicChange(topicInput.value)" />
        </label>
      </div>

      <section class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ng-container *ngIf="loading(); else listCourses">
          <app-skeleton-card />
          <app-skeleton-card />
          <app-skeleton-card />
        </ng-container>
        <ng-template #listCourses>
          <a
            *ngFor="let c of courses()"
            [routerLink]="['/', currentLang(), 'cursos', c.slug]"
            class="block border rounded-lg overflow-hidden hover:shadow-md transition bg-white"
          >
            <img *ngIf="c.coverUrl" [src]="c.coverUrl" [alt]="c.title" class="w-full h-40 object-cover" />
            <div class="p-4">
              <h3 class="text-lg font-semibold line-clamp-2">{{ c.title }}</h3>
              <p class="text-sm text-muted line-clamp-3 mt-2">{{ c.summary }}</p>
              <div class="mt-3 flex flex-wrap gap-2 text-xs text-primary">
                <span *ngFor="let t of c.topics" class="px-2 py-0.5 bg-primary/10 rounded">#{{ t }}</span>
              </div>
            </div>
          </a>
        </ng-template>
      </section>

      <div *ngIf="!loading() && courses().length === 0 && !errorMessage()" class="mt-10 border rounded-lg p-6 text-center text-muted">
        No hay resultados
      </div>
      <div *ngIf="!!errorMessage()" class="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
        {{ errorMessage() }}
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesListComponent {
  private readonly content = inject(ContentService);
  private readonly data = inject(FirebaseDataService);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly log = inject((await import('../../core/log.service')).LogService);

  protected readonly currentLang = this.i18n.currentLang;
  protected readonly courses = signal<any[]>([]);
  private readonly rawCourses = signal<any[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly indexErrorUrl = signal<string>('');
  protected readonly errorMessage = signal<string>('');
  private lastCursor: number | null = null;

  private filterLevel = signal<'' | 'intro' | 'intermedio' | 'avanzado'>('');
  private filterTopic = signal<string>('');

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      this.seo.updateTags({
        title: `Cursos | Sube Academ-IA (${lang.toUpperCase()})`,
        description: 'Cursos de IA para docentes y estudiantes.',
      });
    });

    this.route.queryParamMap.subscribe(() => {
      if (this.rawCourses().length) this.applyFilters(); else this.load();
    });
    this.load();
  }

  onLevelChange(level: string) {
    this.filterLevel.set((level as any) || '');
    this.load();
  }
  onTopicChange(topic: string) {
    this.filterTopic.set(topic || '');
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.errorMessage.set('');
    const lang = this.route.snapshot.paramMap.get('lang') || this.currentLang();
    this.data.getPublishedCourses({ level: this.filterLevel() || undefined, topic: this.filterTopic() || undefined, limit: 12 })
      .pipe(takeUntilDestroyed())
      .subscribe({
      next: (list: any[]) => {
        this.indexErrorUrl.set('');
        const mapped = (list || []).map((item:any)=> {
          const base = item?.languageFallback || 'es';
          const trans = item?.translations?.[lang] || item?.translations?.[base] || null;
          return trans ? { ...item, ...trans } : item;
        });
        this.rawCourses.set(mapped);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err: any) => {
        try {
          const url = this.extractCreateIndexUrl(err?.message || String(err || ''));
          if (url) this.indexErrorUrl.set(url);
          const isIndex = this.log.indexNeeded('courses', err, { lang });
          if (!isIndex) this.log.error('[CoursesList] Error al cargar cursos', err);
          this.errorMessage.set('Error al cargar cursos');
        } finally {
          this.loading.set(false);
          this.courses.set([]);
        }
      }
    });
  }

  private applyFilters() {
    let filtered = this.rawCourses();
    const level = this.filterLevel();
    const topic = this.filterTopic().toLowerCase().trim();
    if (level) filtered = filtered.filter((c) => c.level === level);
    if (topic) filtered = filtered.filter((c) => (c.topics || []).some((t: string) => (t || '').toLowerCase().includes(topic)));
    this.courses.set(filtered);
  }

  private extractCreateIndexUrl(message: string): string {
    try {
      const match = message.match(/https?:\/\/[^\s]*create_composite[^\s]*/i);
      return match ? match[0] : '';
    } catch { return ''; }
  }
}

