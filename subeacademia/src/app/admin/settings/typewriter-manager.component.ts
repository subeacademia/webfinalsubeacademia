import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, TypewriterPhrase } from '../../core/data/settings.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Auth, user } from '@angular/fire/auth';
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

      <!-- Estado de autenticación -->
      <div *ngIf="!isAuthenticated" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p class="font-semibold">⚠️ No estás autenticado como administrador</p>
        <p class="text-sm">Debes iniciar sesión con una cuenta @subeia.tech para gestionar las frases.</p>
        <button class="btn btn-primary mt-2" (click)="signIn()">Iniciar Sesión</button>
      </div>

      <div class="mb-6">
        <label class="block text-sm mb-1">Título principal del Home</label>
        <div class="flex gap-2">
          <input class="ui-input flex-1" [(ngModel)]="titleValue" placeholder="Ej. Potencia tu Talento en la Era de la Inteligencia Artificial" />
          <button class="btn btn-primary" (click)="saveTitle()" [disabled]="!isAuthenticated">Guardar Título</button>
        </div>
      </div>

      <div class="space-y-2 mb-4" *ngIf="phrases.length; else empty">
        <div class="flex items-center gap-2 border rounded px-3 py-2" *ngFor="let phrase of phrases; let i = index">
          <ng-container *ngIf="editingId !== phrase.id; else editing">
            <span class="flex-1 mr-2 truncate" title="{{ phrase.text }}">{{ phrase.text }}</span>
            <span class="text-xs text-gray-500 mr-2">Orden: {{ phrase.order }}</span>
            <button class="btn btn-secondary text-sm" (click)="startEdit(phrase)" [disabled]="!isAuthenticated">Editar</button>
            <button class="btn btn-danger text-sm" (click)="deletePhrase(phrase.id!)" [disabled]="!isAuthenticated">Eliminar</button>
          </ng-container>
          <ng-template #editing>
            <input class="ui-input flex-1" [(ngModel)]="editingValue" />
            <input type="number" class="ui-input w-20" [(ngModel)]="editingOrder" placeholder="Orden" />
            <button class="btn btn-primary text-sm" (click)="saveEdit()">Guardar</button>
            <button class="btn text-sm" (click)="cancelEdit()">Cancelar</button>
          </ng-template>
        </div>
      </div>
      <ng-template #empty>
        <p class="text-sm text-gray-500">No hay frases aún.</p>
      </ng-template>

      <div class="flex gap-2 mt-4">
        <input #phraseInput type="text" class="ui-input flex-1" placeholder="Nueva frase" (keyup.enter)="addPhrase(phraseInput.value); phraseInput.value = ''" />
        <input type="number" #orderInput class="ui-input w-20" placeholder="Orden" (keyup.enter)="addPhrase(phraseInput.value, orderInput.value); phraseInput.value = ''; orderInput.value = ''" />
        <button class="btn btn-primary" (click)="addPhrase(phraseInput.value, orderInput.value); phraseInput.value = ''; orderInput.value = ''" [disabled]="!isAuthenticated">Añadir Frase</button>
      </div>
    </div>
  `,
})
export class TypewriterManagerComponent implements OnInit, OnDestroy {
  private readonly settings = inject(SettingsService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(Auth);
  private phrasesSub?: Subscription;
  private titleSub?: Subscription;
  private authSub?: Subscription;
  
  phrases: TypewriterPhrase[] = [];
  editingId: string | null = null;
  editingValue = '';
  editingOrder = 0;
  titleValue = '';
  isAuthenticated = false;
  
  private readonly defaultPhrases = [
    'Transformar tu Empresa.',
    'Potenciar a tu Equipo.',
    'Optimizar tus Procesos.',
    'Liderar con IA Responsable.'
  ];

  ngOnInit(): void {
    // Suscripción para autenticación
    this.authSub = user(this.auth).subscribe(user => {
      this.isAuthenticated = user?.email?.endsWith('@subeia.tech') || false;
      console.log('Auth state changed:', { user: user?.email, isAdmin: this.isAuthenticated });
      
      if (this.isAuthenticated) {
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    this.phrasesSub?.unsubscribe();
    this.titleSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  private loadData() {
    // Suscripción para frases del typewriter
    this.phrasesSub = this.i18n.currentLang$
      .pipe(switchMap((lang: any) => this.settings.getTypewriterPhrases(lang)))
      .subscribe({
        next: (phrases: TypewriterPhrase[]) => {
          this.phrases = phrases.sort((a, b) => a.order - b.order);
          
          // Si no hay frases, crear las por defecto
          if (!this.phrases.length) {
            this.createDefaultPhrases();
          }
        },
        error: (error) => {
          console.error('Error loading typewriter phrases:', error);
          this.toast.error('Error al cargar las frases: ' + error.message);
        }
      });

    // Suscripción para título del home
    this.titleSub = this.i18n.currentLang$
      .pipe(switchMap((lang: any) => this.settings.getHomePageContent(lang)))
      .subscribe({
        next: (content: any) => {
          this.titleValue = content?.title || '';
        },
        error: (error) => {
          console.error('Error loading home title:', error);
          this.toast.error('Error al cargar el título: ' + error.message);
        }
      });
  }

  async signIn() {
    // Aquí puedes implementar la lógica de inicio de sesión
    // Por ahora, mostraremos un mensaje informativo
    this.toast.info('Por favor, inicia sesión con tu cuenta @subeia.tech en la consola de Firebase');
  }

  private async createDefaultPhrases() {
    const lang = this.i18n.currentLang();
    try {
      for (let i = 0; i < this.defaultPhrases.length; i++) {
        await this.settings.addTypewriterPhrase({
          text: this.defaultPhrases[i],
          lang,
          order: i
        });
      }
      this.toast.success('Frases iniciales creadas');
      // Recargar frases
      this.settings.getTypewriterPhrases(lang).subscribe(phrases => {
        this.phrases = phrases.sort((a, b) => a.order - b.order);
      });
    } catch (error) {
      this.toast.error('No se pudieron crear frases iniciales');
    }
  }

  async addPhrase(newPhrase: string, orderStr?: string) {
    const phrase = (newPhrase || '').trim();
    if (!phrase) {
      this.toast.error('La frase no puede estar vacía');
      return;
    }
    
    const order = orderStr ? parseInt(orderStr) : this.phrases.length;
    
    try {
      console.log('Adding phrase:', { text: phrase, lang: this.i18n.currentLang(), order });
      
      const phraseId = await this.settings.addTypewriterPhrase({
        text: phrase,
        lang: this.i18n.currentLang(),
        order
      });
      
      console.log('Phrase added successfully with ID:', phraseId);
      this.toast.success('Frase añadida correctamente');
      
      // Recargar frases
      this.refreshPhrases();
    } catch (error) {
      console.error('Error adding phrase:', error);
      this.toast.error('No se pudo añadir la frase: ' + (error as Error).message);
    }
  }

  private refreshPhrases() {
    const lang = this.i18n.currentLang();
    this.settings.getTypewriterPhrases(lang).subscribe({
      next: (phrases) => {
        this.phrases = phrases.sort((a, b) => a.order - b.order);
      },
      error: (error) => {
        console.error('Error refreshing phrases:', error);
        this.toast.error('Error al actualizar la lista de frases');
      }
    });
  }

  async deletePhrase(id: string) {
    try {
      await this.settings.deleteTypewriterPhrase(id);
      this.toast.info('Frase eliminada correctamente');
      // Recargar frases
      this.refreshPhrases();
    } catch (error) {
      console.error('Error deleting phrase:', error);
      this.toast.error('No se pudo eliminar la frase: ' + (error as Error).message);
    }
  }

  startEdit(phrase: TypewriterPhrase) {
    this.editingId = phrase.id!;
    this.editingValue = phrase.text;
    this.editingOrder = phrase.order;
  }

  async saveEdit() {
    if (!this.editingId) return;
    
    const value = (this.editingValue || '').trim();
    if (!value) {
      this.toast.error('La frase no puede estar vacía');
      return;
    }
    
    try {
      await this.settings.updateTypewriterPhrase(this.editingId, {
        text: value,
        order: this.editingOrder
      });
      this.toast.success('Frase actualizada correctamente');
      // Recargar frases
      this.refreshPhrases();
    } catch (error) {
      console.error('Error updating phrase:', error);
      this.toast.error('No se pudo actualizar la frase: ' + (error as Error).message);
    }
    this.cancelEdit();
  }

  async saveTitle() {
    const title = (this.titleValue || '').trim();
    try {
      await this.settings.setHomeTitle(this.i18n.currentLang(), title);
      this.toast.success('Título guardado');
    } catch (error) {
      this.toast.error('No se pudo guardar el título');
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editingValue = '';
    this.editingOrder = 0;
  }
}


