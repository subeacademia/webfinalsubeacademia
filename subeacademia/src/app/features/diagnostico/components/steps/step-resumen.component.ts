import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { DiagnosticStateService } from '../../services/diagnostic-state.service';
import { RadarChartComponent } from '../ui/radar-chart.component';
import { SemaforoAresComponent } from '../ui/semaforo-ares.component';
import { ScoringService } from '../../services/scoring.service';
import { PdfService } from '../../services/pdf.service';
import { DiagnosticsService } from '../../services/diagnostics.service';
import { StepNavComponent } from '../step-nav.component';
import { StepNavComponent } from '../step-nav.component';

@Component({
    selector: 'app-step-resumen',
    standalone: true,
    imports: [CommonModule, I18nTranslatePipe, StepNavComponent, RadarChartComponent, SemaforoAresComponent],
    templateUrl: './step-resumen.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepResumenComponent {
	readonly state = inject(DiagnosticStateService);
    private readonly scoring = inject(ScoringService);
    private readonly pdf = inject(PdfService);
    private readonly diagnostics = inject(DiagnosticsService);

    aresPromedio = 0;
    aresChartData: any = {};
    compScores: any[] = [];
    quickWins: string[] = [];

    ngOnInit(): void {
        const form = this.state.getFullValue();
        const ares = this.scoring.computeAresScore(form);
        const competencias = this.scoring.computeCompetencyScores(form);
        this.aresPromedio = ares.promedio;
        // Adaptar para radar: labels + dataset
        const dims = Object.keys(ares).filter(k => k !== 'promedio');
        this.aresChartData = {
            labels: dims,
            datasets: [
                { label: 'ARES', data: dims.map(d => (ares as any)[d]) },
            ],
        };
        this.compScores = competencias;
        this.quickWins = this.buildQuickWins(form.segmento || 'startup', form.objetivo || 'eficiencia');
    }

    private buildQuickWins(segmento: any, objetivo: any): string[] {
        const base = [
            'Definir un backlog de pilotos IA priorizados por impacto y esfuerzo',
            'Establecer métricas de valor claras y un tablero de seguimiento',
            'Alinear un comité ARES con roles y responsables',
        ];
        if (objetivo === 'eficiencia') base.unshift('Automatizar 1-2 procesos repetitivos con agentes');
        if (objetivo === 'crecimiento') base.unshift('Lanzar experimentos de growth con IA generativa');
        if (objetivo === 'innovacion') base.unshift('Prototipar una PoC de alto valor de negocio');
        if (objetivo === 'experienciaCliente') base.unshift('Implementar un asistente de soporte con IA y feedback loop');
        return base.slice(0, 4);
    }

    async onSubmit(): Promise<void> {
        const form = this.state.getFullValue();
        const scores = {
            ares: this.scoring.computeAresScore(form),
            competencias: this.scoring.computeCompetencyScores(form),
        };
        // Guardar en Firestore y solicitar email (CF)
        await this.diagnostics.saveAndRequestEmail({
            version: 1,
            lang: 'es',
            createdAt: Date.now(),
            form,
            scores,
            email: form.lead?.email || undefined,
        });
        // Generar PDF y descargar
        const blob = await this.pdf.renderReport('pdf-report');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagnostico-ares.pdf';
        a.click();
        URL.revokeObjectURL(url);
    }
}


