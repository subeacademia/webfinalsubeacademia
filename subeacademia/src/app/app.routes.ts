import { Routes } from '@angular/router';
import { langMatcher } from './core/routing/lang.matcher';
import { languageGuard } from './core/i18n/language.guard';
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

  // Páginas legales SIN idioma (accesibles globalmente)
  { 
    path: 'terminos', 
    loadComponent: () => import('./features/legal/terminos/terminos.component').then(m => m.TerminosComponent),
  },



  // Público con idioma restringido
  {
    matcher: langMatcher,
    canMatch: [languageGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'diagnostico', loadChildren: () => import('./features/diagnostico/diagnostico.routes').then(m => m.DIAGNOSTICO_ROUTES) },
      { path: 'blog', loadChildren: () => import('./features/blog/blog.routes').then(m => m.BLOG_ROUTES) },
      { path: 'productos', loadChildren: () => import('./features/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES) },
      { path: 'proyectos', loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES) },
      { path: 'nosotros', loadChildren: () => import('./features/about/about.routes').then(m => m.ABOUT_ROUTES) },
      { path: 'metodologia', loadChildren: () => import('./features/methodology/methodology.routes').then(m => m.METHODOLOGY_ROUTES) },
      { path: 'contacto', loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES) },
      { path: 'terminos', loadChildren: () => import('./features/legal/legal.routes').then(m => m.LEGAL_ROUTES) },
    ],
  },

  // 404
  { path: '**', component: HomeComponent },
];
