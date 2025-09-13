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
            
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg mb-6">
              <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                🎯 Nuestro Compromiso Contigo
              </h3>
              <p class="text-blue-800 dark:text-blue-200 mb-4">
                Al completar nuestro diagnóstico gratuito, te proporcionamos un análisis personalizado de tu madurez en IA 
                y un plan de acción estratégico. Este servicio es completamente gratuito y sin compromiso.
              </p>
              <p class="text-blue-800 dark:text-blue-200">
                <strong>Nuestro objetivo:</strong> Ayudarte a entender tu situación actual con la IA y mostrarte el camino 
                hacia la transformación digital exitosa de tu organización.
              </p>
            </div>

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
            
            <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg mb-6">
              <h3 class="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">
                📧 Uso de Información de Contacto
              </h3>
              <p class="text-green-800 dark:text-green-200 mb-4">
                <strong>Transparencia total:</strong> Al proporcionar su información de contacto (nombre, email corporativo, empresa), 
                usted acepta que:
              </p>
              <ul class="list-disc pl-6 space-y-2 text-green-800 dark:text-green-200">
                <li><strong>Diagnóstico gratuito:</strong> Utilizaremos su email para enviarle su diagnóstico personalizado</li>
                <li><strong>Servicios comerciales:</strong> Podremos contactarle para ofrecerle nuestros servicios de consultoría y formación</li>
                <li><strong>Marketing relevante:</strong> Le enviaremos información sobre cursos, eventos y novedades de IA</li>
                <li><strong>Confidencialidad:</strong> Sus datos serán tratados con la máxima confidencialidad y seguridad</li>
                <li><strong>Derecho de baja:</strong> Puede darse de baja de nuestras comunicaciones en cualquier momento</li>
              </ul>
              
              <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                <h4 class="font-semibold text-green-900 dark:text-green-300 mb-2">
                  💼 ¿Por qué nos contactamos?
                </h4>
                <p class="text-sm text-green-700 dark:text-green-300">
                  Basándonos en tu diagnóstico, identificamos oportunidades específicas donde nuestros servicios 
                  pueden ayudarte a alcanzar tus objetivos de IA. Nuestro equipo de expertos puede ofrecerte:
                </p>
                <ul class="list-disc pl-4 mt-2 text-sm text-green-700 dark:text-green-300">
                  <li>Consultoría estratégica personalizada</li>
                  <li>Formación especializada para tu equipo</li>
                  <li>Implementación de soluciones de IA</li>
                  <li>Mentoría en transformación digital</li>
                </ul>
              </div>
            </div>

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

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Valor del Diagnóstico Gratuito</h2>
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg mb-6">
              <h3 class="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3">
                💎 Lo que recibes GRATIS
              </h3>
              <p class="text-purple-800 dark:text-purple-200 mb-4">
                Nuestro diagnóstico de madurez en IA tiene un valor comercial de <strong>€299</strong>, 
                pero lo ofrecemos completamente gratis para ayudarte a:
              </p>
              <ul class="list-disc pl-6 space-y-2 text-purple-800 dark:text-purple-200">
                <li>Identificar tu nivel actual de madurez en IA</li>
                <li>Descubrir brechas específicas en tu organización</li>
                <li>Recibir un plan de acción personalizado</li>
                <li>Obtener recomendaciones estratégicas específicas</li>
                <li>Acceder a insights de expertos en IA</li>
              </ul>
              <p class="text-sm text-purple-700 dark:text-purple-300 mt-4">
                <strong>¿Por qué es gratis?</strong> Creemos en el valor de la educación y queremos ayudarte 
                a dar el primer paso hacia la transformación digital. Nuestro objetivo es establecer una 
                relación de confianza y mostrarte el valor que podemos aportar a tu organización.
              </p>
            </div>

            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Contacto</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en:
            </p>
            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p class="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> contacto@subeia.tech<br>
                <strong>Teléfono:</strong> +569 6506 8064<br>
                <strong>Dirección:</strong> Fco. Mansilla 1007, Castro, Región de Los Lagos, Chile.
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
