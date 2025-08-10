import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PostsService } from '../../core/data/posts.service';
import { RichEditorComponent } from '../../shared/rich-editor/rich-editor.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

function slugify(s:string){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

@Component({
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, RouterLink, RichEditorComponent],
  template: `
  <div class="max-w-3xl mx-auto space-y-4">
    <h1 class="text-2xl font-semibold">{{id() ? 'Editar Post' : 'Nuevo Post'}}</h1>
    <form [formGroup]="form" (ngSubmit)="save()" class="card p-4 space-y-4">
      <div *ngIf="translationsReady()" class="text-xs inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-50 text-emerald-700">
        Traducciones listas ✓
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">Idioma
          <select formControlName="lang" class="w-full">
            <option value="es">es</option><option value="en">en</option><option value="pt">pt</option>
          </select>
        </label>
        <label class="block">Título
          <input class="w-full" formControlName="title" (input)="syncSlug()">
        </label>
      </div>
      <label class="block">Slug
        <input class="w-full" formControlName="slug">
      </label>
      <label class="block">Resumen
        <textarea class="w-full" rows="3" formControlName="summary"></textarea>
      </label>
      <label class="block">Contenido</label>
      <app-rich-editor formControlName="content"></app-rich-editor>
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">Estado
          <select class="w-full" formControlName="status">
            <option>draft</option><option>published</option><option>scheduled</option>
          </select>
        </label>
        <label class="block">Fecha publicación
          <input type="datetime-local" class="w-full" formControlName="publishedAtLocal">
        </label>
      </div>
      <div class="flex gap-3 items-center">
        <button class="btn btn-primary" type="submit">Guardar</button>
        <button type="button" class="btn" (click)="openPreview()">Previsualizar</button>
        <a class="btn" routerLink="/admin/posts">Volver</a>
      </div>
      <div *ngIf="showPreview()" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white max-w-3xl w-full rounded shadow-lg overflow-auto max-h-[80vh]">
          <div class="flex items-center justify-between p-3 border-b">
            <div class="font-medium">Previsualización</div>
            <button class="btn" type="button" (click)="closePreview()">Cerrar</button>
          </div>
          <div class="p-4 prose max-w-none" [innerHTML]="previewHtml"></div>
        </div>
      </div>
    </form>
  </div>
  `
})
export class PostEditComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private posts = inject(PostsService);
  private sanitizer = inject(DomSanitizer);

  id = signal<string|null>(null);
  form = this.fb.group({
    lang: ['es', Validators.required],
    title: ['', Validators.required],
    slug: [''],
    summary: [''],
    content: [''],
    status: ['published'],
    publishedAt: [Date.now()],
    publishedAtLocal: ['']
  });

  constructor(){
    const maybeId = this.route.snapshot.paramMap.get('id');
    if (maybeId) {
      this.id.set(maybeId);
      this.posts.get(maybeId).subscribe(p => {
        if (p) this.form.patchValue({
          ...p,
          publishedAtLocal: new Date(p.publishedAt || Date.now()).toISOString().slice(0,16)
        });
        this.translationsReady.set(!!(p as any)?.translations?.en && !!(p as any)?.translations?.pt);
      });
    }
  }

  syncSlug(){ this.form.patchValue({ slug: slugify(this.form.value.title || '') }, {emitEvent:false}); }

  async save(){
    const v:any = this.form.value;
    if (v.status === 'published') {
      if (!v.title?.trim() || !v.slug?.trim() || !v.summary?.trim() || !v.content?.trim()) {
        alert('Para publicar, completa Título, Slug, Resumen y Contenido.');
        return;
      }
    }
    if (v.publishedAtLocal) v.publishedAt = new Date(v.publishedAtLocal).getTime();
    delete v.publishedAtLocal;

    if (this.id()) await this.posts.update(this.id()!, v);
    else await this.posts.create(v);

    this.router.navigate(['/admin/posts']);
  }

  translationsReady = signal(false);

  showPreview = signal(false);
  previewHtml: SafeHtml = '';
  openPreview(){
    const raw = this.form.value.content || '';
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(raw);
    this.showPreview.set(true);
  }
  closePreview(){ this.showPreview.set(false); }
}

