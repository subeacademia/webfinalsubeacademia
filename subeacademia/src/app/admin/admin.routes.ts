import { Routes } from '@angular/router';
import { AdminGuard } from '../core/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [AdminGuard],
    loadComponent: () => import('./shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'posts' },
      { path: 'posts', loadComponent: () => import('./posts/posts-page.component').then(m => m.PostsPageComponent), canActivate: [AdminGuard] },
      { path: 'posts/new', loadComponent: () => import('./posts/post-edit.component').then(m => m.PostEditComponent), canActivate: [AdminGuard] },
      { path: 'posts/:id', loadComponent: () => import('./posts/post-edit.component').then(m => m.PostEditComponent), canActivate: [AdminGuard] },

      { path: 'courses', loadComponent: () => import('./courses/courses-page.component').then(m => m.CoursesPageComponent), canActivate: [AdminGuard] },
      { path: 'courses/new', loadComponent: () => import('./courses/course-edit.component').then(m => m.CourseEditComponent), canActivate: [AdminGuard] },
      { path: 'courses/:id', loadComponent: () => import('./courses/course-edit.component').then(m => m.CourseEditComponent), canActivate: [AdminGuard] },

      { path: 'media', loadComponent: () => import('./media/media-page.component').then(m => m.MediaPageComponent), canActivate: [AdminGuard] },
      { path: 'settings', loadComponent: () => import('./settings/settings-page.component').then(m => m.SettingsPageComponent), canActivate: [AdminGuard] },
      { path: '**', redirectTo: 'posts' }
    ]
  }
];

