import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, docData, setDoc, collection, collectionData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, of, from, merge, catchError, map as rxMap, combineLatest, firstValueFrom } from 'rxjs';
import { map, catchError as opCatchError, switchMap } from 'rxjs/operators';

export interface SiteSettings {
  brandName: string;
  logoUrl?: string;
  defaultLang: 'es' | 'en' | 'pt';
  social?: { twitter?: string; linkedin?: string; youtube?: string };
  contactEmail?: string;
  ga4MeasurementId?: string;
  searchConsoleVerification?: string;
}

export interface HomePageContent {
  typewriterPhrases: string[];
  title?: string;
}

export interface TypewriterPhrase {
  id?: string;
  text: string;
  lang: 'es' | 'en' | 'pt';
  order: number;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);
  readonly ref = doc(this.db, 'settings/general');
  
  // Referencia dinámica por idioma
  private homeRefForLang(lang: 'es' | 'en' | 'pt') {
    return doc(this.db, 'configuracion_sitio', `textos_home_${lang}`);
  }
  // Fallback legacy path (reglas ya desplegadas)
  private homeRefFallbackForLang(lang: 'es' | 'en' | 'pt') {
    return doc(this.db, 'site_content', `home_page_${lang}`);
  }

  // Nueva colección para frases del typewriter - ESTRATEGIA SIMPLIFICADA
  private typewriterPhrasesCollection() {
    return collection(this.db, 'typewriter_phrases');
  }

  get(): Observable<SiteSettings | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return docData(this.ref) as unknown as Observable<SiteSettings | undefined>;
  }

  async save(data: Partial<SiteSettings>): Promise<void> {
    await setDoc(this.ref, data, { merge: true });
  }

  // ESTRATEGIA SIMPLIFICADA: Sin verificación de permisos compleja
  getTypewriterPhrases(lang: 'es' | 'en' | 'pt'): Observable<TypewriterPhrase[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    
    // USAR RUTAS LEGACY QUE SÍ FUNCIONAN
    return docData(this.homeRefForLang(lang)).pipe(
      opCatchError(() => docData(this.homeRefFallbackForLang(lang))),
      opCatchError(() => of(undefined)),
      map((d: any) => {
        if (!d) return [];
        const frases = Array.isArray(d?.frases) ? d.frases : [];
        return frases.map((text: string, index: number) => ({
          id: `legacy_${index}`,
          text,
          lang,
          order: index,
          createdAt: new Date()
        }));
      }),
      catchError((error: any) => {
        console.error('Error getting typewriter phrases:', error);
        return of([]);
      })
    );
  }

  async addTypewriterPhrase(phrase: Omit<TypewriterPhrase, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('🔄 Intentando agregar frase:', phrase);
      
      // USAR RUTAS LEGACY EN LUGAR DE LA NUEVA COLECCIÓN
      const lang = phrase.lang;
      const currentPhrases = await firstValueFrom(this.getTypewriterPhrases(lang)) || [];
      
      // Agregar nueva frase al array
      const updatedPhrases = [...currentPhrases, phrase];
      const phrasesArray = updatedPhrases.sort((a, b) => a.order - b.order).map(p => p.text);
      
      console.log('📝 Guardando frases:', phrasesArray);
      
      // Guardar en la ruta legacy que funciona
      try {
        await setDoc(this.homeRefForLang(lang), { frases: phrasesArray }, { merge: true });
        console.log('✅ Frase guardada en ruta primaria');
      } catch (error) {
        console.log('⚠️ Fallback a ruta secundaria');
        await setDoc(this.homeRefFallbackForLang(lang), { frases: phrasesArray }, { merge: true });
      }
      
      return `legacy_${phrase.order}`;
    } catch (error: any) {
      console.error('❌ Error adding typewriter phrase:', error);
      throw error;
    }
  }

  async updateTypewriterPhrase(id: string, updates: Partial<TypewriterPhrase>): Promise<void> {
    try {
      console.log('🔄 Intentando actualizar frase:', { id, updates });
      
      // USAR RUTAS LEGACY
      const lang = updates.lang || 'es';
      const currentPhrases = await firstValueFrom(this.getTypewriterPhrases(lang)) || [];
      
      // Encontrar y actualizar la frase
      const phraseIndex = currentPhrases.findIndex(p => p.id === id);
      if (phraseIndex !== -1) {
        currentPhrases[phraseIndex] = { ...currentPhrases[phraseIndex], ...updates };
        const phrasesArray = currentPhrases.sort((a, b) => a.order - b.order).map(p => p.text);
        
        console.log('📝 Guardando frases actualizadas:', phrasesArray);
        
        try {
          await setDoc(this.homeRefForLang(lang), { frases: phrasesArray }, { merge: true });
          console.log('✅ Frase actualizada en ruta primaria');
        } catch (error) {
          console.log('⚠️ Fallback a ruta secundaria');
          await setDoc(this.homeRefFallbackForLang(lang), { frases: phrasesArray }, { merge: true });
        }
      }
    } catch (error: any) {
      console.error('❌ Error updating typewriter phrase:', error);
      throw error;
    }
  }

  async deleteTypewriterPhrase(id: string): Promise<void> {
    try {
      console.log('🔄 Intentando eliminar frase:', id);
      
      // USAR RUTAS LEGACY
      const currentPhrases = await firstValueFrom(this.getTypewriterPhrases('es')) || []; // Asumir español por defecto
      const lang = 'es';
      
      // Filtrar la frase a eliminar
      const updatedPhrases = currentPhrases.filter(p => p.id !== id);
      const phrasesArray = updatedPhrases.sort((a, b) => a.order - b.order).map(p => p.text);
      
      console.log('📝 Guardando frases después de eliminar:', phrasesArray);
      
      try {
        await setDoc(this.homeRefForLang(lang), { frases: phrasesArray }, { merge: true });
        console.log('✅ Frase eliminada de ruta primaria');
      } catch (error) {
        console.log('⚠️ Fallback a ruta secundaria');
        await setDoc(this.homeRefFallbackForLang(lang), { frases: phrasesArray }, { merge: true });
      }
    } catch (error: any) {
      console.error('❌ Error deleting typewriter phrase:', error);
      throw error;
    }
  }

  // Método para obtener frases como array simple (para compatibilidad)
  getTypewriterPhrasesAsArray(lang: 'es' | 'en' | 'pt'): Observable<string[]> {
    return this.getTypewriterPhrases(lang).pipe(
      map(phrases => phrases.sort((a, b) => a.order - b.order).map(p => p.text))
    );
  }

  getHomePageContent(lang: 'es' | 'en' | 'pt'): Observable<HomePageContent | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    
    // Usar la nueva colección de frases
    const phrases$ = this.getTypewriterPhrasesAsArray(lang);
    
    // Obtener título del home
    const title$ = docData(this.homeRefForLang(lang)).pipe(
      opCatchError(() => docData(this.homeRefFallbackForLang(lang))),
      opCatchError(() => of(undefined)),
      map((d: any) => {
        if (!d) return undefined;
        return typeof d?.titulo === 'string' ? d.titulo : (typeof d?.title === 'string' ? d.title : undefined);
      })
    );
    
    // Combinar frases y título
    return combineLatest([phrases$, title$]).pipe(
      map(([phrases, title]) => ({
        typewriterPhrases: phrases,
        title
      }))
    ) as Observable<HomePageContent>;
  }

  // Métodos legacy para compatibilidad (ahora usan la nueva colección)
  async setTypewriterPhrases(lang: 'es' | 'en' | 'pt', phrases: string[]): Promise<void> {
    // Eliminar frases existentes
    const existingPhrases = await firstValueFrom(this.getTypewriterPhrases(lang));
    if (existingPhrases) {
      for (const phrase of existingPhrases) {
        if (phrase.id) {
          await this.deleteTypewriterPhrase(phrase.id);
        }
      }
    }
    
    // Agregar nuevas frases
    for (let i = 0; i < phrases.length; i++) {
      await this.addTypewriterPhrase({
        text: phrases[i],
        lang,
        order: i
      });
    }
  }

  async updateTypewriterPhraseByIndex(lang: 'es' | 'en' | 'pt', index: number, newValue: string, current: string[]): Promise<void> {
    const existingPhrases = await firstValueFrom(this.getTypewriterPhrases(lang));
    if (existingPhrases && existingPhrases[index]) {
      await this.updateTypewriterPhrase(existingPhrases[index].id!, { text: newValue });
    }
  }

  async setHomeTitle(lang: 'es' | 'en' | 'pt', title: string): Promise<void> {
    try {
      await setDoc(this.homeRefForLang(lang), { titulo: title }, { merge: true });
    } catch (error: any) {
      console.error('Error setting home title:', error);
      // Fallback a la ruta legacy
      await setDoc(this.homeRefFallbackForLang(lang), { titulo: title }, { merge: true });
    }
  }
}

