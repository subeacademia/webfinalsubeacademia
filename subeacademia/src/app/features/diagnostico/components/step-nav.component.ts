import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-step-nav',
	standalone: true,
	imports: [CommonModule],
    template: `
        <div class="w-full max-w-6xl mb-8">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-300 dark:text-gray-400">Progreso del diagnóstico</span>
                <span class="text-sm font-medium text-blue-400 dark:text-blue-300">{{ getProgressPercentage() }}%</span>
            </div>
            <div class="h-3 w-full bg-gray-700 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
                <div class="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out shadow-lg" 
                     [style.width.%]="progress"></div>
            </div>
            <div class="flex justify-between mt-3 text-xs text-gray-400 dark:text-gray-500">
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(0)"></div>
                    <span>Inicio</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(16.67)"></div>
                    <span>Contexto</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(50)"></div>
                    <span>ARES</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(83.33)"></div>
                    <span>Competencias</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(91.67)"></div>
                    <span>Objetivo</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(95.83)"></div>
                    <span>Contacto</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full mb-1" [class]="getStepStatusClass(100)"></div>
                    <span>Resultados</span>
                </div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.Default,
})
export class StepNavComponent {
	@Input() progress: number = 0;

	getProgressPercentage(): number {
		return Math.round(this.progress);
	}

	getStepStatusClass(stepProgress: number): string {
		if (this.progress >= stepProgress) {
			return 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg';
		} else if (this.progress >= stepProgress - 16.67) {
			return 'bg-gray-500 dark:bg-gray-400';
		} else {
			return 'bg-gray-600 dark:bg-gray-500';
		}
	}
}


