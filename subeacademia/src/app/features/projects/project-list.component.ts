import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../../core/data/projects.service';
import { Project } from '../../core/models';
import { I18nService } from '../../core/i18n/i18n.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <!-- Header de la página -->
      <div class="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-16">
          <div class="text-center">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Casos de <span class="gradient-text">Éxito</span>
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Descubre cómo hemos ayudado a organizaciones a transformar su futuro con proyectos de IA innovadores y de alto impacto
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de proyectos -->
      <div class="container mx-auto px-4 py-16">
        <!-- Filtros (opcional) -->
        <div class="mb-12 text-center">
          <div class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-6 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <span class="text-sm text-gray-600 dark:text-gray-400">Mostrando</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ projects.length }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">proyectos</span>
          </div>
        </div>

        <!-- Grid de proyectos -->
        <div *ngIf="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let project of projects" 
               class="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-200 dark:border-gray-700">
            
            <!-- Imagen del proyecto -->
            <div class="relative overflow-hidden h-48">
              <img [src]="project.imageUrl" 
                   [alt]="project.title"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              <!-- Badge de cliente -->
              <div class="absolute bottom-4 left-4">
                <span class="inline-block px-3 py-1 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-white text-sm font-medium rounded-full backdrop-blur-sm">
                  {{ project.clientName }}
                </span>
              </div>
            </div>

            <!-- Contenido de la tarjeta -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ project.title }}
              </h3>
              
              <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {{ project.summary }}
              </p>

              <!-- Competencias relacionadas -->
              <div *ngIf="project.relatedCompetencies && project.relatedCompetencies.length > 0" class="mb-4">
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let compId of project.relatedCompetencies.slice(0, 3)" 
                        class="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                    {{ getCompetencyName(compId) }}
                  </span>
                  <span *ngIf="project.relatedCompetencies.length > 3" 
                        class="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{{ project.relatedCompetencies.length - 3 }}
                  </span>
                </div>
              </div>

              <!-- Botón de acción -->
              <button 
                (click)="viewProject(project.slug)"
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform group-hover:scale-105">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div *ngIf="projects.length === 0 && !loading" class="text-center py-16">
          <div class="text-gray-500 dark:text-gray-400">
            <svg class="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p class="text-lg font-medium">No hay proyectos disponibles</p>
            <p class="text-sm">Estamos trabajando en nuevos casos de éxito</p>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando proyectos...</p>
        </div>
      </div>

      <!-- CTA final -->
      <div class="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 py-16 text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Tienes un proyecto en mente?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Nuestro equipo de expertos está listo para ayudarte a convertir tu visión en realidad
          </p>
          <button 
            (click)="contactUs()"
            class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Hablar con un Experto
          </button>
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
    
    .gradient-text {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class ProjectListComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private i18nService = inject(I18nService);
  
  projects: Project[] = [];
  loading = true;

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    try {
      this.loading = true;
      const currentLang = this.i18nService.currentLang();
      this.projects = await firstValueFrom(this.projectsService.list(currentLang, 'published'));
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    } finally {
      this.loading = false;
    }
  }

  viewProject(slug: string) {
    const currentLang = this.i18nService.currentLang();
    this.router.navigate(['/', currentLang, 'proyectos', slug]);
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
