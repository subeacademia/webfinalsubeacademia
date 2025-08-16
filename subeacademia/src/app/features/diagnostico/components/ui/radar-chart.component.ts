import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

interface CompetencyScore {
  name: string;
  score: number;
}

@Component({
	selector: 'app-radar-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
        <div class="bg-slate-800 rounded-lg p-6 shadow-xl">
            <h3 class="text-lg font-semibold text-center text-gray-200 mb-4">Perfil de Competencias</h3>
            <div class="h-80">
                <canvas baseChart 
                    type="radar" 
                    [data]="radarChartData" 
                    [options]="radarChartOptions">
                </canvas>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent implements OnChanges {
    @Input() data: CompetencyScore[] = [];

    public radarChartOptions: ChartConfiguration<'radar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                pointLabels: { 
                    font: { size: 14 }, 
                    color: '#E5E7EB' 
                },
                ticks: {
                    color: '#9CA3AF',
                    backdropColor: 'transparent',
                    stepSize: 20,
                    max: 100,
                    min: 0
                }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    public radarChartData: ChartData<'radar'> = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Competencias',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3B82F6',
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3B82F6',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.updateChartData();
        }
    }

    private updateChartData(): void {
        if (!this.data || this.data.length === 0) {
            return;
        }

        const labels = this.data.map(item => item.name);
        const scores = this.data.map(item => item.score);

        this.radarChartData = {
            labels: labels,
            datasets: [
                {
                    data: scores,
                    label: 'Competencias',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6',
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3B82F6',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }
}


