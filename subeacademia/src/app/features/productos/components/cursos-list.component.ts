import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../../shared/ui/animate-on-scroll.directive';
import { CursosService } from '../services/cursos.service';
import { Curso } from '../data/producto.model';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AnimateOnScrollDirective],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Cursos en IA</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Formación especializada en Inteligencia Artificial con metodología práctica y casos reales. 
          Aprende de expertos y desarrolla proyectos que marquen la diferencia.
        </p>
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
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p class="mt-2 text-gray-600">Cargando cursos...</p>
          </div>

          <!-- Lista de cursos -->
          <ng-container *ngIf="filteredCursos$ | async as cursos">
          <div *ngIf="cursos.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" [appAnimateOnScroll]="'.card'">
            <div *ngFor="let curso of cursos" 
                 class="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              
              <!-- Imagen destacada -->
              <div class="h-48 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 flex items-center justify-center">
                <span class="text-6xl">📚</span>
              </div>
              
              <!-- Contenido -->
              <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {{ curso.titulo }}
                </h3>
                
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {{ curso.descripcion }}
                </p>
                
                <!-- Información adicional -->
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Duración:</span>
                    {{ curso.duracion }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Nivel:</span>
                    <span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {{ curso.nivel }}
                    </span>
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-medium mr-2">Instructor:</span>
                    {{ curso.instructor }}
                  </div>
                </div>
                
                <!-- Precio y CTA -->
                <div class="flex items-center justify-between">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    €{{ curso.precio }}
                  </div>
                  <a [routerLink]="['/productos', curso.slug]"
                     class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Ver Detalles
                  </a>
                </div>
              </div>
            </div>
          </div>
          </ng-container>

          <!-- Estado vacío -->
          <ng-container *ngIf="filteredCursos$ | async as cursos">
          <div *ngIf="cursos.length === 0" class="text-center py-12">
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 max-w-2xl mx-auto">
              <div class="text-yellow-800 dark:text-yellow-200">
                <h2 class="text-2xl font-semibold mb-4">🚧 Próximamente...</h2>
                <p class="text-lg mb-4">
                  Estamos preparando nuestra sección de cursos en Inteligencia Artificial.
                </p>
                <p class="text-base">
                  Muy pronto podrás acceder a formación especializada con metodología práctica.
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
export class CursosListComponent {
  cursos$!: Observable<Curso[]>;
  availableLevels$!: Observable<string[]>;
  filtersForm!: FormGroup;
  loading$!: Observable<boolean>;
  filteredCursos$!: Observable<Curso[]>;

  constructor(private cursosService: CursosService, private fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      search: [''],
      nivel: [''],
      precio: ['']
    });

    this.cursos$ = this.cursosService.getCursos();
    this.availableLevels$ = this.cursos$.pipe(
      map(items => Array.from(new Set(items.map(c => c.nivel).filter(Boolean))))
    );
    this.loading$ = this.cursos$.pipe(map(() => false), startWith(true));

    this.filteredCursos$ = combineLatest([
      this.cursos$,
      this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
    ]).pipe(
      map(([items, filters]: [Curso[], any]) => {
        const search = (filters.search || '').toLowerCase().trim();
        const nivel = filters.nivel || '';
        const precio = filters.precio || '';
        return items.filter((item: Curso) => {
          const matchesSearch = !search ||
            item.titulo.toLowerCase().includes(search) ||
            (item.descripcion || '').toLowerCase().includes(search) ||
            (item.instructor || '').toLowerCase().includes(search);
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
}
