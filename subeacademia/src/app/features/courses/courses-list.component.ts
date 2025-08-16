import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { RouterLink } from '@angular/router';
import { Course } from '../../core/models/course.model';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { CoursesService } from '../../core/data/courses.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, AsyncPipe, NgClass, TitleCasePipe, PageHeaderComponent, I18nTranslatePipe],
  templateUrl: './courses-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesListComponent implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);
  private readonly coursesService = inject(CoursesService);

  // Data streams
  allCourses$: Observable<Course[]> = this.i18n.currentLang$.pipe(
    switchMap((lang) => this.coursesService.list(lang))
  );
  categories$!: Observable<string[]>;
  filteredCourses$!: Observable<Course[]>;

  // UI state
  readonly searchTerm = new BehaviorSubject<string>('');
  readonly activeCategory = new BehaviorSubject<string>('todos');

  get currentLangValue(): string { return this.i18n.currentLang(); }

  ngOnInit(): void {
    // SEO básico
    const lang = this.i18n.currentLang();
    this.seo.updateTags({
      title: `Cursos | Sube Academ-IA (${lang.toUpperCase()})`,
      description: 'Cursos de IA para docentes y estudiantes.',
    });

    // Categorías únicas
    this.categories$ = this.allCourses$.pipe(
      map((courses) => {
        const cats = courses.map((c: any) => c.category || 'General');
        return ['todos', ...Array.from(new Set(cats))];
      })
    );

    // Filtrado reactivo en vivo
    this.filteredCourses$ = combineLatest([
      this.allCourses$,
      this.searchTerm,
      this.activeCategory,
    ]).pipe(
      map(([courses, term, category]) => {
        const lowerCaseTerm = (term || '').toLowerCase();
        return courses.filter((course) => {
          const translated = this.getTranslatedCourse(course);
          const matchesCategory = category === 'todos' || (course as any).category === category;
          const matchesSearch = !term ||
            (translated.title || '').toLowerCase().includes(lowerCaseTerm) ||
            (translated.description || '').toLowerCase().includes(lowerCaseTerm);
          return matchesCategory && matchesSearch;
        }).map((c) => this.getTranslatedCourse(c));
      })
    );
  }

  updateSearchTerm(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.next(target.value ?? '');
  }

  setCategory(category: string): void {
    this.activeCategory.next(category);
  }

  getTranslatedCourse(course: Course): any {
    const lang = this.i18n.currentLang();
    const title = (course as any)[`title_${lang}`] ||
      (course as any).title ||
      (course as any).titleI18n?.[lang] || '';
    const description = (course as any)[`description_${lang}`] ||
      (course as any).description ||
      (course as any).summary || '';
    const image = (course as any).image || (course as any).coverUrl || '/assets/og-placeholder.svg';
    const duration = (course as any).duration ||
      (typeof (course as any).durationHours === 'number' ? `${(course as any).durationHours} horas` : '');
    const lessonCount = (course as any).lessonCount ?? ((course as any).resources?.length ?? 0);
    const levelRaw = (course as any).level;
    const level = levelRaw === 'intro' ? 'Principiante' : levelRaw === 'intermedio' ? 'Intermedio' : levelRaw === 'avanzado' ? 'Avanzado' : levelRaw;
    return { ...course, title, description, image, duration, lessonCount, level };
  }

  formatPrice(price: number, currency?: string): string {
    if (!price) return 'Gratis';
    
    const currencySymbol = currency === 'CLP' ? 'CLP ' : currency === 'EUR' ? '€' : '$';
    
    if (currency === 'CLP') {
      return `CLP ${price.toLocaleString('es-CL')}`;
    } else {
      return `${currencySymbol}${price.toFixed(2)}`;
    }
  }
}

