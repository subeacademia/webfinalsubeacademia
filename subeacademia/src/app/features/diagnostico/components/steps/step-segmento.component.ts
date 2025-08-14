import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-segmento',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.segmento.title' | i18nTranslate }}</h2>
			<form [formGroup]="state.form">
				<div class="grid gap-4">
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="segmento" [value]="'startup'" (change)="state.onSegmentChanged('startup')">
						<span>{{ 'diagnostico.segmento.startup' | i18nTranslate }}</span>
					</label>
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="segmento" [value]="'pyme'" (change)="state.onSegmentChanged('pyme')">
						<span>{{ 'diagnostico.segmento.pyme' | i18nTranslate }}</span>
					</label>
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="segmento" [value]="'corporativo'" (change)="state.onSegmentChanged('corporativo')">
						<span>{{ 'diagnostico.segmento.corporativo' | i18nTranslate }}</span>
					</label>
				</div>
			</form>
			<app-step-nav [prev]="null" next="contexto" [nextDisabled]="!state.form.controls['segmento'].value"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSegmentoComponent {
	readonly state = inject(DiagnosticStateService);
}


