import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certification-wizard-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-red-500 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 class="text-4xl font-bold text-red-600 mb-4">
          🚨 WIZARD DEBUG 🚨
        </h1>
        <p class="text-gray-700 mb-6">
          Si ves este mensaje, el wizard se está cargando correctamente.
        </p>
        <button (click)="goBack()" 
                class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Volver al Listado
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class CertificationWizardDebugComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/admin/productos/certificaciones']);
  }
}
