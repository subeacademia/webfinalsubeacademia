import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/storage.service';
import { MediaService } from '../../core/data/media.service';
import { FormsModule } from '@angular/forms';
import { MediaItem } from '../../core/models/media.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Media</h1>

    <div class="card p-4 space-y-3">
      <label class="btn">
        Elegir archivos
        <input type="file" multiple class="hidden" (change)="onFiles($event)" [disabled]="busy()">
      </label>
      <div class="grid sm:grid-cols-2 gap-3">
        <label class="text-xs grid gap-1">
          <span class="text-[var(--muted)]">Categoría</span>
          <select class="input" [(ngModel)]="category">
            <option value="media">Media</option>
            <option value="documents">Documentos</option>
            <option value="logos">Logos</option>
            <option value="backgrounds">Fondos</option>
            <option value="reports">Reportes</option>
            <option value="misc">Otros</option>
          </select>
        </label>
        <label class="text-xs grid gap-1">
          <span class="text-[var(--muted)]">Etiquetas (coma separadas)</span>
          <input class="input" [(ngModel)]="tagsText" placeholder="marketing, pdf, imagen" />
        </label>
      </div>
      <div *ngIf="busy()" class="text-sm text-[var(--muted)]">Subiendo… {{progress()}}%</div>
      <div class="w-full h-2 bg-black/10 rounded" *ngIf="busy()">
        <div class="h-2 bg-primary rounded" [style.width.%]="progress()"></div>
      </div>
      <p *ngIf="error()" class="text-red-400 text-sm">{{error()}}</p>
      <div *ngIf="doneUrl()" class="text-sm">Listo: <a class="link" [href]="doneUrl()" target="_blank">Preview</a></div>
    </div>

    <div class="card p-3">
      <div class="flex flex-wrap gap-2 items-center mb-3">
        <input class="input max-w-[280px]" placeholder="Buscar..." [(ngModel)]="search" (input)="applyFilter()" />
        <select class="input max-w-[200px]" [(ngModel)]="filterCategory" (change)="applyFilter()">
          <option value="">Todas las categorías</option>
          <option value="media">Media</option>
          <option value="documents">Documentos</option>
          <option value="logos">Logos</option>
          <option value="backgrounds">Fondos</option>
          <option value="reports">Reportes</option>
          <option value="misc">Otros</option>
        </select>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let m of paged" class="card p-3">
          <div class="text-sm truncate" title="{{m.name}}">{{m.name}}</div>
          <div class="text-xs text-[var(--muted)]">{{ (m.size/1024/1024)|number:'1.2-2' }} MB • {{m.type}}</div>
          <div class="flex gap-2 mt-2">
            <a class="btn" [href]="m.url" target="_blank">Abrir</a>
            <button class="btn btn-secondary" (click)="startEdit(m)">Editar</button>
            <button class="btn btn-danger" (click)="remove(m)">Eliminar</button>
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-2 mt-4 text-sm">
        <button class="btn" (click)="prevPage()" [disabled]="page===1">Anterior</button>
        <span>Página {{page}}</span>
        <button class="btn" (click)="nextPage()" [disabled]="(page*pageSize) >= filtered.length">Siguiente</button>
      </div>
    </div>

    <div *ngIf="editing" class="fixed inset-0 z-50 grid place-items-center">
      <div class="absolute inset-0 bg-black/50" (click)="cancelEdit()"></div>
      <div class="relative bg-[var(--panel)] p-4 rounded-lg w-[min(520px,90vw)] max-h-[85vh] border border-white/10 overflow-y-auto">
        <h2 class="text-lg font-semibold mb-4">Editar media</h2>
        <div class="grid gap-3">
          <label class="grid gap-1 text-xs">
            <span class="text-[var(--muted)]">Nombre</span>
            <input class="input" [(ngModel)]="form.name" />
          </label>
          <label class="grid gap-1 text-xs">
            <span class="text-[var(--muted)]">Descripción</span>
            <textarea rows="3" class="input" [(ngModel)]="form.description"></textarea>
          </label>
          <label class="grid gap-1 text-xs">
            <span class="text-[var(--muted)]">Categoría</span>
            <select class="input" [(ngModel)]="form.category">
              <option value="media">Media</option>
              <option value="documents">Documentos</option>
              <option value="logos">Logos</option>
              <option value="backgrounds">Fondos</option>
              <option value="reports">Reportes</option>
              <option value="misc">Otros</option>
            </select>
          </label>
          <label class="grid gap-1 text-xs">
            <span class="text-[var(--muted)]">Etiquetas (coma separadas)</span>
            <input class="input" [(ngModel)]="tagsEdit" />
          </label>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="btn" (click)="cancelEdit()">Cancelar</button>
          <button class="btn btn-primary" (click)="saveEdit()">Guardar</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class MediaPageComponent{
  private storage = inject(StorageService);
  private mediaService = inject(MediaService);

  items: MediaItem[] = [];
  filtered: MediaItem[] = [];
  paged: MediaItem[] = [];
  page = 1; pageSize = 18;
  search = '';
  filterCategory = '';
  busy = signal(false);
  progress = signal(0);
  error = signal<string|null>(null);
  doneUrl = signal<string>('');
  category: string = 'media';
  tagsText = '';

  editing: MediaItem | null = null;
  form: Partial<MediaItem> = {};
  tagsEdit = '';

  constructor(){
    this.mediaService.listRecent().subscribe(v => {
      this.items = v;
      this.applyFilter();
    });
  }

  async onFiles(e:any){
    const files: File[] = Array.from(e.target.files || []);
    this.error.set(null);
    if (!files.length) return;

    this.busy.set(true);
    for (const f of files){
      try{
        this.doneUrl.set('');
        const result = await this.storage.uploadPublicCategory(this.category || 'media', f);
        await this.mediaService.recordUpload({
          name: f.name,
          path: result.path,
          url: result.url,
          size: f.size,
          type: f.type,
          category: this.category,
          tags: this.tagsText.split(',').map(t=>t.trim()).filter(Boolean)
        });
        this.doneUrl.set(result.url);
        this.progress.set(100);
      }catch(err:any){
        console.error(err?.code, err?.message);
        this.error.set(err?.message || 'Error al subir');
      }finally{
        this.progress.set(0);
      }
    }
    this.busy.set(false);
    this.applyFilter();
  }

  applyFilter(){
    const term = (this.search||'').toLowerCase().trim();
    this.filtered = this.items.filter(m => {
      const matchesTerm = term ? (m.name||'').toLowerCase().includes(term) : true;
      const matchesCat = this.filterCategory ? (m.category||'') === this.filterCategory : true;
      return matchesTerm && matchesCat;
    });
    this.page = 1; this.slicePage();
  }

  slicePage(){
    const start = (this.page-1)*this.pageSize; const end = start + this.pageSize;
    this.paged = this.filtered.slice(start, end);
  }
  nextPage(){ this.page++; this.slicePage(); }
  prevPage(){ this.page = Math.max(1, this.page-1); this.slicePage(); }

  startEdit(item: MediaItem){
    this.editing = item;
    this.form = { id: item.id, name: item.name, description: item.description || '', category: item.category || this.category } as any;
    this.tagsEdit = (item.tags||[]).join(', ');
  }
  cancelEdit(){ this.editing = null; }
  async saveEdit(){
    if (!this.editing?.id) { this.cancelEdit(); return; }
    const payload: Partial<MediaItem> = {
      name: this.form.name || this.editing.name,
      description: this.form.description || '',
      category: this.form.category || this.editing.category,
      tags: this.tagsEdit.split(',').map(t=>t.trim()).filter(Boolean)
    };
    await this.mediaService.update(this.editing.id, payload);
    this.cancelEdit();
  }
  async remove(item: MediaItem){
    if (!confirm('¿Eliminar este archivo?')) return;
    await this.mediaService.remove(item);
  }
}

