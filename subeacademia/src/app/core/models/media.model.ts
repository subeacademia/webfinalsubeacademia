import { Timestamp, FieldValue } from '@angular/fire/firestore';

// Modelo unificado para medios, con campos opcionales para compatibilidad
export interface MediaItem {
  id?: string;
  // Datos principales
  name?: string; // nombre legible
  fileName?: string; // compatibilidad antigua
  path: string;
  url: string;
  size: number;
  type?: string; // MIME
  contentType?: string; // compatibilidad antigua

  // Metadatos
  category?: string;
  tags?: string[];
  description?: string;
  meta?: Record<string, any>;

  // Auditoría
  uploadedBy?: string | null;
  uploadedAt?: Timestamp | Date | FieldValue | number;
  updatedAt?: Timestamp | Date | FieldValue | number;
  createdAt?: number; // compatibilidad antigua
  createdBy?: string; // uid legacy
}

