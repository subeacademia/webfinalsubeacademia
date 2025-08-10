import { Routes } from '@angular/router';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./courses-list.component').then((m) => m.CoursesListComponent),
  },
];

