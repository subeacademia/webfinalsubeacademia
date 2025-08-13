import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of, from, merge, catchError, map as rxMap } from 'rxjs';
import { map, catchError as opCatchError } from 'rxjs/operators';

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

  get(): Observable<SiteSettings | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return docData(this.ref) as unknown as Observable<SiteSettings | undefined>;
  }

  async save(data: Partial<SiteSettings>): Promise<void> {
    await setDoc(this.ref, data, { merge: true });
  }

  getHomePageContent(lang: 'es' | 'en' | 'pt'): Observable<HomePageContent | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    const primary$ = (docData(this.homeRefForLang(lang)) as unknown as Observable<any>)
      .pipe(opCatchError(() => of(undefined)));
    const fallback$ = (docData(this.homeRefFallbackForLang(lang)) as unknown as Observable<any>)
      .pipe(opCatchError(() => of(undefined)));
    return merge(primary$, fallback$).pipe(
      rxMap((d: any) => {
        if (!d) return undefined;
        const frases: string[] = Array.isArray(d?.frases) ? d.frases : (Array.isArray(d?.typewriterPhrases) ? d.typewriterPhrases : []);
        const title: string | undefined = typeof d?.titulo === 'string' ? d.titulo : (typeof d?.title === 'string' ? d.title : undefined);
        return { typewriterPhrases: frases, title } as HomePageContent;
      })
    ) as unknown as Observable<HomePageContent | undefined>;
  }

  async setTypewriterPhrases(lang: 'es' | 'en' | 'pt', phrases: string[]): Promise<void> {
    try {
      await setDoc(this.homeRefForLang(lang), { frases: phrases }, { merge: true });
    } catch {
      await setDoc(this.homeRefFallbackForLang(lang), { frases: phrases }, { merge: true });
    }
  }

  async updateTypewriterPhrase(lang: 'es' | 'en' | 'pt', index: number, newValue: string, current: string[]): Promise<void> {
    const copy = [...current];
    if (index < 0 || index >= copy.length) return;
    copy[index] = newValue;
    try {
      await setDoc(this.homeRefForLang(lang), { frases: copy }, { merge: true });
    } catch {
      await setDoc(this.homeRefFallbackForLang(lang), { frases: copy }, { merge: true });
    }
  }

  async setHomeTitle(lang: 'es' | 'en' | 'pt', title: string): Promise<void> {
    try {
      await setDoc(this.homeRefForLang(lang), { titulo: title }, { merge: true });
    } catch {
      await setDoc(this.homeRefFallbackForLang(lang), { titulo: title }, { merge: true });
    }
  }
}

