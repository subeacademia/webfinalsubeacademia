import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-radar-chart',
	standalone: true,
	imports: [CommonModule],
	template: `
		<!-- Placeholder. Se implementará en Parte 5 con ng2-charts -->
		<div class="p-6 border rounded-lg text-sm text-gray-500">Radar chart</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent {
	@Input() data: any;
}


