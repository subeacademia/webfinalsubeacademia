import { Routes } from '@angular/router';

export const COURSE_ROUTES: Routes = [
  {
    path: ':slug',
    loadComponent: () => import('./course.component').then((m) => m.CourseComponent),
    data: { seo: { type: 'course' } },
  },
];

