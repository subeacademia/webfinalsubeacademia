import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { StepNavComponent } from '../step-nav.component';

@Component({
	selector: 'app-step-ares',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
	template: `
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold">{{ 'diagnostico.ares.title' | i18nTranslate }}</h2>
			<form [formGroup]="state.aresForm">
				<div class="space-y-4">
					<div *ngFor="let item of state.aresItems" class="p-4 border rounded-lg">
						<div class="mb-3 font-medium">{{ item.labelKey | i18nTranslate }}</div>
						<div class="flex flex-wrap gap-2">
							<button type="button" class="btn btn-sm" *ngFor="let v of [0,1,2,3,4,5]" (click)="state.setAresAnswer(item.id, v)" [class.btn-primary]="state.aresForm.controls[item.id].value === v">
								{{ ('diagnostico.ares.likert.' + v) | i18nTranslate }}
							</button>
						</div>
					</div>
				</div>
			</form>
			<app-step-nav prev="objetivo" next="competencias"></app-step-nav>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepAresComponent {
	readonly state = inject(DiagnosticStateService);
}


