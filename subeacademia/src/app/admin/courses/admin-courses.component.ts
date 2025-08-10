import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ContentService } from '../../core/services/content.service';
import { Course } from '../../core/models/course.model';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Admin · Courses</h1>
      <button mat-flat-button color="primary" (click)="newCourse()">Nuevo</button>
    </div>

    <section *ngIf="!editingId(); else editTpl" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [ngModel]="querySig()" (ngModelChange)="querySig.set($event)" placeholder="título, slug, tema" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Idioma</mat-label>
          <mat-select [(ngModel)]="filterLang" (selectionChange)="onFilterChange()">
            <mat-option value="es">ES</mat-option>
            <mat-option value="pt">PT</mat-option>
            <mat-option value="en">EN</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="onFilterChange()">
            <mat-option value="draft">Borrador</mat-option>
            <mat-option value="published">Publicado</mat-option>
            <mat-option value="scheduled">Programado</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Página</mat-label>
          <input matInput type="number" [ngModel]="pageSig()" (ngModelChange)="pageSig.set($event)" min="1" />
        </mat-form-field>
      </div>

      <div class="border rounded divide-y">
        <div *ngFor="let c of paged()" class="p-3 flex items-center justify-between">
          <div>
            <div class="font-medium">{{ c.title }}</div>
            <div class="text-xs text-gray-500">{{ c.lang }} · {{ c.status }} · {{ c.slug }}</div>
          </div>
          <div class="space-x-2">
            <button mat-stroked-button color="primary" (click)="startEdit(c)">Editar</button>
            <button mat-stroked-button color="warn" (click)="remove(c)">Eliminar</button>
          </div>
        </div>
      </div>
    </section>

    <ng-template #editTpl>
      <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Título</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Idioma</mat-label>
            <mat-select formControlName="lang">
              <mat-option value="es">ES</mat-option>
              <mat-option value="pt">PT</mat-option>
              <mat-option value="en">EN</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Resumen</mat-label>
            <textarea matInput rows="4" formControlName="summary"></textarea>
          </mat-form-field>
          <div class="flex gap-2">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Slug</mat-label>
              <input matInput formControlName="slug" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Portada URL</mat-label>
              <input matInput formControlName="coverUrl" />
            </mat-form-field>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <mat-form-field appearance="outline">
              <mat-label>Nivel</mat-label>
              <mat-select formControlName="level">
                <mat-option value="intro">Intro</mat-option>
                <mat-option value="intermedio">Intermedio</mat-option>
                <mat-option value="avanzado">Avanzado</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Duración (h)</mat-label>
              <input matInput type="number" formControlName="durationHours" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Temas (coma)</mat-label>
            <input matInput [value]="form.value.topics?.join(', ') || ''" (change)="onTopicsChange($any($event.target).value)" />
          </mat-form-field>
          <div class="grid grid-cols-2 gap-3">
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="status">
                <mat-option value="draft">Borrador</mat-option>
                <mat-option value="published">Publicado</mat-option>
                <mat-option value="scheduled">Programado</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Precio (opcional)</mat-label>
              <input matInput type="number" formControlName="price" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fecha publicación (epoch ms)</mat-label>
              <input matInput type="number" formControlName="publishedAt" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Programar en (epoch ms)</mat-label>
              <input matInput type="number" formControlName="scheduledAt" />
            </mat-form-field>
          </div>
          <div class="flex gap-2">
            <button mat-flat-button color="primary" (click)="saveDraft()" type="button">Guardar borrador</button>
            <button mat-stroked-button color="accent" (click)="publish()" type="button">Publicar</button>
            <button mat-stroked-button (click)="schedule()" type="button">Programar</button>
            <button mat-button type="button" (click)="cancelEdit()">Cancelar</button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="font-medium">Recursos</div>
            <button mat-stroked-button type="button" (click)="addResource()">Añadir recurso</button>
          </div>
          <div formArrayName="resources" class="space-y-2">
            <div *ngFor="let group of resources().controls; let i = index" [formGroupName]="i" class="grid grid-cols-3 gap-2 items-center">
              <mat-form-field appearance="outline">
                <mat-label>Tipo</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="video">Video</mat-option>
                  <mat-option value="pdf">PDF</mat-option>
                  <mat-option value="zip">ZIP</mat-option>
                  <mat-option value="image">Imagen</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>URL</mat-label>
                <input matInput formControlName="url" />
              </mat-form-field>
              <div class="flex gap-2 items-center">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Título</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>
                <button mat-icon-button color="warn" type="button" (click)="removeResource(i)"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCoursesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly content = inject(ContentService);

  filterLang: 'es' | 'pt' | 'en' = 'es';
  filterStatus: 'draft' | 'published' | 'scheduled' = 'draft';
  querySig = signal('');
  pageSig = signal(1);
  pageSize = 10;

  courses = signal<Course[]>([]);
  filtered = computed(() => {
    const q = this.querySig().toLowerCase().trim();
    return this.courses().filter(c => {
      const matchesQ = !q || c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.topics?.some(t => t.toLowerCase().includes(q));
      return matchesQ;
    });
  });
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  paged = computed(() => {
    const start = (Math.max(1, this.pageSig()) - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  form: any = this.fb.group({
    id: [''],
    lang: ['es', Validators.required],
    title: ['', Validators.required],
    slug: [''],
    summary: [''],
    level: ['intro'],
    durationHours: [null as number | null],
    topics: [[] as string[]],
    coverUrl: [''],
    resources: this.fb.array([] as any[]),
    price: [null as number | null],
    publishedAt: [Date.now()],
    updatedAt: [null as number | null],
    status: ['draft' as 'draft' | 'published' | 'scheduled'],
    scheduledAt: [null as number | null],
    seo: this.fb.group({
      title: [''],
      description: [''],
      ogImage: ['']
    })
  });

  editingId = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.load();
    });
  }

  load() {
    this.content.getCoursesByLangAndStatus(this.filterLang, this.filterStatus, 500).subscribe(list => {
      this.courses.set(list);
      this.pageSig.set(1);
    });
  }

  onFilterChange() { this.load(); }

  newCourse() {
    this.editingId.set('new');
    this.form.reset({
      id: crypto.randomUUID(),
      lang: this.filterLang,
      title: '',
      slug: '',
      summary: '',
      level: 'intro',
      durationHours: null,
      topics: [],
      coverUrl: '',
      resources: [],
      price: null,
      publishedAt: Date.now(),
      updatedAt: null,
      status: 'draft',
      scheduledAt: null,
      seo: { title: '', description: '', ogImage: '' }
    });
    this.setResources([]);
  }

  setResources(resources: Array<{type: any; url: string; title?: string}>) {
    const fa = this.fb.array([] as any[]) as unknown as FormArray<any>;
    for (const r of resources) {
      const group = this.fb.group({ type: [r.type || 'video'], url: [r.url || ''], title: [r.title || ''] }) as any;
      fa.push(group);
    }
    this.form.setControl('resources', fa);
  }

  resources(): FormArray<any> { return this.form.get('resources') as FormArray<any>; }

  addResource() {
    const group = this.fb.group({ type: ['video'], url: [''], title: [''] }) as any;
    this.resources().push(group);
  }

  removeResource(index: number) {
    this.resources().removeAt(index);
  }

  startEdit(c: Course) {
    this.editingId.set(c.id);
    this.form.reset({ ...c, resources: [] });
    this.setResources(c.resources || []);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  onTopicsChange(value: string | null | undefined) {
    const topics = (value || '')
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    this.form.patchValue({ topics });
  }

  async saveDraft() {
    const value = this.form.getRawValue() as unknown as Course;
    value.status = 'draft';
    value.updatedAt = Date.now();
    if (this.editingId() === 'new') {
      await this.content.createCourse(value);
    } else {
      await this.content.updateCourse(value.id, value);
    }
    this.cancelEdit();
    this.load();
  }

  async publish() {
    const value = this.form.getRawValue() as unknown as Course;
    value.status = 'published';
    value.publishedAt = Date.now();
    value.updatedAt = Date.now();
    if (this.editingId() === 'new') {
      await this.content.createCourse(value);
    } else {
      await this.content.updateCourse(value.id, value);
    }
    this.cancelEdit();
    this.load();
  }

  async schedule() {
    const value = this.form.getRawValue() as unknown as Course;
    value.status = 'scheduled';
    value.updatedAt = Date.now();
    if (!value.scheduledAt) value.scheduledAt = Date.now() + 24 * 60 * 60 * 1000;
    if (this.editingId() === 'new') {
      await this.content.createCourse(value);
    } else {
      await this.content.updateCourse(value.id, value);
    }
    this.cancelEdit();
    this.load();
  }

  async remove(c: Course) {
    if (!confirm('¿Eliminar este curso?')) return;
    await this.content.deleteCourse(c.id);
    this.load();
  }
}

