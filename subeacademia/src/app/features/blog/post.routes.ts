import { Routes } from '@angular/router';

export const POST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./post.component').then((m) => m.PostComponent),
    data: { seo: { type: 'post' } },
  },
];

