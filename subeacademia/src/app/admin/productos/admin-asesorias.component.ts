import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asesoria } from '../../features/productos/data/asesoria.model';

@Component({
  selector: 'app-admin-asesorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Administrar Asesorías</h1>
        <button (click)="mostrarFormulario = true" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          + Nueva Asesoría
        </button>
      </div>

      <!-- Formulario de creación/edición -->
      <div *ngIf="mostrarFormulario" class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">
          {{ asesoriaEditando ? 'Editar' : 'Crear' }} Asesoría
        </h2>
        
        <form (ngSubmit)="guardarAsesoria()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" [(ngModel)]="asesoriaForm.titulo" name="titulo"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" [(ngModel)]="asesoriaForm.precio" name="precio"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Corta</label>
            <textarea [(ngModel)]="asesoriaForm.descripcionCorta" name="descripcionCorta"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3" required></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Larga</label>
            <textarea [(ngModel)]="asesoriaForm.descripcionLarga" name="descripcionLarga"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="5" required></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tags (separados por comas)</label>
            <input type="text" [(ngModel)]="tagsString" name="tags"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="IA, Machine Learning, Consultoría">
          </div>
          
          <div class="flex gap-3">
            <button type="submit" 
                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              {{ asesoriaEditando ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" (click)="cancelarEdicion()"
                    class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de asesorías -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Asesorías Existentes</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let asesoria of asesorias" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ asesoria.titulo }}</div>
                  <div class="text-sm text-gray-500">{{ asesoria.descripcionCorta }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{{ asesoria.precio }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="asesoria.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ asesoria.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="editarAsesoria(asesoria)"
                          class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button (click)="eliminarAsesoria(asesoria.id)"
                          class="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="asesorias.length === 0" class="px-6 py-8 text-center text-gray-500">
          No hay asesorías creadas aún.
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminAsesoriasComponent implements OnInit {
  asesorias: Asesoria[] = [];
  mostrarFormulario = false;
  asesoriaEditando: Asesoria | null = null;
  asesoriaForm: Partial<Asesoria> = {};
  tagsString = '';

  ngOnInit(): void {
    this.cargarAsesorias();
  }

  cargarAsesorias(): void {
    // Simulación de datos - en producción esto vendría de un servicio
    this.asesorias = [
      {
        id: '1',
        titulo: 'Implementación de IA en Pymes',
        descripcionCorta: 'Asesoría para implementar soluciones de IA en pequeñas empresas',
        descripcionLarga: 'Asesoría completa para implementar soluciones de Inteligencia Artificial en pequeñas y medianas empresas...',
        imagenDestacada: '',
        precio: 1500,
        tags: ['IA', 'Pymes', 'Implementación'],
        slug: 'implementacion-ia-pymes',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true
      }
    ];
  }

  guardarAsesoria(): void {
    if (this.asesoriaForm.titulo && this.asesoriaForm.precio) {
      const asesoria: Asesoria = {
        id: this.asesoriaEditando?.id || Date.now().toString(),
        titulo: this.asesoriaForm.titulo,
        descripcionCorta: this.asesoriaForm.descripcionCorta || '',
        descripcionLarga: this.asesoriaForm.descripcionLarga || '',
        imagenDestacada: this.asesoriaForm.imagenDestacada || '',
        precio: this.asesoriaForm.precio,
        tags: this.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag),
        slug: this.asesoriaForm.titulo.toLowerCase().replace(/\s+/g, '-'),
        fechaCreacion: this.asesoriaEditando?.fechaCreacion || new Date(),
        fechaActualizacion: new Date(),
        activo: true
      };

      if (this.asesoriaEditando) {
        const index = this.asesorias.findIndex(a => a.id === asesoria.id);
        if (index !== -1) {
          this.asesorias[index] = asesoria;
        }
      } else {
        this.asesorias.push(asesoria);
      }

      this.limpiarFormulario();
    }
  }

  editarAsesoria(asesoria: Asesoria): void {
    this.asesoriaEditando = asesoria;
    this.asesoriaForm = { ...asesoria };
    this.tagsString = asesoria.tags.join(', ');
    this.mostrarFormulario = true;
  }

  eliminarAsesoria(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta asesoría?')) {
      this.asesorias = this.asesorias.filter(a => a.id !== id);
    }
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  private limpiarFormulario(): void {
    this.asesoriaForm = {};
    this.tagsString = '';
    this.asesoriaEditando = null;
    this.mostrarFormulario = false;
  }
}
