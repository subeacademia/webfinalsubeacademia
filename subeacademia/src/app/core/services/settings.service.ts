import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, defer } from 'rxjs';
import { GeneralSettings } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly firestore: Firestore = inject(Firestore);
  private readonly docRef = doc(this.firestore, 'settings/general');

  getSettings(): Observable<GeneralSettings | undefined> {
    return defer(() => docData(this.docRef) as Observable<GeneralSettings | undefined>);
  }

  saveSettings(settings: GeneralSettings): Promise<void> {
    return setDoc(this.docRef, settings as any, { merge: true });
  }
}

