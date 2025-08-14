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
    templateUrl: './step-objetivo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepObjetivoComponent {
	readonly state = inject(DiagnosticStateService);
}


