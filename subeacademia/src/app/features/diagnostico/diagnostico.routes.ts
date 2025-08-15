import { Routes } from '@angular/router';
import { DiagnosticoComponent } from './diagnostico.component';

export const DIAGNOSTICO_ROUTES: Routes = [
  {
    path: '',
    component: DiagnosticoComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./components/steps/step-start/step-start.component').then(m => m.StepStartComponent) },
      { path: 'contexto', loadComponent: () => import('./components/steps/step-contexto/step-contexto.component').then(m => m.StepContextoComponent) },
      { path: 'ares/:phase', loadComponent: () => import('./components/steps/step-ares/step-ares.component').then(m => m.StepAresComponent) },
      { path: 'competencias/:group', loadComponent: () => import('./components/steps/step-competencias/step-competencias.component').then(m => m.StepCompetenciasComponent) },
      { path: 'objetivo', loadComponent: () => import('./components/steps/step-objetivo/step-objetivo.component').then(m => m.StepObjetivoComponent) },
      { path: 'lead', loadComponent: () => import('./components/steps/step-lead/step-lead.component').then(m => m.StepLeadComponent) },
      { path: 'resultados', loadComponent: () => import('./components/ui/diagnostic-results/diagnostic-results.component').then(m => m.DiagnosticResultsComponent) },
    ]
  }
];


