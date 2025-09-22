import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../shared/ui/animate-on-scroll.directive';
import { I18nTranslatePipe } from '../../../core/i18n/i18n.pipe';
import { AsesoriasService } from '../services/asesorias.service';
import { Asesoria } from '../data/asesoria.model';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-asesorias-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AnimateOnScrollDirective, I18nTranslatePipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ 'productos.lists.asesorias.title' | i18nTranslate }}</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          {{ 'productos.lists.asesorias.subtitle' | i18nTranslate }}
        </p>
      </div>

      <div class="grid md:grid-cols-12 gap-8">
        <!-- Columna izquierda: filtros sticky -->
        <aside class="md:col-span-3">
          <form [formGroup]="filtersForm" class="sticky top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <input type="text" formControlName="search" [placeholder]="'productos.lists.asesorias.filters.search_placeholder' | i18nTranslate" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
            <select formControlName="tag" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <option value="">{{ 'productos.lists.asesorias.filters.all_categories' | i18nTranslate }}</option>
              <option *ngFor="let t of (availableTags$ | async) || []" [value]="t">{{ t }}</option>
            </select>
            <select formControlName="precio" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <option value="">{{ 'productos.lists.asesorias.filters.any_price' | i18nTranslate }}</option>
              <option value="lt500">{{ 'productos.lists.asesorias.filters.lt500' | i18nTranslate }}</option>
              <option value="500-1500">{{ 'productos.lists.asesorias.filters.500-1500' | i18nTranslate }}</option>
              <option value="gt1500">{{ 'productos.lists.asesorias.filters.gt1500' | i18nTranslate }}</option>
            </select>
          </form>
        </aside>

        <!-- Columna derecha: grid productos -->
        <section class="md:col-span-9">
          <!-- Loading state -->
          <div *ngIf="(loading$ | async)" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">{{ 'productos.lists.asesorias.loading' | i18nTranslate }}</p>
          </div>

          <!-- Lista de asesorías -->
          <ng-container *ngIf="filteredAsesorias$ | async as asesorias">
          <div *ngIf="asesorias.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" [appAnimateOnScroll]="'.card'">
            <div *ngFor="let asesoria of asesorias" 
                 class="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              
              <!-- Imagen destacada -->
              <div class="h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                <span class="text-6xl">💡</span>
              </div>
              
              <!-- Contenido -->
              <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {{ asesoria.titulo }}
                </h3>
                
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {{ asesoria.descripcionCorta }}
                </p>
                
                <!-- Tags -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span *ngFor="let tag of asesoria.tags.slice(0, 3)" 
                        class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    {{ tag }}
                  </span>
                </div>
                
                <!-- Precio y CTA -->
                <div class="flex items-center justify-between">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    €{{ asesoria.precio }}
                  </div>
                  <a [routerLink]="['/productos', asesoria.slug]" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    {{ 'productos.lists.asesorias.cta_view_details' | i18nTranslate }}
                  </a>
                </div>
              </div>
            </div>
          </div>
          </ng-container>

          <!-- Estado vacío -->
          <ng-container *ngIf="filteredAsesorias$ | async as asesorias">
          <div *ngIf="asesorias.length === 0" class="text-center py-12">
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 max-w-2xl mx-auto">
              <div class="text-yellow-800 dark:text-yellow-200">
                <h2 class="text-2xl font-semibold mb-4">{{ 'productos.lists.asesorias.empty.coming_soon' | i18nTranslate }}</h2>
                <p class="text-lg mb-4">{{ 'productos.lists.asesorias.empty.p1' | i18nTranslate }}</p>
                <p class="text-base">{{ 'productos.lists.asesorias.empty.p2' | i18nTranslate }}</p>
              </div>
            </div>
          </div>
          </ng-container>
        </section>
      </div>

    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class AsesoriasListComponent {
  asesorias$!: Observable<Asesoria[]>;
  availableTags$!: Observable<string[]>;
  filtersForm!: FormGroup;
  loading$!: Observable<boolean>;
  filteredAsesorias$!: Observable<Asesoria[]>;

  constructor(private asesoriasService: AsesoriasService, private fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      search: [''],
      tag: [''],
      precio: ['']
    });

    this.asesorias$ = this.asesoriasService.getAsesorias();
    this.availableTags$ = this.asesorias$.pipe(
      map(items => Array.from(new Set(items.flatMap(a => a.tags || []))))
    );
    this.loading$ = this.asesorias$.pipe(map(() => false), startWith(true));

    this.filteredAsesorias$ = combineLatest([
      this.asesorias$,
      this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
    ]).pipe(
      map(([items, filters]: [Asesoria[], any]) => {
        const search = (filters.search || '').toLowerCase().trim();
        const tag = filters.tag || '';
        const precio = filters.precio || '';
        return items.filter((item: Asesoria) => {
          const matchesSearch = !search ||
            item.titulo.toLowerCase().includes(search) ||
            (item.descripcionCorta || '').toLowerCase().includes(search) ||
            (item.descripcionLarga || '').toLowerCase().includes(search);
          const matchesTag = !tag || (item.tags || []).includes(tag);
          const matchesPrecio = (() => {
            if (!precio) return true;
            if (precio === 'lt500') return item.precio < 500;
            if (precio === '500-1500') return item.precio >= 500 && item.precio <= 1500;
            if (precio === 'gt1500') return item.precio > 1500;
            return true;
          })();
          return matchesSearch && matchesTag && matchesPrecio;
        });
      })
    );
  }
}
