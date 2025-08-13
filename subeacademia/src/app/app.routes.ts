import { Routes } from '@angular/router';
import { langMatcher } from './core/routing/lang.matcher';
import { HomeComponent } from './pages/home/home.component';
import { LanguageGuard } from './core/i18n/language.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [LanguageGuard],
    component: HomeComponent,
  },

  // Admin SIN idioma (antes del matcher)
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    data: { preload: false }
  },

  // Página de login global (opcional)
  { 
    path: 'login', 
    loadComponent: () => import('./admin/login/login.component').then(m => m.LoginComponent),
  },

  // Público con idioma restringido
  {
    matcher: langMatcher,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'blog', loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES) },
      { path: 'cursos', loadChildren: () => import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES) },
      { path: 'nosotros', loadChildren: () => import('./features/about/about.routes').then(m => m.ABOUT_ROUTES) },
      { path: 'metodologia', loadChildren: () => import('./features/methodology/methodology.routes').then(m => m.METHODOLOGY_ROUTES) },
      { path: 'contacto', loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES) },
    ],
  },

  // 404
  { path: '**', component: HomeComponent },
];
