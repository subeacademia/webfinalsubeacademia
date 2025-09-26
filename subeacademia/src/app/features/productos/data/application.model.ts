export type ApplicationStatus = 'Recibida' | 'EnRevisión' | 'EntrevistaAgendada' | 'Aprobada' | 'Rechazada';

export interface Interview {
  scheduledAt?: Date;
  panel?: string[];
}

export interface Scores {
  project?: number;
  interview?: number;
  final?: number;
}

export interface Application {
  id: string;
  certificationId: string;
  userId?: string;
  orgId?: string;
  portfolio: {
    type: 'pdf' | 'url';
    value: string;
  };
  interview: Interview;
  scores: Scores;
  status: ApplicationStatus;
  decisionAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
