import { Injectable } from '@angular/core';
import { Observable, from, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CursosService } from '../../../features/productos/services/cursos.service';
import { AsesoriasService } from '../../../features/productos/services/asesorias.service';
import { CertificacionesService } from '../../../features/productos/services/certificaciones.service';
import { Curso, Asesoria, Certificacion } from '../../../features/productos/data/producto.model';

export interface BulkUploadResult {
  success: boolean;
  totalProcessed: number;
  totalErrors: number;
  errors: string[];
  summary: {
    cursosCreados: number;
    asesoriasCreadas: number;
    certificacionesCreadas: number;
  };
}

export interface BulkUploadProgress {
  currentStep: string;
  progress: number;
  totalItems: number;
  processedItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  private readonly BATCH_SIZE = 10; // Procesar en lotes de 10 para mejor rendimiento
  private readonly MAX_RETRIES = 3; // Reintentos en caso de error

  constructor(
    private cursosService: CursosService,
    private asesoriasService: AsesoriasService,
    private certificacionesService: CertificacionesService
  ) {}

  /**
   * Procesa la carga masiva de productos de forma eficiente
   */
  processBulkUpload(
    data: any,
    progressCallback?: (progress: BulkUploadProgress) => void
  ): Observable<BulkUploadResult> {
    return from(this.validateAndProcessData(data, progressCallback));
  }

