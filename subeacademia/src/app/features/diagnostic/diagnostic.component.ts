import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-diagnostic',
  imports: [CommonModule],
  template: `
  <section class="py-16">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-3xl font-bold mb-4">Diagnóstico de Competencias en IA</h1>
      <p class="text-gray-600">Próximamente: cuestionario inteligente para evaluar las 13 competencias clave.</p>
    </div>
  </section>
  `,
})
export class DiagnosticComponent {}


