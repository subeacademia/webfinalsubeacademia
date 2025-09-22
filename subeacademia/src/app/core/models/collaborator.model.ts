export interface Collaborator {
  id?: string;
  name: string;
  logoUrl: string; // URL de la imagen del logo/foto
  website: string; // Enlace a su sitio web o LinkedIn
  description: string; // Una breve descripción del socio para la cara trasera de la tarjeta
  // Rol/título visible en la tarjeta (p.ej. "Ingeniero de IA").
  role?: string;
  // Tipo de partner (opcional para compatibilidad hacia atrás)
  type?: 'Partner Tecnológico' | 'Partner Académico' | 'Cliente Destacado' | 'Fundador';
  // Nuevos campos para fundadores y colaboradores ampliados
  isFounder?: boolean; // Identifica si es uno de los 4 fundadores
  founderOrder?: number; // Orden de los fundadores (0-3)
  fullBio?: string[]; // Biografía completa para fundadores
  linkedinUrl?: string; // URL específica de LinkedIn
  imageUrl?: string; // URL de foto personal (para fundadores)
  bio?: string; // Biografía corta
  displayOrder?: number; // Orden de visualización general
  isActive?: boolean; // Si está activo o no
  joinDate?: Date; // Fecha de incorporación
}

export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  linkedinUrl: string;
  bio: string;
  fullBio: string[];
  flipped?: boolean;
  isFounder?: boolean;
}


