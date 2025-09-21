import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UiModalComponent } from '../../../shared/ui-kit/modal/modal';
import { I18nTranslatePipe } from '../../../core/i18n/i18n.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AsesoriasService } from '../services/asesorias.service';
import { CursosService } from '../services/cursos.service';
import { CertificacionesService } from '../services/certificaciones.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, UiModalComponent, I18nTranslatePipe],
  template: `
    <div class="container mx-auto px-4 py-8 min-h-[60vh]">
      <div class="mb-6">
        <a [routerLink]="['..']" 
           class="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span class="mr-2">←</span>
          {{ 'productos.lists.common.btn_back_to_products' | i18nTranslate }}
        </a>
      </div>

      <ng-container *ngIf="isLoading; else loaded">
        <div class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-4 text-gray-600">{{ 'productos.lists.common.loading_product' | i18nTranslate }}</p>
        </div>
      </ng-container>

      <ng-template #loaded>
        <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
          {{ error }}
        </div>

        <div *ngIf="!error" class="grid md:grid-cols-2 gap-10 items-start">
          <!-- Columna izquierda: imagen -->
          <div class="relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
            <img class="w-full h-full object-cover product-image" [src]="product?.imagenDestacada || 'assets/og-placeholder.svg'" alt="{{ product?.titulo }}" />
          </div>

          <!-- Columna derecha: contenido -->
          <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4 product-title">{{ product?.titulo }}</h1>
            <p class="text-lg text-gray-700 leading-relaxed mb-6 product-paragraph">
              {{ product?.descripcion || product?.descripcionLarga }}
            </p>

            <div *ngIf="product?.puntosAprendizaje?.length" class="mb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-3">{{ 'productos.lists.common.learn_title' | i18nTranslate }}</h2>
              <ul class="list-disc pl-5 space-y-2">
                <li *ngFor="let punto of product?.puntosAprendizaje" class="product-paragraph">{{ punto }}</li>
              </ul>
            </div>

            <div class="flex items-center justify-between mt-8">
              <div class="text-3xl font-extrabold text-gray-900">{{ 'productos.lists.common.price_symbol' | i18nTranslate }}{{ product?.precio }}</div>
              <button (click)="openBuyModal()" class="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors">
                {{ 'productos.lists.common.buy_now' | i18nTranslate }}
              </button>
            </div>
          </div>
        </div>
      </ng-template>

      <app-ui-modal [isOpen]="isModalOpen" size="md" (close)="isModalOpen=false">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">{{ 'productos.lists.common.modal.title' | i18nTranslate }}</h3>
          <p class="text-gray-600 mb-4">{{ 'productos.lists.common.modal.desc' | i18nTranslate }}</p>
          <button (click)="isModalOpen=false" class="bg-gray-900 text-white px-4 py-2 rounded-lg">{{ 'productos.lists.common.modal.close' | i18nTranslate }}</button>
        </div>
      </app-ui-modal>
    </div>
  `,
  styles: []
})
export class ProductoDetalleComponent implements OnInit, AfterViewInit {
  slug: string = '';
  product: any = null;
  isLoading = true;
  error = '';
  isModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private asesoriasService: AsesoriasService,
    private cursosService: CursosService,
    private certificacionesService: CertificacionesService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.slug = params['slug'] || '';
      this.isLoading = true;
      this.error = '';
      this.product = null;
      try {
        const [asesoria, curso, certificacion] = await Promise.all([
          this.asesoriasService.getAsesoriaBySlug(this.slug).toPromise(),
          this.cursosService.getCursoBySlug(this.slug).toPromise(),
          this.certificacionesService.getCertificacionBySlug(this.slug).toPromise()
        ]);
        this.product = asesoria || curso || certificacion;
        if (!this.product) {
          this.error = this.translate('productos.lists.common.errors.not_found');
        }
      } catch (e) {
        console.error(e);
        this.error = this.translate('productos.lists.common.errors.load_error');
      } finally {
        this.isLoading = false;
        this.runIntroAnimation();
      }
    });
  }

  ngAfterViewInit(): void {
    this.runIntroAnimation();
  }

  private translate(key: string): string {
    return this.i18n.translate(key);
  }

  runIntroAnimation(): void {
    setTimeout(() => {
      const w = (globalThis as any);
      const anime = w && w.anime ? w.anime : null;
      if (!anime) return;
      anime({ targets: '.product-image', translateX: [-40, 0], opacity: [0, 1], duration: 900, easing: 'easeOutExpo' });
      const titleEl = document.querySelector('.product-title');
      if (titleEl) {
        const text = titleEl.textContent || '';
        titleEl.textContent = '';
        const span = document.createElement('span');
        span.className = 'inline-block';
        titleEl.appendChild(span);
        span.textContent = text;
        anime({ targets: span, opacity: [0, 1], duration: 600, easing: 'easeOutExpo' });
      }
      anime({ targets: '.product-paragraph', opacity: [0, 1], translateY: [12, 0], delay: anime.stagger(120), duration: 700, easing: 'easeOutExpo' });
    }, 50);
  }

  openBuyModal(): void {
    this.isModalOpen = true;
  }
}
