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
    templateUrl: './step-segmento.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSegmentoComponent {
	readonly state = inject(DiagnosticStateService);
}


