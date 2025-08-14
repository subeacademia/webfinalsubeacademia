import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { InfoModalComponent } from './components/ui/info-modal/info-modal.component';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
	selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InfoModalComponent, I18nTranslatePipe],
    template: `
        <div class="flex flex-col items-center justify-start min-h-[80vh] p-6">
            <div class="w-full max-w-2xl">
                <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-2 bg-blue-500 transition-all" [style.width.%]="progress()"></div>
                </div>
            </div>
            <div class="w-full max-w-2xl mt-8">
                <ng-container [ngSwitch]="currentQuestion()?.type">
                    <ng-container *ngSwitchCase="'select'">
                        <div class="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
                            <div class="text-xl font-semibold mb-4">{{ currentQuestion()?.label | i18nTranslate }}</div>
                            <select class="select select-bordered w-full" [formControl]="currentQuestion()?.control" (change)="onSelectChanged($event)">
                                <option value="" disabled selected>{{ 'Selecciona una opción' | i18nTranslate }}</option>
                                <ng-container *ngFor="let group of currentQuestion()?.options">
                                    <optgroup [label]="group.category">
                                        <option *ngFor="let o of group.options" [ngValue]="o">{{ o }}</option>
                                    </optgroup>
                                </ng-container>
                            </select>
                        </div>
                    </ng-container>

                    <ng-container *ngSwitchCase="'likert'">
                        <div class="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
                            <div class="flex items-center justify-between mb-4">
                                <div class="text-xl font-semibold">{{ currentQuestion()?.label | i18nTranslate }}</div>
                                <button type="button" class="btn btn-ghost btn-xs" (click)="openInfo(currentQuestion()?.tooltip)">i</button>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button class="btn" *ngFor="let v of [0,1,2,3,4,5]" (click)="currentQuestion()?.control.setValue(v)" [class.btn-primary]="currentQuestion()?.control.value===v">{{ ('diagnostico.ares.likert.'+v) | i18nTranslate }}</button>
                            </div>
                        </div>
                    </ng-container>

                    <ng-container *ngSwitchCase="'text'">
                        <div class="p-6 rounded-lg shadow bg-white dark:bg-gray-800">
                            <div class="text-xl font-semibold mb-4">{{ currentQuestion()?.label | i18nTranslate }}</div>
                            <input class="input input-bordered w-full" [formControl]="currentQuestion()?.control" />
                        </div>
                    </ng-container>
                </ng-container>
            </div>
            <div class="mt-8 flex justify-between w-full max-w-2xl">
                <button class="btn" (click)="previousQuestion()">Anterior</button>
                <button class="btn btn-primary" (click)="nextQuestion()">Siguiente</button>
            </div>
        </div>
        <app-info-modal [open]="modalOpen" [content]="modalText" (close)="modalOpen=false"></app-info-modal>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {
    private readonly state = inject(DiagnosticStateService);

    flatQuestions: any[] = [];
    industriesOptions = [] as any[];
    currentQuestionIndex = signal(0);
    currentQuestion = computed(() => this.flatQuestions[this.currentQuestionIndex()] ?? null);
    progress = computed(() => this.flatQuestions.length ? (this.currentQuestionIndex() / this.flatQuestions.length) * 100 : 0);

    modalOpen = false;
    modalText = '';

    private createContextControl(key: string) {
        this.state['ensureContextControl']?.(key as any);
        return this.state.contextoControls[key];
    }

    onSelectChanged(ev: Event): void {
        const target = ev.target as HTMLSelectElement | null;
        const value = target?.value || '';
        this.state.setSegmentFromIndustry(value);
        // Reconstruir cuestionario con base en segmento
        this.buildFlatQuestions();
    }

    private buildFlatQuestions(): void {
        const list: any[] = [];
        // 1) Contexto ya contiene industria, agregar controles dinámicos actuales (sin industria)
        const ctxKeys = Object.keys(this.state.contextoControls).filter(k => k !== 'industria');
        for (const key of ctxKeys) {
            list.push({ type: 'text', label: `diagnostico.contexto.${key}`, control: this.state.contextoControls[key] });
        }
        // 2) ARES (una pregunta a la vez)
        for (const item of this.state.aresItems) {
            list.push({ type: 'likert', label: item.labelKey, tooltip: item.tooltip, control: this.state.aresForm.controls[item.id] });
        }
        // 3) Competencias (una pregunta a la vez)
        for (const comp of this.state.competencias) {
            list.push({ type: 'likert', label: comp.nameKey, control: this.state.competenciasForm.controls[comp.id] });
        }
        // 4) Objetivo y lead
        list.push({ type: 'likert', label: 'diagnostico.objetivo.title', control: this.state.form.controls['objetivo'] });
        list.push({ type: 'text', label: 'diagnostico.lead.nombre', control: this.state.leadForm.controls['nombre'] });
        list.push({ type: 'text', label: 'diagnostico.lead.email', control: this.state.leadForm.controls['email'] });
        list.push({ type: 'text', label: 'diagnostico.lead.telefono', control: this.state.leadForm.controls['telefono'] });

        // Insertar la primera de industria al inicio (cargada desde módulo de datos)
        this.flatQuestions = [
            { type: 'select', label: 'diagnostico.contexto.startup.industria', options: (this as any).industriesOptions, control: this.state.contextoControls['industria'] || this.createContextControl('industria') },
            ...list,
        ];
        this.currentQuestionIndex.set(0);
    }

    previousQuestion(): void {
        const idx = this.currentQuestionIndex();
        if (idx > 0) this.currentQuestionIndex.set(idx - 1);
    }

    nextQuestion(): void {
        const idx = this.currentQuestionIndex();
        if (idx < this.flatQuestions.length - 1) this.currentQuestionIndex.set(idx + 1);
    }

    openInfo(text?: string): void {
        if (!text) return;
        this.modalText = text;
        this.modalOpen = true;
    }

    async ngOnInit(): Promise<void> {
        const mod = await import('./data/industries');
        this.industriesOptions = (mod as any).INDUSTRIES;
        this.buildFlatQuestions();
    }
}


