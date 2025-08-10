import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dejar todo en modo Server; el prerender utilizará las rutas de 'prerender-routes.json'
  { path: '**', renderMode: RenderMode.Server },
];
