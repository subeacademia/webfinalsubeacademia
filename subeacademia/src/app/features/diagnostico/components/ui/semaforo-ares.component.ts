import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-semaforo-ares',
	standalone: true,
	imports: [CommonModule],
	template: `
		<!-- Placeholder. Se implementará en Parte 5 -->
		<div class="flex gap-2 items-center">
			<div class="w-4 h-4 rounded-full" [class.bg-red-500]="level==='low'" [class.bg-yellow-400]="level==='mid'" [class.bg-green-500]="level==='high'"></div>
			<span class="text-sm text-gray-600"><ng-content></ng-content></span>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemaforoAresComponent {
	@Input() level: 'low' | 'mid' | 'high' = 'mid';
}


