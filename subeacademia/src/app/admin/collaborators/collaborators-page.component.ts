import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CollaboratorsService } from '../../core/data/collaborators.service';
import { Collaborator } from '../../core/models/collaborator.model';
import { MediaService } from '../../core/data/media.service';

@Component({
  selector: 'app-admin-collaborators-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Socios Colaboradores</h1>
    <button class="btn" (click)="openCreate()">Añadir</button>
  </div>

  <div class="overflow-x-auto border border-white/10 rounded-lg">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left bg-white/5">
          <th class="p-3">Logo</th>
          <th class="p-3">Nombre</th>
          <th class="p-3">Tipo</th>
          <th class="p-3">Sitio</th>
          <th class="p-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of collaborators()" class="border-t border-white/10">
          <td class="p-3">
            <img [src]="c.logoUrl" alt="logo" class="h-10 w-auto object-contain bg-white/5 rounded" />
          </td>
          <td class="p-3 font-medium">{{ c.name }}</td>
          <td class="p-3">{{ c.type }}</td>
          <td class="p-3"><a class="text-blue-400 hover:underline" [href]="c.website" target="_blank">{{ c.website }}</a></td>
          <td class="p-3 text-right space-x-2">
            <button class="btn" (click)="openEdit(c)">Editar</button>
            <button class="btn btn-danger" (click)="remove(c)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal -->
  <div *ngIf="isOpen()" class="fixed inset-0 z-50 grid place-items-center">
    <div class="absolute inset-0 bg-black/50" (click)="close()"></div>
    <div class="relative bg-[var(--panel)] p-4 rounded-lg w-[min(700px,90vw)] border border-white/10">
      <h2 class="text-lg font-semibold mb-4">{{ editingId() ? 'Editar' : 'Añadir' }} colaborador</h2>
      <form [formGroup]="form" class="grid gap-3" (ngSubmit)="save()">
        <div class="grid md:grid-cols-2 gap-3">
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Nombre</span>
            <input class="input" formControlName="name" />
          </label>
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Tipo</span>
            <select class="input" formControlName="type">
              <option value="Partner Tecnológico">Partner Tecnológico</option>
              <option value="Partner Académico">Partner Académico</option>
              <option value="Cliente Destacado">Cliente Destacado</option>
            </select>
          </label>
        </div>
        <label class="grid gap-1">
          <span class="text-xs text-[var(--muted)]">Descripción</span>
          <textarea class="input" rows="3" formControlName="description"></textarea>
        </label>
        <div class="grid md:grid-cols-[1fr_auto] gap-3 items-end">
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Sitio web</span>
            <input class="input" formControlName="website" placeholder="https://..." />
          </label>
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Logo</span>
            <input type="file" accept="image/*" (change)="onFileChange($event)" />
          </label>
        </div>
        <div class="flex items-center gap-3 mt-2">
          <img *ngIf="previewUrl()" [src]="previewUrl()!" class="h-12 w-auto object-contain bg-white/5 rounded" />
          <span class="text-xs text-[var(--muted)]" *ngIf="uploadProgress() >= 0">Subiendo: {{ uploadProgress() }}%</span>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn" (click)="close()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </div>
</div>
  `
})
export class CollaboratorsPageComponent {
  private fb = inject(FormBuilder);
  private svc = inject(CollaboratorsService);
  private media = inject(MediaService);

  collaborators = signal<Collaborator[]>([]);
  isOpen = signal(false);
  editingId = signal<string | null>(null);
  previewUrl = signal<string | null>(null);
  uploadProgress = signal<number>(-1);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    logoUrl: ['', [Validators.required]],
    website: ['', [Validators.required, Validators.pattern(/^https?:\/\//i)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    type: ['Partner Tecnológico' as Collaborator['type'], [Validators.required]],
  });

  constructor(){
    this.svc.getCollaborators().subscribe(list => this.collaborators.set(list));
  }

  openCreate(){
    this.editingId.set(null);
    this.previewUrl.set(null);
    this.form.reset({ name:'', logoUrl:'', website:'', description:'', type:'Partner Tecnológico' });
    this.isOpen.set(true);
  }
  openEdit(c: Collaborator){
    this.editingId.set(c.id ?? null);
    this.previewUrl.set(c.logoUrl || null);
    this.form.patchValue(c as any);
    this.isOpen.set(true);
  }
  close(){ this.isOpen.set(false); this.uploadProgress.set(-1); }

  async onFileChange(e: Event){
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Normaliza logos para nitidez uniforme
    const normalized = await this.media.normalizeLogoImage(file, { targetHeight: 64, maxWidth: 220, paddingX: 12, background: null, format: 'image/png' }) || file;
    this.media.uploadPublic(normalized).subscribe({
      next: v => {
        if (v.state === 'running') this.uploadProgress.set(v.progress);
        if (v.state === 'success' && v.url) {
          this.form.controls.logoUrl.setValue(v.url);
          this.previewUrl.set(v.url);
          this.uploadProgress.set(100);
        }
      },
      error: ()=> this.uploadProgress.set(-1)
    });
  }

  async save(){
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      const id = this.editingId();
      if (id) await this.svc.updateCollaborator(id, value);
      else await this.svc.addCollaborator(value);
      this.close();
    } finally {
      this.saving.set(false);
    }
  }

  async remove(c: Collaborator){
    if (!c.id) return;
    if (confirm(`¿Eliminar a ${c.name}?`)) await this.svc.deleteCollaborator(c.id);
  }
}


