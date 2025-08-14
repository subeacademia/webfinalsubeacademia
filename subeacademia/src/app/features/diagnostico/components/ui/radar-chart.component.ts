import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
	selector: 'app-radar-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
        <div class="p-6 border rounded-lg">
            <canvas baseChart type="radar" [data]="radarChartData" [options]="radarChartOptions"></canvas>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent implements OnChanges {
    @Input() data: number[] = [];
    @Input() labels: string[] = [];

    radarChartOptions: ChartConfiguration<'radar'>['options'] = {
        responsive: true,
        scales: {
            r: {
                angleLines: { color: 'rgba(255,255,255,0.2)' },
                grid: { color: 'rgba(255,255,255,0.2)' },
                pointLabels: { font: { size: 12 }, color: '#222' },
                ticks: { color: '#222', backdropColor: 'transparent', stepSize: 20 },
            },
        },
        plugins: { legend: { display: false } },
    };

    radarChartData: ChartData<'radar'> = { labels: [], datasets: [{ data: [], label: 'Competencias', backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,1)', pointBackgroundColor: 'rgba(59,130,246,1)', pointBorderColor: '#fff' }] };

    ngOnChanges(): void {
        this.radarChartData = { labels: this.labels, datasets: [{ ...this.radarChartData.datasets[0], data: this.data }] } as any;
    }
}


