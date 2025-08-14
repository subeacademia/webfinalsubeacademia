import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { InfoModalComponent } from '../ui/info-modal/info-modal.component';
import { StepNavComponent } from '../step-nav.component';

@Component({
    selector: 'app-step-ares',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent, InfoModalComponent],
    templateUrl: './step-ares.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepAresComponent {
	readonly state = inject(DiagnosticStateService);
    modalOpen = false;
    modalText = '';

    openInfo(item: any): void {
        this.modalText = item?.tooltip || '';
        this.modalOpen = true;
    }
    closeModal(): void {
        this.modalOpen = false;
    }
}


