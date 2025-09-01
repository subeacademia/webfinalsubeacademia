import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../services/diagnostic-state.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-step-nav',
	standalone: true,
	imports: [CommonModule],
    template: `
        <div class="w-full max-w-6xl mb-12">
            <!-- Header del progreso con diseño mejorado -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <span class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Progreso del diagnóstico</span>
                        <div class="text-2xl font-bold text-white">{{ getProgressPercentage() }}%</div>
                    </div>
                </div>
                
                <!-- Indicador de tiempo estimado -->
                <div class="text-right">
                    <div class="text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tiempo estimado</div>
                    <div class="text-lg font-semibold text-white">{{ getEstimatedTime() }}</div>
                </div>
            </div>

            <!-- Indicador de estado del diagnóstico -->
            <div *ngIf="isDiagnosticComplete()" class="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-green-400 font-medium">¡Diagnóstico Completado! Ahora puedes navegar libremente entre los pasos.</span>
                </div>
            </div>

            <!-- Barra de progreso principal con efectos -->
            <div class="relative mb-8">
                <div class="h-4 w-full bg-gray-700 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
                    <!-- Barra de progreso con gradiente y animación -->
                    <div class="h-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-lg relative overflow-hidden" 
                         [style.width.%]="progress">
                        <!-- Efecto de brillo que se mueve -->
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
                    </div>
                </div>
                
                <!-- Indicadores de pasos con diseño de tarjetas -->
                <div class="flex justify-between mt-8 relative">
                    <!-- Línea de conexión entre pasos -->
                    <div class="absolute top-6 left-0 right-0 h-0.5 bg-gray-600 dark:bg-gray-700 -z-10"></div>
                    
                    <!-- Paso 1: Inicio -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(0)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(0)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(0) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(0) !== 'completed'">1</span>
                            </div>
                            <!-- Punto de conexión -->
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">Inicio</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">Configuración</div>
                    </div>

                    <!-- Paso 2: Contexto -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(1)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(16.67)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(16.67) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(16.67) !== 'completed'">2</span>
                            </div>
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">Contexto</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">Organización</div>
                    </div>

                    <!-- Paso 3: ARES -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(2)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(50)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(50) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(50) !== 'completed'">3</span>
                            </div>
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">ARES</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">Framework</div>
                    </div>

                    <!-- Paso 4: Competencias -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(3)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(83.33)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(83.33) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(83.33) !== 'completed'">4</span>
                            </div>
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">Competencias</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">13 Claves</div>
                    </div>

                    <!-- Paso 5: Objetivo -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(4)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(91.67)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(91.67) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(91.67) !== 'completed'">5</span>
                            </div>
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">Objetivo</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">Metas</div>
                    </div>

                    <!-- Paso 6: Contacto -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(5)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(95.83)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(95.83) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(95.83) !== 'completed'">6</span>
                            </div>
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">Contacto</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">Información</div>
                    </div>

                    <!-- Paso 7: Resultados -->
                    <div class="flex flex-col items-center group" 
                         [class]="isDiagnosticComplete() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                         (click)="navigateToStep(6)">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
                                 [class]="getStepStatusClass(100)"
                                 [class.group-hover:scale-110]="isDiagnosticComplete()">
                                <svg *ngIf="getStepStatus(100) === 'completed'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span *ngIf="getStepStatus(100) !== 'completed'">7</span>
                            </div>
                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-600 dark:bg-gray-700 rounded-full transition-colors duration-300"
                                 [class.group-hover:bg-blue-500]="isDiagnosticComplete()"></div>
                        </div>
                        <span class="mt-3 text-sm font-medium transition-colors duration-300"
                              [class]="isDiagnosticComplete() ? 'text-gray-300 dark:text-gray-400 group-hover:text-white' : 'text-gray-500 dark:text-gray-600'">Resultados</span>
                        <div class="text-xs text-gray-500 dark:text-gray-600 mt-1">Análisis</div>
                    </div>
                </div>
            </div>

            <!-- Mensaje motivacional -->
            <div class="text-center mb-6">
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span class="text-sm text-blue-300">{{ getMotivationalMessage() }}</span>
                </div>
            </div>

            <!-- Navegación de pasos -->
            <div class="flex items-center justify-between gap-4 mt-6">
                <button (click)="goPrevious()"
                        class="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                </button>

                <button (click)="goNext()"
                        [disabled]="!canGoNext"
                        class="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Siguiente
                </button>
            </div>
        </div>
    `,
	changeDetection: ChangeDetectionStrategy.Default,
})
export class StepNavComponent implements OnInit, OnDestroy {
	@Input() progress: number = 0;
	private diagnosticStateService = inject(DiagnosticStateService);
	private router = inject(Router);

