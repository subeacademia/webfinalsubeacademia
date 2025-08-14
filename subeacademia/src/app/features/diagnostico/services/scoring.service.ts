import { Injectable } from '@angular/core';
import { AresScoresByDimension, DiagnosticoFormValue, DiagnosticoScores, NivelCompetencia } from '../data/diagnostic.models';
import { ARES_ITEMS } from '../data/ares-items';
import { NIVEL_TO_SCORE } from '../data/levels';
import { COMPETENCIAS } from '../data/competencias';

export interface DiagnosticAnalysis {
    mainLevel: string;
    topStrengths: { name: string; level: string }[];
    topOpportunities: { name: string; level: string }[];
    aresAnalysis: { phase: string; score: number; interpretation: string }[];
    quickStartPlan: { day: string; task: string; focus: string }[];
}

export type DiagnosticData = DiagnosticoFormValue;

@Injectable({ providedIn: 'root' })
export class ScoringService {
    computeAresScore(form: DiagnosticoFormValue): AresScoresByDimension & { promedio: number } {
        // Regla simple: promedio por dimensión de valores 1-5, 0 se excluye; escala a 0-100.
        const byDim: Record<string, number[]> = {};
        for (const item of ARES_ITEMS) {
            const raw = form.ares?.respuestas?.[item.id] ?? null;
            if (raw === null || raw === 0) continue; // 0 = N/A
            if (!byDim[item.dimension]) byDim[item.dimension] = [];
            byDim[item.dimension].push(Number(raw));
        }
        const scores: AresScoresByDimension = {};
        let sumAll = 0;
        let countAll = 0;
        for (const [dim, values] of Object.entries(byDim)) {
            const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            const score = Math.round((avg / 5) * 100);
            scores[dim] = score;
            sumAll += score;
            countAll += 1;
        }
        const promedio = countAll ? Math.round(sumAll / countAll) : 0;
        return { ...scores, promedio } as any;
    }

    computeCompetencyScores(form: DiagnosticoFormValue): DiagnosticoScores['competencias'] {
        // Mapea nivel autoevaluado -> puntaje
        const niveles = form?.competencias?.niveles ?? {};
        const out = Object.entries(niveles).map(([competenciaId, nivel]) => {
            const puntaje = nivel ? NIVEL_TO_SCORE[nivel as NivelCompetencia] : 0;
            return { competenciaId, puntaje, nivel: (nivel || 'incipiente') as NivelCompetencia };
        });
        // Ordenar desc por puntaje para consistencia
        return out.sort((a, b) => b.puntaje - a.puntaje);
    }

    generateDiagnosticAnalysis(data: DiagnosticData): DiagnosticAnalysis {
        const ares = this.computeAresScore(data);
        const competencias = this.computeCompetencyScores(data);

        // Main level a partir del promedio de competencias (si no hay, usar ARES promedio)
        const promComp = competencias.length
            ? Math.round(competencias.reduce((a, c) => a + c.puntaje, 0) / competencias.length)
            : ares.promedio;
        const mainLevel = this.mapScoreToLevel(promComp);

        // Top 3 fortalezas y 3 oportunidades
        const topStrengths = competencias.slice(0, 3).map(c => ({
            name: (COMPETENCIAS.find(k => k.id === c.competenciaId)?.nameKey || c.competenciaId),
            level: this.mapScoreToLevel(c.puntaje),
        }));
        const opportunitiesSorted = [...competencias].sort((a, b) => a.puntaje - b.puntaje).slice(0, 3);
        const topOpportunities = opportunitiesSorted.map(c => ({
            name: (COMPETENCIAS.find(k => k.id === c.competenciaId)?.nameKey || c.competenciaId),
            level: this.mapScoreToLevel(c.puntaje),
        }));

        // ARES phases aggregation
        const phaseMap: Record<string, string[]> = {
            'F1 - Preparación': ['datos', 'talento', 'gobernanza'],
            'F2 - Diseño': ['valor', 'etica', 'riesgos', 'transparencia'],
            'F3 - Desarrollo': ['tecnologia', 'integracion', 'capacidad'],
            'F4 - Operación': ['operacion', 'seguridad', 'cumplimiento'],
            'F5 - Escalamiento': ['adopcion', 'sostenibilidad'],
        };
        const aresAnalysis = Object.entries(phaseMap).map(([phase, dims]) => {
            const vals = dims.map(d => (ares as any)[d] ?? 0);
            const score = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            return { phase, score, interpretation: this.interpretPhase(phase, score) };
        });

        const quickStartPlan = this.buildQuickStartPlan(data.segmento || 'startup', data.objetivo || 'eficiencia');

        return { mainLevel, topStrengths, topOpportunities, aresAnalysis, quickStartPlan };
    }

