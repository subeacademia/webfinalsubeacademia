import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ContentService } from '../../core/services/content.service';
import { Post } from '../../core/models/post.model';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatChipsModule, MatIconModule, MarkdownModule],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Admin · Posts</h1>
      <button mat-flat-button color="primary" (click)="newPost()">Nuevo</button>
    </div>

    <section *ngIf="!editingId(); else editTpl" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput [ngModel]="querySig()" (ngModelChange)="querySig.set($event)" placeholder="título, slug, tag" />
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
        <div *ngFor="let p of paged()" class="p-3 flex items-center justify-between">
          <div>
            <div class="font-medium">{{ p.title }}</div>
            <div class="text-xs text-gray-500">{{ p.lang }} · {{ p.status }} · {{ p.slug }}</div>
          </div>
          <div class="space-x-2">
            <button mat-stroked-button color="primary" (click)="startEdit(p)">Editar</button>
            <button mat-stroked-button color="warn" (click)="remove(p)">Eliminar</button>
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

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Tags (separados por coma)</mat-label>
            <input matInput [value]="form.value.tags?.join(', ') || ''" (change)="onTagsChange($any($event.target).value)" />
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
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contenido (Markdown)</mat-label>
            <textarea matInput rows="16" formControlName="content"></textarea>
          </mat-form-field>
          <div class="flex items-center gap-2">
            <input type="file" (change)="onFile($event)" />
            <button mat-stroked-button type="button" (click)="insertMediaUrl()">Insertar URL</button>
          </div>
          <div class="border rounded p-2">
            <div class="text-sm font-medium mb-2">Vista previa</div>
            <markdown [data]="form.value.content || ''"></markdown>
          </div>
        </div>
      </form>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPostsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly content = inject(ContentService);

  filterLang: 'es' | 'pt' | 'en' = 'es';
  filterStatus: 'draft' | 'published' | 'scheduled' = 'draft';
  querySig = signal('');
  pageSig = signal(1);
  pageSize = 10;

  posts = signal<Post[]>([]);
  filtered = computed(() => {
    const q = this.querySig().toLowerCase().trim();
    return this.posts().filter(p => {
      const matchesQ = !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
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
    content: [''],
    categories: [[] as string[]],
    tags: [[] as string[]],
    coverUrl: [''],
    media: [[] as any[]],
    authors: [[] as any[]],
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
    this.content.getPostsByLangAndStatus(this.filterLang, this.filterStatus, 500).subscribe(list => {
      this.posts.set(list);
      this.pageSig.set(1);
    });
  }

  onFilterChange() { this.load(); }

  newPost() {
    this.editingId.set('new');
    this.form.reset({
      id: crypto.randomUUID(),
      lang: this.filterLang,
      title: '',
      slug: '',
      summary: '',
      content: '',
      categories: [],
      tags: [],
      coverUrl: '',
      media: [],
      authors: [],
      publishedAt: Date.now(),
      updatedAt: null,
      status: 'draft',
      scheduledAt: null,
      seo: { title: '', description: '', ogImage: '' }
    });
  }

  startEdit(p: Post) {
    this.editingId.set(p.id);
    this.form.reset({ ...p });
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  onTagsChange(value: string | null | undefined) {
    const tags = (value || '')
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
    this.form.patchValue({ tags });
  }

  async saveDraft() {
    const value = this.form.getRawValue() as unknown as Post;
    value.status = 'draft';
    value.updatedAt = Date.now();
    if (this.editingId() === 'new') {
      await this.content.createPost(value);
    } else {
      await this.content.updatePost(value.id, value);
    }
    this.cancelEdit();
    this.load();
  }

  async publish() {
    const value = this.form.getRawValue() as unknown as Post;
    value.status = 'published';
    value.publishedAt = Date.now();
    value.updatedAt = Date.now();
    if (this.editingId() === 'new') {
      await this.content.createPost(value);
    } else {
      await this.content.updatePost(value.id, value);
    }
    this.cancelEdit();
    this.load();
  }

  async schedule() {
    const value = this.form.getRawValue() as unknown as Post;
    value.status = 'scheduled';
    value.updatedAt = Date.now();
    if (!value.scheduledAt) value.scheduledAt = Date.now() + 24 * 60 * 60 * 1000;
    if (this.editingId() === 'new') {
      await this.content.createPost(value);
    } else {
      await this.content.updatePost(value.id, value);
    }
    this.cancelEdit();
    this.load();
  }

  async remove(p: Post) {
    if (!confirm('¿Eliminar este post?')) return;
    await this.content.deletePost(p.id);
    this.load();
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Simplemente subimos a cualquier servicio externo manual y generamos URL
    // Aquí podrías abrir la sección Media; por simplicidad pedimos URL manual si no hay upload
    const reader = new FileReader();
    reader.onload = () => {
      // No subimos; solo demostración de inserción. En producción, usar Media admin para subir y pegar URL
      const url = prompt('Pega la URL pública de la media (o usa Admin · Media para subir):');
      if (url) {
        const current = this.form.value.content || '';
        this.form.patchValue({ content: current + `\n\n![media](${url})\n` });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  insertMediaUrl() {
    const url = prompt('URL de media a insertar en el contenido:');
    if (url) {
      const current = this.form.value.content || '';
      this.form.patchValue({ content: current + `\n\n![media](${url})\n` });
    }
  }
}

