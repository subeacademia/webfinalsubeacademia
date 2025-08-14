import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-step-nav',
	standalone: true,
	imports: [CommonModule],
    template: `
        <div class="flex items-center justify-between gap-4">
            <button 
                type="button" 
                class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="!canGoPrevious"
                (click)="onPrevious()">
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Anterior
            </button>
            
            <div class="flex-1 text-center">
                <span class="text-sm text-gray-400">Paso {{ currentStep + 1 }} de {{ totalSteps }}</span>
            </div>
            
            <button 
                *ngIf="!isCompleted; else completeButton"
                type="button" 
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="!canGoNext"
                (click)="onNext()">
                Siguiente
                <svg class="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </button>

            <ng-template #completeButton>
                <button 
                    type="button" 
                    class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                    (click)="onComplete()">
                    Completar
                    <svg class="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </button>
            </ng-template>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepNavComponent {
	@Input() currentStep: number = 0;
	@Input() totalSteps: number = 0;
	@Input() canGoPrevious: boolean = false;
	@Input() canGoNext: boolean = false;
	@Input() isCompleted: boolean = false;

	@Output() previous = new EventEmitter<void>();
	@Output() next = new EventEmitter<void>();
	@Output() complete = new EventEmitter<void>();

	onPrevious(): void {
		this.previous.emit();
	}

	onNext(): void {
		this.next.emit();
	}

	onComplete(): void {
		this.complete.emit();
	}
}


