import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-contexto',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.contexto.title' | i18nTranslate }}</h2>
			<form [formGroup]="state.form">
				<ng-container [ngSwitch]="state.form.controls['segmento'].value">
					<!-- STARTUP -->
					<div *ngSwitchCase="'startup'" class="grid gap-4">
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.startup.industria' | i18nTranslate }}</span>
							<input class="input input-bordered w-full" [formControl]="state.contextoControls['industria']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.startup.tamanoEquipo' | i18nTranslate }}</span>
							<input type="number" class="input input-bordered w-full" [formControl]="state.contextoControls['tamanoEquipo']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.startup.antiguedadMeses' | i18nTranslate }}</span>
							<input type="number" class="input input-bordered w-full" [formControl]="state.contextoControls['antiguedadMeses']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.startup.modeloNegocio' | i18nTranslate }}</span>
							<input class="input input-bordered w-full" [formControl]="state.contextoControls['modeloNegocio']">
						</label>
					</div>

					<!-- PYME -->
					<div *ngSwitchCase="'pyme'" class="grid gap-4">
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.pyme.industria' | i18nTranslate }}</span>
							<input class="input input-bordered w-full" [formControl]="state.contextoControls['industria']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.pyme.tamanoEmpresa' | i18nTranslate }}</span>
							<input type="number" class="input input-bordered w-full" [formControl]="state.contextoControls['tamanoEmpresa']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.pyme.facturacionAnual' | i18nTranslate }}</span>
							<input type="number" class="input input-bordered w-full" [formControl]="state.contextoControls['facturacionAnual']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.pyme.zonaOperacion' | i18nTranslate }}</span>
							<input class="input input-bordered w-full" [formControl]="state.contextoControls['zonaOperacion']">
						</label>
					</div>

					<!-- CORPORATIVO -->
					<div *ngSwitchCase="'corporativo'" class="grid gap-4">
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.corporativo.industria' | i18nTranslate }}</span>
							<input class="input input-bordered w-full" [formControl]="state.contextoControls['industria']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.corporativo.numEmpleados' | i18nTranslate }}</span>
							<input type="number" class="input input-bordered w-full" [formControl]="state.contextoControls['numEmpleados']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.corporativo.presupuestoInnovacion' | i18nTranslate }}</span>
							<input type="number" class="input input-bordered w-full" [formControl]="state.contextoControls['presupuestoInnovacion']">
						</label>
						<label class="form-control w-full">
							<span class="label-text">{{ 'diagnostico.contexto.corporativo.presenciaRegional' | i18nTranslate }}</span>
							<input type="checkbox" class="toggle" [formControl]="state.contextoControls['presenciaRegional']">
						</label>
					</div>
				</ng-container>
			</form>
			<app-step-nav prev="segmento" next="objetivo" [nextDisabled]="!state.form.controls['segmento'].valid"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepContextoComponent {
	readonly state = inject(DiagnosticStateService);
}


