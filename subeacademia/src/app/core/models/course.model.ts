export interface CourseResource {
  type: 'video' | 'pdf' | 'zip' | 'image';
  url: string;
  title?: string;
}

export interface CourseSeo {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Course {
  id: string;
  lang: 'es' | 'pt' | 'en';
  title: string;
  titleI18n?: { es?: string; en?: string; pt?: string };
  // Traducciones explícitas para UI
  title_en?: string;
  title_pt?: string;
  slug: string;
  summary: string;
  summaryI18n?: { es?: string; en?: string; pt?: string };
  // Nivel interno; se mapea en UI a 'Principiante' | 'Intermedio' | 'Avanzado'
  level: 'intro' | 'intermedio' | 'avanzado';
  // Metadatos adicionales para UI
  category?: string;
  description?: string;
  description_en?: string;
  description_pt?: string;
  duration?: string; // p.ej. "10 horas"
  lessonCount?: number;
  durationHours?: number;
  topics: string[];
  coverUrl?: string;
  image?: string;
  modules?: CourseModule[];
  resources: CourseResource[];
  price?: number;
  publishedAt: number;
  updatedAt?: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: number;
  seo?: CourseSeo;
}

