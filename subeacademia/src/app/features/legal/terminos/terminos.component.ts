import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Términos y Condiciones
            </h1>
            <p class="text-gray-600 dark:text-gray-300">
              Última actualización: {{ fechaActualizacion }}
            </p>
          </div>

          <div class="prose prose-lg max-w-none dark:prose-invert">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Aceptación de los Términos</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Al acceder y utilizar los servicios de Sube Academia, usted acepta estar sujeto a estos términos y condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Descripción del Servicio</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Sube Academia es una plataforma educativa especializada en inteligencia artificial y transformación digital. 
              Ofrecemos diagnósticos de madurez en IA, cursos de capacitación, consultoría estratégica y herramientas 
              de evaluación para empresas y profesionales.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Uso del Servicio</h2>
            <div class="text-gray-700 dark:text-gray-300 mb-6">
              <p class="mb-4">Usted se compromete a:</p>
              <ul class="list-disc pl-6 space-y-2">
                <li>Proporcionar información veraz y actualizada</li>
                <li>No utilizar el servicio para actividades ilegales o no autorizadas</li>
                <li>Respetar los derechos de propiedad intelectual</li>
                <li>No interferir con el funcionamiento del servicio</li>
                <li>Mantener la confidencialidad de su cuenta</li>
              </ul>
            </div>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Privacidad y Protección de Datos</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Su privacidad es importante para nosotros. Recopilamos y procesamos sus datos personales de acuerdo con 
              nuestra Política de Privacidad, cumpliendo con las regulaciones aplicables de protección de datos. 
              Los datos recopilados durante el diagnóstico se utilizan únicamente para generar reportes personalizados 
              y mejorar nuestros servicios.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Propiedad Intelectual</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Todo el contenido de la plataforma, incluyendo textos, gráficos, logos, imágenes, software y compilaciones 
              de datos, es propiedad de Sube Academia o sus licenciantes y está protegido por las leyes de propiedad 
              intelectual. Usted no puede reproducir, distribuir, modificar o crear obras derivadas sin autorización expresa.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Limitación de Responsabilidad</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Sube Academia no será responsable por daños directos, indirectos, incidentales, especiales o consecuenciales 
              que resulten del uso o la imposibilidad de usar nuestros servicios. Nuestros servicios se proporcionan 
              "tal como están" sin garantías de ningún tipo.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Modificaciones</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán 
              en vigor inmediatamente después de su publicación en la plataforma. Su uso continuado del servicio 
              constituye la aceptación de los términos modificados.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Terminación</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Podemos suspender o terminar su acceso al servicio en cualquier momento, con o sin causa, con o sin 
              previo aviso. Usted puede terminar su cuenta en cualquier momento contactándonos directamente.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Ley Aplicable</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Estos términos se rigen por las leyes de España. Cualquier disputa será resuelta por los tribunales 
              competentes de Madrid, España.
            </p>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Contacto</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en:
            </p>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> legal@subeacademia.com<br>
                <strong>Teléfono:</strong> +34 900 123 456<br>
                <strong>Dirección:</strong> Calle de la Innovación, 123, 28001 Madrid, España
              </p>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
              <a routerLink="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                ← Volver al inicio
              </a>
              <button 
                (click)="window.close()" 
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TerminosComponent {
  fechaActualizacion = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Referencia a window para el botón cerrar
  window = window;
}
