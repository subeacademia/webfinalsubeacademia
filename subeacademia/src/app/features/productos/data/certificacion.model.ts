// Enums para el nuevo sistema de certificaciones
export type CertificationState = 'Disponible' | 'Próximamente' | 'NoDisponible';
export type CertificationAudience = 'Empresas' | 'Personas' | 'Ambas';
export type CertificationCategory = 'Madurez Organizacional' | 'Competencias Personas/Equipos' | 'Sectorial';
export type RouteType = 'Formación' | 'Convalidación';
export type Language = 'es' | 'en' | 'pt';
export type Currency = 'CLP' | 'USD' | 'EUR';
export type RecertificationType = 'curso' | 'evaluacion' | 'proyecto';

// Interfaces para estructuras complejas
export interface Modalities {
  asincronica: boolean;
  enVivo: boolean;
  hibrida: boolean;
  presencial: boolean;
}

export interface Currencies {
  CLP?: number;
  USD?: number;
  EUR?: number;
}

export interface Recertification {
  required: boolean;
  hoursCEU?: number;
  type?: RecertificationType;
}

export interface Evaluation {
  exam: boolean;
  project: boolean;
  interview: boolean;
  defense: boolean;
  weights?: {
    exam?: number;
    project?: number;
    interview?: number;
    defense?: number;
  };
}

export interface ValidationTrack {
  enabled: boolean;
  portfolioRequired: boolean;
  allowedFormats: string[];
  autoInterviewBooking: boolean;
  SLA_days: number;
}

export interface Pathways {
  predecessors?: string[];
  successors?: string[];
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
}

// Modelo principal actualizado
export interface Certificacion {
  // Identidad y estado
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  state: CertificationState;
  active: boolean;
  versionPlan: string;
  
  // Clasificación
  audience: CertificationAudience;
  category: CertificationCategory;
  routeTypes: RouteType[];
  
  // Entrega
  durationHours: number;
  modalities: Modalities;
  languages: Language[];
  
  // Economía
  currencies: Currencies;
  pricingNotes?: string;
  paymentLink?: string;
  
  // Avales y sellos
  endorsers: string[];
  doubleSeal: boolean;
  
  // Vigencia y recertificación
  validityMonths?: number;
  recertification: Recertification;
  
  // Evaluación
  evaluation: Evaluation;
  
  // Convalidación
  validationTrack: ValidationTrack;
  
  // Competencias y alineación
  competencies: string[];
  regulatoryAlignment: string[];
  
  // Requisitos y rutas
  prerequisites: string[];
  pathways: Pathways;
  
  // Medios y SEO
  heroImageUrl?: string;
  sealImageUrl?: string;
  gallery: string[];
  seo: SEO;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  updatedBy: string;
  
  // Campos legacy para compatibilidad
  titulo?: string;
  descripcion?: string;
  imagenDestacada?: string;
  entidadCertificadora?: string;
  nivel?: string;
  precio?: number;
  duracionHoras?: number;
  modalidad?: string;
  estado?: string;
  selloUrl?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  activo?: boolean;
}
