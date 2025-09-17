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

      { path: 'productos', loadComponent: () => import('./productos/productos-dashboard.component').then(m => m.ProductosDashboardComponent), canActivate: [AdminGuard] },
      { path: 'productos/asesorias', loadComponent: () => import('./productos/admin-asesorias.component').then(m => m.AdminAsesoriasComponent), canActivate: [AdminGuard] },
      { path: 'productos/cursos', loadComponent: () => import('./productos/admin-cursos.component').then(m => m.AdminCursosComponent), canActivate: [AdminGuard] },
      { path: 'productos/certificaciones', loadComponent: () => import('./productos/admin-certificaciones.component').then(m => m.AdminCertificacionesComponent), canActivate: [AdminGuard] },

      // Certificados (validador): CRUD propio
      { path: 'certificados', loadComponent: () => import('./certificados/admin-certificados.component').then(m => m.AdminCertificadosComponent), canActivate: [AdminGuard] },

      { path: 'projects', loadComponent: () => import('./projects/projects-page.component').then(m => m.ProjectsPageComponent), canActivate: [AdminGuard] },
      { path: 'projects/new', loadComponent: () => import('./projects/project-edit.component').then(m => m.ProjectEditComponent), canActivate: [AdminGuard] },
      { path: 'projects/:id', loadComponent: () => import('./projects/project-edit.component').then(m => m.ProjectEditComponent), canActivate: [AdminGuard] },

      { path: 'media', loadComponent: () => import('./media/media-page.component').then(m => m.MediaPageComponent), canActivate: [AdminGuard] },
      { path: 'logos', loadComponent: () => import('./logos/logos-page.component').then(m => m.LogosPageComponent), canActivate: [AdminGuard] },
      { path: 'history', loadComponent: () => import('./history/history-page.component').then(m => m.HistoryPageComponent), canActivate: [AdminGuard] },
      { path: 'collaborators', loadComponent: () => import('./collaborators/collaborators-page.component').then(m => m.CollaboratorsPageComponent), canActivate: [AdminGuard] },
      { path: 'leads', loadComponent: () => import('./leads/admin-leads.component').then(m => m.AdminLeadsComponent), canActivate: [AdminGuard] },
      { path: 'diagnostic-leads', loadComponent: () => import('./leads/admin-diagnostic-leads.component').then(m => m.AdminDiagnosticLeadsComponent), canActivate: [AdminGuard] },
      { path: 'diagnostic-leads-empresa', loadComponent: () => import('./leads/admin-diagnostic-leads-empresa.component').then(m => m.AdminDiagnosticLeadsEmpresaComponent), canActivate: [AdminGuard] },
      { path: 'settings', loadComponent: () => import('./settings/settings-page.component').then(m => m.SettingsPageComponent), canActivate: [AdminGuard] },
      { path: '**', redirectTo: 'posts' }
    ]
  }
];

