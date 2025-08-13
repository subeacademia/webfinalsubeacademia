import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);
  readonly ref = doc(this.db, 'settings/general');
  readonly homeRef = doc(this.db, 'site_content', 'home_page');

  get(): Observable<SiteSettings | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return docData(this.ref) as unknown as Observable<SiteSettings | undefined>;
  }

  save(data: Partial<SiteSettings>) {
    return from(setDoc(this.ref, data, { merge: true }));
  }

  getHomePageContent(): Observable<HomePageContent | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return docData(this.homeRef) as unknown as Observable<HomePageContent | undefined>;
  }

  setTypewriterPhrases(phrases: string[]) {
    return from(setDoc(this.homeRef, { typewriterPhrases: phrases }, { merge: true }));
  }

  async updateTypewriterPhrase(index: number, newValue: string, current: string[]) {
    const copy = [...current];
    if (index < 0 || index >= copy.length) return;
    copy[index] = newValue;
    return setDoc(this.homeRef, { typewriterPhrases: copy }, { merge: true });
  }
}

