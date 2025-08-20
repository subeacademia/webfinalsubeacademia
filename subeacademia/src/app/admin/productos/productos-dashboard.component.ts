import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsesoriasService } from '../../features/productos/services/asesorias.service';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { CursosService } from '../../features/productos/services/cursos.service';
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
        <h1 class="text-2xl font-bold text-gray-900">Dashboard de Productos</h1>
        <div class="flex gap-2">
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
        <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">💡</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Asesorías</p>
              <p class="text-2xl font-bold text-gray-900">{{ asesorias.length }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">
              {{ asesoriasActivas }} activas
            </span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">📚</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Cursos</p>
              <p class="text-2xl font-bold text-gray-900">{{ cursos.length }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">
              {{ cursosActivos }} activos
            </span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">🏆</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Certificaciones</p>
              <p class="text-2xl font-bold text-gray-900">{{ certificaciones.length }}</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-sm text-gray-500">
              {{ certificacionesActivas }} activas
            </span>
          </div>
        </div>
      </div>

      <!-- Productos recientes -->
      <div class="bg-white rounded-lg shadow-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Productos Recientes</h3>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <!-- Asesorías recientes -->
            <div *ngIf="asesoriasRecientes.length > 0">
              <h4 class="font-medium text-gray-700 mb-2">Asesorías Recientes</h4>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let asesoria of asesoriasRecientes" 
                     class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-gray-900">{{ asesoria.titulo }}</h5>
                      <p class="text-sm text-gray-600">{{ asesoria.descripcionCorta }}</p>
                      <p class="text-sm text-gray-500">€{{ asesoria.precio }}</p>
                    </div>
                    <span [class]="asesoria.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ asesoria.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cursos recientes -->
            <div *ngIf="cursosRecientes.length > 0">
              <h4 class="font-medium text-gray-700 mb-2">Cursos Recientes</h4>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let curso of cursosRecientes" 
                     class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-gray-900">{{ curso.titulo }}</h5>
                      <p class="text-sm text-gray-600">{{ curso.descripcion }}</p>
                      <p class="text-sm text-gray-500">€{{ curso.precio }} • {{ curso.duracion }}</p>
                    </div>
                    <span [class]="curso.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ curso.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Certificaciones recientes -->
            <div *ngIf="certificacionesRecientes.length > 0">
              <h4 class="font-medium text-gray-700 mb-2">Certificaciones Recientes</h4>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let cert of certificacionesRecientes" 
                     class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-medium text-gray-900">{{ cert.titulo }}</h5>
                      <p class="text-sm text-gray-600">{{ cert.descripcion }}</p>
                      <p class="text-sm text-gray-500">€{{ cert.precio }} • {{ cert.nivel }}</p>
                    </div>
                    <span [class]="cert.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          class="px-2 py-1 text-xs font-semibold rounded-full">
                      {{ cert.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!asesoriasRecientes.length && !cursosRecientes.length && !certificacionesRecientes.length" 
                 class="text-center text-gray-500 py-8">
              No hay productos creados aún.
            </div>
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

  constructor(
    private asesoriasService: AsesoriasService,
    private certificacionesService: CertificacionesService,
    private cursosService: CursosService
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
