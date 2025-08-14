import { NivelCompetencia } from './diagnostic.models';

export const NIVEL_TO_SCORE: Record<NivelCompetencia, number> = {
  incipiente: 20,
  basico: 40,
  intermedio: 60,
  avanzado: 80,
  lider: 100,
};


