import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list.component').then(m => m.ProjectListComponent),
  },
  {
    path: ':slug',
    loadComponent: () => import('./project-detail.component').then(m => m.ProjectDetailComponent),
  }
];
