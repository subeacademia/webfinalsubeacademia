import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../../core/data/projects.service';
import { Project } from '../../core/models';
import { ToastService } from '../../core/services/ui/toast/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Proyectos</h1>
        <div class="flex gap-3">
          <!-- Botones de gestión masiva -->
          <button 
            (click)="downloadProjectsAsJson()"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            📥 Descargar Estructura Proyecto (JSON)
          </button>
          <button 
            (click)="triggerJsonUpload()"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            📤 Cargar Proyectos (JSON)
          </button>
          <button 
            (click)="navigateToNew()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      <!-- Input oculto para la carga de archivos -->
      <input 
        type="file" 
        class="hidden" 
        accept=".json"
        (change)="handleJsonFile($event)"
        #fileInput>

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
  private projectsService = inject(ProjectsService)
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

  // Función para descargar estructura de proyecto como JSON
  async downloadProjectsAsJson(): Promise<void> {
    try {
      this.toastService.info('Preparando descarga de estructura de proyecto...');
      
      // Estructura de datos de ejemplo para un proyecto
      const projectStructure = {
        "title": "Sistema de IA para Análisis de Datos",
        "slug": "sistema-ia-analisis-datos",
        "clientName": "Empresa Tecnológica S.A.",
        "summary": "Desarrollo de un sistema inteligente para análisis y visualización de datos empresariales",
        "description": "Proyecto completo de implementación de un sistema de Inteligencia Artificial que permite a las empresas analizar grandes volúmenes de datos, identificar patrones y generar insights valiosos para la toma de decisiones estratégicas. El sistema incluye machine learning, procesamiento de lenguaje natural y dashboards interactivos.",
        "imageUrl": "https://ejemplo.com/proyecto-ia.jpg",
        "projectUrl": "https://ejemplo.com/proyecto-demo",
        "relatedCompetencies": [
          "comp-ia-001",
          "comp-ml-002",
          "comp-data-003",
          "comp-web-004"
        ],
        "status": "draft",
        "lang": "es",
        "langBase": "es",
        "createdAt": Date.now(),
        "updatedAt": Date.now(),
        "publishedAt": null
      };

      // Convertir a JSON formateado
      const jsonContent = JSON.stringify(projectStructure, null, 2);
      
      // Crear blob y descargar
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estructura-proyecto-ejemplo-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.toastService.success('Estructura de proyecto descargada exitosamente');
    } catch (error: any) {
      this.toastService.error(`Error al descargar la estructura: ${error.message}`);
    }
  }

  // Función para activar la selección de archivo
  triggerJsonUpload(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Función para manejar la carga del archivo JSON
  async handleJsonFile(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    try {
      this.toastService.info('Procesando archivo...');
      
      // Leer el archivo
      const content = await this.readFileAsText(file);
      
      // Parsear JSON
      let projectsData: any[];
      try {
        const parsed = JSON.parse(content);
        projectsData = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        throw new Error('El archivo no contiene un JSON válido');
      }

      // Validar estructura básica
      if (!this.validateProjectsStructure(projectsData)) {
        throw new Error('El archivo JSON no tiene la estructura correcta de proyectos');
      }

      // Procesar cada proyecto
      let successCount = 0;
      let errorCount = 0;
      
      for (const projectData of projectsData) {
        try {
          if (projectData.id) {
            // Actualizar proyecto existente
            await this.projectsService.update(projectData.id, projectData);
          } else {
            // Crear nuevo proyecto
            await this.projectsService.create(projectData);
          }
          successCount++;
        } catch (projectError: any) {
          console.error(`Error procesando proyecto ${projectData.title || projectData.id}:`, projectError);
          errorCount++;
        }
      }

      // Mostrar resultado
      if (errorCount === 0) {
        this.toastService.success(`Se han cargado ${successCount} proyectos exitosamente`);
      } else {
        this.toastService.warning(`Se cargaron ${successCount} proyectos, ${errorCount} con errores`);
      }

      // Recargar la lista
      this.loadProjects();
      
      // Limpiar el input
      target.value = '';
      
    } catch (error: any) {
      this.toastService.error(`Error al procesar el archivo: ${error.message}`);
      target.value = '';
    }
  }

  // Función auxiliar para leer archivo como texto
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }

  // Función para validar la estructura de los proyectos
  private validateProjectsStructure(projectsData: any[]): boolean {
    if (!Array.isArray(projectsData)) return false;
    
    return projectsData.every(project => {
      // Validar que tenga al menos título o slug
      return project && (project.title || project.slug);
    });
  }
}
