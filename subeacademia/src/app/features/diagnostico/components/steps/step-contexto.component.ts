import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { INDUSTRIAS } from '../../data/industries';
import { StepNavComponent } from '../step-nav.component';

@Component({
    selector: 'app-step-contexto',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
    templateUrl: './step-contexto.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepContextoComponent {
	readonly state = inject(DiagnosticStateService);
    industrias = INDUSTRIAS;
}


