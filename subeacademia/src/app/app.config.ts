import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getApp } from 'firebase/app';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    
    // --- INICIO DE LA MODIFICACIÓN DE FIREBASE ---
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    // Usar explícitamente el bucket real de Firebase Storage
    provideStorage(() => getStorage(undefined, 'gs://web-subeacademia.firebasestorage.app')),
    provideFirestore(() => initializeFirestore(getApp(), {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })),
    // --- FIN DE LA MODIFICACIÓN DE FIREBASE ---
  ],
};