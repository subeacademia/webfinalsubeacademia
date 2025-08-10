import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../core/services/media.service';
import { Firestore, collection, collectionData, deleteDoc, doc, orderBy, query } from '@angular/fire/firestore';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Media</h1>
    <div class="card p-6 space-y-2">
      <input type="file" multiple (change)="onFiles($event)">
      <div *ngIf="busy()" class="text-sm text-[var(--muted)]">Subiendo… {{progress()}}%</div>
      <p *ngIf="error()" class="text-sm text-red-500">{{error()}}</p>
      <p *ngIf="success()" class="text-sm text-green-600">{{success()}}</p>
    </div>

    <div class="card p-4">
      <input class="w-full" placeholder="Buscar por nombre" [value]="query()" (input)="query.set(($any($event.target).value || '').toString())" />
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div *ngFor="let m of filtered()" class="card p-3 space-y-2">
        <div class="text-sm truncate" title="{{m.fileName || m.path}}">{{m.fileName || m.path}}</div>
        <div class="flex gap-2">
          <a class="btn" [href]="m.url" target="_blank">Abrir</a>
          <button class="btn" type="button" (click)="copy(m.url)">Copiar URL</button>
          <button class="btn btn-danger" type="button" (click)="remove(m)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class MediaPageComponent{
  private media = inject(MediaService);
  private db = inject(Firestore);
  items = signal<any[]>([]);
  busy = signal(false);
  progress = signal<number>(0);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  query = signal<string>('');
  filtered = computed(() => {
    const q = (this.query() || '').toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(i => (i.fileName || i.path || '').toLowerCase().includes(q));
  });

  constructor(){
    const col = collection(this.db, 'media');
    collectionData(query(col, orderBy('createdAt','desc')), {idField:'id'}).subscribe((v:any)=> this.items.set(v));
  }

  async onFiles(e:any){
    const files:File[] = Array.from(e.target.files || []);
    if (!files.length) return;
    this.busy.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      for(const f of files){
        await this.media.uploadWithProgress(f, { convertToWebP: true }, p => this.progress.set(Math.round(p)));
      }
      this.success.set('Subida completa');
      setTimeout(() => this.success.set(null), 2500);
    } catch(err:any){
      const code = err?.code ? ` (${err.code})` : '';
      this.error.set((err?.message || 'Error subiendo archivo') + code);
    } finally {
      this.busy.set(false);
      this.progress.set(0);
    }
  }

  async copy(url:string){
    try{
      await navigator.clipboard.writeText(url);
      this.success.set('URL copiada');
      setTimeout(() => this.success.set(null), 1500);
    }catch{
      this.error.set('No se pudo copiar');
      setTimeout(() => this.error.set(null), 2000);
    }
  }

  async remove(m: any){
    if(!m?.path || !m?.id) return;
    try{
      await this.media.delete(m.path);
      await deleteDoc(doc(this.db, 'media', m.id));
      this.success.set('Eliminado');
      setTimeout(() => this.success.set(null), 1500);
    }catch(err:any){
      const code = err?.code ? ` (${err.code})` : '';
      this.error.set((err?.message || 'Error eliminando archivo') + code);
      setTimeout(() => this.error.set(null), 2500);
    }
  }
}

