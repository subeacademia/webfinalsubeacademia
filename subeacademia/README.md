# Subeacademia

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Firestore: índices y despliegue

La configuración de Firestore está enlazada desde `firebase.json` a `../firestore.indexes.json` y `firestore.rules`.

- Para desplegar únicamente Firestore (reglas e índices):

```bash
npm run deploy:db
```

Esto ejecuta `firebase deploy --only firestore`. Asegúrate de tener el proyecto seleccionado con `firebase use` o pasa `--project <id>`.

## Notas de arquitectura (Auth/Firestore/PWA)

- Única fuente de verdad de sesión/admin: `src/app/core/auth-core.service.ts`. No depende de router ni guards.
- Guards minimalistas: `src/app/core/auth.guard.ts` (login) y `src/app/core/admin.guard.ts` (admin). Usar `canActivate` en rutas.
- Acceso a Firestore: exclusivamente dentro de servicios inyectables (nunca en top-level ni directamente en componentes). Ejemplos: `core/media/media.service.ts`, `core/services/content.service.ts`, `core/firebase-data.service.ts`.
- Desarrollo sin Service Worker: `angular.json` tiene `serviceWorker: false` en dev y en opciones base; en producción se habilita vía `provideServiceWorker` con `enabled: !isDevMode()` en `app.config.ts`.
