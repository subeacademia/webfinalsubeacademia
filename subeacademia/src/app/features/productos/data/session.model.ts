export type DeliveryMode = 'online' | 'presencial' | 'hibrido';

export interface Session {
  id: string;
  certificationId: string;
  startAt: Date;
  endAt: Date;
  delivery: DeliveryMode;
  capacity?: number;
  location?: string;
  enrollmentUrl?: string;
  status: 'programada' | 'en_curso' | 'completada' | 'cancelada';
  instructor?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
