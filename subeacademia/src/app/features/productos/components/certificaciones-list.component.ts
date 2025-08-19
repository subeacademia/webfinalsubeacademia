import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificaciones-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Certificaciones en IA</h1>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-8 max-w-2xl mx-auto">
          <div class="text-purple-800">
            <h2 class="text-2xl font-semibold mb-4">🚧 Próximamente...</h2>
            <p class="text-lg mb-4">
              Estamos preparando nuestra sección de certificaciones oficiales en Inteligencia Artificial.
            </p>
            <p class="text-base">
              Muy pronto podrás obtener certificaciones reconocidas en las tecnologías más demandadas de IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CertificacionesListComponent {}
