import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-resumen',
	standalone: true,
    imports: [CommonModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.resumen.title' | i18nTranslate }}</h2>
			<p class="text-sm text-gray-600">{{ 'diagnostico.resumen.descripcion' | i18nTranslate }}</p>
			<pre class="bg-base-200 p-4 rounded-md overflow-auto text-xs">{{ state.form.value | json }}</pre>
			<app-step-nav prev="lead" [next]="null"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepResumenComponent {
	readonly state = inject(DiagnosticStateService);
}


