export function generateSlug(input: string): string {
  if (!input) return '';
  // Normalizar, quitar acentos y caracteres especiales
  const withoutAccents = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return withoutAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // eliminar caracteres no alfanuméricos excepto espacio y guion
    .replace(/\s+/g, '-') // espacios a guiones
    .replace(/-+/g, '-') // colapsar guiones
    .replace(/^-|-$/g, ''); // quitar guiones al inicio/fin
}

