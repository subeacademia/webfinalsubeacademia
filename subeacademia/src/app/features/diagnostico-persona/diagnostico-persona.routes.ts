import { Routes } from '@angular/router';

export const DIAGNOSTICO_PERSONA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./diagnostico-persona.component').then(m => m.DiagnosticoPersonaComponent),
    children: [
      { path: '', redirectTo: 'edad', pathMatch: 'full' },
      { path: 'edad', loadComponent: () => import('./components/edad/edad.component').then(m => m.EdadComponent) },
      { path: 'consentimiento', loadComponent: () => import('./components/consentimiento/consentimiento.component').then(m => m.ConsentimientoComponent) },
      { path: 'cuestionario/menor', loadComponent: () => import('./components/cuestionario-menor/cuestionario-menor.component').then(m => m.CuestionarioMenorComponent) },
      { path: 'cuestionario/adulto', loadComponent: () => import('./components/cuestionario-adulto/cuestionario-adulto.component').then(m => m.CuestionarioAdultoComponent) },
      { path: 'resumen', loadComponent: () => import('./components/resumen/resumen.component').then(m => m.ResumenComponent) },
      { path: 'resultados/:sessionId', loadComponent: () => import('./components/resultados/resultados.component').then(m => m.ResultadosComponent) },
      { path: '**', redirectTo: 'edad', pathMatch: 'full' }
    ]
  }
];
