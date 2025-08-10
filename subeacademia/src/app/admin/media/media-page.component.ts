import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { MediaService } from '../../core/media/media.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Media</h1>

    <div class="card p-4 space-y-2">
      <label class="btn">
        Elegir archivos
        <input type="file" multiple class="hidden" (change)="onFiles($event)">
      </label>
      <div *ngIf="busy()" class="text-sm text-[var(--muted)]">Subiendo… {{progress()}}%</div>
      <p *ngIf="error()" class="text-red-400 text-sm">{{error()}}</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div *ngFor="let m of items()" class="card p-3">
        <div class="text-sm truncate">{{m.fileName || m.path}}</div>
        <div class="text-xs text-[var(--muted)]">{{ (m.size/1024/1024)|number:'1.2-2' }} MB • {{m.contentType}}</div>
        <a class="btn mt-2" [href]="m.url" target="_blank">Abrir</a>
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
  progress = signal(0);
  error = signal<string|null>(null);

  constructor(){
    const col = collection(this.db, 'media');
    collectionData(query(col, orderBy('createdAt','desc')), {idField:'id'})
      .subscribe((v:any)=> this.items.set(v));
  }

  async onFiles(e:any){
    const files: File[] = Array.from(e.target.files || []);
    this.error.set(null);
    if (!files.length) return;

    this.busy.set(true);
    for (const f of files){
      try{
        await this.media.upload(f, 'media', p => this.progress.set(p));
      }catch(err:any){
        console.error(err?.code, err?.message);
        this.error.set(err?.message || 'Error al subir');
      }finally{
        this.progress.set(0);
      }
    }
    this.busy.set(false);
  }
}

