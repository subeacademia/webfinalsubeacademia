import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LocalSiteSettings {
  brandName: string;
  logoUrl?: string;
  defaultLang: 'es' | 'en' | 'pt';
  social?: { twitter?: string; linkedin?: string; youtube?: string };
  contactEmail?: string;
  ga4MeasurementId?: string;
  searchConsoleVerification?: string;
  homeTitle?: string; // Título principal de la página de inicio
  // Fondo del Home seleccionable desde Admin
  homeBackgroundKey?: string; // e.g. 'neural-3d-v1'
  homeBackgroundName?: string; // e.g. 'Red Neuronal 3D - Versión 1'
}

export interface LocalTypewriterPhrase {
  id: string;
  text: string;
  lang: 'es' | 'en' | 'pt';
  order: number;
  createdAt: Date;
  isEditing?: boolean;
  editingText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalSettingsService {
  private readonly STORAGE_KEY = 'subeacademia_settings';
  private readonly TYPEWRITER_STORAGE_KEY = 'subeacademia_typewriter_phrases';
  
  private settingsSubject = new BehaviorSubject<LocalSiteSettings>({
    brandName: 'Sube Academ-I',
    defaultLang: 'es',
    homeTitle: 'Potencia tu Talento en la Era de la Inteligencia Artificial',
    homeBackgroundKey: 'neural-3d-v1',
    homeBackgroundName: 'Red Neuronal 3D - Versión 1'
  });

  private typewriterPhrasesSubject = new BehaviorSubject<LocalTypewriterPhrase[]>([]);

  public settings$ = this.settingsSubject.asObservable();
  public typewriterPhrases$ = this.typewriterPhrasesSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.loadSettings();
    this.loadTypewriterPhrases();
  }

