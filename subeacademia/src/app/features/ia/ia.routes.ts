import { Routes } from '@angular/router';

export const IA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ia.component').then((m) => m.IaComponent),
  },
];

