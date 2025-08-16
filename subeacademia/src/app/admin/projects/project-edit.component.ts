import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProjectsService } from '../../core/data/projects.service';
import { CommonModule } from '@angular/common';
import { MediaPickerComponent } from '../shared/media-picker.component';
import { Subject, takeUntil } from 'rxjs';
import { Competency } from '../../features/diagnostico/data/competencias';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';
import { Project } from '../../core/models';
import { firstValueFrom } from 'rxjs';

function slugify(s: string) { 
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); 
}

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MediaPickerComponent, 
    UiButtonComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ id() ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
        </h1>
        <div class="flex gap-3">
          <app-ui-button 
            variant="ghost" 
            (clicked)="goBack()"
            size="md">
            Cancelar
          </app-ui-button>
          <app-ui-button 
            variant="primary" 
            (clicked)="save()"
            [disabled]="projectForm.invalid || saving()"
            size="md">
            {{ saving() ? 'Guardando...' : 'Guardar Proyecto' }}
          </app-ui-button>
        </div>
      </div>

      <!-- Notificaciones -->
      <div *ngIf="showNotification()" 
           class="p-4 rounded-lg border" 
           [class]="showNotification()?.type === 'success' 
             ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200' 
             : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'">
        <div class="flex items-center justify-between">
          <span>{{ showNotification()?.message }}</span>
          <button class="text-lg font-bold hover:opacity-70" (click)="showNotification.set(null)">×</button>
        </div>
      </div>

      <!-- Formulario Principal -->
      <form [formGroup]="projectForm" (ngSubmit)="save()" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Columna Izquierda (70%) -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Información Básica -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Información Básica</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
                  <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          formControlName="lang">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                  <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          formControlName="status">
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="scheduled">Programado</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título del Proyecto *</label>
                <input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                       type="text" 
                       formControlName="title" 
                       (input)="syncSlug()"
                       placeholder="Ingresa el título del proyecto">
                <div *ngIf="projectForm.get('title')?.invalid && projectForm.get('title')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  El título es obligatorio
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                <input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                       type="text" 
                       formControlName="slug"
                       placeholder="URL amigable del proyecto">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Cliente *</label>
                <input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                       type="text" 
                       formControlName="clientName"
                       placeholder="Nombre de la empresa o cliente">
                <div *ngIf="projectForm.get('clientName')?.invalid && projectForm.get('clientName')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  El nombre del cliente es obligatorio
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resumen *</label>
                <textarea class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          rows="3" 
                          formControlName="summary"
                          placeholder="Breve descripción del proyecto para las tarjetas"></textarea>
                <div *ngIf="projectForm.get('summary')?.invalid && projectForm.get('summary')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  El resumen es obligatorio
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL del Proyecto (Opcional)</label>
                <input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                       type="url" 
                       formControlName="projectUrl"
                       placeholder="https://ejemplo.com/proyecto">
              </div>
            </div>

            <!-- Descripción del Proyecto -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Descripción del Proyecto</h2>
              <textarea 
                class="w-full min-h-64 h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                formControlName="description"
                placeholder="Describe el proyecto en detalle...">
              </textarea>
              <div *ngIf="projectForm.get('description')?.invalid && projectForm.get('description')?.touched" 
                   class="text-red-500 text-sm mt-1">
                La descripción es obligatoria
              </div>
            </div>
          </div>

          <!-- Columna Derecha (30%) -->
          <div class="space-y-6">
            
            <!-- Imagen del Proyecto -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Imagen del Proyecto</h2>
              
              <app-media-picker (chosen)="attachMedia($event)"></app-media-picker>
              
              <!-- Vista previa de imagen -->
              <div *ngIf="projectForm.value.imageUrl" class="mt-4">
                <img [src]="projectForm.value.imageUrl" 
                     alt="Vista previa" 
                     class="w-full h-32 object-cover rounded-lg border">
              </div>
            </div>

            <!-- Competencias Relacionadas -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Competencias Relacionadas</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccionar Competencias</label>
                <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                        multiple 
                        formControlName="relatedCompetencies"
                        size="6">
                  <option *ngFor="let comp of competencias" [value]="comp.id">
                    {{ comp.name }}
                  </option>
                </select>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona las competencias que este proyecto demuestra
                </div>
              </div>

              <!-- Competencias seleccionadas como tags -->
              <div *ngIf="selectedCompetencies().length > 0" class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Competencias Seleccionadas:</h4>
                <div class="flex flex-wrap gap-2">
                  <div *ngFor="let comp of selectedCompetencies()" 
                       class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    <span>{{ comp.name }}</span>
                    <button type="button" 
                            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-bold"
                            (click)="removeCompetency(comp.id)">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class ProjectEditComponent implements OnInit, OnDestroy {
  private projectsService = inject(ProjectsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  private destroy$ = new Subject<void>();
  
  id = signal<string | null>(null);
  saving = signal(false);
  showNotification = signal<{type: 'success' | 'error', message: string} | null>(null);
  
  projectForm: FormGroup;
  competencias: Competency[] = [];
  attached: any[] = [];

  constructor() {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      clientName: ['', Validators.required],
      summary: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', Validators.required],
      projectUrl: [''],
      relatedCompetencies: [[]],
      status: ['draft'],
      lang: ['es']
    });
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.id.set(params['id']);
        this.loadProject(params['id']);
      }
    });
    
    this.loadCompetencies();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadProject(id: string) {
    try {
      const project = await firstValueFrom(this.projectsService.get(id));
      if (project) {
        this.projectForm.patchValue(project);
      }
    } catch (error) {
      console.error('Error cargando proyecto:', error);
      this.showNotification.set({ type: 'error', message: 'Error al cargar el proyecto' });
    }
  }

  loadCompetencies() {
    // Aquí deberías cargar las competencias desde el servicio correspondiente
    // Por ahora usamos un array vacío
    this.competencias = [];
  }

  syncSlug() {
    const title = this.projectForm.get('title')?.value;
    if (title) {
      this.projectForm.patchValue({ slug: slugify(title) });
    }
  }

  attachMedia(media: any) {
    if (media && media.url) {
      this.projectForm.patchValue({ imageUrl: media.url });
      this.attached = [media];
    }
  }

  selectedCompetencies() {
    const selectedIds = this.projectForm.get('relatedCompetencies')?.value || [];
    return this.competencias.filter(comp => selectedIds.includes(comp.id));
  }

  removeCompetency(compId: string) {
    const current = this.projectForm.get('relatedCompetencies')?.value || [];
    const filtered = current.filter((id: string) => id !== compId);
    this.projectForm.patchValue({ relatedCompetencies: filtered });
  }

  async save() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    
    try {
      const formData = this.projectForm.value;
      
      if (this.id()) {
        await this.projectsService.update(this.id()!, formData);
        this.showNotification.set({ type: 'success', message: 'Proyecto actualizado correctamente' });
      } else {
        const result = await this.projectsService.create(formData);
        this.id.set(result.id);
        this.showNotification.set({ type: 'success', message: 'Proyecto creado correctamente' });
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        this.router.navigate(['/admin/projects']);
      }, 1500);
      
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      this.showNotification.set({ type: 'error', message: 'Error al guardar el proyecto' });
    } finally {
      this.saving.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/admin/projects']);
  }
}
