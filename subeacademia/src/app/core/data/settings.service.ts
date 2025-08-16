import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, docData, setDoc, collection, collectionData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Observable, of, from, merge, catchError, map as rxMap, combineLatest } from 'rxjs';
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
  private readonly auth = inject(Auth);
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

  // Nueva colección para frases del typewriter
  private typewriterPhrasesCollection() {
    return collection(this.db, 'typewriter_phrases');
  }

  // Verificar si el usuario está autenticado como admin
  private isUserAdmin(): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    
    // Verificar si es admin o tiene email de subeia.tech
    return user.email?.endsWith('@subeia.tech') || false;
  }

  get(): Observable<SiteSettings | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return docData(this.ref) as unknown as Observable<SiteSettings | undefined>;
  }

  async save(data: Partial<SiteSettings>): Promise<void> {
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador');
    }
    await setDoc(this.ref, data, { merge: true });
  }

  // Nuevos métodos para gestionar frases del typewriter
  getTypewriterPhrases(lang: 'es' | 'en' | 'pt'): Observable<TypewriterPhrase[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    
    return collectionData(this.typewriterPhrasesCollection(), { idField: 'id' }).pipe(
      map(phrases => phrases.filter(phrase => phrase['lang'] === lang) as TypewriterPhrase[]),
      catchError((error: any) => {
        console.error('Error getting typewriter phrases:', error);
        if (error.code === 'permission-denied') {
          console.warn('Permission denied - user may not be authenticated as admin');
        }
        return of([]);
      })
    );
  }

  async addTypewriterPhrase(phrase: Omit<TypewriterPhrase, 'id' | 'createdAt'>): Promise<string> {
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador para agregar frases');
    }
    
    try {
      const docRef = await addDoc(this.typewriterPhrasesCollection(), {
        ...phrase,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding typewriter phrase:', error);
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos de administrador para agregar frases');
      }
      throw error;
    }
  }

  async updateTypewriterPhrase(id: string, updates: Partial<TypewriterPhrase>): Promise<void> {
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador para actualizar frases');
    }
    
    try {
      const docRef = doc(this.db, 'typewriter_phrases', id);
      await updateDoc(docRef, updates);
    } catch (error: any) {
      console.error('Error updating typewriter phrase:', error);
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos de administrador para actualizar frases');
      }
      throw error;
    }
  }

  async deleteTypewriterPhrase(id: string): Promise<void> {
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador para eliminar frases');
    }
    
    try {
      const docRef = doc(this.db, 'typewriter_phrases', id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Error deleting typewriter phrase:', error);
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos de administrador para eliminar frases');
      }
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
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador para gestionar frases');
    }
    
    // Eliminar frases existentes
    const existingPhrases = await this.getTypewriterPhrases(lang).toPromise();
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
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador para actualizar frases');
    }
    
    const existingPhrases = await this.getTypewriterPhrases(lang).toPromise();
    if (existingPhrases && existingPhrases[index]) {
      await this.updateTypewriterPhrase(existingPhrases[index].id!, { text: newValue });
    }
  }

  async setHomeTitle(lang: 'es' | 'en' | 'pt', title: string): Promise<void> {
    if (!this.isUserAdmin()) {
      throw new Error('No tienes permisos de administrador para gestionar el título');
    }
    
    try {
      await setDoc(this.homeRefForLang(lang), { titulo: title }, { merge: true });
    } catch (error: any) {
      console.error('Error setting home title:', error);
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos de administrador para gestionar el título');
      }
      // Fallback a la ruta legacy
      await setDoc(this.homeRefFallbackForLang(lang), { titulo: title }, { merge: true });
    }
  }
}

