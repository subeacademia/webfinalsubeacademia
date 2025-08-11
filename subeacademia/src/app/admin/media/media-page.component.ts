import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../core/storage.service';
import { MediaService } from '../../core/data/media.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Media</h1>

    <div class="card p-4 space-y-3">
      <label class="btn">
        Elegir archivos
        <input type="file" multiple class="hidden" (change)="onFiles($event)" [disabled]="busy()">
      </label>
      <div *ngIf="busy()" class="text-sm text-[var(--muted)]">Subiendo… {{progress()}}%</div>
      <div class="w-full h-2 bg-black/10 rounded" *ngIf="busy()">
        <div class="h-2 bg-primary rounded" [style.width.%]="progress()"></div>
      </div>
      <p *ngIf="error()" class="text-red-400 text-sm">{{error()}}</p>
      <div *ngIf="doneUrl()" class="text-sm">Listo: <a class="link" [href]="doneUrl()" target="_blank">Preview</a></div>
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
  private storage = inject(StorageService);
  private mediaService = inject(MediaService);

  items = signal<any[]>([]);
  busy = signal(false);
  progress = signal(0);
  error = signal<string|null>(null);
  doneUrl = signal<string>('');

  constructor(){
    this.mediaService.listRecent().subscribe((v:any)=> this.items.set(v));
  }

  async onFiles(e:any){
    const files: File[] = Array.from(e.target.files || []);
    this.error.set(null);
    if (!files.length) return;

    this.busy.set(true);
    for (const f of files){
      try{
        this.doneUrl.set('');
        await new Promise<void>((resolve, reject) => {
          const sub = this.storage.uploadPublic(f).subscribe({
            next: async (s) => {
              this.progress.set(s.progress);
              if (s.state === 'success' && s.downloadURL && s.path) {
                try {
                  await this.mediaService.recordUpload({
                    name: f.name,
                    path: s.path,
                    url: s.downloadURL,
                    size: f.size,
                    type: f.type,
                  });
                  this.doneUrl.set(s.downloadURL);
                  resolve();
                } catch (e) {
                  reject(e);
                } finally {
                  sub.unsubscribe();
                }
              } else if (s.state === 'error') {
                sub.unsubscribe();
                reject(s.error);
              }
            },
            error: (err) => { sub.unsubscribe(); reject(err); }
          });
        });
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

