import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    children: [
      {
        path: 'posts',
        loadComponent: () => import('./posts/admin-posts.component').then((m) => m.AdminPostsComponent),
      },
      {
        path: 'courses',
        loadComponent: () => import('./courses/admin-courses.component').then((m) => m.AdminCoursesComponent),
      },
      {
        path: 'media',
        loadComponent: () => import('./media/admin-media.component').then((m) => m.AdminMediaComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/admin-settings.component').then((m) => m.AdminSettingsComponent),
      },
    ],
  },
];

