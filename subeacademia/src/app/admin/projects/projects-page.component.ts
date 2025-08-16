import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../../core/data/projects.service';
import { Project } from '../../core/models';
import { ToastService } from '../../core/ui/toast/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Proyectos</h1>
        <button 
          (click)="navigateToNew()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          + Nuevo Proyecto
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Proyecto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let project of projects" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img 
                        [src]="project.imageUrl" 
                        [alt]="project.title"
                        class="h-12 w-12 rounded-lg object-cover">
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ project.title }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ project.summary | slice:0:50 }}{{ project.summary.length > 50 ? '...' : '' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ project.clientName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    [class]="getStatusClass(project.status)"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(project.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ project.createdAt | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    (click)="editProject(project.id!)"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                    Editar
                  </button>
                  <button 
                    (click)="deleteProject(project.id!)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="projects.length === 0" class="text-center py-12">
          <div class="text-gray-500 dark:text-gray-400">
            <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p class="text-lg font-medium">No hay proyectos aún</p>
            <p class="text-sm">Crea tu primer proyecto para comenzar</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectsPageComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  projects: Project[] = [];

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    try {
      this.projects = await this.projectsService.getAllProjects();
    } catch (error) {
      console.error('Error cargando proyectos:', error);
              this.toastService.error('Error al cargar los proyectos');
    }
  }

  navigateToNew() {
    this.router.navigate(['/admin/projects/new']);
  }

  editProject(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  async deleteProject(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await firstValueFrom(this.projectsService.remove(id));
        this.toastService.success('Proyecto eliminado correctamente');
        this.loadProjects();
      } catch (error) {
        console.error('Error eliminando proyecto:', error);
        this.toastService.error('Error al eliminar el proyecto');
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'scheduled':
        return 'Programado';
      default:
        return 'Desconocido';
    }
  }
}
