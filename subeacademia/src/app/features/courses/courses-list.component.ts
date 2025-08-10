import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { Course } from '../../core/models/course.model';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <main class="container mx-auto p-6">
      <h1 class="text-3xl font-semibold">Cursos</h1>
      <p class="text-muted mt-2">Aprende IA aplicada a educación.</p>

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

      <section class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </section>

      <p *ngIf="courses().length === 0" class="mt-10 text-muted">No hay cursos.</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesListComponent {
  private readonly content = inject(ContentService);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly currentLang = this.i18n.currentLang;
  protected readonly courses = signal<Course[]>([]);

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

    this.route.queryParamMap.subscribe(() => this.load());
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
    const lang = this.currentLang();
    this.content.getCoursesByLangAndStatus(lang, 'published', 12).subscribe((list) => {
      let filtered = list;
      const level = this.filterLevel();
      const topic = this.filterTopic().toLowerCase().trim();
      if (level) filtered = filtered.filter((c) => c.level === level);
      if (topic) filtered = filtered.filter((c) => c.topics?.some((t) => t.toLowerCase().includes(topic)));
      this.courses.set(filtered);
    });
  }
}

