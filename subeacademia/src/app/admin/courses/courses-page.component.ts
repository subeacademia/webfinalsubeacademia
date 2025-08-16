import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { CoursesService } from '../../core/data/courses.service';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';
import { ToastService } from '../../core/ui/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-admin-courses-page',
  imports: [RouterLink, NgFor, NgIf, UiButtonComponent],
  template: `
    <div class="admin-page max-w-7xl mx-auto p-6 space-y-6">
      <!-- Header con botones de gestión masiva -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="admin-text text-3xl font-bold">Cursos</h1>
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Botones de gestión masiva -->
          <div class="flex gap-2">
            <app-ui-button 
              variant="secondary" 
              (clicked)="downloadCoursesAsJson()"
              size="md">
              📥 Descargar Cursos (JSON)
            </app-ui-button>
            <app-ui-button 
              variant="secondary" 
              (clicked)="triggerJsonUpload()"
              size="md">
              📤 Cargar Cursos (JSON)
            </app-ui-button>
          </div>
          <app-ui-button 
            variant="primary" 
            (clicked)="goToNewCourse()"
            size="md">
            + Nuevo Curso
          </app-ui-button>
        </div>
      </div>

      <!-- Input oculto para la carga de archivos -->
      <input 
        type="file" 
        class="hidden" 
        accept=".json"
        (change)="handleJsonFile($event)"
        #fileInput>

      <!-- Lista de cursos -->
      <div class="grid gap-4">
        <div *ngFor="let c of courses()" class="admin-card rounded-lg shadow-sm p-6">
          <div class="md:flex items-center justify-between">
            <div class="flex-1">
              <div class="admin-text font-semibold text-lg">{{c.title}}</div>
              <div class="admin-text-muted text-sm mt-1">
                {{c.lang}} • {{c.level}} • {{c.status}}
                <span *ngIf="c.price" class="ml-2 text-green-600 font-medium">
                  {{formatPrice(c.price, c.currency)}}
                </span>
              </div>
              <div *ngIf="c.summary" class="admin-text-muted text-sm mt-2 line-clamp-2">
                {{c.summary}}
              </div>
            </div>
            <div class="flex gap-2 mt-4 md:mt-0">
              <a class="inline-flex items-center px-4 py-2 border admin-border rounded-md shadow-sm text-sm font-medium admin-text bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" 
                 [routerLink]="['/admin/courses', c.id]">
                Editar
              </a>
              <button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      (click)="deleteCourse(c.id)">
                Eliminar
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="!courses().length" class="admin-card rounded-lg shadow-sm p-12 text-center">
          <div class="admin-text-muted text-lg mb-4">No hay cursos aún.</div>
          <app-ui-button 
            variant="primary" 
            (clicked)="goToNewCourse()"
            size="md">
            Crear primer curso
          </app-ui-button>
        </div>
      </div>
    </div>
  `,
})
export class CoursesPageComponent {
  private coursesSvc = inject(CoursesService);
  private toast = inject(ToastService);
  private router = inject(Router);
  
  courses = signal<any[]>([]);

  constructor() {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.coursesSvc.list('es').subscribe(list => this.courses.set(list as any[]));
  }

  goToNewCourse(): void {
    this.router.navigate(['/admin/courses/new']);
  }

  async deleteCourse(courseId: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        await this.coursesSvc.remove(courseId).toPromise();
        this.toast.success('Curso eliminado exitosamente');
        this.loadCourses(); // Recargar la lista
      } catch (error: any) {
        this.toast.error(`Error al eliminar el curso: ${error.message}`);
      }
    }
  }

  formatPrice(price: number, currency?: string): string {
    if (!price) return 'Gratis';
    
    const currencySymbol = currency === 'CLP' ? 'CLP ' : currency === 'EUR' ? '€' : '$';
    
    if (currency === 'CLP') {
      return `CLP ${price.toLocaleString('es-CL')}`;
    } else {
      return `${currencySymbol}${price.toFixed(2)}`;
    }
  }

  // Función para descargar todos los cursos como JSON
  async downloadCoursesAsJson(): Promise<void> {
    try {
      this.toast.info('Preparando descarga...');
      
      // Obtener todos los cursos
      const allCourses = await this.coursesSvc.getAllCourses();
      
      if (!allCourses || allCourses.length === 0) {
        this.toast.warning('No hay cursos para descargar');
        return;
      }

      // Convertir a JSON formateado
      const jsonContent = JSON.stringify(allCourses, null, 2);
      
      // Crear blob y descargar
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cursos-sube-academia-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.toast.success(`Se han descargado ${allCourses.length} cursos exitosamente`);
    } catch (error: any) {
      this.toast.error(`Error al descargar los cursos: ${error.message}`);
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
      this.toast.info('Procesando archivo...');
      
      // Leer el archivo
      const content = await this.readFileAsText(file);
      
      // Parsear JSON
      let coursesData: any[];
      try {
        const parsed = JSON.parse(content);
        coursesData = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        throw new Error('El archivo no contiene un JSON válido');
      }

      // Validar estructura básica
      if (!this.validateCoursesStructure(coursesData)) {
        throw new Error('El archivo JSON no tiene la estructura correcta de cursos');
      }

      // Procesar cada curso
      let successCount = 0;
      let errorCount = 0;
      
      for (const courseData of coursesData) {
        try {
          if (courseData.id) {
            // Actualizar curso existente
            await this.coursesSvc.update(courseData.id, courseData);
          } else {
            // Crear nuevo curso
            await this.coursesSvc.create(courseData);
          }
          successCount++;
        } catch (courseError: any) {
          console.error(`Error procesando curso ${courseData.title || courseData.id}:`, courseError);
          errorCount++;
        }
      }

      // Mostrar resultado
      if (errorCount === 0) {
        this.toast.success(`Se han cargado ${successCount} cursos exitosamente`);
      } else {
        this.toast.warning(`Se cargaron ${successCount} cursos, ${errorCount} con errores`);
      }

      // Recargar la lista
      this.loadCourses();
      
      // Limpiar el input
      target.value = '';
      
    } catch (error: any) {
      this.toast.error(`Error al procesar el archivo: ${error.message}`);
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

  // Función para validar la estructura de los cursos
  private validateCoursesStructure(coursesData: any[]): boolean {
    if (!Array.isArray(coursesData)) return false;
    
    return coursesData.every(course => {
      // Validar que tenga al menos título o slug
      return course && (course.title || course.slug);
    });
  }
}

