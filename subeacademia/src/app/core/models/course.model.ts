export interface CourseResource {
  type: 'video' | 'pdf' | 'zip' | 'image' | 'link' | 'file';
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
  title_en?: string;
  title_pt?: string;
  lessons: string[];
  lessons_en?: string[];
  lessons_pt?: string[];
}

export interface Course {
  id?: string;
  slug: string;
  title: string;
  title_en?: string;
  title_pt?: string;
  description?: string;
  description_en?: string;
  description_pt?: string;
  image?: string;
  category?: string;
  level?: 'Principiante' | 'Intermedio' | 'Avanzado' | 'intro' | 'intermedio' | 'avanzado';
  duration?: string; // ej: "10 horas"
  lessonCount?: number;
  date?: any; // Firestore timestamp
  modules?: CourseModule[]; // Programa académico

  // Campos legacy/opcionales para compatibilidad con datos existentes
  lang?: 'es' | 'pt' | 'en';
  titleI18n?: { es?: string; en?: string; pt?: string };
  summary?: string;
  summaryI18n?: { es?: string; en?: string; pt?: string };
  durationHours?: number | null;
  coverUrl?: string;
  resources?: CourseResource[];
  price?: number;
  publishedAt?: number | any;
  updatedAt?: number;
  status?: 'draft' | 'published' | 'scheduled';
  scheduledAt?: number;
  seo?: CourseSeo;
  topics?: string[];
}

