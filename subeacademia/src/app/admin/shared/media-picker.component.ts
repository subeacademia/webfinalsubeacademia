import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../core/media/media.service';

@Component({
  standalone: true,
  selector: 'app-media-picker',
  imports: [CommonModule],
  template: `
  <div class="space-y-3">
    <div class="card p-4">
      <label class="btn">
        Elegir archivos
        <input type="file" multiple class="hidden" (change)="onFiles($event)">
      </label>
      <div *ngIf="uploading()" class="text-sm text-[var(--muted)]">Subiendo… {{progress()}}%</div>
      <p *ngIf="error()" class="text-red-400 text-sm">{{error()}}</p>
      <p *ngIf="success()" class="text-green-400 text-sm">{{success()}}</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div *ngFor="let m of items()" class="card p-3">
        <div class="truncate text-sm">{{m.fileName || m.path}}</div>
        <a class="btn mt-2" (click)="select(m)">Usar en este contenido</a>
      </div>
    </div>
  </div>
  `
})
export class MediaPickerComponent {
  private media = inject(MediaService);

  items = signal<any[]>([]);
  uploading = signal(false);
  progress = signal<number>(0);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  @Output() chosen = new EventEmitter<any>();

  constructor(){
    this.media.listAll().subscribe((v:any)=> this.items.set(v));
  }

  async onFiles(e:any){
    const files: File[] = Array.from(e.target.files || []);
    this.error.set(null);
    if (!files.length) return;
    this.uploading.set(true);
    for(const f of files){
      try{
        await this.media.upload(f, 'media', p => this.progress.set(Math.round(p)));
      }catch(err:any){
        console.error(err?.code, err?.message);
        this.error.set((err?.message || 'Error subiendo archivo') + (err?.code ? ` (${err.code})` : ''));
      }finally{
        this.progress.set(0);
      }
    }
    this.uploading.set(false);
    if (!this.error()) {
      this.success.set('Subida completa');
      setTimeout(() => this.success.set(null), 2500);
    }
  }

  select(m:any){ this.chosen.emit(m); }
}

