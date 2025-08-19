export interface Certificacion {
  id: string;
  titulo: string;
  descripcion: string;
  imagenDestacada: string;
  entidadCertificadora: string;
  nivel: string;
  precio: number;
  slug: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
}
