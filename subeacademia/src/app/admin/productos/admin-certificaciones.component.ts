import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Certificacion } from '../../features/productos/data/certificacion.model';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-certificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Administrar Certificaciones</h1>
        <button (click)="mostrarFormulario = true" 
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          + Nueva Certificación
        </button>
      </div>

      <!-- Formulario de creación/edición -->
      <div *ngIf="mostrarFormulario" class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">
          {{ certificacionEditando ? 'Editar' : 'Crear' }} Certificación
        </h2>
        
        <form (ngSubmit)="guardarCertificacion()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" [(ngModel)]="certificacionForm.titulo" name="titulo"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" [(ngModel)]="certificacionForm.precio" name="precio"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Entidad Certificadora</label>
              <input type="text" [(ngModel)]="certificacionForm.entidadCertificadora" name="entidadCertificadora"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select [(ngModel)]="certificacionForm.nivel" name="nivel"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea [(ngModel)]="certificacionForm.descripcion" name="descripcion"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      <!-- Lista de certificaciones -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Certificaciones Existentes</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let certificacion of certificaciones" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ certificacion.titulo }}</div>
                  <div class="text-sm text-gray-500">{{ certificacion.descripcion }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ certificacion.entidadCertificadora }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {{ certificacion.nivel }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{{ certificacion.precio }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="editarCertificacion(certificacion)"
                          class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button (click)="eliminarCertificacion(certificacion.id)"
                          class="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="certificaciones.length === 0" class="px-6 py-8 text-center text-gray-500">
          No hay certificaciones creadas aún.
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

  constructor(private certificacionesService: CertificacionesService) {}

  ngOnInit(): void {
    this.cargarCertificaciones();
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
}
