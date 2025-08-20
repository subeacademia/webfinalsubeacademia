import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CursosService } from '../services/cursos.service';
import { Curso } from '../data/producto.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Cursos en IA</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Formación especializada en Inteligencia Artificial con metodología práctica y casos reales. 
          Aprende de expertos y desarrolla proyectos que marquen la diferencia.
        </p>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p class="mt-2 text-gray-600">Cargando cursos...</p>
      </div>

      <!-- Lista de cursos -->
      <div *ngIf="!loading && cursos.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let curso of cursos" 
             class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          
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
              <a [routerLink]="['/productos/cursos', curso.slug]"
                 class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Ver Detalles
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!loading && cursos.length === 0" class="text-center py-12">
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
export class CursosListComponent implements OnInit, OnDestroy {
  cursos: Curso[] = [];
  loading = true;
  private readonly unsubscribe$ = new Subject<void>();

  constructor(private cursosService: CursosService) {}

  ngOnInit(): void {
    this.cargarCursos();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarCursos(): void {
    this.loading = true;
    this.cursosService.getCursos()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.cursos = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando cursos:', error);
          this.loading = false;
        }
      });
  }
}
