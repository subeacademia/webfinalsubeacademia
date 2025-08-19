export interface Asesoria {
  id: string;
  titulo: string;
  descripcionCorta: string;
  descripcionLarga: string;
  imagenDestacada: string;
  precio: number;
  tags: string[];
  slug: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
}
