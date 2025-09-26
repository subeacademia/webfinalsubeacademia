import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certification-wizard-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🎉 WIZARD FUNCIONANDO
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            El wizard se está cargando correctamente. Este es un componente de prueba.
          </p>
          <button (click)="goBack()" 
                  class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Volver al Listado
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CertificationWizardTestComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/admin/productos/certificaciones']);
  }
}
