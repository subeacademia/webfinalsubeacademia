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
    templateUrl: './step-ares.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepAresComponent {
	readonly state = inject(DiagnosticStateService);

    openInfo(item: { id: string }): void {
        const key = `diagnostico.ares.desc.${item.id}`;
        const text = (window as any).ngI18n?.(key) || key;
        alert(text);
    }
}


