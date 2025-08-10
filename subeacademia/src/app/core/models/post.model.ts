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
  slug: string;
  summary: string;
  content: string;
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
}

