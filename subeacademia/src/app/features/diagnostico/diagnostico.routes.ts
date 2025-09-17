import { Routes } from '@angular/router';
import { DiagnosticoComponent } from './diagnostico.component';
import { StepStartComponent } from './components/steps/step-start/step-start.component';
import { StepContextoComponent } from './components/steps/step-contexto/step-contexto.component';
import { StepAresComponent } from './components/steps/step-ares/step-ares.component';
import { StepCompetenciasComponent } from './components/steps/step-competencias/step-competencias.component';
import { StepObjetivoComponent } from './components/steps/step-objetivo/step-objetivo.component';
import { StepLeadComponent } from './components/steps/step-lead/step-lead.component'; // Importar
import { DiagnosticResultsComponent } from './components/ui/diagnostic-results/diagnostic-results.component';

export const DIAGNOSTICO_ROUTES: Routes = [
  {
    path: 'empresas',
    loadComponent: () => import('./diagnostico-empresa.component').then(m => m.DiagnosticoEmpresaComponent),
    title: 'Diagnóstico para Empresas'
  },
  {
    path: '',
    component: DiagnosticoComponent,
    children: [
      { path: '', component: StepStartComponent },
      { path: 'contexto', component: StepContextoComponent },
      { path: 'ares', component: StepAresComponent },
      { path: 'competencias', component: StepCompetenciasComponent },
      { path: 'objetivo', component: StepObjetivoComponent },
      { path: 'finalizar', component: StepLeadComponent }, // Ruta añadida
      { path: 'resultados', component: DiagnosticResultsComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];


