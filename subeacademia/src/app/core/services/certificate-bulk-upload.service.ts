import { Injectable, inject } from '@angular/core';
import { CertificateService } from '../../features/productos/services/certificate.service';
import { CertificateAuditService } from './certificate-audit.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface CertificateExcelRow {
  'Nombre del Estudiante': string;
  'Nombre del Curso': string;
  'Fecha de Finalización': string | Date;
  'Tipo de Certificado': 'completion' | 'achievement' | 'participation';
  'Instructor': string;
  'Duración del Curso': string;
  'Calificación': number;
  'Email del Emisor': string;
}

export interface BulkUploadResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    studentName: string;
    error: string;
  }>;
  successfulCertificates: Array<{
    row: number;
    studentName: string;
    certificateCode: string;
  }>;
}

export interface BulkUploadProgress {
  currentRow: number;
  totalRows: number;
  percentage: number;
  status: 'processing' | 'completed' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateBulkUploadService {
  private certificateService = inject(CertificateService);
  private auditService = inject(CertificateAuditService);

  /**
   * Genera y descarga la plantilla de Excel para carga masiva
   */
  downloadTemplate(): void {
    const templateData: Partial<CertificateExcelRow>[] = [
      {
        'Nombre del Estudiante': 'Juan Pérez García',
        'Nombre del Curso': 'Introducción a la Inteligencia Artificial',
        'Fecha de Finalización': '2024-01-15',
        'Tipo de Certificado': 'completion',
        'Instructor': 'Dr. María González',
        'Duración del Curso': '40 horas',
        'Calificación': 92,
        'Email del Emisor': 'admin@subeia.tech'
      },
      {
        'Nombre del Estudiante': 'Ana López Martín',
        'Nombre del Curso': 'Machine Learning Avanzado',
        'Fecha de Finalización': '2024-01-20',
        'Tipo de Certificado': 'achievement',
        'Instructor': 'Dr. Carlos Mendoza',
        'Duración del Curso': '60 horas',
        'Calificación': 88,
        'Email del Emisor': 'admin@subeia.tech'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 25 }, // Nombre del Estudiante
      { wch: 35 }, // Nombre del Curso
      { wch: 18 }, // Fecha de Finalización
      { wch: 20 }, // Tipo de Certificado
      { wch: 25 }, // Instructor
      { wch: 15 }, // Duración del Curso
      { wch: 12 }, // Calificación
      { wch: 25 }  // Email del Emisor
    ];
    worksheet['!cols'] = columnWidths;

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificados');

    // Agregar hoja de instrucciones
    const instructionsData = [
      ['INSTRUCCIONES PARA CARGA MASIVA DE CERTIFICADOS'],
      [''],
      ['CAMPOS OBLIGATORIOS:'],
      ['• Nombre del Estudiante: Nombre completo del estudiante'],
      ['• Nombre del Curso: Nombre completo del programa o curso'],
      ['• Fecha de Finalización: Formato YYYY-MM-DD (ej: 2024-01-15)'],
      [''],
      ['CAMPOS OPCIONALES:'],
      ['• Tipo de Certificado: completion, achievement, o participation'],
      ['• Instructor: Nombre del instructor o docente'],
      ['• Duración del Curso: Duración en horas (ej: 40 horas)'],
      ['• Calificación: Número entre 0 y 100'],
      ['• Email del Emisor: Email del administrador que emite'],
      [''],
      ['NOTAS IMPORTANTES:'],
      ['• No modifique los nombres de las columnas'],
      ['• Las fechas deben estar en formato YYYY-MM-DD'],
      ['• Los tipos válidos son: completion, achievement, participation'],
      ['• La calificación debe ser un número entre 0 y 100'],
      ['• Elimine esta hoja antes de subir el archivo'],
      ['• Se generarán códigos únicos y QR automáticamente'],
      [''],
      ['EJEMPLO DE FECHA VÁLIDA: 2024-01-15'],
      ['TIPOS DE CERTIFICADO:'],
      ['• completion: Certificado de Completación'],
      ['• achievement: Certificado de Logro'],
      ['• participation: Certificado de Participación']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');

    // Descargar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `plantilla-certificados-${new Date().getTime()}.xlsx`);
  }

  /**
   * Procesa un archivo Excel y valida los datos
   */
  async processExcelFile(
    file: File, 
    progressCallback?: (progress: BulkUploadProgress) => void
  ): Promise<BulkUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Buscar la hoja de datos (primera hoja que no sea "Instrucciones")
          let worksheetName = workbook.SheetNames.find(name => name !== 'Instrucciones');
          if (!worksheetName) {
            worksheetName = workbook.SheetNames[0];
          }
          
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData: CertificateExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            reject(new Error('El archivo Excel está vacío o no contiene datos válidos.'));
            return;
          }

          // Procesar certificados
          const result = await this.processCertificatesBatch(jsonData, progressCallback);
          resolve(result);
          
        } catch (error) {
          reject(new Error(`Error procesando el archivo Excel: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error leyendo el archivo Excel.'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Procesa un lote de certificados desde datos Excel
   */
  private async processCertificatesBatch(
    data: CertificateExcelRow[],
    progressCallback?: (progress: BulkUploadProgress) => void
  ): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      totalProcessed: data.length,
      successful: 0,
      failed: 0,
      errors: [],
      successfulCertificates: []
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 porque Excel empieza en 1 y hay header

      // Actualizar progreso
      if (progressCallback) {
        progressCallback({
          currentRow: i + 1,
          totalRows: data.length,
          percentage: Math.round(((i + 1) / data.length) * 100),
          status: 'processing',
          message: `Procesando certificado para ${row['Nombre del Estudiante']}...`
        });
      }

      try {
        // Validar datos de la fila
        const validationError = this.validateExcelRow(row, rowNumber);
        if (validationError) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            studentName: row['Nombre del Estudiante'] || 'Desconocido',
            error: validationError
          });
          continue;
        }

        // Crear certificado
        const certificateData = this.mapExcelRowToCertificate(row);
        await this.certificateService.createCertificate(certificateData);
        
        result.successful++;
        result.successfulCertificates.push({
          row: rowNumber,
          studentName: row['Nombre del Estudiante'],
          certificateCode: 'Generado automáticamente'
        });

      } catch (error) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          studentName: row['Nombre del Estudiante'] || 'Desconocido',
          error: `Error creando certificado: ${error}`
        });
      }

      // Pequeña pausa para no saturar el sistema
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Notificar finalización
    if (progressCallback) {
      progressCallback({
        currentRow: data.length,
        totalRows: data.length,
        percentage: 100,
        status: 'completed',
        message: `Procesamiento completado: ${result.successful} exitosos, ${result.failed} fallidos`
      });
    }

    // Registrar auditoría de carga masiva
    await this.auditService.logAction({
      certificateId: 'bulk_upload',
      certificateCode: `BULK_${Date.now()}`,
      action: 'created',
      performedBy: 'admin_bulk_upload',
      details: {
        totalProcessed: result.totalProcessed,
        successful: result.successful,
        failed: result.failed
      },
      metadata: {
        validationSource: 'admin',
        securityFlags: ['BULK_UPLOAD']
      }
    });

    return result;
  }

  /**
   * Valida una fila de datos del Excel
   */
  private validateExcelRow(row: CertificateExcelRow, rowNumber: number): string | null {
    // Campos obligatorios
    if (!row['Nombre del Estudiante']?.trim()) {
      return 'Nombre del estudiante es obligatorio';
    }

    if (!row['Nombre del Curso']?.trim()) {
      return 'Nombre del curso es obligatorio';
    }

    if (!row['Fecha de Finalización']) {
      return 'Fecha de finalización es obligatoria';
    }

    // Validar fecha
    const dateValue = row['Fecha de Finalización'];
    let parsedDate: Date;
    
    if (typeof dateValue === 'string') {
      parsedDate = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      parsedDate = dateValue;
    } else {
      return 'Formato de fecha inválido. Use YYYY-MM-DD';
    }

    if (isNaN(parsedDate.getTime())) {
      return 'Fecha de finalización inválida. Use formato YYYY-MM-DD';
    }

    // Validar tipo de certificado
    const validTypes = ['completion', 'achievement', 'participation'];
    if (row['Tipo de Certificado'] && !validTypes.includes(row['Tipo de Certificado'])) {
      return `Tipo de certificado inválido. Use: ${validTypes.join(', ')}`;
    }

    // Validar calificación
    if (row['Calificación'] !== undefined && row['Calificación'] !== null) {
      const grade = Number(row['Calificación']);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        return 'La calificación debe ser un número entre 0 y 100';
      }
    }

    // Validar email
    if (row['Email del Emisor'] && !this.isValidEmail(row['Email del Emisor'])) {
      return 'Email del emisor inválido';
    }

    return null;
  }

  /**
   * Convierte una fila de Excel a datos de certificado
   */
  private mapExcelRowToCertificate(row: CertificateExcelRow): any {
    let completionDate: Date;
    
    if (typeof row['Fecha de Finalización'] === 'string') {
      completionDate = new Date(row['Fecha de Finalización']);
    } else {
      completionDate = row['Fecha de Finalización'] as Date;
    }

    return {
      studentName: row['Nombre del Estudiante'].trim(),
      courseName: row['Nombre del Curso'].trim(),
      completionDate: completionDate,
      certificateType: row['Tipo de Certificado'] || 'completion',
      instructorName: row['Instructor']?.trim() || undefined,
      courseDuration: row['Duración del Curso']?.trim() || undefined,
      grade: row['Calificación'] ? Number(row['Calificación']) : undefined,
      issuerEmail: row['Email del Emisor']?.trim() || 'admin@subeia.tech'
    };
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Genera reporte de errores en Excel
   */
  downloadErrorReport(result: BulkUploadResult): void {
    if (result.errors.length === 0) {
      return;
    }

    const errorData = result.errors.map(error => ({
      'Fila': error.row,
      'Estudiante': error.studentName,
      'Error': error.error
    }));

    const worksheet = XLSX.utils.json_to_sheet(errorData);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 50 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores');

    // Agregar resumen
    const summaryData = [
      ['RESUMEN DE CARGA MASIVA'],
      [''],
      ['Total procesados:', result.totalProcessed],
      ['Exitosos:', result.successful],
      ['Fallidos:', result.failed],
      ['Fecha:', new Date().toLocaleString()],
      [''],
      ['ERRORES DETALLADOS:']
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `reporte-errores-certificados-${new Date().getTime()}.xlsx`);
  }

  /**
   * Genera reporte de certificados exitosos
   */
  downloadSuccessReport(result: BulkUploadResult): void {
    if (result.successfulCertificates.length === 0) {
      return;
    }

    const successData = result.successfulCertificates.map(cert => ({
      'Fila': cert.row,
      'Estudiante': cert.studentName,
      'Estado': 'Certificado creado exitosamente'
    }));

    const worksheet = XLSX.utils.json_to_sheet(successData);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 35 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exitosos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `certificados-exitosos-${new Date().getTime()}.xlsx`);
  }
}
