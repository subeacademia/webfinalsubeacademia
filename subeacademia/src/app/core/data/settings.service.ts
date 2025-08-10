import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

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
  readonly ref = doc(this.db, 'settings/general');

  get(): Observable<SiteSettings | undefined> {
    return docData(this.ref) as unknown as Observable<SiteSettings | undefined>;
  }

  save(data: Partial<SiteSettings>) {
    return from(setDoc(this.ref, data, { merge: true }));
  }
}

