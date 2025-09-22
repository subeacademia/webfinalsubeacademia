import { Injectable, inject } from '@angular/core';
import { HistoryService } from '../data/history.service';
import { HistoryEvent } from '../models/history-event.model';
import { saveAs } from 'file-saver';

export interface HistoryBulkUploadResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    item: any;
    error: string;
  }>;
  successfulItems: Array<{
    index: number;
    title: string;
    year: number;
  }>;
}

export interface HistoryBulkUploadProgress {
  currentItem: number;
  totalItems: number;
  percentage: number;
  status: 'processing' | 'completed' | 'error';
  message: string;
}

export interface HistoryJsonStructure {
  version: string;
  exportDate: string;
  totalItems: number;
  data: HistoryEvent[];
  metadata: {
    description: string;
    instructions: string[];
    fieldDefinitions: {
      [key: string]: {
        type: string;
        required: boolean;
        description: string;
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class HistoryBulkUploadService {
  private historyService = inject(HistoryService);

  /**
   * Descarga la estructura actual de Historia en formato JSON
   */
  async downloadCurrentStructure(): Promise<void> {
    try {
      // Obtener todos los eventos de historia
      const historyEvents = await this.historyService.list().toPromise() || [];
      
      // Crear estructura JSON completa
      const jsonStructure: HistoryJsonStructure = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalItems: historyEvents.length,
        data: historyEvents.map(event => ({
          year: event.year,
          title: event.title,
          description: event.description,
          order: event.order || 0
        })),
        metadata: {
          description: 'Estructura de Historia de Sube Academia - Sistema de carga masiva',
          instructions: [
            'Este archivo contiene la estructura completa de la historia de la empresa',
            'Puedes modificar los datos existentes o agregar nuevos elementos',
            'Respeta la estructura de cada objeto para evitar errores',
            'Los campos "year", "title" y "description" son obligatorios',
            'El campo "order" es opcional y controla el orden de visualización',
            'Guarda el archivo y súbelo usando el sistema de carga masiva'
          ],
          fieldDefinitions: {
            year: {
              type: 'number',
              required: true,
              description: 'Año del evento histórico (ej: 2024)'
            },
            title: {
              type: 'string',
              required: true,
              description: 'Título del evento o hito histórico'
            },
            description: {
              type: 'string',
              required: true,
              description: 'Descripción detallada del evento'
            },
            order: {
              type: 'number',
              required: false,
              description: 'Orden de visualización (opcional, por defecto se ordena por año)'
            }
          }
        }
      };

      // Crear archivo JSON con formato bonito
      const jsonString = JSON.stringify(jsonStructure, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const fileName = `historia-estructura-${new Date().toISOString().split('T')[0]}.json`;
      
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error descargando estructura de historia:', error);
      throw new Error('No se pudo descargar la estructura de historia');
    }
  }

  /**
   * Procesa un archivo JSON y valida la estructura
   */
  async processJsonFile(
    file: File,
    progressCallback?: (progress: HistoryBulkUploadProgress) => void
  ): Promise<HistoryBulkUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const parsedData = JSON.parse(jsonContent);
          
          // Validar estructura básica
          const validationError = this.validateJsonStructure(parsedData);
          if (validationError) {
            reject(new Error(`Estructura JSON inválida: ${validationError}`));
            return;
          }

          // Extraer datos de historia
          const historyData = this.extractHistoryData(parsedData);
          
          if (historyData.length === 0) {
            reject(new Error('El archivo JSON no contiene datos de historia válidos.'));
            return;
          }

          // Procesar eventos de historia
          const result = await this.processHistoryBatch(historyData, progressCallback);
          resolve(result);
          
        } catch (error) {
          if (error instanceof SyntaxError) {
            reject(new Error('El archivo no contiene JSON válido. Verifica el formato.'));
          } else {
            reject(new Error(`Error procesando el archivo JSON: ${error}`));
          }
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error leyendo el archivo JSON.'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Valida la estructura del JSON
   */
  private validateJsonStructure(data: any): string | null {
    if (typeof data !== 'object' || data === null) {
      return 'El archivo debe contener un objeto JSON válido';
    }

    // Verificar si tiene estructura completa (con metadata) o solo datos
    if (data.data && Array.isArray(data.data)) {
      // Estructura completa exportada por el sistema
      if (!data.version) return 'Falta el campo "version" en la estructura';
      if (!Array.isArray(data.data)) return 'El campo "data" debe ser un array';
      return null;
    } else if (Array.isArray(data)) {
      // Array directo de eventos
      return null;
    } else {
      return 'El archivo debe contener un array de eventos o una estructura con campo "data"';
    }
  }

  /**
   * Extrae los datos de historia del JSON
   */
  private extractHistoryData(data: any): HistoryEvent[] {
    if (data.data && Array.isArray(data.data)) {
      // Estructura completa
      return data.data;
    } else if (Array.isArray(data)) {
      // Array directo
      return data;
    } else {
      return [];
    }
  }

  /**
   * Procesa un lote de eventos de historia
   */
  private async processHistoryBatch(
    data: HistoryEvent[],
    progressCallback?: (progress: HistoryBulkUploadProgress) => void,
    replaceAll: boolean = true
  ): Promise<HistoryBulkUploadResult> {
    const result: HistoryBulkUploadResult = {
      totalProcessed: data.length,
      successful: 0,
      failed: 0,
      errors: [],
      successfulItems: []
    };

    // Si replaceAll es true, eliminar todos los eventos existentes primero
    if (replaceAll) {
      try {
        if (progressCallback) {
          progressCallback({
            currentItem: 0,
            totalItems: data.length,
            percentage: 0,
            status: 'processing',
            message: 'Eliminando historia existente...'
          });
        }

        await this.clearAllHistory();
      } catch (error) {
        console.error('Error eliminando historia existente:', error);
        // Continuar con la carga aunque falle la eliminación
      }
    }

    // Procesar cada evento
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const itemIndex = i + 1;

      // Actualizar progreso
      if (progressCallback) {
        progressCallback({
          currentItem: itemIndex,
          totalItems: data.length,
          percentage: Math.round(((itemIndex) / data.length) * 100),
          status: 'processing',
          message: `Procesando evento: ${item.title || 'Sin título'}...`
        });
      }

      try {
        // Validar evento individual
        const validationError = this.validateHistoryEvent(item, itemIndex);
        if (validationError) {
          result.failed++;
          result.errors.push({
            index: itemIndex,
            item: item,
            error: validationError
          });
          continue;
        }

        // Crear evento de historia
        const historyEvent: HistoryEvent = {
          year: Number(item.year),
          title: String(item.title).trim(),
          description: String(item.description).trim(),
          order: item.order ? Number(item.order) : i
        };

        await this.historyService.add(historyEvent);
        
        result.successful++;
        result.successfulItems.push({
          index: itemIndex,
          title: historyEvent.title,
          year: historyEvent.year
        });

      } catch (error) {
        result.failed++;
        result.errors.push({
          index: itemIndex,
          item: item,
          error: `Error creando evento: ${error}`
        });
      }

      // Pequeña pausa para no saturar el sistema
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Notificar finalización
    if (progressCallback) {
      progressCallback({
        currentItem: data.length,
        totalItems: data.length,
        percentage: 100,
        status: 'completed',
        message: `Procesamiento completado: ${result.successful} exitosos, ${result.failed} fallidos`
      });
    }

    return result;
  }

  /**
   * Valida un evento de historia individual
   */
  private validateHistoryEvent(item: any, index: number): string | null {
    if (!item || typeof item !== 'object') {
      return `Elemento ${index}: Debe ser un objeto válido`;
    }

    // Validar año
    if (!item.year) {
      return `Elemento ${index}: El campo "year" es obligatorio`;
    }
    const year = Number(item.year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return `Elemento ${index}: El año debe ser un número válido entre 1900 y 2100`;
    }

    // Validar título
    if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
      return `Elemento ${index}: El campo "title" es obligatorio y debe ser texto`;
    }

    // Validar descripción
    if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
      return `Elemento ${index}: El campo "description" es obligatorio y debe ser texto`;
    }

    // Validar orden (opcional)
    if (item.order !== undefined && item.order !== null) {
      const order = Number(item.order);
      if (isNaN(order)) {
        return `Elemento ${index}: El campo "order" debe ser un número válido`;
      }
    }

    return null;
  }

  /**
   * Elimina todos los eventos de historia existentes
   */
  private async clearAllHistory(): Promise<void> {
    try {
      const existingEvents = await this.historyService.list().toPromise() || [];
      
      for (const event of existingEvents) {
        if (event.id) {
          await this.historyService.delete(event.id);
        }
      }
    } catch (error) {
      console.error('Error eliminando historia existente:', error);
      throw error;
    }
  }

  /**
   * Genera reporte de errores en JSON
   */
  downloadErrorReport(result: HistoryBulkUploadResult): void {
    if (result.errors.length === 0) {
      return;
    }

    const errorReport = {
      summary: {
        totalProcessed: result.totalProcessed,
        successful: result.successful,
        failed: result.failed,
        reportDate: new Date().toISOString()
      },
      errors: result.errors.map(error => ({
        index: error.index,
        item: error.item,
        error: error.error,
        suggestions: this.getErrorSuggestions(error.error)
      }))
    };

    const jsonString = JSON.stringify(errorReport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `historia-errores-${new Date().toISOString().split('T')[0]}.json`;
    
    saveAs(blob, fileName);
  }

  /**
   * Genera reporte de elementos exitosos en JSON
   */
  downloadSuccessReport(result: HistoryBulkUploadResult): void {
    if (result.successfulItems.length === 0) {
      return;
    }

    const successReport = {
      summary: {
        totalProcessed: result.totalProcessed,
        successful: result.successful,
        failed: result.failed,
        reportDate: new Date().toISOString()
      },
      successfulItems: result.successfulItems.map(item => ({
        index: item.index,
        title: item.title,
        year: item.year,
        status: 'Creado exitosamente'
      }))
    };

    const jsonString = JSON.stringify(successReport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `historia-exitosos-${new Date().toISOString().split('T')[0]}.json`;
    
    saveAs(blob, fileName);
  }

  /**
   * Genera un JSON de ejemplo para guiar al usuario
   */
  downloadExampleStructure(): void {
    const exampleStructure: HistoryJsonStructure = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalItems: 3,
      data: [
        {
          year: 2020,
          title: 'Fundación de la empresa',
          description: 'Se establece oficialmente Sube Academia como empresa de educación tecnológica.',
          order: 0
        },
        {
          year: 2021,
          title: 'Primer curso de IA',
          description: 'Lanzamiento del primer programa de formación en Inteligencia Artificial.',
          order: 1
        },
        {
          year: 2024,
          title: 'Expansión internacional',
          description: 'Inicio de operaciones en mercados internacionales con programas especializados.',
          order: 2
        }
      ],
      metadata: {
        description: 'Ejemplo de estructura de Historia para Sube Academia',
        instructions: [
          'Modifica los datos de ejemplo con tu información real',
          'Puedes agregar tantos elementos como necesites',
          'Los campos year, title y description son obligatorios',
          'El campo order es opcional para controlar el orden de visualización',
          'Guarda este archivo como .json y súbelo al sistema'
        ],
        fieldDefinitions: {
          year: {
            type: 'number',
            required: true,
            description: 'Año del evento histórico'
          },
          title: {
            type: 'string',
            required: true,
            description: 'Título del evento'
          },
          description: {
            type: 'string',
            required: true,
            description: 'Descripción del evento'
          },
          order: {
            type: 'number',
            required: false,
            description: 'Orden de visualización'
          }
        }
      }
    };

    const jsonString = JSON.stringify(exampleStructure, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = 'historia-ejemplo-estructura.json';
    
    saveAs(blob, fileName);
  }

  /**
   * Proporciona sugerencias para errores comunes
   */
  private getErrorSuggestions(error: string): string[] {
    const suggestions: string[] = [];

    if (error.includes('year')) {
      suggestions.push('Verifica que el año sea un número válido entre 1900 y 2100');
      suggestions.push('Ejemplo: "year": 2024');
    }

    if (error.includes('title')) {
      suggestions.push('El título debe ser texto no vacío');
      suggestions.push('Ejemplo: "title": "Fundación de la empresa"');
    }

    if (error.includes('description')) {
      suggestions.push('La descripción debe ser texto no vacío');
      suggestions.push('Ejemplo: "description": "Descripción detallada del evento"');
    }

    if (error.includes('order')) {
      suggestions.push('El orden debe ser un número (opcional)');
      suggestions.push('Ejemplo: "order": 1');
    }

    if (error.includes('objeto válido')) {
      suggestions.push('Cada elemento debe ser un objeto JSON con las propiedades requeridas');
      suggestions.push('Verifica que no falten llaves {} o comas en el JSON');
    }

    return suggestions;
  }
}
