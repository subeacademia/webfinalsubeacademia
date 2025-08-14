import { Routes } from '@angular/router';

import { DiagnosticoComponent } from './diagnostico.component';
import { DiagnosticResultsComponent } from './components/ui/diagnostic-results.component';

export const DIAGNOSTICO_ROUTES: Routes = [
{
	path: '',
	component: DiagnosticoComponent,
},
{
	path: 'resumen',
	component: DiagnosticResultsComponent,
},
];


