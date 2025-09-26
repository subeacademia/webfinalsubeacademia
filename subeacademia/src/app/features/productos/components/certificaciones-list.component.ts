import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../shared/ui/animate-on-scroll.directive';
import { I18nTranslatePipe } from '../../../core/i18n/i18n.pipe';
import { CertificacionesService } from '../services/certificaciones.service';
import { Certificacion, CertificationAudience, CertificationCategory, RouteType, CertificationState } from '../data/certificacion.model';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-certificaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AnimateOnScrollDirective, I18nTranslatePipe],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ 'productos.lists.certificaciones.title' | i18nTranslate }}</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          {{ 'productos.lists.certificaciones.subtitle' | i18nTranslate }}
        </p>
        <!-- Acceso rápido al validador -->
        <form [formGroup]="validatorForm" (ngSubmit)="goToValidator()" class="mt-6 flex items-center justify-center gap-3">
          <input type="text" formControlName="code" [placeholder]="'productos.lists.certificaciones.validator.placeholder' | i18nTranslate" class="w-72 px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
          <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">{{ 'productos.lists.certificaciones.validator.btn' | i18nTranslate }}</button>
        </form>
      </div>

      <div class="grid md:grid-cols-12 gap-8">
        <aside class="md:col-span-3">
          <form [formGroup]="filtersForm" class="sticky top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <!-- Búsqueda -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Búsqueda</label>
              <input type="text" formControlName="search" placeholder="Buscar certificaciones..." class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
            </div>

            <!-- Audiencia -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audiencia</label>
              <select formControlName="audience" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todas las audiencias</option>
                <option value="Empresas">Empresas</option>
                <option value="Personas">Personas</option>
                <option value="Ambas">Ambas</option>
              </select>
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
              <select formControlName="category" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todas las categorías</option>
                <option value="Madurez Organizacional">Madurez Organizacional</option>
                <option value="Competencias Personas/Equipos">Competencias Personas/Equipos</option>
                <option value="Sectorial">Sectorial</option>
              </select>
            </div>

            <!-- Tipo de Ruta -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Ruta</label>
              <select formControlName="routeType" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todas las rutas</option>
                <option value="Formación">Formación</option>
                <option value="Convalidación">Convalidación</option>
              </select>
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
              <select formControlName="state" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todos los estados</option>
                <option value="Disponible">Disponible</option>
                <option value="Próximamente">Próximamente</option>
              </select>
            </div>

            <!-- Modalidad -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modalidad</label>
              <select formControlName="modality" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todas las modalidades</option>
                <option value="asincronica">Asincrónica</option>
                <option value="enVivo">En Vivo</option>
                <option value="hibrida">Híbrida</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>

            <!-- Idioma -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
              <select formControlName="language" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todos los idiomas</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>

            <!-- Vigencia -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vigencia</label>
              <select formControlName="validity" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <option value="">Todas</option>
                <option value="true">Con vigencia</option>
                <option value="false">Sin vigencia</option>
              </select>
            </div>

            <!-- Botón de limpiar filtros -->
            <button type="button" (click)="clearFilters()" class="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
              Limpiar Filtros
            </button>
          </form>
        </aside>

        <section class="md:col-span-9">
          <!-- Loading state -->
          <div *ngIf="(loading$ | async)" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p class="mt-2 text-gray-600">{{ 'productos.lists.certificaciones.loading' | i18nTranslate }}</p>
          </div>

          <!-- Lista de certificaciones -->
          <ng-container *ngIf="filteredCertificaciones$ | async as certificaciones">
          <div *ngIf="certificaciones.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" [appAnimateOnScroll]="'.card'">
            <div *ngFor="let certificacion of certificaciones" 
                 class="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              
              <!-- Imagen destacada -->
              <div class="h-48 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center relative">
                <span class="text-6xl">🏆</span>
                <!-- Badge de estado -->
                <div class="absolute top-4 right-4">
                  <span *ngIf="certificacion.state === 'Próximamente'" 
                        class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full font-medium">
                    Próximamente
                  </span>
                  <span *ngIf="certificacion.state === 'Disponible'" 
                        class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                    Disponible
                  </span>
                </div>
              </div>
              
              <!-- Contenido -->
              <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {{ certificacion.title || certificacion.titulo }}
                </h3>
                
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {{ certificacion.shortDescription || certificacion.descripcion }}
                </p>
                
                <!-- Badges de rutas -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span *ngFor="let route of certificacion.routeTypes" 
                        class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    {{ route }}
                  </span>
                </div>
                
                <!-- Información adicional -->
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Audiencia:</span>
                    {{ certificacion.audience }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Categoría:</span>
                    {{ certificacion.category }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400" *ngIf="certificacion.durationHours > 0">
                    <span class="font-medium mr-2">Duración:</span>
                    {{ certificacion.durationHours }}h
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400" *ngIf="certificacion.validityMonths">
                    <span class="font-medium mr-2">Vigencia:</span>
                    {{ certificacion.validityMonths }} meses
                  </div>
                </div>
                
                <!-- Avales -->
                <div class="flex items-center gap-2 mb-4">
                  <span *ngFor="let endorser of certificacion.endorsers" 
                        class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    {{ endorser }}
                  </span>
                </div>
                
                <!-- Precio y CTA -->
                <div class="flex items-center justify-between">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    <span *ngIf="certificacion.currencies?.USD">{{ certificacion.currencies.USD }}</span>
                    <span *ngIf="!certificacion.currencies?.USD && certificacion.precio">€{{ certificacion.precio }}</span>
                  </div>
                  <div class="flex flex-col gap-2">
                    <a [routerLink]="['/productos', certificacion.slug]" 
                       class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-center">
                      Ver Detalles
                    </a>
                    <a *ngIf="certificacion.paymentLink" 
                       [href]="certificacion.paymentLink" 
                       target="_blank"
                       class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-center">
                      Pagar Ahora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </ng-container>

          <!-- Estado vacío -->
          <ng-container *ngIf="filteredCertificaciones$ | async as certificaciones">
          <div *ngIf="certificaciones.length === 0" class="text-center py-12">
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 max-w-2xl mx-auto">
              <div class="text-yellow-800 dark:text-yellow-200">
                <h2 class="text-2xl font-semibold mb-4">{{ 'productos.lists.certificaciones.empty.coming_soon' | i18nTranslate }}</h2>
                <p class="text-lg mb-4">{{ 'productos.lists.certificaciones.empty.p1' | i18nTranslate }}</p>
                <p class="text-base">{{ 'productos.lists.certificaciones.empty.p2' | i18nTranslate }}</p>
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
export class CertificacionesListComponent {
  certificaciones$!: Observable<Certificacion[]>;
  availableLevels$!: Observable<string[]>;
  filtersForm!: FormGroup;
  loading$!: Observable<boolean>;
  filteredCertificaciones$!: Observable<Certificacion[]>;
  validatorForm!: FormGroup;

  constructor(private certificacionesService: CertificacionesService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.filtersForm = this.fb.group({
      search: [''],
      audience: [''],
      category: [''],
      routeType: [''],
      state: [''],
      modality: [''],
      language: [''],
      validity: ['']
    });
    this.validatorForm = this.fb.group({
      code: ['']
    });

    this.certificaciones$ = this.certificacionesService.getCertificaciones();
    this.loading$ = this.certificaciones$.pipe(map(() => false), startWith(true));

    this.filteredCertificaciones$ = combineLatest([
      this.certificaciones$,
      this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
    ]).pipe(
      map(([items, filters]: [Certificacion[], any]) => {
        return items.filter((item: Certificacion) => {
          // Filtro de búsqueda
          const search = (filters.search || '').toLowerCase().trim();
          const matchesSearch = !search ||
            (item.title || item.titulo || '').toLowerCase().includes(search) ||
            (item.shortDescription || item.descripcion || '').toLowerCase().includes(search) ||
            (item.competencies || []).some(comp => comp.toLowerCase().includes(search));

          // Filtro de audiencia
          const matchesAudience = !filters.audience || 
            item.audience === filters.audience || 
            item.audience === 'Ambas';

          // Filtro de categoría
          const matchesCategory = !filters.category || item.category === filters.category;

          // Filtro de tipo de ruta
          const matchesRouteType = !filters.routeType || 
            (item.routeTypes || []).includes(filters.routeType);

          // Filtro de estado
          const matchesState = !filters.state || item.state === filters.state;

          // Filtro de modalidad
          const matchesModality = !filters.modality || 
            (item.modalities && this.hasModality(item.modalities, filters.modality));

          // Filtro de idioma
          const matchesLanguage = !filters.language || 
            (item.languages || []).includes(filters.language);

          // Filtro de vigencia
          const matchesValidity = !filters.validity || 
            (filters.validity === 'true' && item.validityMonths && item.validityMonths > 0) ||
            (filters.validity === 'false' && (!item.validityMonths || item.validityMonths === 0));

          return matchesSearch && matchesAudience && matchesCategory && 
                 matchesRouteType && matchesState && matchesModality && 
                 matchesLanguage && matchesValidity;
        });
      })
    );
  }

  goToValidator(): void {
    const code = (this.validatorForm.value.code || '').trim();
    if (!code) return;
    this.router.navigate(['../certificaciones/validar', code], { relativeTo: this.route });
  }

  clearFilters(): void {
    this.filtersForm.reset();
  }

  private hasModality(modalities: any, modality: string): boolean {
    switch (modality) {
      case 'asincronica': return modalities.asincronica;
      case 'enVivo': return modalities.enVivo;
      case 'hibrida': return modalities.hibrida;
      case 'presencial': return modalities.presencial;
      default: return false;
    }
  }
}
