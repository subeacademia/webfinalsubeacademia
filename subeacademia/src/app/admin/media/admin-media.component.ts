import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MediaService } from '../../core/services/media.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Admin · Media</h1>
      <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="convertWebp" /> Convertir a WebP</label>
    </div>

    <div
      class="border-2 border-dashed rounded p-6 text-center bg-gray-50"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
      Arrastra y suelta archivos aquí o
      <input type="file" multiple (change)="onFilePick($event)" class="block mx-auto mt-2" />
    </div>

    <div class="mt-6 space-y-3" *ngIf="queue().length">
      <div *ngFor="let q of queue()" class="border rounded p-3">
        <div class="text-sm">{{ q.file.name }}</div>
        <mat-progress-bar mode="determinate" [value]="q.progress"></mat-progress-bar>
      </div>
      <div class="flex gap-2">
        <button mat-flat-button color="primary" (click)="startUpload()" [disabled]="uploading()">Subir</button>
        <button mat-button (click)="clearQueue()" [disabled]="uploading()">Limpiar</button>
      </div>
    </div>

    <div class="mt-8" *ngIf="uploaded().length">
      <div class="font-medium mb-2">Subidos</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a *ngFor="let m of uploaded()" [href]="m.url" target="_blank" class="block border rounded p-2 text-xs break-all">{{ m.fileName }}</a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMediaComponent {
  private readonly media = inject(MediaService);

  convertWebp = true;
  uploading = signal(false);
  queue = signal<Array<{ file: File; progress: number }>>([]);
  uploaded = signal<Array<{ fileName: string; url: string }>>([]);

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
    this.queue.set([...current, ...files.map(f => ({ file: f, progress: 0 }))]);
  }

  clearQueue() { this.queue.set([]); }

  async startUpload() {
    if (this.uploading()) return;
    this.uploading.set(true);
    const items = [] as Array<{ fileName: string; url: string }>;
    for (const entry of this.queue()) {
      try {
        const item = await this.media.uploadWithProgress(entry.file, { convertToWebP: this.convertWebp }, (p) => {
          entry.progress = p;
          this.queue.set([...this.queue()]);
        });
        items.push({ fileName: item.fileName, url: item.url });
      } catch (e) {
        console.error(e);
      }
    }
    this.uploaded.set([...this.uploaded(), ...items]);
    this.clearQueue();
    this.uploading.set(false);
  }
}

