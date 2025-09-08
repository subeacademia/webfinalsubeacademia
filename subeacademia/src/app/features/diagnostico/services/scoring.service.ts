import { Injectable } from '@angular/core';
import {
  Question,
  Answer,
  AresPillar,
  AresPhase,
  AresScores,
  CompScores,
  RiskLevel,
  GatingStatus
} from '../data/diagnostic.models';

// Helpers
const avg = (arr: number[]): number => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const round = (n: number): number => Math.round(n * 100) / 100;

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  constructor() {}

  computeAresScores(qs: Question[], ans: Record<string, Answer>): AresScores {
    const answered = (id: string) => ans[id]?.value != null && ans[id].value! >= 1 && ans[id].value! <= 5;
    const values = (filter: (q: Question) => boolean): number[] =>
      qs.filter(filter)
        .map(q => ans[q.id]?.value)
        .filter((v): v is number => typeof v === 'number');

    const bySubarea: Record<string, number> = {};
    const subareas = Array.from(new Set(qs.map(q => q.subarea).filter(Boolean))) as string[];
    for (const s of subareas) {
      const vs = values(q => q.subarea === s && answered(q.id));
      bySubarea[s] = vs.length ? round(avg(vs)) : 0;
    }

    const byPillar: Record<AresPillar, number> = { 'Agilidad': 0, 'Responsabilidad y Ética': 0, 'Sostenibilidad': 0 };
    const pillars: AresPillar[] = ['Agilidad', 'Responsabilidad y Ética', 'Sostenibilidad'];
    for (const p of pillars) {
      const vs = values(q => q.pillar === p && answered(q.id));
      byPillar[p] = vs.length ? round(avg(vs)) : 0;
    }
    
    const byPhase: Record<AresPhase, number> = { 'Preparación':0,'Diseño':0,'Desarrollo':0,'Monitoreo':0,'Escalado':0 };
    const phases: AresPhase[] = ['Preparación', 'Diseño', 'Desarrollo', 'Monitoreo', 'Escalado'];
    for (const f of phases) {
      const vs = values(q => q.phase === f && answered(q.id));
      byPhase[f] = vs.length ? round(avg(vs)) : 0;
    }

    const all = values(q => answered(q.id));
    const general = all.length ? round(avg(all)) : 0;

    const criticalQuestions = qs.filter(q => q.critical);
    const answeredCriticalIds = criticalQuestions.map(q => q.id).filter(answered);
    const criticalVals = answeredCriticalIds.map(id => ans[id].value!);

    let gatingStatus: GatingStatus = 'SIN_DATOS';
    if (answeredCriticalIds.length > 0) { // Only check if at least one critical question is answered
      if (answeredCriticalIds.length === criticalQuestions.length) {
         gatingStatus = Math.min(...criticalVals) >= 3 ? 'OK' : 'Bloquea≥3';
      } else {
         gatingStatus = 'Bloquea≥3'; // Incomplete criticals block progress
      }
    } else if (criticalQuestions.length > 0) {
      gatingStatus = 'Bloquea≥3'; // If there are criticals but none answered
    } else {
      gatingStatus = 'OK'; // No critical questions to gate
    }

    return { bySubarea, byPillar, byPhase, general, gatingStatus };
  }

  applyRiskWeighting(ares: AresScores, risk: RiskLevel): AresScores {
    if (!risk) return { ...ares, generalWeighted: ares.general };
    const w = risk === 'Alto' ? { A: 0.25, R: 0.50, S: 0.25 }
            : risk === 'Limitado' ? { A: 0.30, R: 0.40, S: 0.30 }
            : { A: 1/3, R: 1/3, S: 1/3 };

    const generalWeighted = round(
      (w.A * (ares.byPillar['Agilidad'] || 0)) +
      (w.R * (ares.byPillar['Responsabilidad y Ética'] || 0)) +
      (w.S * (ares.byPillar['Sostenibilidad'] || 0))
    );
    return { ...ares, generalWeighted };
  }

  computeCompScores(qs: Question[], ans: Record<string, Answer>): CompScores {
    const answered = (id: string) => ans[id]?.value != null && ans[id].value! >= 1 && ans[id].value! <= 5;
    const values = (filter: (q: Question) => boolean): number[] =>
      qs.filter(filter)
        .map(q => ans[q.id]?.value)
        .filter((v): v is number => typeof v === 'number');

    const byCluster: Record<string, number> = {};
    const clusters = Array.from(new Set(qs.map(q => q.cluster).filter(Boolean))) as string[];
    for (const c of clusters) {
      const vs = values(q => q.cluster === c && answered(q.id));
      byCluster[c] = vs.length ? round(avg(vs)) : 0;
    }

    const byCompetency: Record<string, number> = {};
    const comps = Array.from(new Set(qs.map(q => q.comp).filter(Boolean))) as string[];
    for (const c of comps) {
      const vs = values(q => q.comp === c && answered(q.id));
      byCompetency[c] = vs.length ? round(avg(vs)) : 0;
    }

    const all = values(q => answered(q.id));
    const general = all.length ? round(avg(all)) : 0;

    const criticalQuestions = qs.filter(q => q.critical);
    const answeredCriticalIds = criticalQuestions.map(q => q.id).filter(answered);
    const criticalVals = answeredCriticalIds.map(id => ans[id].value!);
    
    let gatingStatus: GatingStatus = 'SIN_DATOS';
     if (answeredCriticalIds.length > 0) {
      if (answeredCriticalIds.length === criticalQuestions.length) {
         gatingStatus = Math.min(...criticalVals) >= 3 ? 'OK' : 'Bloquea≥3';
      } else {
         gatingStatus = 'Bloquea≥3';
      }
    } else if (criticalQuestions.length > 0) {
      gatingStatus = 'Bloquea≥3';
    } else {
       gatingStatus = 'OK';
    }


    return { byCluster, byCompetency, general, gatingStatus };
  }

  composite(aresWeighted: number, comp: number, lambdaComp: number): number {
    return round(((1 - lambdaComp) * (aresWeighted || 0)) + (lambdaComp * (comp || 0)));
  }

  // Métodos de compatibilidad para el sistema anterior
  computeAresScore(data: any): any {
    // Método de compatibilidad - retornar estructura esperada por el sistema anterior
    return {
      general: 0,
      byPillar: {},
      bySubarea: {},
      byPhase: {},
      gatingStatus: 'SIN_DATOS'
    };
  }

  computeCompetencyScores(data: any): any[] {
    // Método de compatibilidad - retornar array esperado por el sistema anterior
    return [];
  }
}
