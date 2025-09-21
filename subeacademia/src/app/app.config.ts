import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

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
    provideStorage(() => getStorage()),
    provideFirestore(() => {
      // AÑADIMOS LA INICIALIZACIÓN CON LA NUEVA CONFIGURACIÓN
      return initializeFirestore(getApp(), {
          // ESTA LÍNEA ES LA SOLUCIÓN:
          experimentalForceLongPolling: true, 
          localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
      });
    }),
    // --- FIN DE LA MODIFICACIÓN DE FIREBASE ---
    {
      provide: 'APP_INIT_LIGHT_MODE',
      useFactory: () => {
        const doc = inject(DOCUMENT);
        try {
          doc.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        } catch {}
        return true;
      }
    }
  ],
};

// Función helper para obtener la instancia de la app, necesaria para initializeFirestore
function getApp() {
    return initializeApp(environment.firebase);
}