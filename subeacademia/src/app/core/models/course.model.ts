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

export interface Course {
  id: string;
  lang: 'es' | 'pt' | 'en';
  title: string;
  slug: string;
  summary: string;
  level: 'intro' | 'intermedio' | 'avanzado';
  durationHours?: number;
  topics: string[];
  coverUrl?: string;
  resources: CourseResource[];
  price?: number;
  publishedAt: number;
  updatedAt?: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: number;
  seo?: CourseSeo;
}

