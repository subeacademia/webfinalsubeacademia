export interface Collaborator {
  id?: string;
  name: string;
  logoUrl: string; // URL de la imagen del logo
  website: string; // Enlace a su sitio web
  description: string; // Una breve descripción del socio para la cara trasera de la tarjeta
  // Rol/título visible en la tarjeta (p.ej. "Ingeniero de IA").
  role?: string;
  // Tipo de partner (opcional para compatibilidad hacia atrás)
  type?: 'Partner Tecnológico' | 'Partner Académico' | 'Cliente Destacado';
}


