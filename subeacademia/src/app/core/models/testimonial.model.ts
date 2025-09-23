export interface Testimonial {
  id?: string;
  name: string;
  company: string;
  position?: string; // Cargo o posición en la empresa
  testimonial: string; // El testimonio en sí
  photoUrl: string; // URL de la foto de la persona
  companyLogoUrl?: string; // URL del logo de la empresa (opcional)
  rating?: number; // Calificación de 1 a 5 (opcional)
  isActive?: boolean; // Si está activo para mostrar
  displayOrder?: number; // Orden de visualización
  createdAt?: any;
  createdBy?: string;
}
