import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { computed, Signal } from '@angular/core';
import { COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO } from '../../data/competencias';
import { StepNavComponent } from '../step-nav.component';

@Component({
    selector: 'app-step-competencias',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, StepNavComponent],
    templateUrl: './step-competencias.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCompetenciasComponent {
    readonly state = inject(DiagnosticStateService);
    readonly competenciasFiltradas = computed(() => {
        const seg = this.state.form.controls['segmento'].value || 'startup';
        const top = COMPETENCIAS_PRIORITARIAS_POR_SEGMENTO[seg as any] || [];
        return this.state.competencias.filter(c => top.includes(c.id));
    });
}


