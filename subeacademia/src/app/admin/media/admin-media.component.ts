import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MediaService } from '../../core/media/media.service';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, limit, orderBy, query } from '@angular/fire/firestore';
import { Storage, ref as storageRef, listAll, getDownloadURL } from '@angular/fire/storage';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthService } from '../../core/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Admin · Media</h1>
      <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="convertWebp" /> Convertir a WebP</label>
    </div>

    <ng-container *ngIf="(isAdmin$|async) as isAdmin">
      <div
        class="border-2 border-dashed rounded p-6 text-center bg-gray-50"
        [class.opacity-50]="!isAdmin"
        (dragover)="isAdmin && onDragOver($event)"
        (drop)="isAdmin && onDrop($event)"
      >
        Arrastra y suelta archivos aquí o
        <input type="file" multiple (change)="onFilePick($event)" class="block mx-auto mt-2" [disabled]="!isAdmin" />
        <div class="text-xs text-red-600 mt-2" *ngIf="!isAdmin">Debes ser administrador para subir archivos.</div>
      </div>
    </ng-container>

    <div class="mt-6 space-y-3" *ngIf="queue().length">
      <div *ngFor="let q of queue()" class="border rounded p-3">
        <div class="text-sm">{{ q.file.name }}</div>
        <mat-progress-bar mode="determinate" [value]="q.progress"></mat-progress-bar>
        <div class="text-xs text-muted mt-1">
          <ng-container [ngSwitch]="q.state">
            <span *ngSwitchCase="'running'">Subiendo… ({{ q.progress }}%)</span>
            <span *ngSwitchCase="'success'" class="text-green-700">Completado</span>
            <span *ngSwitchCase="'error'" class="text-red-700">Error</span>
            <span *ngSwitchDefault>{{ q.progress }}%</span>
          </ng-container>
        </div>
      </div>
      <div class="flex gap-2">
        <button mat-flat-button color="primary" (click)="startUpload()" [disabled]="uploading()">Subir</button>
        <button mat-button (click)="clearQueue()" [disabled]="uploading()">Limpiar</button>
      </div>
    </div>

    <div class="mt-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="font-medium">Últimos archivos</div>
        <input class="border rounded px-2 py-1 text-sm ui-input" placeholder="Buscar por nombre" [(ngModel)]="search" (input)="applyFilter()" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div *ngFor="let m of paged()" class="border rounded p-2 text-xs">
          <div class="font-medium break-all">{{ m.name }}</div>
          <div class="text-muted break-all">
            <a [href]="m.url" target="_blank">{{ m.url }}</a>
          </div>
          <div class="flex gap-2 mt-2">
            <button mat-stroked-button color="primary" (click)="copy(m.url)">Copiar URL</button>
          </div>
        </div>
      </div>
      <div class="flex justify-center gap-2 mt-4 text-sm">
        <button mat-button (click)="prevPage()" [disabled]="page() === 1">Anterior</button>
        <span>Página {{ page() }}</span>
        <button mat-button (click)="nextPage()" [disabled]="(page()*pageSize) >= filtered().length">Siguiente</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMediaComponent {
  private readonly media = inject(MediaService);
  private readonly db = inject(Firestore);
  private readonly clipboard = inject(Clipboard);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(Storage);

  convertWebp = true;
  uploading = signal(false);
  queue = signal<Array<{ file: File; progress: number; state: 'idle'|'running'|'success'|'error' }>>([]);
  uploaded = signal<Array<{ name: string; url: string }>>([]);
  isAdmin$ = this.auth.isAdmin$;

  // listado
  items = signal<any[]>([]);
  filtered = signal<any[]>([]);
  paged = signal<any[]>([]);
  page = signal<number>(1);
  pageSize = 20;
  search = '';

  onDragOver(ev: DragEvent) { ev.preventDefault(); }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    const files = Array.from(ev.dataTransfer?.files || []);
    this.addToQueue(files);
  }

  onFilePick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.addToQueue(files);
    input.value = '';
  }

  addToQueue(files: File[]) {
    const current = this.queue();
    this.queue.set([...current, ...files.map(f => ({ file: f, progress: 0, state: 'idle' as const }))]);
  }

  clearQueue() { this.queue.set([]); }

  async startUpload() {
    if (this.uploading()) return;
    this.uploading.set(true);
    for (const entry of this.queue()) {
      await new Promise<void>((resolve) => {
        this.media.uploadPublic(entry.file).subscribe({
          next: (v) => {
            entry.progress = v.progress;
            entry.state = v.state as any;
            this.queue.set([...this.queue()]);
          },
          error: (err) => {
            console.error('Error subiendo', err);
            entry.state = 'error';
            resolve();
          },
          complete: () => resolve(),
        });
      });
    }
    this.clearQueue();
    this.uploading.set(false);
    this.load();
  }

  constructor(){ this.load(); }

  load(){
    // Listar archivos desde Storage en la carpeta pública
    listAll(storageRef(this.storage, 'public')).then(async res => {
      const items = await Promise.all(res.items.map(async it => ({
        name: it.name,
        url: await getDownloadURL(it)
      })));
      this.items.set(items);
      this.applyFilter();
    }).catch(() => {
      this.items.set([]);
      this.applyFilter();
    });
  }

  applyFilter(){
    const term = (this.search || '').toLowerCase().trim();
    const base = this.items();
    const filtered = term ? base.filter(m => (m.name || '').toLowerCase().includes(term)) : base;
    this.filtered.set(filtered);
    this.page.set(1);
    this.slicePage();
  }

  slicePage(){
    const start = (this.page()-1)*this.pageSize;
    const end = start + this.pageSize;
    this.paged.set(this.filtered().slice(start,end));
  }

  nextPage(){ this.page.set(this.page()+1); this.slicePage(); }
  prevPage(){ this.page.set(Math.max(1,this.page()-1)); this.slicePage(); }

  copy(url: string){ this.clipboard.copy(url); }
}

