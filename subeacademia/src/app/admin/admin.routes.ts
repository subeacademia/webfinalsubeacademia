import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canMatch: [() => import('../core/guards/admin.guard').then(m => m.adminGuard)],
    loadComponent: () => import('./dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'posts' },
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
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  }
];

