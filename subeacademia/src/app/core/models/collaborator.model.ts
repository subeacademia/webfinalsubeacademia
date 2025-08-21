export interface Collaborator {
  id?: string;
  name: string;
  logoUrl: string; // URL de la imagen del logo
  website: string; // Enlace a su sitio web
  description: string; // Una breve descripción del socio para la cara trasera de la tarjeta
  type: 'Partner Tecnológico' | 'Partner Académico' | 'Cliente Destacado'; // Para poder filtrar o categorizar en el futuro
}


