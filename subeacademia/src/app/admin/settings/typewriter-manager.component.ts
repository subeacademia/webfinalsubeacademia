import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject, of } from 'rxjs';
import { LocalSettingsService, LocalTypewriterPhrase } from '../../core/services/local-settings.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/services/ui/toast/toast.service';
import { AuthCoreService } from '../../core/auth-core.service';

@Component({
  selector: 'app-typewriter-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Gestión de Frases del Typewriter -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <span class="inline-flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Frases del Typewriter
          </span>
        </h3>

        <!-- Lista de Frases -->
        <div class="space-y-3 mb-6">
          <div *ngFor="let phrase of phrases$ | async; trackBy: trackByPhrase" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <!-- Orden -->
            <div class="w-16">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Orden</span>
              <div class="text-lg font-bold text-gray-900 dark:text-white">{{ phrase.order + 1 }}</div>
            </div>
            
            <!-- Texto de la Frase -->
            <div class="flex-1">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Frase</span>
              <div *ngIf="!phrase.isEditing" class="text-gray-900 dark:text-white py-1">
                {{ phrase.text }}
              </div>
              <input 
                *ngIf="phrase.isEditing"
                type="text" 
                [(ngModel)]="phrase.editingText" 
                class="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                (keyup.enter)="savePhraseEdit(phrase)"
                (keyup.escape)="cancelPhraseEdit(phrase)"
                #phraseInput
              >
            </div>
            
            <!-- Acciones -->
            <div class="flex gap-2">
              <button 
                *ngIf="!phrase.isEditing"
                (click)="startPhraseEdit(phrase)"
                class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                title="Editar frase"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              
              <button 
                *ngIf="phrase.isEditing"
                (click)="savePhraseEdit(phrase)"
                [disabled]="!phrase.editingText?.trim() || phrase.editingText === phrase.text"
                class="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Guardar cambios"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              
              <button 
                *ngIf="phrase.isEditing"
                (click)="cancelPhraseEdit(phrase)"
                class="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                title="Cancelar edición"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              <button 
                (click)="deletePhrase(phrase)"
                class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title="Eliminar frase"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Mensaje cuando no hay frases -->
          <div *ngIf="(phrases$ | async)?.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg class="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-lg font-medium">No hay frases configuradas</p>
            <p class="text-sm">Agrega tu primera frase usando el formulario de abajo</p>
          </div>
        </div>

        <!-- Formulario para Agregar Nueva Frase -->
        <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Agregar Nueva Frase</h4>
          
          <div class="flex gap-3">
            <input 
              type="text" 
              [(ngModel)]="newPhraseText" 
              placeholder="Escribe tu frase aquí..."
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              (keyup.enter)="addPhrase()"
            >
            <input 
              type="number" 
              [(ngModel)]="newPhraseOrder" 
              placeholder="Orden"
              min="0"
              class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center"
            >
            <button 
              (click)="addPhrase()" 
              [disabled]="!newPhraseText.trim() || isAddingPhrase"
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg *ngIf="isAddingPhrase" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isAddingPhrase ? 'Agregando...' : '+ Agregar Frase' }}
            </button>
          </div>
          
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            💡 El orden determina la secuencia en que aparecerán las frases en la página de inicio
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TypewriterManagerComponent implements OnInit, OnDestroy {
  private readonly settings = inject(LocalSettingsService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthCoreService);
  private readonly destroy$ = new Subject<void>();

  // Datos reactivos
  phrases$ = new BehaviorSubject<LocalTypewriterPhrase[]>([]);
  titleValue = '';
  
  // Estados
  isAddingPhrase = false;
  isSavingTitle = false;
  
  // Formulario
  newPhraseText = '';
  newPhraseOrder = 0;

  ngOnInit(): void {
    this.loadData();
    this.diagnoseAuthStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Cargar frases del typewriter
    this.i18n.currentLang$.pipe(
      switchMap((lang: any) => this.settings.getTypewriterPhrases(lang)),
      tap((phrases) => {
        console.log('🔄 Frases del typewriter cargadas:', phrases);
        const phrasesWithEditing = phrases.map(p => ({ ...p, isEditing: false, editingText: p.text }));
        this.phrases$.next(phrasesWithEditing);
      }),
      catchError((error) => {
        console.error('❌ Error cargando frases del typewriter:', error);
        this.toast.error('❌ Error al cargar las frases del typewriter');
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  // Agregar nueva frase
  async addPhrase(): Promise<void> {
    if (!this.newPhraseText?.trim()) return;
    
    this.isAddingPhrase = true;
    try {
      const newPhrase: Omit<LocalTypewriterPhrase, 'id' | 'createdAt'> = {
        text: this.newPhraseText.trim(),
        lang: this.i18n.currentLang(),
        order: this.newPhraseOrder || this.phrases$.value.length
      };
      
      console.log('🔄 Iniciando agregar frase:', newPhrase);
      
      await this.settings.addTypewriterPhrase(newPhrase);
      
      // Limpiar formulario
      this.newPhraseText = '';
      this.newPhraseOrder = this.phrases$.value.length;
      
      // Recargar datos
      this.loadData();
      
      this.toast.success('✅ Frase agregada exitosamente');
      console.log('✅ Frase agregada:', newPhrase);
    } catch (error: any) {
      console.error('❌ Error al agregar frase:', error);
      
      // Mejorar el mensaje de error
      let errorMessage = 'No se pudo agregar la frase';
      if (error.code === 'permission-denied') {
        errorMessage = 'Error de permisos: Verifica que estés autenticado como administrador';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.toast.error(`❌ ${errorMessage}`);
    } finally {
      this.isAddingPhrase = false;
    }
  }

  // Iniciar edición de frase
  startPhraseEdit(phrase: any): void {
    phrase.isEditing = true;
    phrase.editingText = phrase.text;
    
    // Focus en el input después de un tick
    setTimeout(() => {
      const input = document.querySelector(`input[ng-model="phrase.editingText"]`) as HTMLInputElement;
      if (input) input.focus();
    });
  }

  // Guardar edición de frase
  async savePhraseEdit(phrase: any): Promise<void> {
    if (!phrase.editingText?.trim() || phrase.editingText === phrase.text) return;
    
    try {
      console.log('🔄 Iniciando actualización de frase:', { id: phrase.id, text: phrase.editingText });
      
      await this.settings.updateTypewriterPhrase(phrase.id, { text: phrase.editingText.trim() });
      
      // Actualizar localmente
      phrase.text = phrase.editingText.trim();
      phrase.isEditing = false;
      
      // Actualizar el BehaviorSubject
      this.phrases$.next([...this.phrases$.value]);
      
      this.toast.success('✅ Frase actualizada exitosamente');
      console.log('✅ Frase actualizada:', phrase.text);
    } catch (error: any) {
      console.error('❌ Error al actualizar frase:', error);
      
      // Mejorar el mensaje de error
      let errorMessage = 'No se pudo actualizar la frase';
      if (error.code === 'permission-denied') {
        errorMessage = 'Error de permisos: Verifica que estés autenticado como administrador';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.toast.error(`❌ ${errorMessage}`);
    }
  }

  // Cancelar edición de frase
  cancelPhraseEdit(phrase: any): void {
    phrase.isEditing = false;
    phrase.editingText = phrase.text;
  }

  // Eliminar frase
  async deletePhrase(phrase: any): Promise<void> {
    if (!confirm(`¿Estás seguro de que quieres eliminar la frase "${phrase.text}"?`)) return;
    
    try {
      console.log('🔄 Iniciando eliminación de frase:', { id: phrase.id, text: phrase.text });
      
      await this.settings.deleteTypewriterPhrase(phrase.id);
      
      // Recargar datos para actualizar la vista
      this.loadData();
      
      this.toast.success('✅ Frase eliminada exitosamente');
      console.log('✅ Frase eliminada:', phrase.text);
    } catch (error: any) {
      console.error('❌ Error al eliminar frase:', error);
      
      // Mejorar el mensaje de error
      let errorMessage = 'No se pudo eliminar la frase';
      if (error.code === 'permission-denied') {
        errorMessage = 'Error de permisos: Verifica que estés autenticado como administrador';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.toast.error(`❌ ${errorMessage}`);
    }
  }

  // Guardar título
  async saveTitle(): Promise<void> {
    if (!this.titleValue?.trim()) return;
    
    this.isSavingTitle = true;
    try {
      console.log('🔄 Iniciando guardado de título:', this.titleValue);
      
      await this.settings.updateSetting('homeTitle', this.titleValue.trim());
      
      this.toast.success('✅ Título guardado exitosamente');
      console.log('✅ Título guardado:', this.titleValue);
    } catch (error: any) {
      console.error('❌ Error al guardar título:', error);
      
      // Mejorar el mensaje de error
      let errorMessage = 'No se pudo guardar el título';
      if (error.code === 'permission-denied') {
        errorMessage = 'Error de permisos: Verifica que estés autenticado como administrador';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.toast.error(`❌ ${errorMessage}`);
    } finally {
      this.isSavingTitle = false;
    }
  }

  // TrackBy para optimización
  trackByPhrase(index: number, phrase: any): string {
    return phrase.id || index;
  }

  // Método de diagnóstico para verificar el estado de la autenticación
  private async diagnoseAuthStatus(): Promise<void> {
    try {
      console.log('🔍 Diagnóstico de autenticación...');
      
      // Verificar si hay usuario autenticado usando el método síncrono
      const currentUser = (this.auth as any)?.auth?.currentUser;
      console.log('👤 Usuario actual:', currentUser);
      
      if (currentUser) {
        console.log('📧 Email del usuario:', currentUser.email);
        console.log('🆔 UID del usuario:', currentUser.uid);
        
        // Verificar si es admin
        const isAdmin = this.auth.isAdminSync();
        console.log('👑 ¿Es admin?:', isAdmin);
        
        if (isAdmin) {
          console.log('✅ Usuario autenticado como administrador');
        } else {
          console.log('❌ Usuario NO es administrador');
          this.toast.warning('⚠️ No tienes permisos de administrador');
        }
      } else {
        console.log('❌ No hay usuario autenticado');
        this.toast.warning('⚠️ No estás autenticado');
      }
      
      // Verificar token de Firebase
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          console.log('🎫 Claims del token:', tokenResult.claims);
          console.log('⏰ Token expira en:', tokenResult.expirationTime);
        } catch (tokenError) {
          console.error('❌ Error obteniendo token:', tokenError);
        }
      }
      
    } catch (error) {
      console.error('❌ Error en diagnóstico de autenticación:', error);
    }
  }
}