  private async validateAndProcessData(
    data: any,
    progressCallback?: (progress: BulkUploadProgress) => void
  ): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      success: false,
      totalProcessed: 0,
      totalErrors: 0,
      errors: [],
      summary: {
        cursosCreados: 0,
        asesoriasCreadas: 0,
        certificacionesCreadas: 0
      }
    };

    try {
      // Validar estructura de datos
      if (!data || typeof data !== 'object') {
        throw new Error('El archivo JSON no tiene un formato válido');
      }

      // Contar total de elementos
      const totalItems = this.countTotalItems(data);
      if (totalItems === 0) {
        throw new Error('No se encontraron productos válidos en el archivo');
      }

      let processedItems = 0;

      // Procesar cursos
      if (data.cursos && Array.isArray(data.cursos)) {
        progressCallback?.({
          currentStep: 'Procesando cursos',
          progress: Math.round((processedItems / totalItems) * 100),
          totalItems,
          processedItems
        });

        const cursosResult = await this.processBatch(
          data.cursos,
          'curso',
          this.cursosService.createCurso.bind(this.cursosService)
        );
        
        result.summary.cursosCreados = cursosResult.success;
        result.totalProcessed += cursosResult.success;
        result.totalErrors += cursosResult.errors;
        result.errors.push(...cursosResult.errorMessages);
        processedItems += data.cursos.length;
      }

      // Procesar asesorías
      if (data.asesorias && Array.isArray(data.asesorias)) {
        progressCallback?.({
          currentStep: 'Procesando asesorías',
          progress: Math.round((processedItems / totalItems) * 100),
          totalItems,
          processedItems
        });

        const asesoriasResult = await this.processBatch(
          data.asesorias,
          'asesoria',
          this.asesoriasService.createAsesoria.bind(this.asesoriasService)
        );
        
        result.summary.asesoriasCreadas = asesoriasResult.success;
        result.totalProcessed += asesoriasResult.success;
        result.totalErrors += asesoriasResult.errors;
        result.errors.push(...asesoriasResult.errorMessages);
        processedItems += data.asesorias.length;
      }

      // Procesar certificaciones
      if (data.certificaciones && Array.isArray(data.certificaciones)) {
        progressCallback?.({
          currentStep: 'Procesando certificaciones',
          progress: Math.round((processedItems / totalItems) * 100),
          totalItems,
          processedItems
        });

        const certificacionesResult = await this.processBatch(
          data.certificaciones,
          'certificacion',
          this.certificacionesService.createCertificacion.bind(this.certificacionesService)
        );
        
        result.summary.certificacionesCreadas = certificacionesResult.success;
        result.totalProcessed += certificacionesResult.success;
        result.totalErrors += certificacionesResult.errors;
        result.errors.push(...certificacionesResult.errorMessages);
        processedItems += data.certificaciones.length;
      }

      progressCallback?.({
        currentStep: 'Completado',
        progress: 100,
        totalItems,
        processedItems: totalItems
      });

      result.success = result.totalErrors < totalItems; // Éxito si hay menos errores que elementos
      return result;

    } catch (error) {
      result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      result.totalErrors++;
      return result;
    }
  }

  private countTotalItems(data: any): number {
    let total = 0;
    if (data.cursos && Array.isArray(data.cursos)) total += data.cursos.length;
    if (data.asesorias && Array.isArray(data.asesorias)) total += data.asesorias.length;
    if (data.certificaciones && Array.isArray(data.certificaciones)) total += data.certificaciones.length;
    return total;
  }

  private async processBatch(
    items: any[],
    type: 'curso' | 'asesoria' | 'certificacion',
    createFunction: (item: any) => Observable<string>
  ): Promise<{ success: number; errors: number; errorMessages: string[] }> {
    const result = {
      success: 0,
      errors: 0,
      errorMessages: [] as string[]
    };

    // Procesar en lotes para mejor rendimiento
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);
      
      const batchPromises = batch.map(async (item, index) => {
        const globalIndex = i + index;
        try {
          const validatedItem = this.validateAndPrepareItem(item, type);
          await createFunction(validatedItem).toPromise();
          return { success: true, index: globalIndex };
        } catch (error) {
          const errorMessage = `Error en ${type} ${globalIndex + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          return { success: false, index: globalIndex, error: errorMessage };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const itemResult = promiseResult.value;
          if (itemResult.success) {
            result.success++;
          } else {
            result.errors++;
            result.errorMessages.push(itemResult.error!);
          }
        } else {
          result.errors++;
          result.errorMessages.push(`Error de procesamiento: ${promiseResult.reason}`);
        }
      });

      // Pequeña pausa entre lotes para no sobrecargar Firestore
      if (i + this.BATCH_SIZE < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return result;
  }

  private validateAndPrepareItem(item: any, type: 'curso' | 'asesoria' | 'certificacion'): any {
    if (!item || typeof item !== 'object') {
      throw new Error('El elemento no es un objeto válido');
    }

    if (!item.titulo || typeof item.titulo !== 'string' || item.titulo.trim().length === 0) {
      throw new Error('El título es obligatorio y debe ser un texto válido');
    }

    if (item.precio !== undefined && (isNaN(Number(item.precio)) || Number(item.precio) < 0)) {
      throw new Error('El precio debe ser un número válido mayor o igual a 0');
    }

    const baseData = {
      titulo: item.titulo.trim(),
      descripcion: item.descripcion || 'Sin descripción',
      precio: Number(item.precio) || 0,
      slug: this.generateSlug(item.titulo),
      imagenDestacada: item.imagenDestacada || '',
      activo: item.activo !== undefined ? Boolean(item.activo) : true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    switch (type) {
      case 'curso':
        return {
          ...baseData,
          tipo: 'curso' as const,
          duracion: item.duracion || '0 horas',
          nivel: item.nivel || 'Principiante',
          instructor: item.instructor || 'Sin instructor',
          contenido: Array.isArray(item.contenido) ? item.contenido : [],
          recursos: Array.isArray(item.recursos) ? item.recursos : []
        };

      case 'asesoria':
        return {
          ...baseData,
          tipo: 'asesoria' as const,
          descripcionCorta: item.descripcionCorta || item.descripcion || 'Sin descripción',
          descripcionLarga: item.descripcionLarga || item.descripcion || 'Sin descripción',
          tags: Array.isArray(item.tags) ? item.tags : []
        };

      case 'certificacion':
        return {
          ...baseData,
          tipo: 'certificacion' as const,
          entidadCertificadora: item.entidadCertificadora || 'Sube Academia',
          nivel: item.nivel || 'Básico'
        };

      default:
        throw new Error(`Tipo de producto no válido: ${type}`);
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now();
  }

  /**
   * Genera un archivo JSON de ejemplo con la estructura correcta
   */
  generateExampleStructure(): string {
    const structure = {
      cursos: [
        {
          titulo: "Introducción a la Inteligencia Artificial",
          descripcion: "Curso completo sobre los fundamentos de la IA y sus aplicaciones prácticas",
          precio: 149.99,
          duracion: "40 horas",
          nivel: "Principiante",
          instructor: "Dr. Ana Martínez",
          contenido: [
            "Módulo 1: Conceptos básicos de IA",
            "Módulo 2: Machine Learning fundamentals",
            "Módulo 3: Redes Neuronales",
            "Módulo 4: Aplicaciones prácticas"
          ],
          recursos: [
            "Manual del curso en PDF",
            "Videos explicativos",
            "Ejercicios prácticos",
            "Datasets de ejemplo"
          ],
          imagenDestacada: "https://ejemplo.com/curso-ia.jpg",
          activo: true
        }
      ],
      asesorias: [
        {
          titulo: "Consultoría en Transformación Digital con IA",
          descripcion: "Asesoría personalizada para implementar IA en tu empresa",
          descripcionCorta: "Transformación digital con IA",
          descripcionLarga: "Consultoría integral para guiar a tu empresa en el proceso de adopción de tecnologías de inteligencia artificial, desde la estrategia hasta la implementación.",
          precio: 299.99,
          tags: ["IA", "Consultoría", "Transformación Digital", "Estrategia"],
          imagenDestacada: "https://ejemplo.com/asesoria-ia.jpg",
          activo: true
        }
      ],
      certificaciones: [
        {
          titulo: "Certificación en IA para Negocios",
          descripcion: "Certificación oficial que valida tus conocimientos en aplicación de IA en entornos empresariales",
          precio: 199.99,
          entidadCertificadora: "Sube Academia",
          nivel: "Intermedio",
          imagenDestacada: "https://ejemplo.com/certificacion-ia.jpg",
          activo: true
        }
      ]
    };

    return JSON.stringify(structure, null, 2);
  }
}
