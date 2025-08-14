import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-radar-chart',
	standalone: true,
	imports: [CommonModule],
    template: `
        <div class="p-6 border rounded-lg">
            <div class="text-sm text-gray-500">Radar chart (placeholder)</div>
            <pre class="text-xs mt-2 overflow-auto">{{ data | json }}</pre>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent {
	@Input() data: any;
}


