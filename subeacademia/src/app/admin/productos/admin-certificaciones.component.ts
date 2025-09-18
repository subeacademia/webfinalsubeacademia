import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Certificacion } from '../../features/productos/data/certificacion.model';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { CertificateService } from '../../features/productos/services/certificate.service';
import { BulkUploadService, BulkUploadProgress } from './services/bulk-upload.service';
import { Timestamp } from '@angular/fire/firestore';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-certificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/productos" 
             class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver a Productos
          </a>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Administrar Certificaciones</h1>
        </div>
        <div class="flex gap-2">
          <button (click)="descargarEstructuraJSON()" 
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Descargar JSON
          </button>
          <button (click)="mostrarModalCargaMasiva = true" 
                  class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Carga Masiva
          </button>
          <button (click)="mostrarFormulario = true" 
                  class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            + Nueva Certificación
          </button>
        </div>
      </div>

      <!-- Formulario de creación/edición -->
      <div *ngIf="mostrarFormulario" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {{ certificacionEditando ? 'Editar' : 'Crear' }} Certificación
        </h2>
        
        <form (ngSubmit)="guardarCertificacion()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input type="text" [(ngModel)]="certificacionForm.titulo" name="titulo"
                     class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
              <input type="number" [(ngModel)]="certificacionForm.precio" name="precio"
                     class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entidad Certificadora</label>
              <input type="text" [(ngModel)]="certificacionForm.entidadCertificadora" name="entidadCertificadora"
                     class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nivel</label>
              <select [(ngModel)]="certificacionForm.nivel" name="nivel"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required>
                <option value="">Seleccionar nivel</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Experto">Experto</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea [(ngModel)]="certificacionForm.descripcion" name="descripcion"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="4" required></textarea>
          </div>
          
          <div class="flex gap-3">
            <button type="submit" 
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              {{ certificacionEditando ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" (click)="cancelarEdicion()"
                    class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Emisión de certificados -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Emitir Certificado</h2>
        <form (ngSubmit)="addCertificate()" class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Estudiante</label>
            <input type="text" [(ngModel)]="certificateForm.studentName" name="studentName" 
                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Curso</label>
            <input type="text" [(ngModel)]="certificateForm.courseName" name="courseName" 
                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Finalización</label>
            <input type="date" [(ngModel)]="certificateForm.completionDateHtml" name="completionDateHtml" 
                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código Único del Certificado</label>
            <input type="text" [(ngModel)]="certificateForm.certificateCode" name="certificateCode" 
                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
          </div>
          <div class="md:col-span-2 flex gap-3 mt-2">
            <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Emitir</button>
            <a *ngIf="lastCreatedCode" [href]="'/productos/certificaciones/validar/' + lastCreatedCode" target="_blank" 
               class="text-blue-600 dark:text-blue-400 underline">Verificar recién emitido</a>
          </div>
        </form>
        <div *ngIf="certStatusMessage" class="mt-3 text-sm" 
             [class.text-green-700]="certStatusOk && !isDarkMode" 
             [class.text-red-700]="!certStatusOk && !isDarkMode"
             [class.text-green-300]="certStatusOk && isDarkMode" 
             [class.text-red-300]="!certStatusOk && isDarkMode">{{ certStatusMessage }}</div>
      </div>

      <!-- Lista de certificaciones -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Certificaciones Existentes</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let certificacion of certificaciones" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ certificacion.titulo }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ certificacion.descripcion }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ certificacion.entidadCertificadora }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    {{ certificacion.nivel }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  €{{ certificacion.precio }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="editarCertificacion(certificacion)"
                          class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">Editar</button>
                  <button (click)="eliminarCertificacion(certificacion.id)"
                          class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="certificaciones.length === 0" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          No hay certificaciones creadas aún.
        </div>
      </div>

      <!-- Modal de carga masiva -->
      <div *ngIf="mostrarModalCargaMasiva" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Carga Masiva de Certificaciones JSON</h3>
            <button (click)="cerrarModalCargaMasiva()" 
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar archivo JSON:
            </label>
            <input type="file" 
                   accept=".json"
                   (change)="onArchivoSeleccionado($event)"
                   class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          </div>

          <div *ngIf="archivoSeleccionado" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              <strong>Archivo seleccionado:</strong> {{ archivoSeleccionado.name }}
            </p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Tamaño: {{ (archivoSeleccionado.size / 1024).toFixed(2) }} KB
            </p>
          </div>

          <div *ngIf="estadoCarga.mostrar" class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">Progreso de carga</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ estadoCarga.progreso }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                   [style.width.%]="estadoCarga.progreso"></div>
            </div>
          </div>

          <div *ngIf="estadoCarga.mensaje" class="mb-4 p-3 rounded-md"
               [class]="estadoCarga.esError ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'">
            {{ estadoCarga.mensaje }}
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
            <h4 class="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Formato JSON Esperado:</h4>
            <pre class="text-xs text-yellow-700 dark:text-yellow-400 overflow-x-auto">{{ formatoEjemplo }}</pre>
          </div>

          <div class="flex justify-end gap-3">
            <button (click)="cerrarModalCargaMasiva()" 
                    class="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancelar
            </button>
            <button (click)="procesarCargaMasiva()" 
                    [disabled]="!archivoSeleccionado || estadoCarga.procesando"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ estadoCarga.procesando ? 'Procesando...' : 'Procesar Archivo' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminCertificacionesComponent implements OnInit, OnDestroy {
  certificaciones: Certificacion[] = [];
  mostrarFormulario = false;
  certificacionEditando: Certificacion | null = null;
  certificacionForm: Partial<Certificacion> = {};
  private readonly unsubscribe$ = new Subject<void>();
  certificateForm: any = { studentName: '', courseName: '', completionDateHtml: '', certificateCode: '' };
  lastCreatedCode: string | null = null;
  certStatusMessage = '';
  certStatusOk = false;
  isDarkMode = false;

  // Propiedades para carga masiva
  mostrarModalCargaMasiva = false;
  archivoSeleccionado: File | null = null;
  estadoCarga = {
    mostrar: false,
    progreso: 0,
    mensaje: '',
    esError: false,
    procesando: false
  };

  formatoEjemplo = `{
  "certificaciones": [
    {
      "titulo": "Certificación en IA",
      "descripcion": "Certificación oficial en IA",
      "precio": 199.99,
      "entidadCertificadora": "Sube Academia",
      "nivel": "Intermedio",
      "activo": true
    }
  ]
}`;

  constructor(
    private certificacionesService: CertificacionesService, 
    private certificateService: CertificateService,
    private bulkUploadService: BulkUploadService
  ) {}

  ngOnInit(): void {
    this.cargarCertificaciones();
    // Detectar modo oscuro
    this.isDarkMode = document.documentElement.classList.contains('dark');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarCertificaciones(): void {
    this.certificacionesService.getAllCertificaciones()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.certificaciones = data;
      });
  }

  guardarCertificacion(): void {
    if (this.certificacionForm.titulo && this.certificacionForm.precio && 
        this.certificacionForm.entidadCertificadora && this.certificacionForm.nivel) {
      const certificacionData = {
        titulo: this.certificacionForm.titulo,
        descripcion: this.certificacionForm.descripcion || '',
        imagenDestacada: this.certificacionForm.imagenDestacada || '',
        entidadCertificadora: this.certificacionForm.entidadCertificadora,
        nivel: this.certificacionForm.nivel,
        precio: this.certificacionForm.precio,
        slug: this.certificacionForm.titulo.toLowerCase().replace(/\s+/g, '-'),
        fechaCreacion: this.certificacionEditando?.fechaCreacion || new Date(),
        fechaActualizacion: new Date(),
        activo: true
      };

      if (this.certificacionEditando) {
        // Actualizar certificación existente
        this.certificacionesService.updateCertificacion(this.certificacionEditando.id, certificacionData)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.cargarCertificaciones();
            this.limpiarFormulario();
          });
      } else {
        // Crear nueva certificación
        this.certificacionesService.createCertificacion(certificacionData)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this.cargarCertificaciones();
            this.limpiarFormulario();
          });
      }
    }
  }

  editarCertificacion(certificacion: Certificacion): void {
    this.certificacionEditando = certificacion;
    this.certificacionForm = { ...certificacion };
    this.mostrarFormulario = true;
  }

  eliminarCertificacion(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta certificación?')) {
      this.certificacionesService.deleteCertificacion(id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.cargarCertificaciones();
        });
    }
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  private limpiarFormulario(): void {
    this.certificacionForm = {};
    this.certificacionEditando = null;
    this.mostrarFormulario = false;
  }

  async addCertificate(): Promise<void> {
    this.certStatusMessage = '';
    this.certStatusOk = false;
    try {
      const { studentName, courseName, completionDateHtml, certificateCode } = this.certificateForm;
      if (!studentName || !courseName || !completionDateHtml || !certificateCode) {
        this.certStatusMessage = 'Completa todos los campos.';
        return;
      }
      const date = new Date(completionDateHtml);
      await this.certificateService.createCertificate({ 
        studentName, 
        courseName, 
        completionDate: date, 
        certificateType: 'completion' as const
      });
      this.lastCreatedCode = certificateCode;
      this.certStatusMessage = 'Certificado emitido correctamente.';
      this.certStatusOk = true;
      this.certificateForm = { studentName: '', courseName: '', completionDateHtml: '', certificateCode: '' };
    } catch (e) {
      console.error(e);
      this.certStatusMessage = 'Error al emitir el certificado.';
      this.certStatusOk = false;
    }
  }

  // Métodos para carga masiva
  onArchivoSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      this.archivoSeleccionado = file;
      this.estadoCarga.mensaje = '';
      this.estadoCarga.esError = false;
    } else {
      this.archivoSeleccionado = null;
      this.estadoCarga.mensaje = 'Por favor, selecciona un archivo JSON válido.';
      this.estadoCarga.esError = true;
    }
  }

  procesarCargaMasiva(): void {
    if (!this.archivoSeleccionado) return;

    this.estadoCarga.procesando = true;
    this.estadoCarga.mostrar = true;
    this.estadoCarga.progreso = 0;
    this.estadoCarga.mensaje = 'Leyendo archivo...';
    this.estadoCarga.esError = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contenido = e.target?.result as string;
        const datos = JSON.parse(contenido);
        this.procesarDatosConServicio(datos);
      } catch (error) {
        this.estadoCarga.mensaje = 'Error al parsear el archivo JSON. Verifica el formato.';
        this.estadoCarga.esError = true;
        this.estadoCarga.procesando = false;
      }
    };

    reader.onerror = () => {
      this.estadoCarga.mensaje = 'Error al leer el archivo.';
      this.estadoCarga.esError = true;
      this.estadoCarga.procesando = false;
    };

    reader.readAsText(this.archivoSeleccionado);
  }

  private procesarDatosConServicio(datos: any): void {
    this.bulkUploadService.processBulkUpload(
      datos,
      (progress: BulkUploadProgress) => {
        this.estadoCarga.mensaje = progress.currentStep;
        this.estadoCarga.progreso = progress.progress;
      }
    ).subscribe({
      next: (result) => {
        this.estadoCarga.procesando = false;
        this.estadoCarga.progreso = 100;

        if (result.success) {
          this.estadoCarga.mensaje = `¡Carga completada! Se crearon ${result.summary.certificacionesCreadas} certificaciones.`;
          this.estadoCarga.esError = false;
          
          setTimeout(() => {
            this.cargarCertificaciones();
          }, 1500);
        } else {
          this.estadoCarga.mensaje = `Carga completada con errores. Procesadas: ${result.totalProcessed}, Errores: ${result.totalErrors}`;
          this.estadoCarga.esError = true;
        }
      },
      error: (error) => {
        this.estadoCarga.procesando = false;
        this.estadoCarga.mensaje = `Error durante el procesamiento: ${error.message || 'Error desconocido'}`;
        this.estadoCarga.esError = true;
      }
    });
  }

  descargarEstructuraJSON(): void {
    const estructura = {
      certificaciones: [
        {
          titulo: "Certificación en IA para Negocios",
          descripcion: "Certificación oficial que valida tus conocimientos en aplicación de IA en entornos empresariales",
          precio: 199.99,
          entidadCertificadora: "Sube Academia",
          nivel: "Intermedio",
          imagenDestacada: "https://ejemplo.com/certificacion-ia.jpg",
          activo: true
        },
        {
          titulo: "Certificación Avanzada en Machine Learning",
          descripcion: "Certificación especializada en técnicas avanzadas de aprendizaje automático y deep learning",
          precio: 299.99,
          entidadCertificadora: "Sube Academia",
          nivel: "Avanzado",
          imagenDestacada: "https://ejemplo.com/cert-ml-avanzado.jpg",
          activo: true
        }
      ]
    };

    const dataStr = JSON.stringify(estructura, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `estructura-certificaciones-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  cerrarModalCargaMasiva(): void {
    this.mostrarModalCargaMasiva = false;
    this.archivoSeleccionado = null;
    this.estadoCarga = {
      mostrar: false,
      progreso: 0,
      mensaje: '',
      esError: false,
      procesando: false
    };
  }
}