	canGoNext = true;
	private subs = new Subscription();

	ngOnInit(): void {
		// Inicialización del componente
		this.updateCanGoNext();
		this.subs.add(this.diagnosticStateService.state$.subscribe(() => this.updateCanGoNext()));
		this.subs.add(this.router.events.subscribe(() => this.updateCanGoNext()));
	}

	getProgressPercentage(): number {
		return Math.round(this.progress);
	}

	getEstimatedTime(): string {
		const remainingSteps = 7 - Math.ceil(this.progress / 16.67);
		const estimatedMinutes = remainingSteps * 2; // 2 minutos por paso
		return `${estimatedMinutes} min`;
	}

	getStepStatus(stepProgress: number): 'completed' | 'current' | 'pending' {
		if (this.progress >= stepProgress) {
			return 'completed';
		} else if (this.progress >= stepProgress - 16.67) {
			return 'current';
		} else {
			return 'pending';
		}
	}

	getStepStatusClass(stepProgress: number): string {
		const status = this.getStepStatus(stepProgress);
		
		switch (status) {
			case 'completed':
				return 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25';
			case 'current':
				return 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 animate-pulse';
			default:
				return 'bg-gray-600 dark:bg-gray-500 shadow-md';
		}
	}

	getMotivationalMessage(): string {
		const percentage = this.getProgressPercentage();
		
		if (percentage < 20) {
			return '¡Comencemos este viaje juntos!';
		} else if (percentage < 40) {
			return '¡Excelente progreso! Sigue así';
		} else if (percentage < 60) {
			return '¡Ya estás a mitad de camino!';
		} else if (percentage < 80) {
			return '¡Casi terminamos! Mantén el ritmo';
		} else if (percentage < 100) {
			return '¡Último esfuerzo! Estás muy cerca';
		} else {
			return '¡Felicidades! Has completado el diagnóstico';
		}
	}

	isDiagnosticComplete(): boolean {
		return this.diagnosticStateService.isDiagnosticComplete();
	}

	private updateCanGoNext(): void {
		const currentUrl = this.router.url;
		this.canGoNext = this.diagnosticStateService.canProceedFromRoute(currentUrl);
	}

	navigateToStep(stepIndex: number): void {
		if (this.isDiagnosticComplete()) {
			// Navegar al paso específico
			const stepRoutes = [
				'/diagnostico/inicio',
				'/diagnostico/contexto',
				'/diagnostico/ares',
				'/diagnostico/competencias',
				'/diagnostico/objetivo',
				'/diagnostico/contacto',
				'/diagnostico/resultados'
			];
			
			if (stepRoutes[stepIndex]) {
				this.router.navigate([stepRoutes[stepIndex]]);
				console.log(`✅ Navegando al paso ${stepIndex + 1}: ${stepRoutes[stepIndex]}`);
			}
		} else {
			// Mostrar mensaje de que no se puede navegar
			console.warn('⚠️ No puedes navegar libremente hasta que el diagnóstico esté completo.');
			// Aquí podrías mostrar un toast o notificación al usuario
			alert('Debes completar todo el diagnóstico antes de poder navegar libremente entre los pasos.');
		}
	}

	goNext(): void {
		this.updateCanGoNext();
		if (!this.canGoNext) {
			alert('Completa el paso actual antes de continuar.');
			return;
		}
		const next = this.diagnosticStateService.getNextStepLink(this.router.url);
		if (next) {
			this.router.navigate(['/diagnostico', next]);
		}
	}

	goPrevious(): void {
		const prev = this.diagnosticStateService.getPreviousStepLink(this.router.url);
		if (prev) {
			this.router.navigate(['/diagnostico', prev]);
		}
	}

	ngOnDestroy(): void {
		this.subs.unsubscribe();
	}
}


