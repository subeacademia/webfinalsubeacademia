export interface PostMediaItem {
  type: 'image' | 'video' | 'pdf' | 'interactive';
  url: string;
  title?: string;
}

export interface PostAuthorItem {
  name: string;
  url?: string;
}

export interface PostSeo {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface Post {
  id: string;
  lang: 'es' | 'pt' | 'en';
  title: string;
  // Campos opcionales para títulos traducidos
  title_en?: string;
  title_pt?: string;
  titleI18n?: { es?: string; en?: string; pt?: string };
  slug: string;
  summary: string;
  summaryI18n?: { es?: string; en?: string; pt?: string };
  content: string;
  // Campos opcionales para contenido traducido
  content_en?: string;
  content_pt?: string;
  contentI18n?: { es?: string; en?: string; pt?: string };
  contentHtml?: string;
  contentText?: string;
  categories: string[];
  tags: string[];
  coverUrl?: string;
  media: PostMediaItem[];
  authors: PostAuthorItem[];
  publishedAt: number;
  updatedAt?: number;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: number;
  seo?: PostSeo;
  relatedCompetencies?: string[]; // IDs de competencias relacionadas
}

