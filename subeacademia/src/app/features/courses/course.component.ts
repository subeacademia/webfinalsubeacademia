import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { SeoService } from '../../core/seo/seo.service';
import { courseJsonLd } from '../../core/seo/jsonld';
import { Course } from '../../core/models/course.model';
import { CoursesService } from '../../core/data/courses.service';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { CompetencyModalComponent } from '../../shared/ui/competency-modal/competency-modal.component';
import { Competency } from '../../features/diagnostico/data/competencias';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    NgIf, 
    NgFor, 
    RouterLink, 
    I18nTranslatePipe, 
    UiButtonComponent,
    PageHeaderComponent,
    CompetencyModalComponent
  ],
  templateUrl: './course.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesService = inject(CoursesService);
  protected readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly course = signal<Course | null>(null);
  protected readonly competencias = signal<Competency[]>([]);
  public activeModule: number | null = 0;
  public showCompetencyModal = false;
  public selectedCompetency: Competency | null = null;

  toggleModule(index: number): void {
    this.activeModule = this.activeModule === index ? null : index;
  }

  goToPayment(): void {
    const course = this.course();
    if (course?.paymentLink) {
      window.open(course.paymentLink, '_blank');
    }
  }

  openCompetencyModal(competencyId: string): void {
    const competency = this.competencias().find(c => c.id === competencyId);
    if (competency) {
      this.selectedCompetency = competency;
      this.showCompetencyModal = true;
    }
  }

  closeCompetencyModal(): void {
    this.showCompetencyModal = false;
    this.selectedCompetency = null;
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

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const lang = this.i18n.currentLang();
    
    // Cargar competencias
    this.loadCompetencies();
    
    // Obtener curso por slug
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

      this.course.set({ 
        ...(c as any), 
        title: localizedTitle, 
        description: localizedDesc, 
        image, 
        modules 
      } as Course);

      // Configurar SEO
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

  private async loadCompetencies(): Promise<void> {
    try {
      const module = await import('../../features/diagnostico/data/competencias');
      this.competencias.set(module.COMPETENCIAS_COMPLETAS);
    } catch (error) {
      console.error('Error cargando competencias:', error);
    }
  }

  getCompetencyName(competencyId: string): string {
    const competency = this.competencias().find(c => c.id === competencyId);
    return competency?.name || competencyId;
  }

  getCompetencyDescription(competencyId: string): string {
    const competency = this.competencias().find(c => c.id === competencyId);
    return competency?.description || '';
  }
}

