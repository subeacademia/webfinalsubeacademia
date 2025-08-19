import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6">
        <a [routerLink]="['..']" 
           class="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span class="mr-2">←</span>
          Volver a Productos
        </a>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Detalle del Producto</h1>
          <p class="text-lg text-gray-600 mb-6">
            Slug: {{ slug }}
          </p>
          
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">🚧 Plantilla en Desarrollo</h2>
            <p class="text-gray-600">
              Este componente está preparado para mostrar la información detallada de un producto específico.
              Se mostrará información de asesorías, cursos o certificaciones según el tipo de producto.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductoDetalleComponent implements OnInit {
  slug: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'] || '';
    });
  }
}
