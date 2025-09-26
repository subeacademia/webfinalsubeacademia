export interface Producto {
  id: string;
  titulo: string;
  descripcion: string;
  imagenDestacada: string;
  precio: number;
  slug: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  tipo: 'asesoria' | 'curso' | 'certificacion';
}

export interface Curso extends Producto {
  tipo: 'curso';
  duracion: string;
  nivel: string;
  instructor: string;
  contenido: string[];
  recursos: string[];
}

export interface Asesoria extends Producto {
  tipo: 'asesoria';
  descripcionCorta: string;
  descripcionLarga: string;
  tags: string[];
}

export interface CertificacionLegacy extends Producto {
  tipo: 'certificacion';
  entidadCertificadora: string;
  nivel: string;
}