  private loadSettings(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored) as LocalSiteSettings;
        this.settingsSubject.next(settings);
        console.log('✅ Configuraciones cargadas desde localStorage:', settings);
      } else {
        // Guardar configuración por defecto
        this.saveToStorage(this.settingsSubject.value);
      }
    } catch (error) {
      console.error('❌ Error cargando configuraciones:', error);
      // Usar configuración por defecto
      this.saveToStorage(this.settingsSubject.value);
    }
  }

  private saveToStorage(settings: LocalSiteSettings): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ Configuraciones guardadas en localStorage');
    } catch (error) {
      console.error('❌ Error guardando configuraciones:', error);
    }
  }

  // Obtener configuraciones actuales
  get(): Observable<LocalSiteSettings> {
    return this.settings$;
  }

  // Obtener configuraciones de forma síncrona
  getCurrentSettings(): LocalSiteSettings {
    return this.settingsSubject.value;
  }

  // Guardar configuraciones
  async save(settings: LocalSiteSettings): Promise<void> {
    try {
      // Validar datos requeridos (permitimos brandName vacío para usar solo logo)
      if (!settings || !settings.defaultLang) {
        throw new Error('Idioma por defecto es requerido');
      }

      // Actualizar configuraciones
      this.settingsSubject.next(settings);
      
      // Guardar en localStorage
      this.saveToStorage(settings);
      
      console.log('✅ Configuraciones actualizadas:', settings);
    } catch (error) {
      console.error('❌ Error guardando configuraciones:', error);
      throw error;
    }
  }

  // Actualizar una configuración específica
  async updateSetting<K extends keyof LocalSiteSettings>(key: K, value: LocalSiteSettings[K]): Promise<void> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, [key]: value };
    await this.save(updatedSettings);
  }

  // Resetear a configuración por defecto
  async resetToDefault(): Promise<void> {
    const defaultSettings: LocalSiteSettings = {
      brandName: 'Sube Academ-IA',
      defaultLang: 'es',
      homeTitle: 'Potencia tu Talento en la Era de la Inteligencia Artificial',
      homeBackgroundKey: 'neural-3d-v1',
      homeBackgroundName: 'Red Neuronal 3D - Versión 1'
    };
    await this.save(defaultSettings);
  }

  // ===== MÉTODOS PARA TYPEWRITER PHRASES =====

  private loadTypewriterPhrases(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const stored = localStorage.getItem(this.TYPEWRITER_STORAGE_KEY);
      if (stored) {
        const phrases = JSON.parse(stored) as LocalTypewriterPhrase[];
        // Convertir fechas de string a Date
        const phrasesWithDates = phrases.map(phrase => ({
          ...phrase,
          createdAt: new Date(phrase.createdAt)
        }));
        this.typewriterPhrasesSubject.next(phrasesWithDates);
        console.log('✅ Frases del typewriter cargadas desde localStorage:', phrasesWithDates);
      } else {
        // Crear frases por defecto
        this.initializeDefaultPhrases();
      }
    } catch (error) {
      console.error('❌ Error cargando frases del typewriter:', error);
      this.initializeDefaultPhrases();
    }
  }

  private initializeDefaultPhrases(): void {
    const defaultPhrases: LocalTypewriterPhrase[] = [
      {
        id: 'phrase_1',
        text: 'Implementa IA de forma Ágil, Responsable y Sostenible con nuestro Framework ARES-AI©.',
        lang: 'es',
        order: 1,
        createdAt: new Date()
      },
      {
        id: 'phrase_2', 
        text: 'Desarrolla las 13 competencias clave que tu equipo necesita para liderar la transformación digital.',
        lang: 'es',
        order: 2,
        createdAt: new Date()
      },
      {
        id: 'phrase_3',
        text: 'Transforma tu organización con nuestra plataforma de aprendizaje adaptativo AVE-AI.',
        lang: 'es',
        order: 3,
        createdAt: new Date()
      }
    ];
    
    this.saveTypewriterPhrasesToStorage(defaultPhrases);
    this.typewriterPhrasesSubject.next(defaultPhrases);
  }

  private saveTypewriterPhrasesToStorage(phrases: LocalTypewriterPhrase[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem(this.TYPEWRITER_STORAGE_KEY, JSON.stringify(phrases));
      console.log('✅ Frases del typewriter guardadas en localStorage');
    } catch (error) {
      console.error('❌ Error guardando frases del typewriter:', error);
    }
  }

  // Obtener frases del typewriter por idioma
  getTypewriterPhrases(lang: 'es' | 'en' | 'pt'): Observable<LocalTypewriterPhrase[]> {
    return this.typewriterPhrases$.pipe(
      map(phrases => phrases.filter(p => p.lang === lang).sort((a, b) => a.order - b.order))
    );
  }

  // Obtener frases como array de strings (para compatibilidad)
  getTypewriterPhrasesAsArray(lang: 'es' | 'en' | 'pt'): Observable<string[]> {
    return this.getTypewriterPhrases(lang).pipe(
      map(phrases => phrases.map(p => p.text))
    );
  }

  // Agregar nueva frase
  async addTypewriterPhrase(phraseData: Omit<LocalTypewriterPhrase, 'id' | 'createdAt'>): Promise<LocalTypewriterPhrase> {
    const currentPhrases = this.typewriterPhrasesSubject.value;
    
    const newPhrase: LocalTypewriterPhrase = {
      id: 'phrase_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...phraseData,
      createdAt: new Date()
    };

    const updatedPhrases = [...currentPhrases, newPhrase];
    this.saveTypewriterPhrasesToStorage(updatedPhrases);
    this.typewriterPhrasesSubject.next(updatedPhrases);

    console.log('✅ Frase agregada:', newPhrase);
    return newPhrase;
  }

  // Actualizar frase
  async updateTypewriterPhrase(id: string, updates: Partial<LocalTypewriterPhrase>): Promise<LocalTypewriterPhrase> {
    const currentPhrases = this.typewriterPhrasesSubject.value;
    const phraseIndex = currentPhrases.findIndex(p => p.id === id);
    
    if (phraseIndex === -1) {
      throw new Error('Frase no encontrada');
    }

    const updatedPhrase: LocalTypewriterPhrase = {
      ...currentPhrases[phraseIndex],
      ...updates
    };

    const updatedPhrases = [...currentPhrases];
    updatedPhrases[phraseIndex] = updatedPhrase;
    
    this.saveTypewriterPhrasesToStorage(updatedPhrases);
    this.typewriterPhrasesSubject.next(updatedPhrases);

    console.log('✅ Frase actualizada:', updatedPhrase);
    return updatedPhrase;
  }

  // Eliminar frase
  async deleteTypewriterPhrase(id: string): Promise<boolean> {
    const currentPhrases = this.typewriterPhrasesSubject.value;
    const updatedPhrases = currentPhrases.filter(p => p.id !== id);
    
    this.saveTypewriterPhrasesToStorage(updatedPhrases);
    this.typewriterPhrasesSubject.next(updatedPhrases);

    console.log('✅ Frase eliminada:', id);
    return true;
  }

  // Reordenar frases
  async reorderTypewriterPhrases(lang: 'es' | 'en' | 'pt', phraseIds: string[]): Promise<void> {
    const currentPhrases = this.typewriterPhrasesSubject.value;
    
    // Actualizar el orden de las frases del idioma especificado
    const updatedPhrases = currentPhrases.map(phrase => {
      if (phrase.lang === lang) {
        const newOrder = phraseIds.indexOf(phrase.id);
        return { ...phrase, order: newOrder >= 0 ? newOrder : phrase.order };
      }
      return phrase;
    });

    this.saveTypewriterPhrasesToStorage(updatedPhrases);
    this.typewriterPhrasesSubject.next(updatedPhrases);

    console.log('✅ Frases reordenadas para idioma:', lang);
  }
}
