import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CertificacionesService } from '../services/certificaciones.service';
import { Certificacion } from '../data/certificacion.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-certificaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Certificaciones en IA</h1>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Certificaciones oficiales reconocidas por la industria en tecnologías de Inteligencia Artificial. 
          Valida tus conocimientos y mejora tu perfil profesional.
        </p>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-gray-600">Cargando certificaciones...</p>
      </div>

      <!-- Lista de certificaciones -->
      <div *ngIf="!loading && certificaciones.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let certificacion of certificaciones" 
             class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          
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
              <a [routerLink]="['/productos/certificaciones', certificacion.slug]"
                 class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Ver Detalles
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!loading && certificaciones.length === 0" class="text-center py-12">
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
export class CertificacionesListComponent implements OnInit, OnDestroy {
  certificaciones: Certificacion[] = [];
  loading = true;
  private readonly unsubscribe$ = new Subject<void>();

  constructor(private certificacionesService: CertificacionesService) {}

  ngOnInit(): void {
    this.cargarCertificaciones();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarCertificaciones(): void {
    this.loading = true;
    this.certificacionesService.getCertificaciones()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.certificaciones = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando certificaciones:', error);
          this.loading = false;
        }
      });
  }
}
