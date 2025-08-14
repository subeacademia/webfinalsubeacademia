import { Injectable } from '@angular/core';
import { AresScoresByDimension, DiagnosticoFormValue, DiagnosticoScores, NivelCompetencia } from '../data/diagnostic.models';
import { ARES_ITEMS } from '../data/ares-items';
import { NIVEL_TO_SCORE } from '../data/levels';

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
}


