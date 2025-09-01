import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { StepNavComponent } from './components/step-nav.component';
import { DiagnosticFlowLoggerService } from '../../core/services/diagnostic-flow-logger.service';
import { DebugPanelComponent } from '../../core/ui/debug-panel/debug-panel.component';

import { ThemeService } from '../../shared/theme.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, RouterOutlet, StepNavComponent, DebugPanelComponent],
    template: `
        <div class="flex flex-col items-center justify-start min-h-screen bg-gray-900 dark:bg-gray-900 text-white p-4 pt-24 transition-colors duration-300">
            <div class="w-full max-w-6xl">
                <app-step-nav [progress]="progress()"></app-step-nav>
                <main class="mt-10">
                    <router-outlet></router-outlet>
                </main>
            </div>
        </div>
        
        <!-- Panel de Debug -->
        <app-debug-panel></app-debug-panel>
    `,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DiagnosticoComponent implements OnInit {
    private readonly diagnosticState = inject(DiagnosticStateService);
    private readonly router = inject(Router);
    private readonly themeService = inject(ThemeService);
    private readonly flowLogger = inject(DiagnosticFlowLoggerService);

    // Signal de progreso que se actualiza manualmente
    private readonly _progress = signal(0);
    readonly progress = this._progress.asReadonly();

    constructor() {
        // Suscribirse a cambios en el progreso del servicio
        effect(() => {
            this.diagnosticState.progressChanged();
            this.updateProgress();
        });
    }

    ngOnInit(): void {
        // 🔍 INICIAR RASTREO DEL FLUJO DE DIAGNÓSTICO
        this.flowLogger.startTracking();
        console.log('🔍 DiagnosticoComponent: Iniciando rastreo del flujo de diagnóstico');
        
        // Calcular progreso inicial
        this.updateProgress();
        
        // Suscribirse a cambios de navegación para actualizar el progreso
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.updateProgress();
            console.log('🔍 DiagnosticoComponent: Navegación completada', {
                url: event.url,
                progreso: this.progress(),
                sessionId: this.flowLogger.getSessionId()
            });
            
            // 🔍 REGISTRAR COMPLETACIÓN DEL PASO ANTERIOR
            if (event.url.includes('/diagnostico/')) {
                const currentStep = this.extractCurrentStep(event.url);
                if (currentStep) {
                    this.flowLogger.logStepCompleted(currentStep, {
                        progress: this.progress(),
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    private updateProgress(): void {
        const currentRoute = this.router.url;
        const newProgress = this.diagnosticState.getProgressForRoute(currentRoute);
        this._progress.set(newProgress);
        
        // 🔍 LOG DEL PROGRESO
        console.log('🔍 DiagnosticoComponent: Progreso actualizado', {
            route: currentRoute,
            progress: newProgress,
            sessionId: this.flowLogger.getSessionId()
        });
    }

    private extractCurrentStep(url: string): string | null {
        const match = url.match(/\/diagnostico\/([^\/\?]+)/);
        return match ? match[1] : null;
    }

    // 🔍 MÉTODO PARA EXPORTAR LOGS (útil para debugging)
    public exportDiagnosticLogs(): void {
        const flowLog = this.flowLogger.exportFlowLog();
        console.log('🔍 DiagnosticoComponent: Logs del flujo de diagnóstico exportados', {
            sessionId: this.flowLogger.getSessionId(),
            flowLog: flowLog
        });
        
        // Crear archivo descargable
        const blob = new Blob([flowLog], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagnostic-flow-${this.flowLogger.getSessionId()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // 🔍 MÉTODO PARA VER ESTADO ACTUAL DEL LOGGING
    public getCurrentLogStatus(): any {
        return {
            sessionId: this.flowLogger.getSessionId(),
            currentFlowLog: this.flowLogger.getCurrentFlowLog(),
            timestamp: new Date().toISOString()
        };
    }
}


