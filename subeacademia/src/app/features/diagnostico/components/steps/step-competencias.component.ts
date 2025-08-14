import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-competencias',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.competencias.title' | i18nTranslate }}</h2>
			<form [formGroup]="state.competenciasForm">
				<div class="space-y-4">
					<div *ngFor="let comp of state.competencias" class="p-4 border rounded-lg">
						<div class="mb-3 font-medium">{{ comp.nameKey | i18nTranslate }}</div>
						<div class="flex flex-wrap gap-2">
							<button type="button" class="btn btn-sm" *ngFor="let nivel of state.nivelesCompetencia" (click)="state.setCompetenciaNivel(comp.id, nivel)" [class.btn-primary]="state.competenciasForm.controls[comp.id].value === nivel">
								{{ ('diagnostico.competencias.nivel.' + nivel) | i18nTranslate }}
							</button>
						</div>
					</div>
				</div>
			</form>
			<app-step-nav prev="ares" next="lead"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCompetenciasComponent {
	readonly state = inject(DiagnosticStateService);
}


