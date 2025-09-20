import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../shared/ui/animate-on-scroll.directive';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, AnimateOnScrollDirective],
  template: `
    <!-- Header rediseñado con más vida y color - TEMA ADAPTATIVO -->
    <div class="min-h-screen bg-gradient-to-br from-[var(--surface-3)] via-[var(--primary)] to-[var(--secondary)] dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden" style="background: linear-gradient(135deg, var(--surface-3) 0%, var(--primary) 50%, var(--secondary) 100%)">
      <!-- Elementos de fondo animados -->
      <div class="absolute inset-0" aria-hidden="true">
        <div class="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <!-- Contenido principal -->
      <div class="container mx-auto px-6 py-20 relative z-10 flex items-center min-h-screen">
        <div class="text-center w-full">
          <!-- Badge superior -->
          <div class="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border" 
               style="background: linear-gradient(135deg, var(--primary-light) 0.2, var(--secondary-light) 0.2); color: var(--fg); border-color: var(--border)">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Metodología Revolucionaria
          </div>
          
          <!-- Título principal -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight" style="color: var(--fg)">
            Nuestros 
            <span class="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">Productos</span>
          </h1>
          
          <!-- Descripción mejorada -->
          <div class="max-w-6xl mx-auto mb-12">
            <p class="text-xl md:text-2xl lg:text-3xl text-gray-200 leading-relaxed mb-8">
              Nuestros servicios son premium porque fusionamos la
              <span class="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent font-bold">matética</span> con la IA, enfocándonos en
              <span class="bg-gradient-to-r from-fuchsia-400 to-fuchsia-300 bg-clip-text text-transparent font-bold">cómo aprendes</span>, no solo en cómo enseñamos.
            </p>
            
            <!-- Texto central destacado -->
            <div class="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
              <p class="text-2xl md:text-3xl text-white mb-6 font-medium">
                Nuestro modelo es un balance perfecto:
              </p>
              
              <!-- Estadísticas destacadas con animación -->
              <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8">
                <div class="text-center group">
                  <div class="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                    50%
                  </div>
                  <div class="text-xl md:text-2xl text-gray-300 font-semibold">
                    Contenido Estándar
                  </div>
                  <div class="w-16 h-1 bg-gradient-to-r from-cyan-400 to-cyan-300 mx-auto mt-3 rounded-full"></div>
                </div>
                
                <div class="text-4xl md:text-6xl text-white font-light">+</div>
                
                <div class="text-center group">
                  <div class="text-6xl md:text-8xl font-black bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                    50%
                  </div>
                  <div class="text-xl md:text-2xl text-gray-300 font-semibold">
                    Personalización Total
                  </div>
                  <div class="w-16 h-1 bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 mx-auto mt-3 rounded-full"></div>
                </div>
              </div>
              
              <!-- Mensaje final -->
              <div class="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 border border-white/10">
                <p class="text-xl md:text-2xl text-white font-medium">
                  Es la fórmula que la 
                  <span class="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold">competencia no puede replicar</span>
                </p>
              </div>
            </div>
          </div>
          
          <!-- Indicador de scroll -->
          <div class="animate-bounce mt-12">
            <div class="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
              <div class="w-1 h-4 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de productos -->
    <div class="container mx-auto px-4 py-16">

      <!-- Grid de categorías de productos rediseñado -->
      <div class="grid md:grid-cols-3 gap-8 mb-20">
        <!-- Asesorías -->
        <div class="group relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/50 dark:via-gray-900 dark:to-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
          <!-- Gradiente de fondo en hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative p-8 text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-500">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Asesorías</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Consultoría personalizada para implementar IA en tu empresa
            </p>
            <a [routerLink]="['asesorias']" 
               class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-lg">
              <span class="flex items-center">
                Ver Asesorías
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </a>
          </div>
        </div>

        <!-- Cursos -->
        <div class="group relative bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/50 dark:via-gray-900 dark:to-green-950/50 border border-green-200 dark:border-green-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
          <!-- Gradiente de fondo en hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative p-8 text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-green-500/30 transition-all duration-500">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cursos</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Formación especializada en Inteligencia Artificial
            </p>
            <a [routerLink]="['cursos']" 
               class="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-lg">
              <span class="flex items-center">
                Ver Cursos
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </a>
          </div>
        </div>

        <!-- Certificaciones -->
        <div class="group relative bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-950/50 dark:via-gray-900 dark:to-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
          <!-- Gradiente de fondo en hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative p-8 text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-purple-500/30 transition-all duration-500">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Certificaciones</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Certificaciones oficiales en tecnologías de IA
            </p>
            <a [routerLink]="['certificaciones']" 
               class="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-lg">
              <span class="flex items-center">
                Ver Certificaciones
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Propuesta de Valor Rediseñada -->
      <div class="mt-20 py-20 bg-gradient-to-br from-neutral-900 via-primary-950 to-secondary-950 relative overflow-hidden">
        <!-- Elementos de fondo -->
        <div class="absolute inset-0" aria-hidden="true">
          <div class="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-success-400/10 to-warning-400/10 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-neutral-400/5 to-primary-400/5 rounded-full blur-3xl"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
          <!-- Header mejorado -->
          <div class="text-center mb-16">
            <div class="inline-flex items-center px-4 py-2 bg-primary-500/20 dark:bg-primary-900/40 rounded-full text-primary-300 text-sm font-medium mb-6 backdrop-blur-sm border border-primary-400/20">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Metodología Diferenciadora
            </div>
            <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              El Enfoque 
              <span class="bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent">Sube-Academia</span>
            </h2>
            <p class="text-lg md:text-xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
              Nuestra metodología única combina lo mejor de la educación personalizada con tecnología de vanguardia
            </p>
          </div>

          <!-- Grid de tarjetas rediseñado -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto" [appAnimateOnScroll]="'.value-card'">

            <!-- Tarjeta 1: Personalización Matética -->
            <div class="value-card group">
              <div class="relative h-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-primary-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                <!-- Gradiente de fondo -->
                <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <!-- Icono -->
                <div class="relative mb-8">
                  <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-primary-500/30 transition-all duration-500">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Contenido -->
                <div class="relative text-center">
                  <h3 class="text-2xl md:text-3xl font-bold mb-6 text-white leading-tight">
                    Personalización
                    <span class="block text-lg font-semibold text-primary-400 mt-2">Matética</span>
                  </h3>
                  <p class="text-base md:text-lg text-neutral-300 leading-relaxed mb-6">
                    Dejamos atrás la didáctica tradicional. Creamos una ruta de aprendizaje única para ti, optimizando cómo aprendes y aplicas el conocimiento.
                  </p>
                  
                  <!-- Detalles expandibles -->
                  <div class="mt-6 p-4 bg-primary-950/30 rounded-xl border border-primary-400/10">
                    <p class="text-sm text-neutral-400 leading-relaxed">
                      <strong class="text-primary-300">Modelo 50/50 revolucionario:</strong> Combina conocimiento estándar con contenido totalmente adaptado a tus metas y contexto real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta 2: Experiencia Práctica -->
            <div class="value-card group">
              <div class="relative h-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-success-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-success-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                <!-- Gradiente de fondo -->
                <div class="absolute inset-0 bg-gradient-to-br from-success-500/10 to-success-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <!-- Icono -->
                <div class="relative mb-8">
                  <div class="w-20 h-20 mx-auto bg-gradient-to-br from-success-500 to-success-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-success-500/30 transition-all duration-500">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Contenido -->
                <div class="relative text-center">
                  <h3 class="text-2xl md:text-3xl font-bold mb-6 text-white leading-tight">
                    Experiencia Práctica
                    <span class="block text-lg font-semibold text-success-400 mt-2">Acelerada</span>
                  </h3>
                  <p class="text-base md:text-lg text-neutral-300 leading-relaxed mb-6">
                    Te enfrentarás a desafíos empresariales reales y complejos desde el primer día. Aquí no hay espacio para la teoría abstracta.
                  </p>
                  
                  <!-- Detalles expandibles -->
                  <div class="mt-6 p-4 bg-success-950/30 rounded-xl border border-success-400/10">
                    <p class="text-sm text-neutral-400 leading-relaxed">
                      <strong class="text-success-300">Proyectos reales:</strong> Cada módulo culmina en un proyecto tangible que simula entornos profesionales reales.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta 3: Calidad Premium -->
            <div class="value-card group md:col-span-2 lg:col-span-1">
              <div class="relative h-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-warning-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-warning-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                <!-- Gradiente de fondo -->
                <div class="absolute inset-0 bg-gradient-to-br from-warning-500/10 to-warning-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <!-- Icono -->
                <div class="relative mb-8">
                  <div class="w-20 h-20 mx-auto bg-gradient-to-br from-warning-500 to-warning-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-warning-500/30 transition-all duration-500">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Contenido -->
                <div class="relative text-center">
                  <h3 class="text-2xl md:text-3xl font-bold mb-6 text-white leading-tight">
                    Calidad Premium
                    <span class="block text-lg font-semibold text-warning-400 mt-2">y Vanguardia</span>
                  </h3>
                  <p class="text-base md:text-lg text-neutral-300 leading-relaxed mb-6">
                    Accede a contenido de élite, desarrollado por un equipo senior con experiencia probada en transformación digital.
                  </p>
                  
                  <!-- Detalles expandibles -->
                  <div class="mt-6 p-4 bg-warning-950/30 rounded-xl border border-warning-400/10">
                    <p class="text-sm text-neutral-400 leading-relaxed">
                      <strong class="text-warning-300">Conocimiento validado:</strong> Contenido actualizado en tiempo real, probado en proyectos de alto impacto empresarial.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductosComponent implements AfterViewInit {
  constructor(
    private readonly animationService: AnimationService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngAfterViewInit(): void {
    const w = (globalThis as any);
    const anime = w && w.anime ? w.anime : null;
    if (anime) {
      anime({
        targets: '.highlight',
        backgroundColor: ['rgba(167, 139, 250, 0)', 'rgba(167, 139, 250, 0.2)'],
        delay: anime.stagger(200, { start: 500 }),
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.balance',
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 1500,
        delay: 1000,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      // Fallback suave si anime.js no está disponible
      this.animationService.fadeInScale('.balance', 500);
    }
  }
}
