import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Curso } from '../../features/productos/data/producto.model';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Administrar Cursos</h1>
        <button (click)="mostrarFormulario = true" 
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          + Nuevo Curso
        </button>
      </div>

      <!-- Formulario de creación/edición -->
      <div *ngIf="mostrarFormulario" class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">
          {{ cursoEditando ? 'Editar' : 'Crear' }} Curso
        </h2>
        
        <form (ngSubmit)="guardarCurso()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" [(ngModel)]="cursoForm.titulo" name="titulo"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input type="number" [(ngModel)]="cursoForm.precio" name="precio"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                     required>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duración</label>
              <input type="text" [(ngModel)]="cursoForm.duracion" name="duracion"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="ej: 40 horas" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select [(ngModel)]="cursoForm.nivel" name="nivel"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required>
                <option value="">Seleccionar nivel</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <input type="text" [(ngModel)]="cursoForm.instructor" name="instructor"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                   required>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea [(ngModel)]="cursoForm.descripcion" name="descripcion"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="4" required></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenido (separado por comas)</label>
              <input type="text" [(ngModel)]="contenidoString" name="contenido"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="Módulo 1, Módulo 2, Módulo 3">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recursos (separados por comas)</label>
              <input type="text" [(ngModel)]="recursosString" name="recursos"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                     placeholder="PDF, Videos, Ejercicios">
            </div>
          </div>
          
          <div class="flex gap-3">
            <button type="submit" 
                    class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              {{ cursoEditando ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" (click)="cancelarEdicion()"
                    class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de cursos -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Cursos Existentes</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let curso of cursos" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ curso.titulo }}</div>
                  <div class="text-sm text-gray-500">{{ curso.descripcion }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ curso.duracion }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ curso.nivel }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{{ curso.precio }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="editarCurso(curso)"
                          class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button (click)="eliminarCurso(curso.id)"
                          class="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="cursos.length === 0" class="px-6 py-8 text-center text-gray-500">
          No hay cursos creados aún.
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminCursosComponent implements OnInit {
  cursos: Curso[] = [];
  mostrarFormulario = false;
  cursoEditando: Curso | null = null;
  cursoForm: Partial<Curso> = {};
  contenidoString = '';
  recursosString = '';

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {
    // Simulación de datos - en producción esto vendría de un servicio
    this.cursos = [
      {
        id: '1',
        titulo: 'Fundamentos de Machine Learning',
        descripcion: 'Curso introductorio a los conceptos básicos de Machine Learning',
        imagenDestacada: '',
        precio: 299,
        slug: 'fundamentos-machine-learning',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        tipo: 'curso',
        duracion: '40 horas',
        nivel: 'Principiante',
        instructor: 'Dr. Ana García',
        contenido: ['Introducción a ML', 'Algoritmos básicos', 'Proyecto final'],
        recursos: ['PDF', 'Videos', 'Ejercicios prácticos']
      }
    ];
  }

  guardarCurso(): void {
    if (this.cursoForm.titulo && this.cursoForm.precio && this.cursoForm.duracion && this.cursoForm.nivel) {
      const curso: Curso = {
        id: this.cursoEditando?.id || Date.now().toString(),
        titulo: this.cursoForm.titulo,
        descripcion: this.cursoForm.descripcion || '',
        imagenDestacada: this.cursoForm.imagenDestacada || '',
        precio: this.cursoForm.precio,
        slug: this.cursoForm.titulo.toLowerCase().replace(/\s+/g, '-'),
        fechaCreacion: this.cursoEditando?.fechaCreacion || new Date(),
        fechaActualizacion: new Date(),
        activo: true,
        tipo: 'curso',
        duracion: this.cursoForm.duracion,
        nivel: this.cursoForm.nivel,
        instructor: this.cursoForm.instructor || '',
        contenido: this.contenidoString.split(',').map(item => item.trim()).filter(item => item),
        recursos: this.recursosString.split(',').map(item => item.trim()).filter(item => item)
      };

      if (this.cursoEditando) {
        const index = this.cursos.findIndex(c => c.id === curso.id);
        if (index !== -1) {
          this.cursos[index] = curso;
        }
      } else {
        this.cursos.push(curso);
      }

      this.limpiarFormulario();
    }
  }

  editarCurso(curso: Curso): void {
    this.cursoEditando = curso;
    this.cursoForm = { ...curso };
    this.contenidoString = curso.contenido.join(', ');
    this.recursosString = curso.recursos.join(', ');
    this.mostrarFormulario = true;
  }

  eliminarCurso(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      this.cursos = this.cursos.filter(c => c.id !== id);
    }
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  private limpiarFormulario(): void {
    this.cursoForm = {};
    this.contenidoString = '';
    this.recursosString = '';
    this.cursoEditando = null;
    this.mostrarFormulario = false;
  }
}
