import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'es',
  },
  {
    path: ':lang',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: ':lang/blog',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/blog/blog.routes').then((m) => m.BLOG_ROUTES),
  },
  {
    path: ':lang/blog/:slug',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/blog/post.routes').then((m) => m.POST_ROUTES),
  },
  {
    path: ':lang/cursos',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/courses/courses.routes').then((m) => m.COURSES_ROUTES),
  },
  {
    path: ':lang/cursos/:slug',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/courses/course.routes').then((m) => m.COURSE_ROUTES),
  },
  {
    path: ':lang/ia',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/ia/ia.routes').then((m) => m.IA_ROUTES),
  },
  {
    path: ':lang/contacto',
    canMatch: [() => import('./core/i18n/language.guard').then(m => m.languageGuard)],
    resolve: { _lang: () => import('./core/i18n/language.guard').then(m => m.languageResolver) },
    loadChildren: () => import('./features/contact/contact.routes').then((m) => m.CONTACT_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: 'es' },
];
