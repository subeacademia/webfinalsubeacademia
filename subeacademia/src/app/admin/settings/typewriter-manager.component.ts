import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, HomePageContent } from '../../core/data/settings.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { switchMap } from 'rxjs/operators';
import { ToastService } from '../../core/ui/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-typewriter-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mt-10">
      <h3 class="text-xl font-semibold mb-4">Gestionar Frases Dinámicas del Inicio</h3>

      <div class="mb-6">
        <label class="block text-sm mb-1">Título principal del Home</label>
        <div class="flex gap-2">
          <input class="ui-input flex-1" [(ngModel)]="titleValue" placeholder="Ej. Potencia tu Talento en la Era de la Inteligencia Artificial" />
          <button class="btn btn-primary" (click)="saveTitle()">Guardar Título</button>
        </div>
      </div>

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
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private sub?: Subscription;
  phrases: string[] = [];
  editingIndex: number | null = null;
  editingValue = '';
  titleValue = '';
  private readonly defaultPhrases = [
    'Transformar tu Empresa.',
    'Potenciar a tu Equipo.',
    'Optimizar tus Procesos.',
    'Liderar con IA Responsable.'
  ];

  ngOnInit(): void {
    this.sub = this.i18n.currentLang$
      .pipe(switchMap((lang:any)=> this.settings.getHomePageContent(lang)))
      .subscribe((c: HomePageContent | undefined) => {
      this.phrases = c?.typewriterPhrases?.length ? c.typewriterPhrases : [];
      this.titleValue = c?.title || '';
      if (!this.phrases.length) {
        // Inicializa con las frases por defecto si el doc no existe o está vacío
        this.settings.setTypewriterPhrases(this.i18n.currentLang(), this.defaultPhrases).then(()=>{
          this.toast.success('Frases iniciales creadas');
        }).catch(()=> this.toast.error('No se pudieron crear frases iniciales'));
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
    try {
      await this.settings.setTypewriterPhrases(this.i18n.currentLang(), updated);
      this.toast.success('Frase añadida');
    } catch {
      this.toast.error('No se pudo añadir la frase');
    }
  }

  async deletePhrase(index: number) {
    if (index < 0 || index >= this.phrases.length) return;
    const updated = this.phrases.filter((_, i) => i !== index);
    try {
      await this.settings.setTypewriterPhrases(this.i18n.currentLang(), updated);
      this.toast.info('Frase eliminada');
    } catch {
      this.toast.error('No se pudo eliminar la frase');
    }
  }

  startEdit(index: number, current: string) {
    this.editingIndex = index;
    this.editingValue = current;
  }

  async saveEdit(index: number) {
    if (this.editingIndex !== index) return;
    const value = (this.editingValue || '').trim();
    if (!value) return;
    try {
      await this.settings.updateTypewriterPhrase(this.i18n.currentLang(), index, value, this.phrases);
      this.toast.success('Frase actualizada');
    } catch {
      this.toast.error('No se pudo actualizar la frase');
    }
    this.cancelEdit();
  }
  async saveTitle() {
    const title = (this.titleValue || '').trim();
    try {
      await this.settings.setHomeTitle(this.i18n.currentLang(), title);
      this.toast.success('Título guardado');
    } catch {
      this.toast.error('No se pudo guardar el título');
    }
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editingValue = '';
  }
}


