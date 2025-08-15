import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { DiagnosticStateService } from './services/diagnostic-state.service';
import { StepNavComponent } from './components/step-nav.component';
import { ThemeService } from '../../shared/theme.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-diagnostico',
    standalone: true,
    imports: [CommonModule, RouterOutlet, StepNavComponent],
    template: `
        <div class="flex flex-col items-center justify-start min-h-screen bg-gray-900 dark:bg-gray-900 text-white p-4 pt-24 transition-colors duration-300">
            <div class="w-full max-w-6xl">
                <app-step-nav [progress]="progress()"></app-step-nav>
                <main class="mt-10">
                    <router-outlet></router-outlet>
                </main>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DiagnosticoComponent implements OnInit {
    private readonly diagnosticState = inject(DiagnosticStateService);
    private readonly router = inject(Router);
    private readonly themeService = inject(ThemeService);

    // Señal de progreso basada en la ruta actual y cambios en formularios
    progress = computed(() => {
        const currentRoute = this.router.url;
        // Forzar recálculo cuando cambien los formularios
        this.diagnosticState.aresForm.value;
        this.diagnosticState.competenciasForm.value;
        return this.diagnosticState.getProgressForRoute(currentRoute);
    });

    ngOnInit(): void {
        // Suscribirse a cambios de navegación para actualizar el progreso
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            // El progreso se actualiza automáticamente a través de la señal computed
            console.log('Navegación completada, progreso actual:', this.progress());
        });
    }
}


