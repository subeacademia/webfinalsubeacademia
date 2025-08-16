import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../../core/data/projects.service';
import { Project } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="project" class="min-h-screen bg-white dark:bg-slate-900">
      <!-- Hero Section con imagen principal -->
      <div class="relative h-96 md:h-[500px] overflow-hidden">
        <img [src]="project.imageUrl" 
             [alt]="project.title"
             class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <!-- Contenido del hero -->
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <div class="container mx-auto">
            <div class="max-w-4xl">
              <!-- Badge del cliente -->
              <div class="mb-4">
                <span class="inline-block px-4 py-2 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-white text-sm font-medium rounded-full backdrop-blur-sm">
                  {{ project.clientName }}
                </span>
              </div>
              
              <!-- Título del proyecto -->
              <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {{ project.title }}
              </h1>
              
              <!-- Resumen -->
              <p class="text-xl text-gray-200 max-w-3xl leading-relaxed">
                {{ project.summary }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="container mx-auto px-4 py-16">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <!-- Columna principal (70%) -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Descripción del proyecto -->
            <div class="prose prose-lg dark:prose-invert max-w-none">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Sobre el Proyecto
              </h2>
              <div class="text-gray-700 dark:text-gray-300 leading-relaxed" [innerHTML]="project.description">
              </div>
            </div>

            <!-- Detalles técnicos -->
            <div class="bg-gray-50 dark:bg-slate-800 rounded-xl p-8">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Detalles del Proyecto
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Cliente</h4>
                  <p class="text-gray-900 dark:text-white">{{ project.clientName }}</p>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado</h4>
                  <span class="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full">
                    Completado
                  </span>
                </div>
                <div *ngIf="project.projectUrl">
                  <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">URL del Proyecto</h4>
                  <a [href]="project.projectUrl" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
                    {{ project.projectUrl }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar (30%) -->
          <div class="space-y-8">
            
            <!-- Competencias relacionadas -->
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Competencias Demostradas
              </h3>
              
              <div *ngIf="project.relatedCompetencies && project.relatedCompetencies.length > 0" class="space-y-3">
                <div *ngFor="let compId of project.relatedCompetencies" 
                     class="inline-block px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-lg mr-2 mb-2">
                  {{ getCompetencyName(compId) }}
                </div>
              </div>
              
              <div *ngIf="!project.relatedCompetencies || project.relatedCompetencies.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
                No se han especificado competencias para este proyecto.
              </div>
            </div>

            <!-- CTA -->
            <div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
              <h3 class="text-xl font-bold mb-3">
                ¿Te gusta este proyecto?
              </h3>
              <p class="text-blue-100 mb-6">
                Hablemos sobre cómo podemos crear algo similar para tu organización
              </p>
              <button 
                (click)="contactUs()"
                class="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Contactar Expertos
              </button>
            </div>

            <!-- Botón de visita al proyecto -->
            <div *ngIf="project.projectUrl" class="text-center">
              <a [href]="project.projectUrl" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Visitar Proyecto
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegación entre proyectos -->
      <div class="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-16">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Más Casos de Éxito
            </h2>
            <button 
              (click)="goToList()"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Ver Todos los Proyectos
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="!project && !error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Cargando proyecto...</p>
      </div>
    </div>

    <!-- Error state -->
    <div *ngIf="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Proyecto no encontrado
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          El proyecto que buscas no existe o ha sido removido.
        </p>
        <button 
          (click)="goToList()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
          Volver a Proyectos
        </button>
      </div>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private i18nService = inject(I18nService);
  
  project: Project | null = null;
  error = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProject(slug);
      }
    });
  }

  async loadProject(slug: string) {
    try {
      this.project = await this.projectsService.getBySlug(slug);
      if (!this.project) {
        this.error = true;
      }
    } catch (error) {
      console.error('Error cargando proyecto:', error);
      this.error = true;
    }
  }

  goToList() {
    const currentLang = this.i18nService.currentLang();
    this.router.navigate(['/', currentLang, 'proyectos']);
  }

  contactUs() {
    const currentLang = this.i18nService.currentLang();
    this.router.navigate(['/', currentLang, 'contacto']);
  }

  getCompetencyName(compId: string): string {
    // Aquí deberías obtener el nombre de la competencia desde un servicio
    // Por ahora retornamos el ID
    return compId;
  }
}
