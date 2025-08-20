import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../shared/ui/animate-on-scroll.directive';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, AnimateOnScrollDirective],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header de la sección -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">Nuestros Productos</h1>
        <div class="max-w-4xl mx-auto">
          <p class="text-lg text-gray-700 leading-relaxed">
            Nuestros servicios son premium porque son personalizados, adaptados y pensados desde la matética y no desde la didáctica. 
            Nuestro modelo se compone de un 50% de contenido estándar sobre IA y su implementación, y un 50% de contenido totalmente 
            personalizado para las empresas y profesionales.
          </p>
        </div>
      </div>

      <!-- Grid de categorías de productos -->
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <!-- Asesorías -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">💡</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Asesorías</h3>
            <p class="text-gray-600 mb-4">
              Consultoría personalizada para implementar IA en tu empresa
            </p>
            <a [routerLink]="['asesorias']" 
               class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Ver Asesorías
            </a>
          </div>
        </div>

        <!-- Cursos -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📚</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Cursos</h3>
            <p class="text-gray-600 mb-4">
              Formación especializada en Inteligencia Artificial
            </p>
            <a [routerLink]="['cursos']" 
               class="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Ver Cursos
            </a>
          </div>
        </div>

        <!-- Certificaciones -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🏆</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Certificaciones</h3>
            <p class="text-gray-600 mb-4">
              Certificaciones oficiales en tecnologías de IA
            </p>
            <a [routerLink]="['certificaciones']" 
               class="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Ver Certificaciones
            </a>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center" [appAnimateOnScroll]="'.value-card'">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-8">¿Por qué elegir nuestros productos?</h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="value-card bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🎯</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Personalización</h3>
            <p class="text-gray-600 dark:text-gray-300">Cada producto se adapta a tus necesidades específicas y objetivos empresariales</p>
          </div>
          <div class="value-card bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🚀</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Experiencia Práctica</h3>
            <p class="text-gray-600 dark:text-gray-300">Aprendizaje basado en casos reales y proyectos prácticos del mundo empresarial</p>
          </div>
          <div class="value-card bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">💎</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Calidad Premium</h3>
            <p class="text-gray-600 dark:text-gray-300">Contenido de alta calidad desarrollado por expertos en IA y transformación digital</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductosComponent {}
