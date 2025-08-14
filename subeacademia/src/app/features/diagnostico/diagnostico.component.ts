import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-diagnostico',
	standalone: true,
	imports: [CommonModule, RouterModule],
	template: `
		<div class="mx-auto max-w-5xl px-4 py-6">
			<router-outlet></router-outlet>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {}


