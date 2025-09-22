import { Component, AfterViewInit, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../shared/ui/animate-on-scroll.directive';
import { AnimationService } from '../../core/services/animation.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, AnimateOnScrollDirective, I18nTranslatePipe],
  template: `
    <!-- Header más armónico con el resto del sitio -->
    <div class="min-h-screen relative overflow-hidden"
         style="background: radial-gradient(1200px 800px at 50% -10%, color-mix(in oklab, var(--panel) 30%, transparent), transparent 60%), linear-gradient(to bottom, color-mix(in oklab, var(--bg) 94%, #ffffff), var(--bg));">
      <!-- Elementos de fondo animados -->
      <div class="absolute inset-0" aria-hidden="true">
        <div class="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <!-- Contenido principal -->
      <div class="container mx-auto px-6 py-20 relative z-10 flex items-center min-h-screen">
        <div class="text-center w-full">
          <!-- Badge superior optimizado para ambos temas -->
          <div class="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border bg-[var(--panel)]/50 text-[var(--fg)] border-white/20 dark:border-white/10">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            {{ 'productos.badge' | i18nTranslate }}
          </div>
          
          <!-- Título principal optimizado para ambos temas -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span class="orange-gradient-text">{{ 'productos.title' | i18nTranslate }}</span>
          </h1>
          
          <!-- Descripción mejorada -->
          <div class="max-w-6xl mx-auto mb-12">
            <p class="text-xl md:text-2xl lg:text-3xl text-[var(--fg)]/80 dark:text-gray-200 leading-relaxed mb-8">
              {{ 'productos.subtitle' | i18nTranslate }}
            </p>
            
            <!-- Texto central destacado optimizado para ambos temas -->
            <div class="bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/40 dark:border-white/10 shadow-2xl">
              <p class="text-2xl md:text-3xl text-[var(--fg)] dark:text-white mb-6 font-medium">
                {{ 'productos.model_title' | i18nTranslate }}
              </p>
              
              <!-- Estadísticas destacadas con animación -->
              <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8">
                <div class="text-center group">
                  <div class="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-500 to-sky-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                    50%
                  </div>
                  <div class="text-xl md:text-2xl text-[var(--fg)] dark:text-gray-300 font-semibold">
                    {{ 'productos.standard_content' | i18nTranslate }}
                  </div>
                  <div class="w-16 h-1 bg-gradient-to-r from-cyan-400 to-cyan-300 mx-auto mt-3 rounded-full"></div>
                </div>
                
                <div class="text-4xl md:text-6xl text-[var(--fg)] dark:text-white font-light">+</div>
                
                <div class="text-center group">
                  <div class="text-6xl md:text-8xl font-black bg-gradient-to-r from-fuchsia-600 to-pink-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                    50%
                  </div>
                  <div class="text-xl md:text-2xl text-[var(--fg)] dark:text-gray-300 font-semibold">
                    {{ 'productos.total_personalization' | i18nTranslate }}
                  </div>
                  <div class="w-16 h-1 bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 mx-auto mt-3 rounded-full"></div>
                </div>
              </div>
              
              <!-- Mensaje final optimizado -->
              <div class="bg-white/10 dark:bg-white/5 rounded-2xl p-6 border border-white/20 dark:border-white/10">
                <p class="text-xl md:text-2xl text-blue-700 dark:text-white font-semibold">
                  {{ 'productos.competitive_formula' | i18nTranslate }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Indicador de scroll optimizado -->
          <div class="animate-bounce mt-12">
            <div class="w-8 h-12 border-2 border-white/50 dark:border-white/30 rounded-full flex justify-center">
              <div class="w-1 h-4 bg-white/80 dark:bg-white/60 rounded-full mt-2 animate-pulse"></div>
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
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ 'productos.categories.consulting.title' | i18nTranslate }}</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{ 'productos.categories.consulting.description' | i18nTranslate }}
            </p>
            <a [routerLink]="['asesorias']" 
               class="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-lg">
              <span class="flex items-center">
                {{ 'productos.categories.consulting.btn' | i18nTranslate }}
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
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ 'productos.categories.courses.title' | i18nTranslate }}</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{ 'productos.categories.courses.description' | i18nTranslate }}
            </p>
            <a [routerLink]="['cursos']" 
               class="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-lg">
              <span class="flex items-center">
                {{ 'productos.categories.courses.btn' | i18nTranslate }}
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
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ 'productos.categories.certifications.title' | i18nTranslate }}</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{ 'productos.categories.certifications.description' | i18nTranslate }}
            </p>
            <a [routerLink]="['certificaciones']" 
               class="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-lg">
              <span class="flex items-center">
                {{ 'productos.categories.certifications.btn' | i18nTranslate }}
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Propuesta de Valor Rediseñada - Optimizada para ambos temas -->
      <div class="mt-20 py-20 bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 dark:from-neutral-900 dark:via-primary-950 dark:to-secondary-950 relative overflow-hidden">
        <!-- Elementos de fondo -->
        <div class="absolute inset-0" aria-hidden="true">
          <div class="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-success-400/10 to-warning-400/10 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-neutral-400/5 to-primary-400/5 rounded-full blur-3xl"></div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
          <!-- Header mejorado -->
          <div class="text-center mb-16">
            <div class="inline-flex items-center px-4 py-2 bg-blue-600/20 dark:bg-primary-900/40 rounded-full text-blue-800 dark:text-primary-300 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-500/30 dark:border-primary-400/20">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              {{ 'productos.approach.badge' | i18nTranslate }}
            </div>
            <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-8 leading-tight">
              {{ 'productos.approach.title' | i18nTranslate }}
              <span class="orange-gradient-text">Sube-Academia</span>
            </h2>
            <p class="text-lg md:text-xl text-gray-700 dark:text-neutral-300 leading-relaxed max-w-3xl mx-auto">
              {{ 'productos.approach.subtitle' | i18nTranslate }}
            </p>
          </div>

          <!-- Grid de tarjetas rediseñado con altura uniforme -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto" [appAnimateOnScroll]="'.value-card'">

            <!-- Tarjeta 1: Personalización Matética -->
            <div class="value-card group flex cursor-pointer" (click)="openModal('personalizacion')">
              <div class="relative w-full bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-blue-200 dark:border-primary-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-primary-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden flex flex-col">
                <!-- Gradiente de fondo -->
                <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <!-- Icono -->
                <div class="relative mb-6">
                  <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-primary-500/30 transition-all duration-500">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Contenido con flex-grow para ocupar espacio disponible -->
                <div class="relative text-center flex-grow flex flex-col">
                  <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white leading-tight">
                    {{ 'productos.approach.personalization.title' | i18nTranslate }}
                    <span class="block text-lg font-semibold text-blue-600 dark:text-primary-400 mt-2">{{ 'productos.approach.personalization.subtitle' | i18nTranslate }}</span>
                  </h3>
                  <p class="text-base text-gray-700 dark:text-neutral-300 leading-relaxed mb-6 flex-grow">
                    {{ 'productos.approach.personalization.description' | i18nTranslate }}
                  </p>
                  
                  <!-- Detalles expandibles siempre al final -->
                  <div class="mt-auto p-4 bg-blue-50 dark:bg-primary-950/30 rounded-xl border border-blue-200 dark:border-primary-400/10">
                    <p class="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed mb-2">
                      <strong class="text-blue-700 dark:text-primary-300">{{ 'productos.approach.personalization.details' | i18nTranslate }}</strong>
                    </p>
                    <div class="flex items-center justify-center mt-3 text-blue-600 dark:text-blue-400">
                      <span class="text-xs font-medium mr-2">{{ 'productos.approach.personalization.click_more' | i18nTranslate }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta 2: Experiencia Práctica -->
            <div class="value-card group flex cursor-pointer" (click)="openModal('experiencia')">
              <div class="relative w-full bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-green-200 dark:border-success-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-green-500/20 dark:hover:shadow-success-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden flex flex-col">
                <!-- Gradiente de fondo -->
                <div class="absolute inset-0 bg-gradient-to-br from-success-500/10 to-success-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <!-- Icono -->
                <div class="relative mb-6">
                  <div class="w-20 h-20 mx-auto bg-gradient-to-br from-success-500 to-success-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-success-500/30 transition-all duration-500">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Contenido con flex-grow para ocupar espacio disponible -->
                <div class="relative text-center flex-grow flex flex-col">
                  <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white leading-tight">
                    {{ 'productos.approach.experience.title' | i18nTranslate }}
                    <span class="block text-lg font-semibold text-green-600 dark:text-success-400 mt-2">{{ 'productos.approach.experience.subtitle' | i18nTranslate }}</span>
                  </h3>
                  <p class="text-base text-gray-700 dark:text-neutral-300 leading-relaxed mb-6 flex-grow">
                    {{ 'productos.approach.experience.description' | i18nTranslate }}
                  </p>
                  
                  <!-- Detalles expandibles siempre al final -->
                  <div class="mt-auto p-4 bg-green-50 dark:bg-success-950/30 rounded-xl border border-green-200 dark:border-success-400/10">
                    <p class="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed mb-2">
                      <strong class="text-green-700 dark:text-success-300">{{ 'productos.approach.experience.detail_label' | i18nTranslate }}</strong> {{ 'productos.approach.experience.detail_text' | i18nTranslate }}
                    </p>
                    <div class="flex items-center justify-center mt-3 text-green-600 dark:text-green-400">
                      <span class="text-xs font-medium mr-2">{{ 'productos.approach.personalization.click_more' | i18nTranslate }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta 3: Calidad Premium -->
            <div class="value-card group flex cursor-pointer" (click)="openModal('calidad')">
              <div class="relative w-full bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-orange-200 dark:border-warning-400/20 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-warning-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden flex flex-col">
                <!-- Gradiente de fondo -->
                <div class="absolute inset-0 bg-gradient-to-br from-warning-500/10 to-warning-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <!-- Icono -->
                <div class="relative mb-6">
                  <div class="w-20 h-20 mx-auto bg-gradient-to-br from-warning-500 to-warning-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-warning-500/30 transition-all duration-500">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Contenido con flex-grow para ocupar espacio disponible -->
                <div class="relative text-center flex-grow flex flex-col">
                  <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white leading-tight">
                    {{ 'productos.approach.quality.title' | i18nTranslate }}
                    <span class="block text-lg font-semibold text-orange-600 dark:text-warning-400 mt-2">{{ 'productos.approach.quality.subtitle' | i18nTranslate }}</span>
                  </h3>
                  <p class="text-base text-gray-700 dark:text-neutral-300 leading-relaxed mb-6 flex-grow">
                    {{ 'productos.approach.quality.description' | i18nTranslate }}
                  </p>
                  
                  <!-- Detalles expandibles siempre al final -->
                  <div class="mt-auto p-4 bg-orange-50 dark:bg-warning-950/30 rounded-xl border border-orange-200 dark:border-warning-400/10">
                    <p class="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed mb-2">
                      <strong class="text-orange-700 dark:text-warning-300">{{ 'productos.approach.quality.detail_label' | i18nTranslate }}</strong> {{ 'productos.approach.quality.detail_text' | i18nTranslate }}
                    </p>
                    <div class="flex items-center justify-center mt-3 text-orange-600 dark:text-orange-400">
                      <span class="text-xs font-medium mr-2">{{ 'productos.approach.personalization.click_more' | i18nTranslate }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modales informativos -->
    
    <!-- Modal: Personalización Matética -->
    <div *ngIf="activeModal() === 'personalizacion'" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="onOverlayClick($event)">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="p-8">
          <!-- Header fijo con botón de cerrar siempre visible -->
          <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700 mb-6 -m-8 mb-0">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Personalización Matética</h2>
                <p class="text-blue-600 dark:text-blue-400 font-medium">Fundamentos Académicos y Técnicos</p>
              </div>
            </div>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Contenido del modal con padding restaurado -->
          <div class="px-8 pb-8">

          <div class="space-y-6 text-gray-700 dark:text-gray-300">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
              <h3 class="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-3">🧠 ¿Qué es la Matética?</h3>
              <p class="leading-relaxed mb-4">
                La <strong>Matética</strong> es la ciencia del aprendizaje, desarrollada por Seymour Papert en el MIT. A diferencia de la didáctica tradicional que se enfoca en "cómo enseñar", la matética se centra en <strong>"cómo se aprende"</strong> de manera natural y efectiva.
              </p>
              <p class="leading-relaxed">
                Nuestro enfoque matético utiliza <strong>constructivismo cognitivo</strong> y <strong>aprendizaje experiencial</strong> para crear rutas de aprendizaje que se adaptan al estilo cognitivo único de cada participante.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">📊 Modelo 50/50 Revolucionario</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>50% Contenido Estándar:</strong> Fundamentos sólidos basados en investigación académica</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>50% Personalización:</strong> Adaptación a tu contexto, metas y estilo de aprendizaje</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>Balance Perfecto:</strong> Evita la rigidez del contenido estático y el caos de la improvisación</span>
                  </li>
                </ul>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🔬 Base Científica</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>Teoría de Estilos de Aprendizaje</strong> (Kolb, 1984)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>Constructivismo Social</strong> (Vygotsky, 1978)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>Aprendizaje Adaptativo</strong> (Bloom, 1984)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 mt-1">•</span>
                    <span><strong>Neuroplasticidad Dirigida</strong> (Merzenich, 2013)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🎯 Impacto Demostrable</h4>
              <p class="leading-relaxed mb-4">
                Estudios independientes demuestran que el aprendizaje personalizado aumenta la <strong>retención del conocimiento en un 89%</strong> y la <strong>aplicación práctica en un 76%</strong> comparado con métodos tradicionales.
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400 italic">
                "La personalización no es un lujo educativo, es una necesidad cognitiva" - Dr. Howard Gardner, Harvard University
              </p>
            </div>
          </div>
          </div> <!-- Cierre del contenido del modal -->
        </div>
      </div>
    </div>

    <!-- Modal: Experiencia Práctica -->
    <div *ngIf="activeModal() === 'experiencia'" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="onOverlayClick($event)">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="p-8">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Experiencia Práctica Acelerada</h2>
                <p class="text-green-600 dark:text-green-400 font-medium">Metodología Basada en Proyectos Reales</p>
              </div>
            </div>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="space-y-6 text-gray-700 dark:text-gray-300">
            <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
              <h3 class="text-xl font-semibold text-green-800 dark:text-green-300 mb-3">🚀 Aprendizaje Experiencial Aplicado</h3>
              <p class="leading-relaxed mb-4">
                Basado en la <strong>Teoría del Aprendizaje Experiencial de Kolb</strong>, nuestro enfoque elimina la brecha entre teoría y práctica mediante el <strong>Learning by Doing</strong> desde el primer día.
              </p>
              <p class="leading-relaxed">
                Cada módulo está diseñado como un <strong>sprint empresarial real</strong> donde enfrentas desafíos auténticos que las organizaciones viven diariamente en su transformación digital.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🎯 Metodología de Proyectos</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>Problem-Based Learning:</strong> Problemas reales de empresas</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>Design Thinking:</strong> Proceso iterativo de solución</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>Agile Learning:</strong> Sprints de aprendizaje cortos</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>Peer Learning:</strong> Colaboración entre participantes</span>
                  </li>
                </ul>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">📈 Resultados Medibles</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>95% Aplicación Inmediata:</strong> Conocimientos usados en el trabajo</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>87% Retención a 6 meses:</strong> Vs. 23% en formación tradicional</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-green-600 mt-1">•</span>
                    <span><strong>Portfolio Real:</strong> Proyectos demostrables para tu CV</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🏆 Diferenciación Competitiva</h4>
              <p class="leading-relaxed">
                Mientras otros ofrecen cursos teóricos, nosotros creamos <strong>experiencias transformadoras</strong>. Nuestros participantes no solo aprenden IA, sino que <strong>implementan soluciones reales</strong> que generan valor inmediato en sus organizaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Calidad Premium -->
    <div *ngIf="activeModal() === 'calidad'" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="onOverlayClick($event)">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="p-8">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Calidad Premium y Vanguardia</h2>
                <p class="text-orange-600 dark:text-orange-400 font-medium">Excelencia Académica y Tecnológica</p>
              </div>
            </div>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="space-y-6 text-gray-700 dark:text-gray-300">
            <div class="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
              <h3 class="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-3">🏅 Estándares de Excelencia</h3>
              <p class="leading-relaxed mb-4">
                Nuestro contenido cumple con los más altos estándares académicos internacionales, incluyendo <strong>IEEE Standards for AI Education</strong> y las directrices de <strong>ACM Computing Curricula</strong>.
              </p>
              <p class="leading-relaxed">
                Cada curso es desarrollado por un equipo multidisciplinario de <strong>doctores en IA</strong>, <strong>ingenieros senior</strong> y <strong>consultores empresariales</strong> con experiencia demostrada.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">👨‍🎓 Equipo Académico</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>PhD en IA:</strong> Investigadores activos en universidades top</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>Industria Senior:</strong> +15 años en transformación digital</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>Publicaciones:</strong> Autores de papers en conferencias IEEE</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>Consultoría:</strong> Asesores en Fortune 500</span>
                  </li>
                </ul>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🔄 Actualización Continua</h4>
                <ul class="space-y-2 text-sm">
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>Contenido Living:</strong> Actualizado cada 3 meses</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>Tendencias Emergentes:</strong> Integración de últimas tecnologías</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-orange-600 mt-1">•</span>
                    <span><strong>Feedback Loop:</strong> Mejora basada en resultados reales</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
              <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">💎 Valor Diferencial</h4>
              <p class="leading-relaxed">
                No vendemos cursos, <strong>creamos transformaciones</strong>. Nuestro contenido premium es el resultado de <strong>+10,000 horas de investigación</strong>, <strong>500+ proyectos empresariales</strong> y la <strong>validación en 50+ organizaciones</strong> de diferentes sectores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Gradiente naranja - NUEVO COLOR PRIMARIO */
    .orange-gradient-text {
      background: linear-gradient(135deg, #ea580c 0%, #dc2626 25%, #f97316 50%, #fb923c 75%, #fdba74 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);
      font-weight: 900 !important;
    }
    
    /* Modo oscuro */
    :global(.dark) .orange-gradient-text {
      background: linear-gradient(135deg, #fdba74 0%, #fb923c 25%, #f97316 50%, #ea580c 75%, #dc2626 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 8px rgba(251, 146, 60, 0.4);
      font-weight: 900 !important;
    }
  `]
})
export class ProductosComponent implements AfterViewInit {
  // Estado de los modales
  activeModal = signal<string | null>(null);

  // Traducciones eliminadas - ahora usa el pipe i18nTranslate

  constructor(
    private readonly animationService: AnimationService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    public readonly i18n: I18nService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // Eliminado fallback propio: el template usa i18nTranslate

  // Métodos para gestionar modales
  openModal(modalType: string): void {
    this.activeModal.set(modalType);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.activeModal.set(null);
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  }

  // Método para manejar click en el overlay
  onOverlayClick(event: Event): void {
    // Solo cerrar si el click fue en el overlay, no en el contenido
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  ngAfterViewInit(): void {
    // Asegurar que el diccionario actual esté cargado cuando se entra a Productos
    // y forzar detección de cambios para reflejar el idioma activo
    void this.initializeI18n();
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

  private async initializeI18n(): Promise<void> {
    try {
      const lang = this.i18n.currentLang();
      await this.i18n.ensureLoaded(lang, true);
      await this.i18n.setLang(lang);
      this.cdr.detectChanges();
    } catch {}
  }
}
