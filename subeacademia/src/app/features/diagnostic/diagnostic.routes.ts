import { Routes } from '@angular/router';

export const DIAGNOSTIC_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./diagnostic.component').then(m => m.DiagnosticComponent) }
];


