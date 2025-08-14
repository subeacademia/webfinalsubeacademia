import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-step-nav',
	standalone: true,
	imports: [CommonModule],
    template: `
        <div class="w-full max-w-3xl mb-8">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-300">Progreso del diagnóstico</span>
                <span class="text-sm text-gray-300">{{ currentStep + 1 }} / {{ totalSteps }}</span>
            </div>
            <div class="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                <div class="h-3 bg-blue-500 transition-all duration-500 ease-out" [style.width.%]="progress"></div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepNavComponent {
	@Input() progress: number = 0;
	@Input() currentStep: number = 0;
	@Input() totalSteps: number = 0;
}


