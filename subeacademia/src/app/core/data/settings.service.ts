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

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);
  readonly ref = doc(this.db, 'settings/general');

  get(): Observable<SiteSettings | undefined> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }
    return docData(this.ref) as unknown as Observable<SiteSettings | undefined>;
  }

  save(data: Partial<SiteSettings>) {
    return from(setDoc(this.ref, data, { merge: true }));
  }
}

