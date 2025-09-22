import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
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
  homeTitle?: string; // Título principal de la página de inicio
  // Fondo del Home seleccionado desde Admin (para propagar a todos los dispositivos)
  homeBackgroundKey?: string;
  homeBackgroundName?: string;
}

export interface HomePageContent {
  typewriterPhrases: string[];
  title?: string;
  homeBackgroundKey?: string;
  homeBackgroundName?: string;
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
  private readonly db: Firestore;
  private readonly platformId: object;
  readonly ref: any;
  
  constructor(
    @Inject(Firestore) db: Firestore,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.db = db;
    this.platformId = platformId;
    this.ref = doc(this.db, 'settings/general');
  }
  
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
      console.log('🚫 No es plataforma browser, retornando undefined');
      return of(undefined);
    }
    
    console.log('🔍 Obteniendo contenido del home para idioma:', lang);
    
    // Usar la nueva colección de frases
    const phrases$ = this.getTypewriterPhrasesAsArray(lang);
    
    // Obtener datos del home (título + fondo)
    const homeDoc$ = docData(this.homeRefForLang(lang)).pipe(
      opCatchError((error) => {
        console.log('⚠️ Error en ruta primaria, intentando fallback:', error);
        return docData(this.homeRefFallbackForLang(lang));
      }),
      opCatchError((error) => {
        console.log('⚠️ Error en ruta fallback, retornando undefined:', error);
        return of(undefined);
      }),
      map((d: any) => {
        console.log('📄 Datos obtenidos del documento:', d);
        if (!d) return undefined as any;
        const titulo = typeof d?.titulo === 'string' ? d.titulo : (typeof d?.title === 'string' ? d.title : undefined);
        const homeBackgroundKey = typeof d?.homeBackgroundKey === 'string' ? d.homeBackgroundKey : undefined;
        const homeBackgroundName = typeof d?.homeBackgroundName === 'string' ? d.homeBackgroundName : undefined;
        return { titulo, homeBackgroundKey, homeBackgroundName } as any;
      })
    );
    
    // Combinar frases y título
    return combineLatest([phrases$, homeDoc$]).pipe(
      map(([phrases, home]) => {
        const payload: HomePageContent = {
          typewriterPhrases: phrases,
          title: (home as any)?.titulo,
          homeBackgroundKey: (home as any)?.homeBackgroundKey,
          homeBackgroundName: (home as any)?.homeBackgroundName
        };
        console.log('🔍 Contenido final del home:', payload);
        return payload;
      })
    ) as Observable<HomePageContent>;
  }

  // Permitir que Admin publique también el fondo del Home en el documento público por idioma
  async setHomeBackgroundKey(lang: 'es' | 'en' | 'pt', key: string, name?: string): Promise<void> {
    try {
      await setDoc(this.homeRefForLang(lang), { homeBackgroundKey: key, homeBackgroundName: name }, { merge: true });
    } catch (error) {
      console.warn('⚠️ Fallback al documento legacy para homeBackgroundKey');
      await setDoc(this.homeRefFallbackForLang(lang), { homeBackgroundKey: key, homeBackgroundName: name }, { merge: true });
    }
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

  // Método de prueba para verificar conexión y crear datos si no existen
  async testAndInitializeHomeContent(lang: 'es' | 'en' | 'pt'): Promise<void> {
    try {
      console.log('🧪 Probando conexión con Firestore para idioma:', lang);
      
      // Intentar obtener datos existentes
      const existingData = await firstValueFrom(docData(this.homeRefForLang(lang)));
      console.log('📄 Datos existentes en ruta primaria:', existingData);
      
      if (!existingData || !existingData['titulo']) {
        console.log('📝 No hay título configurado, creando datos por defecto');
        
        // Crear datos por defecto
        let titulo = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
        if (lang === 'en') titulo = 'Power Your Talent in the Age of Artificial Intelligence';
        if (lang === 'pt') titulo = 'Potencialize seu Talento na Era da Inteligência Artificial';
        
        let frases = [
          'Implementa IA de forma Ágil, Responsable y Sostenible con nuestro Framework ARES-AI©.',
          'Desarrolla las 13 competencias clave que tu equipo necesita para liderar la transformación digital.',
          'Transforma tu organización con nuestra plataforma de aprendizaje adaptativo AVE-AI.'
        ];
        
        if (lang === 'en') {
          frases = [
            'Implement AI in an Agile, Responsible and Sustainable way with our ARES-AI© Framework.',
            'Develop the 13 key competencies your team needs to lead digital transformation.',
            'Transform your organization with our adaptive learning platform AVE-AI.'
          ];
        } else if (lang === 'pt') {
          frases = [
            'Implemente IA de forma Ágil, Responsável e Sustentável com nosso Framework ARES-AI©.',
            'Desenvolva as 13 competências-chave que sua equipe precisa para liderar a transformação digital.',
            'Transforme sua organização com nossa plataforma de aprendizado adaptativo AVE-AI.'
          ];
        }
        
        const defaultData = { titulo, frases };
        
        console.log('📝 Guardando datos por defecto:', defaultData);
        await setDoc(this.homeRefForLang(lang), defaultData);
        console.log('✅ Datos por defecto guardados exitosamente');
      } else {
        console.log('✅ Datos existentes encontrados, no se necesita inicialización');
      }
      
    } catch (error: any) {
      console.error('❌ Error en testAndInitializeHomeContent:', error);
      
      // Intentar con ruta fallback
      try {
        console.log('🔄 Intentando con ruta fallback');
        const fallbackData = await firstValueFrom(docData(this.homeRefFallbackForLang(lang)));
        console.log('📄 Datos en ruta fallback:', fallbackData);
        
        if (!fallbackData || !fallbackData['titulo']) {
          console.log('📝 Creando datos por defecto en ruta fallback');
          
          let titulo = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
          if (lang === 'en') titulo = 'Power Your Talent in the Age of Artificial Intelligence';
          if (lang === 'pt') titulo = 'Potencialize seu Talento na Era da Inteligência Artificial';
          
          let frases = [
            'Implementa IA de forma Ágil, Responsable y Sostenible con nuestro Framework ARES-AI©.',
            'Desarrolla las 13 competencias clave que tu equipo necesita para liderar la transformación digital.',
            'Transforma tu organización con nuestra plataforma de aprendizaje adaptativo AVE-AI.'
          ];
          
          if (lang === 'en') {
            frases = [
              'Implement AI in an Agile, Responsible and Sustainable way with our ARES-AI© Framework.',
              'Develop the 13 key competencies your team needs to lead digital transformation.',
              'Transform your organization with our adaptive learning platform AVE-AI.'
            ];
          } else if (lang === 'pt') {
            frases = [
              'Implemente IA de forma Ágil, Responsável e Sustentável com nosso Framework ARES-AI©.',
              'Desenvolva as 13 competências-chave que sua equipe precisa para liderar a transformação digital.',
              'Transforme sua organização com nossa plataforma de aprendizado adaptativo AVE-AI.'
            ];
          }
          
          const defaultData = { titulo, frases };
          
          await setDoc(this.homeRefFallbackForLang(lang), defaultData);
          console.log('✅ Datos por defecto guardados en ruta fallback');
        }
      } catch (fallbackError: any) {
        console.error('❌ Error también en ruta fallback:', fallbackError);
      }
    }
  }
}

