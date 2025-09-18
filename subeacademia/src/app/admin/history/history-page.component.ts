import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HistoryService } from '../../core/data/history.service';
import { HistoryEvent } from '../../core/models/history-event.model';
import { HistoryBulkUploadService, HistoryBulkUploadResult, HistoryBulkUploadProgress } from '../../core/services/history-bulk-upload.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Historia</h1>
    <div class="flex gap-2 flex-wrap">
      <button class="btn btn-secondary" (click)="downloadCurrentStructure()">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Descargar JSON
      </button>
      <button class="btn btn-secondary" (click)="openBulkUpload()">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"></path>
        </svg>
        Cargar JSON
      </button>
      <button class="btn" (click)="openCreate()">Añadir hito</button>
    </div>
  </div>

  <div class="overflow-x-auto border border-white/10 rounded-lg">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left bg-white/5">
          <th class="p-3">Orden</th>
          <th class="p-3">Año</th>
          <th class="p-3">Título</th>
          <th class="p-3">Descripción</th>
          <th class="p-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let e of events()" class="border-t border-white/10">
          <td class="p-3">{{ e.order ?? 0 }}</td>
          <td class="p-3 font-medium">{{ e.year }}</td>
          <td class="p-3">{{ e.title }}</td>
          <td class="p-3 max-w-[480px] truncate" title="{{e.description}}">{{ e.description }}</td>
          <td class="p-3 text-right space-x-2">
            <button class="btn" (click)="openEdit(e)">Editar</button>
            <button class="btn btn-danger" (click)="remove(e)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div *ngIf="isOpen()" class="fixed inset-0 z-50 grid place-items-center">
    <div class="absolute inset-0 bg-black/50" (click)="close()"></div>
    <div class="relative bg-[var(--panel)] p-4 rounded-lg w-[min(700px,90vw)] border border-white/10">
      <h2 class="text-lg font-semibold mb-4">{{ editingId() ? 'Editar' : 'Añadir' }} hito</h2>
      <form [formGroup]="form" class="grid gap-3" (ngSubmit)="save()">
        <div class="grid md:grid-cols-3 gap-3">
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Orden</span>
            <input type="number" class="input" formControlName="order" />
          </label>
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Año</span>
            <input type="number" class="input" formControlName="year" />
          </label>
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Título</span>
            <input class="input" formControlName="title" />
          </label>
        </div>
        <label class="grid gap-1">
          <span class="text-xs text-[var(--muted)]">Descripción</span>
          <textarea rows="4" class="input" formControlName="description"></textarea>
        </label>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn" (click)="close()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</div>
  `
})
export class HistoryPageComponent {
  private fb = inject(FormBuilder);
  private svc = inject(HistoryService);

  events = signal<HistoryEvent[]>([]);
  isOpen = signal(false);
  editingId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    order: [0],
    year: [2024, [Validators.required]],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  constructor(){
    this.svc.list().subscribe(v => this.events.set(v));
  }

  openCreate(){ this.editingId.set(null); this.form.reset({ order:0, year:2024, title:'', description:'' }); this.isOpen.set(true); }
  openEdit(e: HistoryEvent){ this.editingId.set(e.id ?? null); this.form.patchValue(e as any); this.isOpen.set(true); }
  close(){ this.isOpen.set(false); }

  async save(){
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const id = this.editingId();
    if (id) await this.svc.update(id, val);
    else await this.svc.add(val);
    this.close();
  }
  async remove(e: HistoryEvent){ if (!e.id) return; if (confirm('¿Eliminar hito?')) await this.svc.delete(e.id); }

  // Métodos para carga masiva (placeholders por ahora)
  downloadCurrentStructure() {
    console.log('Funcionalidad de descarga de estructura JSON pendiente de implementación');
    // TODO: Implementar descarga de estructura JSON
  }

  openBulkUpload() {
    console.log('Funcionalidad de carga masiva JSON pendiente de implementación');
    // TODO: Implementar modal de carga masiva JSON
  }
}


