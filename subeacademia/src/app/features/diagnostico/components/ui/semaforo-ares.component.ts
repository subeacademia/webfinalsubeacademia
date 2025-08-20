import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
        <div class="flex flex-col gap-6">
            <h3 class="text-xl font-semibold text-center text-gray-200">Estado ARES por Fase</h3>
            
            <div class="flex flex-wrap gap-6 justify-center">
                <div 
                    *ngFor="let phase of phases; let i = index" 
                    class="flex flex-col items-center p-6 rounded-xl transition-all duration-300 hover:scale-105"
                    [ngClass]="getPhaseClass(phase)">
                    
                    <!-- Etiqueta de la fase -->
                    <div class="text-sm font-medium text-gray-400 mb-4">{{ getPhaseLabel(phase) }}</div>
                    
                    <!-- Semáforo vertical -->
                    <div class="relative mb-4">
                        <!-- Contenedor del semáforo -->
                        <div class="w-20 h-32 bg-gray-800 rounded-full border-4 border-gray-700 relative flex flex-col justify-between p-2">
                            <!-- Luz roja (crítico) -->
                            <div 
                                #redLight
                                class="w-12 h-12 rounded-full mx-auto transition-all duration-500"
                                [ngClass]="getLightClass(phase, 'red')">
                            </div>
                            
                            <!-- Luz amarilla (atención) -->
                            <div 
                                #yellowLight
                                class="w-12 h-12 rounded-full mx-auto transition-all duration-500"
                                [ngClass]="getLightClass(phase, 'yellow')">
                            </div>
                            
                            <!-- Luz verde (excelente) -->
                            <div 
                                #greenLight
                                class="w-12 h-12 rounded-full mx-auto transition-all duration-500"
                                [ngClass]="getLightClass(phase, 'green')">
                            </div>
                        </div>
                        
                        <!-- Indicador de estado activo -->
                        <div class="absolute -right-2 top-1/2 transform -translate-y-1/2">
                            <div class="w-4 h-4 rounded-full bg-white shadow-lg"
                                 [ngClass]="getActiveIndicatorClass(phase)">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Score y estado -->
                    <div class="text-center">
                        <div class="text-3xl font-bold mb-2" [ngClass]="getScoreTextClass(phase)">
                            {{ getPhaseScore(phase) }}
                        </div>
                        <div class="text-xs text-gray-400 mb-2">
                            / {{ getPhaseTotal(phase) }}
                        </div>
                        <div class="text-sm font-medium px-3 py-1 rounded-full" [ngClass]="getStatusBadgeClass(phase)">
                            {{ getPhaseStatus(phase) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SemaforoAresComponent implements OnChanges, AfterViewInit {
	@Input() aresByPhase: Record<string, AresPhaseScore> = {};
    @ViewChild('redLight') redLight!: ElementRef;
    @ViewChild('yellowLight') yellowLight!: ElementRef;
    @ViewChild('greenLight') greenLight!: ElementRef;

    readonly phases = ['F1', 'F2', 'F3', 'F4', 'F5'];

    ngAfterViewInit(): void {
        this.animateLights();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aresByPhase']) {
            setTimeout(() => this.animateLights(), 100);
        }
    }

    getPhaseLabel(phase: string): string {
        const labels: Record<string, string> = {
            'F1': 'Preparación',
            'F2': 'Diseño',
            'F3': 'Desarrollo',
            'F4': 'Operación',
            'F5': 'Escalamiento'
        };
        return labels[phase] || phase;
    }

    getPhaseScore(phase: string): number {
        return this.aresByPhase[phase]?.score || 0;
    }

    getPhaseTotal(phase: string): number {
        return this.aresByPhase[phase]?.total || 100;
    }

    getPhaseStatus(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        if (score >= 80) return 'Excelente';
        if (score >= 60) return 'Bueno';
        if (score >= 40) return 'Regular';
        if (score >= 20) return 'Bajo';
        return 'Crítico';
    }

    getPhaseClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        if (score >= 80) return 'bg-green-900/20 border border-green-600/30 shadow-lg shadow-green-500/20';
        if (score >= 60) return 'bg-blue-900/20 border border-blue-600/30 shadow-lg shadow-blue-500/20';
        if (score >= 40) return 'bg-yellow-900/20 border border-yellow-600/30 shadow-lg shadow-yellow-500/20';
        if (score >= 20) return 'bg-orange-900/20 border border-orange-600/30 shadow-lg shadow-orange-500/20';
        return 'bg-red-900/20 border border-red-600/30 shadow-lg shadow-red-500/20';
    }

    getLightClass(phase: string, color: 'red' | 'yellow' | 'green'): string {
        const score = this.getPhaseScore(phase);
        const isActive = this.isLightActive(score, color);
        
        if (color === 'red') {
            return isActive ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-gray-700';
        } else if (color === 'yellow') {
            return isActive ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-gray-700';
        } else {
            return isActive ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-700';
        }
    }

    getActiveIndicatorClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        if (score >= 80) return 'bg-green-500 shadow-green-500/50';
        if (score >= 60) return 'bg-blue-500 shadow-blue-500/50';
        if (score >= 40) return 'bg-yellow-500 shadow-yellow-500/50';
        if (score >= 20) return 'bg-orange-500 shadow-orange-500/50';
        return 'bg-red-500 shadow-red-500/50';
    }

    getScoreTextClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        if (score >= 20) return 'text-orange-400';
        return 'text-red-400';
    }

    getStatusBadgeClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        if (score >= 80) return 'bg-green-500/20 text-green-300 border border-green-500/30';
        if (score >= 60) return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        if (score >= 40) return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        if (score >= 20) return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
    }

    private isLightActive(score: number, color: 'red' | 'yellow' | 'green'): boolean {
        if (color === 'red') return score < 20;
        if (color === 'yellow') return score >= 20 && score < 60;
        if (color === 'green') return score >= 60;
        return false;
    }

    private animateLights(): void {
        const anime = (window as any).anime;
        if (!anime) return;

        // Animar la aparición de cada fase
        this.phases.forEach((phase, index) => {
            const score = this.getPhaseScore(phase);
            const activeLight = this.getActiveLightElement(score);
            
            if (activeLight) {
                // Animación de iluminación
                anime({
                    targets: activeLight,
                    scale: [0.8, 1.2, 1],
                    opacity: [0.5, 1, 0.8],
                    duration: 800,
                    delay: index * 200,
                    easing: 'easeOutElastic(1, 0.5)'
                });
            }
        });
    }

    private getActiveLightElement(score: number): ElementRef | null {
        if (score < 20) return this.redLight;
        if (score >= 20 && score < 60) return this.yellowLight;
        if (score >= 60) return this.greenLight;
        return null;
    }
}


