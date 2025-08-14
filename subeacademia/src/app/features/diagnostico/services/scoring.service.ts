import { Injectable } from '@angular/core';
import { AresScoresByDimension, DiagnosticoFormValue, DiagnosticoScores } from '../data/diagnostic.models';

@Injectable({ providedIn: 'root' })
export class ScoringService {
	computeAresScore(form: DiagnosticoFormValue): AresScoresByDimension & { promedio: number } {
		// Placeholder: implementación real en Parte 4
		return { promedio: 0 } as any;
	}

	computeCompetencyScores(form: DiagnosticoFormValue): DiagnosticoScores['competencias'] {
		// Placeholder: implementación real en Parte 4
		return [];
	}
}


