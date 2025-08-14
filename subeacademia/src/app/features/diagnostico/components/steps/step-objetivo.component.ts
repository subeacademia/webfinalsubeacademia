import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-objetivo',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.objetivo.title' | i18nTranslate }}</h2>
			<form [formGroup]="state.form">
				<div class="grid gap-4">
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="objetivo" [value]="'eficiencia'">
						<span>{{ 'diagnostico.objetivo.eficiencia' | i18nTranslate }}</span>
					</label>
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="objetivo" [value]="'crecimiento'">
						<span>{{ 'diagnostico.objetivo.crecimiento' | i18nTranslate }}</span>
					</label>
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="objetivo" [value]="'innovacion'">
						<span>{{ 'diagnostico.objetivo.innovacion' | i18nTranslate }}</span>
					</label>
					<label class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
						<input type="radio" class="radio" formControlName="objetivo" [value]="'experienciaCliente'">
						<span>{{ 'diagnostico.objetivo.experienciaCliente' | i18nTranslate }}</span>
					</label>
				</div>
			</form>
			<app-step-nav prev="contexto" next="ares" [nextDisabled]="!state.form.controls['objetivo'].value"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepObjetivoComponent {
	readonly state = inject(DiagnosticStateService);
}


