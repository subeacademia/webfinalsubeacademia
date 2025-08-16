export interface Project {
  id?: string;
  title: string;
  slug: string;
  clientName: string;
  summary: string; // Un resumen corto para la tarjeta
  description: string; // Descripción completa para la página de detalle
  imageUrl: string;
  projectUrl?: string; // Link opcional al proyecto real
  relatedCompetencies: string[]; // IDs de las competencias
  status: 'draft' | 'published' | 'scheduled';
  lang: string;
  langBase: string;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}
