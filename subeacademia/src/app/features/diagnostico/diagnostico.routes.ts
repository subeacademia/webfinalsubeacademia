import { Routes } from '@angular/router';

import { DiagnosticoComponent } from './diagnostico.component';
import { StepContextoComponent } from './components/steps/step-contexto.component';
import { StepObjetivoComponent } from './components/steps/step-objetivo.component';
import { StepAresComponent } from './components/steps/step-ares.component';
import { StepCompetenciasComponent } from './components/steps/step-competencias.component';
import { StepLeadComponent } from './components/steps/step-lead.component';
import { StepResumenComponent } from './components/steps/step-resumen.component';

export const DIAGNOSTICO_ROUTES: Routes = [
{
	path: '',
	component: DiagnosticoComponent,
	children: [
		{ path: '', pathMatch: 'full', redirectTo: 'contexto' },
		{ path: 'contexto', component: StepContextoComponent },
		{ path: 'objetivo', component: StepObjetivoComponent },
		{ path: 'ares', component: StepAresComponent },
		{ path: 'competencias', component: StepCompetenciasComponent },
		{ path: 'lead', component: StepLeadComponent },
		{ path: 'resumen', component: StepResumenComponent },
	],
},
];


