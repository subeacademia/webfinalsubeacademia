import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsesoriasService } from '../services/asesorias.service';
import { Asesoria } from '../data/asesoria.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-asesorias-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Asesorías en IA</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Consultoría personalizada para implementar soluciones de Inteligencia Artificial en tu empresa. 
          Nuestros expertos te guiarán en cada paso del proceso.
        </p>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Cargando asesorías...</p>
      </div>

      <!-- Lista de asesorías -->
      <div *ngIf="!loading && asesorias.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let asesoria of asesorias" 
             class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          
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
              <a [routerLink]="['/productos/asesorias', asesoria.slug]"
                 class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Ver Detalles
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!loading && asesorias.length === 0" class="text-center py-12">
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 max-w-2xl mx-auto">
          <div class="text-yellow-800 dark:text-yellow-200">
            <h2 class="text-2xl font-semibold mb-4">🚧 Próximamente...</h2>
            <p class="text-lg mb-4">
              Estamos preparando nuestra sección de asesorías personalizadas en Inteligencia Artificial.
            </p>
            <p class="text-base">
              Muy pronto podrás acceder a consultoría especializada para implementar IA en tu empresa.
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
export class AsesoriasListComponent implements OnInit, OnDestroy {
  asesorias: Asesoria[] = [];
  loading = true;
  private readonly unsubscribe$ = new Subject<void>();

  constructor(private asesoriasService: AsesoriasService) {}

  ngOnInit(): void {
    this.cargarAsesorias();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarAsesorias(): void {
    this.loading = true;
    this.asesoriasService.getAsesorias()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.asesorias = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando asesorías:', error);
          this.loading = false;
        }
      });
  }
}
