import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Cursos de IA</h1>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-2xl mx-auto">
          <div class="text-blue-800">
            <h2 class="text-2xl font-semibold mb-4">🚧 Próximamente...</h2>
            <p class="text-lg mb-4">
              Estamos preparando nuestra sección de cursos especializados en Inteligencia Artificial.
            </p>
            <p class="text-base">
              Muy pronto podrás acceder a formación personalizada y práctica en tecnologías de IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CursosListComponent {}
