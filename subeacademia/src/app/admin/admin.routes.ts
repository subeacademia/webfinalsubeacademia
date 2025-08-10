import { Routes } from '@angular/router';
import { AdminGuard } from '../core/auth/admin.guard';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [AdminGuard],
    loadComponent: () => import('./shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'posts' },
      { path: 'posts', loadComponent: () => import('./posts/posts-page.component').then(m => m.PostsPageComponent) },
      { path: 'posts/new', loadComponent: () => import('./posts/post-edit.component').then(m => m.PostEditComponent) },
      { path: 'posts/:id', loadComponent: () => import('./posts/post-edit.component').then(m => m.PostEditComponent) },

      { path: 'courses', loadComponent: () => import('./courses/courses-page.component').then(m => m.CoursesPageComponent) },
      { path: 'courses/new', loadComponent: () => import('./courses/course-edit.component').then(m => m.CourseEditComponent) },
      { path: 'courses/:id', loadComponent: () => import('./courses/course-edit.component').then(m => m.CourseEditComponent) },

      { path: 'media', loadComponent: () => import('./media/media-page.component').then(m => m.MediaPageComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings-page.component').then(m => m.SettingsPageComponent) },
      { path: '**', redirectTo: 'posts' }
    ]
  }
];

