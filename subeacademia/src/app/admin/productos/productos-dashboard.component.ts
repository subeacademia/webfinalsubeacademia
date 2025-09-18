import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsesoriasService } from '../../features/productos/services/asesorias.service';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { CursosService } from '../../features/productos/services/cursos.service';
import { BulkUploadService, BulkUploadProgress } from './services/bulk-upload.service';
import { Asesoria } from '../../features/productos/data/asesoria.model';
import { Certificacion } from '../../features/productos/data/certificacion.model';
import { Curso } from '../../features/productos/data/producto.model';

@Component({
  selector: 'app-productos-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard de Productos</h1>
        <div class="flex gap-2">
          <!-- Botones de carga masiva -->
          <button (click)="descargarEstructuraJSON()" 
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Descargar Estructura JSON
          </button>
          <button (click)="mostrarModalCargaMasiva = true" 
                  class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Carga Masiva JSON
          </button>
          <a routerLink="/admin/productos/asesorias" 
             class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Gestionar Asesorías
          </a>
          <a routerLink="/admin/productos/cursos" 
             class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Gestionar Cursos
          </a>
          <a routerLink="/admin/productos/certificaciones" 
             class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Gestionar Certificaciones
          </a>
        </div>
      </div>

      <!-- Estadísticas generales -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span class="text-2xl">💡</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Asesorías</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ asesorias.length }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ asesoriasActivas }} activas
            </span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span class="text-2xl">📚</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Cursos</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ cursos.length }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ cursosActivos }} activos
            </span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <span class="text-2xl">🏆</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Certificaciones</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ certificaciones.length }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ certificacionesActivas }} activas
            </span>
          </div>
        </div>
      </div>

      <!-- Productos recientes -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Productos Recientes</h3>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <!-- Asesorías recientes -->
            <div *ngIf="asesoriasRecientes.length > 0">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Asesorías Recientes</h4>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let asesoria of asesoriasRecientes" 
                     class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-gray-900 dark:text-white">{{ asesoria.titulo }}</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-300">{{ asesoria.descripcionCorta }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">€{{ asesoria.precio }}</p>
                    </div>
                    <span [class]="asesoria.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                          class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ asesoria.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cursos recientes -->
            <div *ngIf="cursosRecientes.length > 0">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Cursos Recientes</h4>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let curso of cursosRecientes" 
                     class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-gray-900 dark:text-white">{{ curso.titulo }}</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-300">{{ curso.descripcion }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">€{{ curso.precio }} • {{ curso.duracion }}</p>
                    </div>
                    <span [class]="curso.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                          class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ curso.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Certificaciones recientes -->
            <div *ngIf="certificacionesRecientes.length > 0">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Certificaciones Recientes</h4>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let cert of certificacionesRecientes" 
                     class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-gray-900 dark:text-white">{{ cert.titulo }}</h5>
                      <p class="text-sm text-gray-600 dark:text-gray-300">{{ cert.descripcion }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">€{{ cert.precio }} • {{ cert.nivel }}</p>
                    </div>
                    <span [class]="cert.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                          class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ cert.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!asesoriasRecientes.length && !cursosRecientes.length && !certificacionesRecientes.length" 
                 class="text-center text-gray-500 dark:text-gray-400 py-8">
              No hay productos creados aún.
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de carga masiva -->
      <div *ngIf="mostrarModalCargaMasiva" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Carga Masiva de Productos JSON</h3>
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
export class ProductosDashboardComponent implements OnInit {
  asesorias: Asesoria[] = [];
  cursos: Curso[] = [];
  certificaciones: Certificacion[] = [];

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
  "cursos": [
    {
      "titulo": "Introducción a IA",
      "descripcion": "Curso básico de IA",
      "precio": 99.99,
      "duracion": "20 horas",
      "nivel": "Principiante",
      "instructor": "Juan Pérez",
      "contenido": ["Módulo 1", "Módulo 2"],
      "recursos": ["PDF", "Videos"],
      "activo": true
    }
  ],
  "asesorias": [...],
  "certificaciones": [...]
}`;

  constructor(
    private asesoriasService: AsesoriasService,
    private certificacionesService: CertificacionesService,
    private cursosService: CursosService,
    private bulkUploadService: BulkUploadService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.asesoriasService.getAllAsesorias().subscribe(data => {
      this.asesorias = data;
    });

    this.cursosService.getAllCursos().subscribe(data => {
      this.cursos = data;
    });

    this.certificacionesService.getAllCertificaciones().subscribe(data => {
      this.certificaciones = data;
    });
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
          this.estadoCarga.mensaje = `¡Carga completada exitosamente! 
            Cursos creados: ${result.summary.cursosCreados}, 
            Asesorías creadas: ${result.summary.asesoriasCreadas}, 
            Certificaciones creadas: ${result.summary.certificacionesCreadas}. 
            Total procesado: ${result.totalProcessed} productos.`;
          this.estadoCarga.esError = false;
          
          // Recargar datos después de un breve delay
          setTimeout(() => {
            this.cargarProductos();
          }, 1500);
        } else {
          this.estadoCarga.mensaje = `Carga completada con errores. Procesados: ${result.totalProcessed}, Errores: ${result.totalErrors}`;
          this.estadoCarga.esError = true;
          
          // Mostrar algunos errores específicos si los hay
          if (result.errors.length > 0) {
            const primerosErrores = result.errors.slice(0, 3).join('; ');
            console.warn('Errores durante la carga masiva:', result.errors);
            this.estadoCarga.mensaje += `. Ejemplos de errores: ${primerosErrores}`;
          }
        }
      },
      error: (error) => {
        this.estadoCarga.procesando = false;
        this.estadoCarga.mensaje = `Error durante el procesamiento: ${error.message || 'Error desconocido'}`;
        this.estadoCarga.esError = true;
        console.error('Error en carga masiva:', error);
      }
    });
  }

  descargarEstructuraJSON(): void {
    const estructuraJSON = this.bulkUploadService.generateExampleStructure();
    const dataBlob = new Blob([estructuraJSON], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `estructura-productos-${new Date().toISOString().split('T')[0]}.json`;
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

  get asesoriasRecientes(): Asesoria[] {
    return this.asesorias
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 2);
  }

  get cursosRecientes(): Curso[] {
    return this.cursos
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 2);
  }

  get certificacionesRecientes(): Certificacion[] {
    return this.certificaciones
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 2);
  }

  get asesoriasActivas(): number {
    return this.asesorias.filter(a => a.activo).length;
  }

  get cursosActivos(): number {
    return this.cursos.filter(c => c.activo).length;
  }

  get certificacionesActivas(): number {
    return this.certificaciones.filter(c => c.activo).length;
  }
}
