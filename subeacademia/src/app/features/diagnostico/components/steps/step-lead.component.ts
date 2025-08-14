import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-lead',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.lead.title' | i18nTranslate }}</h2>
			<form [formGroup]="state.leadForm" class="grid gap-4 max-w-xl">
				<label class="form-control w-full">
					<span class="label-text">{{ 'diagnostico.lead.nombre' | i18nTranslate }}</span>
					<input class="input input-bordered w-full" formControlName="nombre">
				</label>
				<label class="form-control w-full">
					<span class="label-text">{{ 'diagnostico.lead.email' | i18nTranslate }}</span>
					<input class="input input-bordered w-full" formControlName="email" type="email">
				</label>
				<label class="form-control w-full">
					<span class="label-text">{{ 'diagnostico.lead.telefono' | i18nTranslate }}</span>
					<input class="input input-bordered w-full" formControlName="telefono">
				</label>
				<label class="flex items-center gap-3">
					<input type="checkbox" class="checkbox" formControlName="aceptaComunicaciones">
					<span>{{ 'diagnostico.lead.aceptaComunicaciones' | i18nTranslate }}</span>
				</label>
			</form>
			<app-step-nav prev="competencias" next="resumen" [nextDisabled]="!state.leadForm.valid"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepLeadComponent {
	readonly state = inject(DiagnosticStateService);
}


