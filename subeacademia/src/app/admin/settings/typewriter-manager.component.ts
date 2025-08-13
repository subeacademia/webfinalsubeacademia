import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, HomePageContent } from '../../core/data/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-typewriter-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mt-10">
      <h3 class="text-xl font-semibold mb-4">Gestionar Frases Dinámicas del Inicio</h3>

      <div class="space-y-2 mb-4" *ngIf="phrases.length; else empty">
        <div class="flex items-center gap-2 border rounded px-3 py-2" *ngFor="let p of phrases; let i = index">
          <ng-container *ngIf="editingIndex !== i; else editing">
            <span class="flex-1 mr-2 truncate" title="{{ p }}">{{ p }}</span>
            <button class="btn btn-secondary text-sm" (click)="startEdit(i, p)">Editar</button>
            <button class="btn btn-danger text-sm" (click)="deletePhrase(i)">Eliminar</button>
          </ng-container>
          <ng-template #editing>
            <input class="ui-input flex-1" [(ngModel)]="editingValue" />
            <button class="btn btn-primary text-sm" (click)="saveEdit(i)">Guardar</button>
            <button class="btn text-sm" (click)="cancelEdit()">Cancelar</button>
          </ng-template>
        </div>
      </div>
      <ng-template #empty>
        <p class="text-sm text-gray-500">No hay frases aún.</p>
      </ng-template>

      <div class="flex gap-2 mt-4">
        <input #phraseInput type="text" class="ui-input flex-1" placeholder="Nueva frase" (keyup.enter)="addPhrase(phraseInput.value); phraseInput.value = ''" />
        <button class="btn btn-primary" (click)="addPhrase(phraseInput.value); phraseInput.value = ''">Añadir Frase</button>
      </div>
    </div>
  `,
})
export class TypewriterManagerComponent implements OnInit, OnDestroy {
  private readonly settings = inject(SettingsService);
  private sub?: Subscription;
  phrases: string[] = [];
  editingIndex: number | null = null;
  editingValue = '';
  private readonly defaultPhrases = [
    'Transformar tu Empresa.',
    'Potenciar a tu Equipo.',
    'Optimizar tus Procesos.',
    'Liderar con IA Responsable.'
  ];

  ngOnInit(): void {
    this.sub = this.settings.getHomePageContent().subscribe((c: HomePageContent | undefined) => {
      this.phrases = c?.typewriterPhrases?.length ? c.typewriterPhrases : [];
      if (!this.phrases.length) {
        // Inicializa con las frases por defecto si el doc no existe o está vacío
        this.settings.setTypewriterPhrases(this.defaultPhrases);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async addPhrase(newPhrase: string) {
    const phrase = (newPhrase || '').trim();
    if (!phrase) return;
    const updated = [...this.phrases, phrase];
    await this.settings.setTypewriterPhrases(updated);
  }

  async deletePhrase(index: number) {
    if (index < 0 || index >= this.phrases.length) return;
    const updated = this.phrases.filter((_, i) => i !== index);
    await this.settings.setTypewriterPhrases(updated);
  }

  startEdit(index: number, current: string) {
    this.editingIndex = index;
    this.editingValue = current;
  }

  async saveEdit(index: number) {
    if (this.editingIndex !== index) return;
    const value = (this.editingValue || '').trim();
    if (!value) return;
    await this.settings.updateTypewriterPhrase(index, value, this.phrases);
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editingValue = '';
  }
}


