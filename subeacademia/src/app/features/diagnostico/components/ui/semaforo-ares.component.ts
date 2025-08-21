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
        <div class="flex flex-col gap-4 overflow-hidden">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 justify-items-center">
                <div 
                    *ngFor="let phase of phases; let i = index" 
                    class="flex flex-col items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 w-full max-w-[180px]"
                    [ngClass]="getPhaseClass(phase)">
                    
                    <!-- Etiqueta de la fase -->
                    <div class="text-xs font-medium text-gray-400 mb-3 text-center">{{ getPhaseLabel(phase) }}</div>
                    
                    <!-- Semáforo vertical -->
                    <div class="relative mb-3">
                        <!-- Contenedor del semáforo -->
                        <div class="w-16 h-28 bg-gray-800 rounded-full border-4 border-gray-700 relative flex flex-col justify-between p-1.5">
                            <!-- Luz roja (crítico) -->
                            <div 
                                #redLight
                                class="w-8 h-8 rounded-full mx-auto transition-all duration-500"
                                [ngClass]="getLightClass(phase, 'red')">
                            </div>
                            
                            <!-- Luz amarilla (atención) -->
                            <div 
                                #yellowLight
                                class="w-8 h-8 rounded-full mx-auto transition-all duration-500"
                                [ngClass]="getLightClass(phase, 'yellow')">
                            </div>
                            
                            <!-- Luz verde (excelente) -->
                            <div 
                                #greenLight
                                class="w-8 h-8 rounded-full mx-auto transition-all duration-500"
                                [ngClass]="getLightClass(phase, 'green')">
                            </div>
                        </div>
                        
                        <!-- Indicador de estado activo -->
                        <div class="absolute right-1 top-1/2 transform -translate-y-1/2">
                            <div class="w-3.5 h-3.5 rounded-full bg-white shadow-lg"
                                 [ngClass]="getActiveIndicatorClass(phase)">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Score y estado -->
                    <div class="text-center">
                        <div class="text-2xl font-bold mb-1" [ngClass]="getScoreTextClass(phase)">
                            {{ getPhaseScore(phase) }}
                        </div>
                        <div class="text-[10px] text-gray-400 mb-1">
                            / {{ getPhaseTotal(phase) }}
                        </div>
                        <div class="text-xs font-medium px-2 py-0.5 rounded-full" [ngClass]="getStatusBadgeClass(phase)">
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
        console.log('🎬 ngAfterViewInit llamado en SemaforoAresComponent');
        console.log('🎬 Estado de aresByPhase:', this.aresByPhase);
        console.log('🎬 Referencias de luces disponibles:', {
            redLight: !!this.redLight,
            yellowLight: !!this.yellowLight,
            greenLight: !!this.greenLight
        });
        
        // Esperar un poco para asegurar que las referencias estén listas
        setTimeout(() => {
            console.log('🎬 Iniciando animación de luces después de ngAfterViewInit');
            console.log('🎬 Estado final de aresByPhase:', this.aresByPhase);
            
            if (this.aresByPhase && Object.keys(this.aresByPhase).length > 0) {
                this.animateLights();
            } else {
                console.warn('⚠️ No hay datos ARES disponibles en ngAfterViewInit');
            }
        }, 100);
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('🔄 ngOnChanges llamado en SemaforoAresComponent');
        console.log('🔄 Cambios detectados:', changes);
        
        if (changes['aresByPhase']) {
            console.log('🔄 Cambio detectado en aresByPhase');
            console.log('🔄 Valor anterior:', changes['aresByPhase'].previousValue);
            console.log('🔄 Valor actual:', changes['aresByPhase'].currentValue);
            console.log('🔄 Estado actual de aresByPhase:', this.aresByPhase);
            
            // Verificar que los datos estén disponibles
            if (this.aresByPhase && Object.keys(this.aresByPhase).length > 0) {
                console.log('🔄 Datos ARES disponibles, iniciando animación');
                setTimeout(() => this.animateLights(), 100);
            } else {
                console.warn('⚠️ No hay datos ARES disponibles para animar');
            }
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
        
        const label = labels[phase] || phase;
        console.log(`🏷️ getPhaseLabel para fase ${phase}: ${label}`);
        return label;
    }

    getPhaseScore(phase: string): number {
        const score = this.aresByPhase[phase]?.score || 0;
        console.log(`📊 getPhaseScore para fase ${phase}: score=${score}, datos completos=`, this.aresByPhase[phase]);
        return score;
    }

    getPhaseTotal(phase: string): number {
        const total = this.aresByPhase[phase]?.total || 100;
        console.log(`📊 getPhaseTotal para fase ${phase}: ${total}`);
        return total;
    }

    getPhaseStatus(phase: string): string {
        const score = this.getPhaseScore(phase);
        const status = score >= 80 ? 'Excelente' : 
                       score >= 60 ? 'Bueno' : 
                       score >= 40 ? 'Regular' : 
                       score >= 20 ? 'Bajo' : 'Crítico';
        
        console.log(`📊 getPhaseStatus para fase ${phase}: score=${score}, status=${status}`);
        return status;
    }

    getPhaseClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        console.log(`🎨 getPhaseClass para fase ${phase}: score=${score}`);
        
        let phaseClass = '';
        if (score >= 80) {
            phaseClass = 'bg-green-900/20 border border-green-600/30 shadow-lg shadow-green-500/20';
        } else if (score >= 60) {
            phaseClass = 'bg-blue-900/20 border border-blue-600/30 shadow-lg shadow-blue-500/20';
        } else if (score >= 40) {
            phaseClass = 'bg-yellow-900/20 border border-yellow-600/30 shadow-lg shadow-yellow-500/20';
        } else if (score >= 20) {
            phaseClass = 'bg-orange-900/20 border border-orange-600/30 shadow-lg shadow-orange-500/20';
        } else {
            phaseClass = 'bg-red-900/20 border border-red-600/30 shadow-lg shadow-red-500/20';
        }
        
        console.log(`🎨 Clase CSS de la fase ${phase}: ${phaseClass}`);
        return phaseClass;
    }

    getLightClass(phase: string, color: 'red' | 'yellow' | 'green'): string {
        const score = this.getPhaseScore(phase);
        const isActive = this.isLightActive(score, color);
        
        console.log(`🎨 getLightClass para fase ${phase}, color ${color}: score=${score}, isActive=${isActive}`);
        
        let lightClass = '';
        if (color === 'red') {
            lightClass = isActive ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-gray-700';
        } else if (color === 'yellow') {
            lightClass = isActive ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-gray-700';
        } else if (color === 'green') {
            lightClass = isActive ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-700';
        }
        
        console.log(`🎨 Clase CSS generada para luz ${color}: ${lightClass}`);
        return lightClass;
    }

    getActiveIndicatorClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        console.log(`🎨 getActiveIndicatorClass para fase ${phase}: score=${score}`);
        
        let indicatorClass = '';
        if (score >= 80) {
            indicatorClass = 'bg-green-500 shadow-green-500/50';
        } else if (score >= 60) {
            indicatorClass = 'bg-blue-500 shadow-blue-500/50';
        } else if (score >= 40) {
            indicatorClass = 'bg-yellow-500 shadow-yellow-500/50';
        } else if (score >= 20) {
            indicatorClass = 'bg-orange-500 shadow-orange-500/50';
        } else {
            indicatorClass = 'bg-red-500 shadow-red-500/50';
        }
        
        console.log(`🎨 Clase CSS del indicador para fase ${phase}: ${indicatorClass}`);
        return indicatorClass;
    }

    getScoreTextClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        console.log(`🎨 getScoreTextClass para fase ${phase}: score=${score}`);
        
        let textClass = '';
        if (score >= 80) {
            textClass = 'text-green-400';
        } else if (score >= 60) {
            textClass = 'text-blue-400';
        } else if (score >= 40) {
            textClass = 'text-yellow-400';
        } else if (score >= 20) {
            textClass = 'text-orange-400';
        } else {
            textClass = 'text-red-400';
        }
        
        console.log(`🎨 Clase CSS del texto para fase ${phase}: ${textClass}`);
        return textClass;
    }

    getStatusBadgeClass(phase: string): string {
        const score = this.getPhaseScore(phase);
        
        console.log(`🎨 getStatusBadgeClass para fase ${phase}: score=${score}`);
        
        let badgeClass = '';
        if (score >= 80) {
            badgeClass = 'bg-green-500/20 text-green-300 border border-green-500/30';
        } else if (score >= 60) {
            badgeClass = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        } else if (score >= 40) {
            badgeClass = 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        } else if (score >= 20) {
            badgeClass = 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
        } else {
            badgeClass = 'bg-red-500/20 text-red-300 border border-red-500/30';
        }
        
        console.log(`🎨 Clase CSS del badge para fase ${phase}: ${badgeClass}`);
        return badgeClass;
    }

    private isLightActive(score: number, color: 'red' | 'yellow' | 'green'): boolean {
        console.log(`🔍 isLightActive llamado con score: ${score}, color: ${color}`);
        
        let isActive = false;
        if (color === 'red') {
            isActive = score < 20;
        } else if (color === 'yellow') {
            isActive = score >= 20 && score < 60;
        } else if (color === 'green') {
            isActive = score >= 60;
        }
        
        console.log(`🔍 Luz ${color} activa para score ${score}: ${isActive}`);
        return isActive;
    }

    private animateLights(): void {
        console.log('🎬 animateLights llamado');
        console.log('🎬 Estado de aresByPhase:', this.aresByPhase);
        console.log('🎬 Fases disponibles:', this.phases);
        
        const anime = (window as any).anime;
        if (!anime) {
            console.warn('⚠️ anime.js no está disponible');
            return;
        }

        console.log('🎬 anime.js disponible, iniciando animaciones');

        // Animar la aparición de cada fase
        this.phases.forEach((phase, index) => {
            const score = this.getPhaseScore(phase);
            const activeLight = this.getActiveLightElement(score);
            
            console.log(`🎬 Fase ${phase}: score=${score}, activeLight=${activeLight ? 'disponible' : 'no disponible'}`);
            
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
                console.log(`🎬 Animación iniciada para fase ${phase}`);
            } else {
                console.warn(`⚠️ No se pudo encontrar luz activa para fase ${phase} con score ${score}`);
            }
        });
    }

    private getActiveLightElement(score: number): ElementRef | null {
        console.log(`🔍 getActiveLightElement llamado con score: ${score}`);
        console.log(`🔍 Referencias disponibles:`, {
            redLight: !!this.redLight,
            yellowLight: !!this.yellowLight,
            greenLight: !!this.greenLight
        });
        
        let activeLight: ElementRef | null = null;
        if (score < 20) {
            activeLight = this.redLight;
            console.log(`🔍 Score ${score} < 20, luz roja seleccionada`);
        } else if (score >= 20 && score < 60) {
            activeLight = this.yellowLight;
            console.log(`🔍 Score ${score} entre 20-59, luz amarilla seleccionada`);
        } else if (score >= 60) {
            activeLight = this.greenLight;
            console.log(`🔍 Score ${score} >= 60, luz verde seleccionada`);
        }
        
        console.log(`🔍 Luz activa seleccionada:`, activeLight ? 'disponible' : 'no disponible');
        return activeLight;
    }
}


