import { Routes } from '@angular/router';
import { DiagnosticoComponent } from './diagnostico.component';
import { StepStartComponent } from './components/steps/step-start/step-start.component';
import { StepContextoComponent } from './components/steps/step-contexto/step-contexto.component';
import { StepAresComponent } from './components/steps/step-ares/step-ares.component';
import { StepCompetenciasComponent } from './components/steps/step-competencias/step-competencias.component';
import { StepObjetivoComponent } from './components/steps/step-objetivo/step-objetivo.component';
import { StepLeadComponent } from './components/steps/step-lead/step-lead.component';
import { DiagnosticResultsComponent } from './components/ui/diagnostic-results/diagnostic-results.component';
import { SimpleDiagnosticResultsComponent } from './components/ui/simple-diagnostic-results/simple-diagnostic-results.component';
import { EnhancedDiagnosticResultsComponent } from './components/ui/enhanced-diagnostic-results/enhanced-diagnostic-results.component';

export const DIAGNOSTICO_ROUTES: Routes = [
  {
    path: '',
    component: DiagnosticoComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: StepStartComponent },
      { path: 'contexto', component: StepContextoComponent },
      { path: 'ares', component: StepAresComponent },
      { path: 'ares/:phase', component: StepAresComponent },
      { path: 'competencias', component: StepCompetenciasComponent },
      { path: 'competencias/:group', component: StepCompetenciasComponent },
      { path: 'objetivo', component: StepObjetivoComponent },
      { path: 'lead', component: StepLeadComponent },
      { path: 'resultados', component: EnhancedDiagnosticResultsComponent },
      { path: 'resultados/:id', component: EnhancedDiagnosticResultsComponent },
    ]
  }
];


