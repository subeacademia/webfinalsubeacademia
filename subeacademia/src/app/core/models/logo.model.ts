export interface Logo {
  id?: string;
  name: string;
  imageUrl: string;
  type?: 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica';
  websiteUrl?: string; // URL opcional para redireccionar al hacer click
  createdAt?: any;
  createdBy?: string;
}


