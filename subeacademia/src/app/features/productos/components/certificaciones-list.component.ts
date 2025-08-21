import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../shared/ui/animate-on-scroll.directive';
import { CertificacionesService } from '../services/certificaciones.service';
import { Certificacion } from '../data/certificacion.model';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-certificaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AnimateOnScrollDirective],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Certificaciones en IA</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Certificaciones oficiales reconocidas por la industria en tecnologías de Inteligencia Artificial. 
          Valida tus conocimientos y mejora tu perfil profesional.
        </p>
        <!-- Acceso rápido al validador -->
        <form [formGroup]="validatorForm" (ngSubmit)="goToValidator()" class="mt-6 flex items-center justify-center gap-3">
          <input type="text" formControlName="code" placeholder="Pega tu código de certificado" class="w-72 px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
          <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Validar certificado</button>
        </form>
      </div>

      <div class="grid md:grid-cols-12 gap-8">
        <aside class="md:col-span-3">
          <form [formGroup]="filtersForm" class="sticky top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <input type="text" formControlName="search" placeholder="Buscar por título o descripción" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
            <select formControlName="nivel" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <option value="">Todos los niveles</option>
              <option *ngFor="let n of (availableLevels$ | async)" [value]="n">{{ n }}</option>
            </select>
            <select formControlName="precio" class="w-full px-4 py-2 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <option value="">Cualquier precio</option>
              <option value="lt200">Menos de €200</option>
              <option value="200-600">€200 - €600</option>
              <option value="gt600">Más de €600</option>
            </select>
          </form>
        </aside>

        <section class="md:col-span-9">
          <!-- Loading state -->
          <div *ngIf="(loading$ | async)" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p class="mt-2 text-gray-600">Cargando certificaciones...</p>
          </div>

          <!-- Lista de certificaciones -->
          <ng-container *ngIf="filteredCertificaciones$ | async as certificaciones">
          <div *ngIf="certificaciones.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" [appAnimateOnScroll]="'.card'">
            <div *ngFor="let certificacion of certificaciones" 
                 class="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              
              <!-- Imagen destacada -->
              <div class="h-48 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                <span class="text-6xl">🏆</span>
              </div>
              
              <!-- Contenido -->
              <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {{ certificacion.titulo }}
                </h3>
                
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {{ certificacion.descripcion }}
                </p>
                
                <!-- Información adicional -->
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Entidad:</span>
                    {{ certificacion.entidadCertificadora }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Nivel:</span>
                    <span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      {{ certificacion.nivel }}
                    </span>
                  </div>
                </div>
                
                <!-- Precio y CTA -->
                <div class="flex items-center justify-between">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    €{{ certificacion.precio }}
                  </div>
                  <a [routerLink]="['/productos', certificacion.slug]"
                     class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Ver Detalles
                  </a>
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
                <h2 class="text-2xl font-semibold mb-4">🚧 Próximamente...</h2>
                <p class="text-lg mb-4">
                  Estamos preparando nuestra sección de certificaciones en Inteligencia Artificial.
                </p>
                <p class="text-base">
                  Muy pronto podrás acceder a certificaciones oficiales reconocidas por la industria.
                </p>
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
      nivel: [''],
      precio: ['']
    });
    this.validatorForm = this.fb.group({
      code: ['']
    });

    this.certificaciones$ = this.certificacionesService.getCertificaciones();
    this.availableLevels$ = this.certificaciones$.pipe(
      map(items => Array.from(new Set(items.map(c => c.nivel).filter(Boolean))))
    );
    this.loading$ = this.certificaciones$.pipe(map(() => false), startWith(true));

    this.filteredCertificaciones$ = combineLatest([
      this.certificaciones$,
      this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
    ]).pipe(
      map(([items, filters]: [Certificacion[], any]) => {
        const search = (filters.search || '').toLowerCase().trim();
        const nivel = filters.nivel || '';
        const precio = filters.precio || '';
        return items.filter((item: Certificacion) => {
          const matchesSearch = !search ||
            item.titulo.toLowerCase().includes(search) ||
            (item.descripcion || '').toLowerCase().includes(search) ||
            (item.entidadCertificadora || '').toLowerCase().includes(search);
          const matchesNivel = !nivel || item.nivel === nivel;
          const matchesPrecio = (() => {
            if (!precio) return true;
            if (precio === 'lt200') return item.precio < 200;
            if (precio === '200-600') return item.precio >= 200 && item.precio <= 600;
            if (precio === 'gt600') return item.precio > 600;
            return true;
          })();
          return matchesSearch && matchesNivel && matchesPrecio;
        });
      })
    );
  }

  goToValidator(): void {
    const code = (this.validatorForm.value.code || '').trim();
    if (!code) return;
    this.router.navigate(['../certificaciones/validar', code], { relativeTo: this.route });
  }
}
