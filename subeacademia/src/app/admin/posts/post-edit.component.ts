import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PostsService } from '../../core/data/posts.service';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { MediaPickerComponent } from '../shared/media-picker.component';

function slugify(s:string){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

@Component({
  standalone:true,
  imports:[CommonModule, ReactiveFormsModule, MarkdownModule, MediaPickerComponent],
  template:`
  <div class="max-w-3xl mx-auto space-y-4">
    <h1 class="text-2xl font-semibold">{{id()? 'Editar Post' : 'Nuevo Post'}}</h1>
    <form [formGroup]="form" (ngSubmit)="save()" class="card p-4 space-y-4 max-w-full">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">Idioma
          <select class="w-full" formControlName="lang">
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
      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">Estado
          <select class="w-full" formControlName="status">
            <option>draft</option><option>published</option><option>scheduled</option>
          </select>
        </label>
        <label class="block">Fecha publicación
          <input class="w-full" type="datetime-local" formControlName="publishedAtLocal">
        </label>
      </div>

      <label class="block">Contenido (Markdown)
        <textarea class="w-full" rows="10" formControlName="content"></textarea>
      </label>

      <div class="grid md:grid-cols-2 gap-4">
        <button class="btn btn-primary" type="submit">Guardar</button>
        <button class="btn" type="button" (click)="goBack()">Volver</button>
      </div>
    </form>

    <div class="card p-4">
      <h2 class="text-xl font-semibold mb-2">Preview</h2>
      <markdown [data]="form.value.content || ''"></markdown>
    </div>

  <div class="card p-4">
    <h2 class="text-xl font-semibold mb-2">Media</h2>
    <app-media-picker (chosen)="attachMedia($event)"></app-media-picker>

    <div class="mt-3">
      <h3 class="font-medium mb-2">Adjuntos</h3>
      <div class="grid gap-2">
        <div *ngFor="let m of attached" class="flex items-center justify-between text-sm">
          <span class="truncate">{{m.fileName || m.path}}</span>
          <a class="btn" [href]="m.url" target="_blank">Ver</a>
        </div>
      </div>
    </div>
  </div>
  </div>
  `
})
export class PostEditComponent{
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private posts = inject(PostsService);

  id = signal<string | null>(null);

  form = this.fb.group({
    lang: ['es', Validators.required],
    title: ['', Validators.required],
    slug: [''],
    summary: [''],
    content: [''],
    media: this.fb.array([] as any[]),
    status: ['draft'],
    publishedAt: [Date.now()],
    publishedAtLocal: ['']
  });

  constructor(){
    const id = this.route.snapshot.paramMap.get('id');
    if(id){ this.id.set(id); this.posts.get(id).subscribe(p=>{ if(p){ this.form.patchValue({...p, publishedAtLocal: new Date((p as any).publishedAt).toISOString().slice(0,16)}); } }); }
  }

  syncSlug(){ const t = this.form.value.title || ''; this.form.patchValue({ slug: slugify(t as string) }, {emitEvent:false}); }

  async save(){
    const v:any = this.form.value;
    if(v.publishedAtLocal){ v.publishedAt = new Date(v.publishedAtLocal).getTime(); delete v.publishedAtLocal; }
    if(this.id()) await this.posts.update(this.id()!, v); else await this.posts.create(v);
    this.router.navigate(['/admin/posts']);
  }

  goBack(){ this.router.navigate(['/admin/posts']); }

  attached: any[] = [];
  attachMedia(m:any){
    this.attached.push(m);
    const current = (this.form.value as any).media || [];
    const type = guessType(m.contentType);
    (this.form.get('media') as any).patchValue([ ...current, { type, url: m.url, title: m.fileName } ]);
  }
}

function guessType(ct:string){ if(ct?.includes('pdf')) return 'pdf'; if(ct?.includes('image')) return 'image'; if(ct?.includes('video')) return 'video'; return 'file'; }