    private mapScoreToLevel(score: number): string {
        if (score >= 85) return 'Líder';
        if (score >= 70) return 'Avanzado';
        if (score >= 50) return 'Practicante';
        if (score >= 30) return 'Principiante';
        return 'Inicial';
    }

    private interpretPhase(phase: string, score: number): string {
        if (score >= 70) return `${phase}: Fortaleza sólida. Mantener métricas y escalar con gobernanza.`;
        if (score >= 50) return `${phase}: Base aceptable. Prioriza mejoras incrementales y documentación.`;
        if (score >= 30) return `${phase}: Oportunidad clave. Define responsables, KPIs y pilotos focalizados.`;
        return `${phase}: Urgente. Establece fundamentos (diagnóstico, gobierno de datos, políticas ARES).`;
    }

    private buildQuickStartPlan(segment: string, objetivo: string): { day: string; task: string; focus: string }[] {
        const base: { day: string; task: string; focus: string }[] = [
            { day: '1-2', task: 'Inventariar 3 procesos clave candidatos para IA.', focus: 'F1 - Preparación' },
            { day: '3-4', task: 'Definir KPIs de éxito y riesgos/ética para un piloto.', focus: 'F2 - Diseño' },
            { day: '5-6', task: 'Seleccionar herramientas y diseñar arquitectura del piloto.', focus: 'F3 - Desarrollo' },
            { day: '7-9', task: 'Construir PoC con datos reales y pruebas controladas.', focus: 'F3 - Desarrollo' },
            { day: '10-11', task: 'Plan de operación: monitoreo, alertas y retraining.', focus: 'F4 - Operación' },
            { day: '12', task: 'Definir comité ARES y checklist de cumplimiento.', focus: 'F4 - Operación' },
            { day: '13-14', task: 'Presentar resultados, lecciones y roadmap de escalamiento.', focus: 'F5 - Escalamiento' },
        ];

        if (objetivo === 'eficiencia') {
            base[0].task = 'Identificar 3 procesos repetitivos para automatizar con IA.';
            base[3].task = 'Construir PoC de automatización/agentización con métricas de tiempo/ahorro.';
        } else if (objetivo === 'crecimiento') {
            base[0].task = 'Identificar 3 palancas de crecimiento (captación, activación, retención).';
            base[3].task = 'PoC de growth con IA (personalización, scoring de leads, contenidos).';
        } else if (objetivo === 'innovacion') {
            base[0].task = 'Mapear 3 hipótesis de alto impacto para nuevos productos/servicios con IA.';
            base[3].task = 'PoC exploratoria validando factibilidad técnica y valor percibido.';
        } else if (objetivo === 'experienciaCliente') {
            base[0].task = 'Auditar journey y puntos de fricción del cliente.';
            base[3].task = 'PoC de asistente/soporte con IA y feedback loop de calidad.';
        }

        // Ajustes por segmento
        if (segment === 'startup') {
            base.push({ day: 'Extra', task: 'Preparar pitch de resultados para inversores/aliados.', focus: 'F5 - Escalamiento' });
        } else if (segment === 'corporativo') {
            base[1].task = base[1].task + ' Alinear con compliance y seguridad.';
        }
        return base;
    }
}


