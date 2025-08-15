import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { StepNavComponent } from './components/step-nav.component';

@Component({
    selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, RouterOutlet, StepNavComponent],
    template: `
        <div class="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4 pt-24">
            <div class="w-full max-w-4xl">
                <app-step-nav [progress]="progress()"></app-step-nav>
                <main class="mt-10">
                    <router-outlet></router-outlet>
                </main>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticoComponent {
    private readonly diagnosticState = inject(DiagnosticStateService);
    private readonly router = inject(Router);

    // Señal de progreso basada en la ruta actual
    progress = computed(() => {
        const currentRoute = this.router.url;
        return this.diagnosticState.getProgressForRoute(currentRoute);
    });
}


