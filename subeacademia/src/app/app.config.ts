import { APP_INITIALIZER, ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { environment } from '../environments/environment';

// Overrides de runtime con window.__env (opcional y simple)
const runtimeEnv = ((): typeof environment => {
  try {
    const w: any = typeof window !== 'undefined' ? (window as any) : undefined;
    if (w?.__env) {
      return {
        ...environment,
        ...w.__env,
        firebase: {
          ...environment.firebase,
          ...(w.__env.firebase || {}),
        },
      } as typeof environment;
    }
  } catch {
    // no-op
  }
  return environment;
})();

function shouldUseEmulators(): boolean {
  return isDevMode() && (runtimeEnv as any).useEmulators === true;
}

function injectGa4AndSearchConsoleFactory(doc: Document) {
  return () => {
    try {
      // Google Site Verification
      const token = runtimeEnv.settings?.searchConsoleVerification;
      if (token && !doc.querySelector('meta[name="google-site-verification"]')) {
        const meta = doc.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        meta.setAttribute('content', token);
        doc.head.appendChild(meta);
      }

      // GA4
      const id = runtimeEnv.ga4MeasurementId;
      if (id) {
        if (!doc.getElementById('ga4-src')) {
          const s = doc.createElement('script');
          s.async = true;
          s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
          s.id = 'ga4-src';
          doc.head.appendChild(s);
        }
        if (!doc.getElementById('ga4-inline')) {
          const inline = doc.createElement('script');
          inline.id = 'ga4-inline';
          inline.text = `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${id}', { anonymize_ip: true });`;
          doc.head.appendChild(inline);
        }
      }
    } catch {
      // no-op
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(runtimeEnv.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (shouldUseEmulators()) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
      return auth;
    }),
    provideFirestore(() => {
      const db = getFirestore();
      if (shouldUseEmulators()) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      return db;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (shouldUseEmulators()) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: injectGa4AndSearchConsoleFactory,
      deps: [DOCUMENT],
      multi: true,
    },
  ],
};
