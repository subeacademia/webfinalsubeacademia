import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { CoursesService } from '../../core/data/courses.service';
import { ContentService } from '../../core/services/content.service';
import { CommonModule } from '@angular/common';
import { MediaPickerComponent } from '../shared/media-picker.component';
import { MediaService } from '../../core/data/media.service';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Competency } from '../../features/diagnostico/data/competencias';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';

function slugify(s: string) { 
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); 
}

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    NgIf, 
    MediaPickerComponent, 
    UiButtonComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ id() ? 'Editar Curso' : 'Nuevo Curso' }}
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
            [disabled]="courseForm.invalid || uploading()"
            size="md">
            Guardar Curso
          </app-ui-button>
        </div>
      </div>

      <!-- Notificaciones -->
      <div *ngIf="showNotification()" 
           class="p-4 rounded-lg border" 
           [class]="showNotification()?.type === 'success' 
             ? 'bg-green-50 border-green-200 text-green-800' 
             : 'bg-red-50 border-red-200 text-red-800'">
        <div class="flex items-center justify-between">
          <span>{{ showNotification()?.message }}</span>
          <button class="text-lg font-bold hover:opacity-70" (click)="showNotification.set(null)">×</button>
        </div>
      </div>

      <!-- Formulario Principal -->
      <form [formGroup]="courseForm" (ngSubmit)="save()" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Columna Izquierda (70%) -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Información Básica -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Información Básica</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          formControlName="lang">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          formControlName="level">
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Título del Curso *</label>
                <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       type="text" 
                       formControlName="title" 
                       (input)="syncSlug()"
                       placeholder="Ingresa el título del curso">
                <div *ngIf="courseForm.get('title')?.invalid && courseForm.get('title')?.touched" 
                     class="text-red-500 text-sm mt-1">
                  El título es obligatorio
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       type="text" 
                       formControlName="slug"
                       placeholder="URL amigable del curso">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Resumen</label>
                <textarea class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          rows="3" 
                          formControlName="summary"
                          placeholder="Breve descripción del curso"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Duración</label>
                  <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         type="text" 
                         formControlName="duration"
                         placeholder="Ej: 10 horas">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Temas (separados por comas)</label>
                  <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         type="text" 
                         [value]="(courseForm.value.topics || []).join(', ')" 
                         (change)="onTopicsChange($any($event.target).value)"
                         placeholder="tema1, tema2, tema3">
                </div>
              </div>
            </div>

            <!-- Descripción del Curso -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Descripción del Curso</h2>
              <textarea 
                class="w-full min-h-64 h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                formControlName="description"
                placeholder="Describe el contenido del curso...">
              </textarea>
            </div>

            <!-- Programa Académico -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Programa Académico</h2>
              
              <div formArrayName="modules" class="space-y-4">
                <div *ngFor="let module of modules.controls; let i = index" 
                     [formGroupName]="i" 
                     class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">Módulo {{ i + 1 }}</h4>
                    <button type="button" 
                            class="text-red-600 hover:text-red-800 text-sm font-medium"
                            (click)="removeModule(i)">
                      Eliminar Módulo
                    </button>
                  </div>
                  
                  <input formControlName="title" 
                         placeholder="Título del Módulo" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3">

                  <div formArrayName="lessons" class="space-y-2">
                    <div *ngFor="let lesson of lessons(i).controls; let j = index" 
                         class="flex items-center gap-2">
                      <input [formControlName]="j" 
                             placeholder="Nombre de la lección" 
                             class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <button type="button" 
                              class="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                              (click)="removeLesson(i, j)">
                        ×
                      </button>
                    </div>
                    <button type="button" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            (click)="addLesson(i)">
                      + Añadir Lección
                    </button>
                  </div>
                </div>
                
                <button type="button" 
                        class="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                        (click)="addModule()">
                  + Añadir Módulo
                </button>
              </div>
            </div>

            <!-- Recursos -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Recursos del Curso</h2>
              
              <div class="space-y-2" formArrayName="resources">
                <div *ngFor="let r of resourcesArray; let i=index" 
                     [formGroupName]="i" 
                     class="grid md:grid-cols-3 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm truncate">
                    <strong>{{ r.value.title || r.value.name || r.value.type }}</strong>
                    <div class="text-gray-500 truncate">{{ r.value.url }}</div>
                  </div>
                  <div class="text-xs text-gray-600">{{ r.value.type }}</div>
                  <button type="button" 
                          class="text-red-600 hover:text-red-800 text-sm font-medium"
                          (click)="removeResource(i)">
                    Quitar
                  </button>
                </div>
              </div>
              
              <button type="button" 
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      (click)="openResourceDialog()">
                + Añadir Recurso
              </button>
              
              <div class="flex items-center gap-3" *ngIf="uploading()">
                <span class="text-sm text-gray-600">Subiendo… {{progress()}}%</span>
                <span *ngIf="error()" class="text-sm text-red-500">{{error()}}</span>
              </div>
            </div>
          </div>

          <!-- Columna Derecha (30%) -->
          <div class="space-y-6">
            
            <!-- Imagen del Curso -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Imagen del Curso</h2>
              
              <app-media-picker (chosen)="attachMedia($event)"></app-media-picker>
              
              <!-- Vista previa de imagen -->
              <div *ngIf="courseForm.value.imageUrl" class="mt-4">
                <img [src]="courseForm.value.imageUrl" 
                     alt="Vista previa" 
                     class="w-full h-32 object-cover rounded-lg border">
              </div>
              
              <!-- Media adjuntos -->
              <div *ngIf="attached.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Archivos Adjuntos</h4>
                <div class="space-y-2">
                  <div *ngFor="let m of attached" 
                       class="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span class="truncate">{{m.fileName || m.path}}</span>
                    <a class="text-blue-600 hover:text-blue-800" 
                       [href]="m.url" 
                       target="_blank">Ver</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Competencias Relacionadas -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Competencias Relacionadas</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Competencias</label>
                <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        multiple 
                        formControlName="relatedCompetencies"
                        size="6">
                  <option *ngFor="let comp of competencias" [value]="comp.id">
                    {{ comp.name }}
                  </option>
                </select>
                <div class="text-xs text-gray-500 mt-1">
                  Selecciona las competencias que este curso ayuda a desarrollar
                </div>
              </div>

              <!-- Competencias seleccionadas como tags -->
              <div *ngIf="selectedCompetencies().length > 0" class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700">Competencias Seleccionadas:</h4>
                <div class="flex flex-wrap gap-2">
                  <div *ngFor="let comp of selectedCompetencies()" 
                       class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <span>{{ comp.name }}</span>
                    <button type="button" 
                            class="text-blue-600 hover:text-blue-800 font-bold"
                            (click)="removeCompetency(comp.id)">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de Precio y Pago -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Precio y Pago</h2>
              
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         type="number" 
                         formControlName="price" 
                         min="0" 
                         step="0.01" 
                         placeholder="0.00">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          formControlName="currency">
                    <option value="CLP">Peso Chileno (CLP)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dólar ($)</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enlace de Pago</label>
                  <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         type="url" 
                         formControlName="paymentLink" 
                         placeholder="https://...">
                </div>
              </div>
            </div>

            <!-- Estado y Publicación -->
            <div class="bg-white rounded-lg shadow-sm border p-6 space-y-4">
              <h2 class="text-xl font-semibold text-gray-900">Estado y Publicación</h2>
              
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          formControlName="status">
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="scheduled">Programado</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Publicación</label>
                  <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         type="datetime-local" 
                         formControlName="publishedAtLocal">
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Diálogo de Recurso -->
      <div *ngIf="showResDlg()" 
           class="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Añadir Recurso</h3>
            <button type="button" 
                    class="text-gray-400 hover:text-gray-600 text-2xl"
                    (click)="closeResourceDialog()">×</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre visible</label>
              <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                     [(ngModel)]="resName" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      [(ngModel)]="resKind">
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="zip">ZIP</option>
                <option value="link">Enlace</option>
              </select>
            </div>
            
            <ng-container *ngIf="resKind !== 'link'; else linkTpl">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Archivo</label>
                <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       type="file" 
                       (change)="onPickResFile($event)" />
              </div>
            </ng-container>
            
            <ng-template #linkTpl>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       [(ngModel)]="resUrl" 
                       placeholder="https://..." />
              </div>
            </ng-template>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <app-ui-button 
              variant="ghost" 
              (clicked)="closeResourceDialog()"
              size="md">
              Cancelar
            </app-ui-button>
            <app-ui-button 
              variant="primary" 
              (clicked)="confirmResource()"
              [disabled]="uploading()"
              size="md">
              Añadir
            </app-ui-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CourseEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courses = inject(CoursesService);
  private media = inject(MediaService);
  private content = inject(ContentService);

  id = signal<string | null>(null);
  private readonly unsubscribe$ = new Subject<void>();

  // Formulario reactivo principal
  courseForm = this.fb.group({
    lang: ['es', Validators.required],
    title: ['', Validators.required],
    slug: [''],
    summary: [''],
    description: [''],
    level: ['Principiante'],
    duration: [''],
    topics: [[] as string[]],
    resources: this.fb.array([] as any[]),
    media: this.fb.array([] as any[]),
    status: ['draft'],
    publishedAt: [Date.now()],
    publishedAtLocal: [''],
    price: [0],
    currency: ['CLP'],
    paymentLink: [''],
    modules: this.fb.array([] as any[]),
    relatedCompetencies: [[] as string[]],
    imageUrl: [''],
  });

  competencias: Competency[] = [];
  selectedCompetencies = signal<Competency[]>([]);

  // Estados del componente
  uploading = signal(false);
  progress = signal(0);
  error = signal<string | null>(null);
  showNotification = signal<{type: 'success' | 'error', message: string} | null>(null);
  showResDlg = signal(false);
  
  // Variables del diálogo de recurso
  resKind: 'video' | 'pdf' | 'zip' | 'link' = 'pdf';
  resName = '';
  resUrl = '';
  resFile?: File;

  // Media adjuntos
  attached: any[] = [];

  ngOnInit(): void {
    this.loadCompetencies();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id.set(id);
      this.courses
        .get(id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(c => {
          if (c) {
            const value: any = c;
            this.courseForm.patchValue({
              ...value,
              publishedAtLocal: new Date(value.publishedAt || Date.now()).toISOString().slice(0, 16),
              imageUrl: value.image || value.coverUrl || ''
            });
            this.setResources(value.resources || []);
            this.setModules((value as any).modules || []);
            this.updateSelectedCompetencies();
          }
        });
    } else {
      // Para nuevos cursos, inicializar con un módulo vacío
      this.addModule();
    }

    // Suscribirse a cambios en las competencias seleccionadas
    this.courseForm.get('relatedCompetencies')?.valueChanges.subscribe(() => {
      this.updateSelectedCompetencies();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadCompetencies(): void {
    import('../../features/diagnostico/data/competencias').then(module => {
      this.competencias = module.competencias;
    });
  }

  private updateSelectedCompetencies(): void {
    const selectedIds = this.courseForm.get('relatedCompetencies')?.value || [];
    this.selectedCompetencies.set(
      this.competencias.filter(comp => selectedIds.includes(comp.id))
    );
  }

  removeCompetency(competencyId: string): void {
    const current = this.courseForm.get('relatedCompetencies')?.value || [];
    const updated = current.filter((id: string) => id !== competencyId);
    this.courseForm.patchValue({ relatedCompetencies: updated });
  }

  // Getters para FormArrays
  get resourcesArray(): any[] { return (this.courseForm.get('resources') as FormArray)?.controls || []; }
  get resourcesFormArray(): FormArray { return this.courseForm.get('resources') as FormArray; }
  get modules(): FormArray { return this.courseForm.get('modules') as FormArray; }

  // Métodos para recursos
  setResources(resources: Array<{type:string; url:string; title?:string}>): void {
    const fa = this.fb.array([] as any[]) as FormArray;
    for(const r of resources){ 
      fa.push(this.fb.group({ type:[r.type], url:[r.url], title:[r.title || ''] })); 
    }
    this.courseForm.setControl('resources', fa);
  }

  removeResource(i: number): void { 
    this.resourcesFormArray.removeAt(i); 
  }

  // Métodos para módulos
  private createModuleGroup(data?: any): FormGroup {
    return this.fb.group({
      title: [data?.title || '', Validators.required],
      lessons: this.fb.array((data?.lessons?.length ? data.lessons : ['']).map((l:string)=> this.fb.control(l, Validators.required)))
    });
  }

  setModules(mods: Array<{ title: string; lessons: string[] }>): void {
    const arr = this.fb.array([]) as FormArray;
    for (const m of mods) arr.push(this.createModuleGroup(m));
    if (mods.length === 0) arr.push(this.createModuleGroup());
    this.courseForm.setControl('modules', arr);
  }

  addModule(): void { 
    this.modules.push(this.createModuleGroup()); 
  }

  removeModule(index: number): void { 
    this.modules.removeAt(index); 
  }

  lessons(moduleIndex: number): FormArray { 
    return this.modules.at(moduleIndex).get('lessons') as FormArray; 
  }

  addLesson(moduleIndex: number): void { 
    this.lessons(moduleIndex).push(this.fb.control('', Validators.required)); 
  }

  removeLesson(moduleIndex: number, lessonIndex: number): void { 
    this.lessons(moduleIndex).removeAt(lessonIndex); 
  }

  // Métodos del diálogo de recurso
  openResourceDialog(): void { 
    this.showResDlg.set(true); 
    this.resKind='pdf'; 
    this.resName=''; 
    this.resUrl=''; 
    this.resFile=undefined; 
  }

  closeResourceDialog(): void { 
    this.showResDlg.set(false); 
  }

  onPickResFile(e: any): void { 
    const f = e.target?.files?.[0] as File|undefined; 
    if(f) { 
      this.resFile = f; 
      this.resName ||= f.name; 
    } 
  }

  async confirmResource(): Promise<void> {
    this.error.set(null);
    const createdAt = Date.now();
    try{
      if(this.resKind === 'link'){
        if(!this.resUrl) throw new Error('URL requerida');
        this.resourcesFormArray.push(this.fb.group({ 
          type:['link'], 
          url:[this.resUrl], 
          title:[this.resName||'Link'], 
          name:[this.resName||'Link'], 
          size:[null], 
          createdAt:[createdAt] 
        }));
      } else {
        const file = this.resFile;
        if(!file) throw new Error('Archivo requerido');
        this.uploading.set(true);
        const up = await this.media.upload(file, 'courses', p => this.progress.set(p));
        const type = guessType(up.contentType);
        this.resourcesFormArray.push(this.fb.group({ 
          type:[type], 
          url:[up.url], 
          title:[this.resName||file.name], 
          name:[file.name], 
          size:[up.size], 
          path:[up.path], 
          createdAt:[createdAt] 
        }));
      }
      this.closeResourceDialog();
    }catch(err:any){
      this.error.set(err?.message || 'Error al añadir recurso');
    }finally{
      this.uploading.set(false);
      this.progress.set(0);
    }
  }

  // Métodos de utilidad
  onTopicsChange(v: string): void {
    const topics = (v || '').split(',').map(x=>x.trim()).filter(Boolean);
    this.courseForm.patchValue({ topics });
  }

  syncSlug(): void { 
    const t = this.courseForm.value.title || ''; 
    this.courseForm.patchValue({ slug: slugify(t) }, {emitEvent:false}); 
  }

  attachMedia(m: any): void {
    this.attached.push(m);
    const current = (this.courseForm.value as any).media || [];
    const type = guessType(m.contentType);
    (this.courseForm.get('media') as any).patchValue([ ...current, { type, url: m.url, title: m.fileName } ]);
    
    // Si es una imagen, actualizar también imageUrl
    if (type === 'image') {
      this.courseForm.patchValue({ imageUrl: m.url });
    }
  }

  // Método principal de guardado
  async save(): Promise<void> {
    try {
      const v: any = this.courseForm.value;
      if(v.publishedAtLocal){ 
        v.publishedAt = new Date(v.publishedAtLocal).getTime(); 
        delete v.publishedAtLocal; 
      }
      
      // Asegurar que se genere el slug si no existe
      if (!v.slug && v.title) {
        v.slug = slugify(v.title);
      }
      
      if(this.id()) {
        await this.courses.update(this.id()!, v);
        this.showNotification.set({type: 'success', message: 'Curso actualizado exitosamente'});
      } else {
        await this.courses.create(v);
        this.showNotification.set({type: 'success', message: 'Curso creado exitosamente'});
      }
      
      // Esperar 2 segundos antes de redirigir para que se vea la notificación
      setTimeout(() => {
        this.router.navigate(['/admin/courses']);
      }, 2000);
    } catch (error: any) {
      this.showNotification.set({type: 'error', message: `Error: ${error.message}`});
    }
  }

  goBack(): void { 
    this.router.navigate(['/admin/courses']); 
  }
}

function guessType(ct: string): string { 
  if(ct?.includes('pdf')) return 'pdf'; 
  if(ct?.includes('image')) return 'image'; 
  if(ct?.includes('video')) return 'video'; 
  return 'file'; 
}

