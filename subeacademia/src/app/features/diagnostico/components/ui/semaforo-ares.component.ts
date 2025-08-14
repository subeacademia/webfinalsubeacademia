import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AresPhaseScore {
    score: number;
    total: number;
    items: any[];
}

@Component({
	selector: 'app-semaforo-ares',
	standalone: true,
	imports: [CommonModule],
    template: `
        <div class="flex flex-col gap-4">
            <h3 class="text-lg font-semibold text-center text-gray-200">Estado ARES por Fase</h3>
            <div class="flex flex-wrap gap-3 justify-center">
                <div 
                    *ngFor="let phase of phases" 
                    class="flex flex-col items-center p-4 rounded-lg transition-all duration-200"
                    [ngClass]="getPhaseClass(phase)">
                    
                    <!-- Chip de la fase -->
                    <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg"
                         [ngClass]="getPhaseChipClass(phase)">
                        {{ phase }}
                    </div>
                    
                    <!-- Score -->
                    <div class="text-center">
                        <div class="text-2xl font-bold" [ngClass]="getScoreTextClass(phase)">
                            {{ getPhaseScore(phase) }}
                        </div>
                        <div class="text-xs text-gray-400">
                            / {{ getPhaseTotal(phase) }}
                        </div>
                    </div>
                    
                    <!-- Estado -->
                    <div class="text-xs font-medium mt-1" [ngClass]="getStatusTextClass(phase)">
                        {{ getPhaseStatus(phase) }}
                    </div>
                </div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemaforoAresComponent {
	@Input() aresByPhase: Record<string, AresPhaseScore> = {};

    readonly phases = ['F1', 'F2', 'F3', 'F4', 'F5'];

    getPhaseScore(phase: string): number {
        return this.aresByPhase[phase]?.score || 0;
    }

    getPhaseTotal(phase: string): number {
        return this.aresByPhase[phase]?.total || 0;
    }

    getPhaseStatus(phase: string): string {
        const score = this.getPhaseScore(phase);
        const total = this.getPhaseTotal(phase);
        const percentage = total > 0 ? (score / total) * 100 : 0;
        
        if (percentage >= 80) return 'Excelente';
        if (percentage >= 60) return 'Bueno';
        if (percentage >= 40) return 'Regular';
        if (percentage >= 20) return 'Bajo';
        return 'Crítico';
    }

    getPhaseClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        const total = this.getPhaseTotal(phase);
        const percentage = total > 0 ? (score / total) * 100 : 0;
        
        if (percentage >= 80) return 'bg-green-900/20 border border-green-600/30';
        if (percentage >= 60) return 'bg-blue-900/20 border border-blue-600/30';
        if (percentage >= 40) return 'bg-yellow-900/20 border border-yellow-600/30';
        if (percentage >= 20) return 'bg-orange-900/20 border border-orange-600/30';
        return 'bg-red-900/20 border border-red-600/30';
    }

    getPhaseChipClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        const total = this.getPhaseTotal(phase);
        const percentage = total > 0 ? (score / total) * 100 : 0;
        
        if (percentage >= 80) return 'bg-green-500 shadow-green-500/50';
        if (percentage >= 60) return 'bg-blue-500 shadow-blue-500/50';
        if (percentage >= 40) return 'bg-yellow-500 shadow-yellow-500/50';
        if (percentage >= 20) return 'bg-orange-500 shadow-orange-500/50';
        return 'bg-red-500 shadow-red-500/50';
    }

    getScoreTextClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        const total = this.getPhaseTotal(phase);
        const percentage = total > 0 ? (score / total) * 100 : 0;
        
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-blue-400';
        if (percentage >= 40) return 'text-yellow-400';
        if (percentage >= 20) return 'text-orange-400';
        return 'text-red-400';
    }

    getStatusTextClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        const total = this.getPhaseTotal(phase);
        const percentage = total > 0 ? (score / total) * 100 : 0;
        
        if (percentage >= 80) return 'text-green-300';
        if (percentage >= 60) return 'text-blue-300';
        if (percentage >= 40) return 'text-yellow-300';
        if (percentage >= 20) return 'text-orange-300';
        return 'text-red-300';
    }
}


