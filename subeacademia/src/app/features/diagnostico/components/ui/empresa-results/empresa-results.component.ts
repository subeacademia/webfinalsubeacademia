import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReporteDiagnosticoEmpresa } from '../../../data/empresa-diagnostic.models';

@Component({
  selector: 'app-empresa-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <span class="text-blue-800 dark:text-blue-200 font-semibold">🏢 Diagnóstico Empresarial</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Diagnóstico de Madurez en IA
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Análisis completo de la madurez en Inteligencia Artificial de <strong>{{ report.metadata.razonSocial }}</strong>
          </p>
        </div>

        <!-- Company Info Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-blue-500">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span class="text-3xl mr-3">🏢</span>
            Información de la Empresa
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Empresa</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ report.metadata.razonSocial }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Tamaño</h3>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    [class]="getSizeColor(report.metadata.categoriaTamano)">
                {{ report.metadata.categoriaTamano }} empresa
              </span>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Contacto</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ report.metadata.nombreContacto }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Fecha</h3>
              <p class="text-gray-600 dark:text-gray-300">{{ report.metadata.fecha | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>
        </div>

        <!-- Overall Score -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-4">Nivel de Madurez General</h2>
            <div class="flex items-center justify-center mb-6">
              <div class="text-8xl font-bold mr-6">{{ report.puntajes.ig_ia_0a100 }}</div>
              <div class="text-left">
                <div class="text-2xl font-semibold">{{ report.puntajes.ig_ia_nivel }}</div>
                <div class="text-blue-200">Puntuación sobre 100</div>
                <div class="text-blue-200">Nota: {{ report.puntajes.ig_ia_1a7 }}/7</div>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="max-w-2xl mx-auto">
              <div class="flex justify-between text-sm text-blue-100 mb-2">
                <span>Incipiente</span>
                <span>Básico</span>
                <span>Intermedio</span>
                <span>Avanzado</span>
                <span>Transformador</span>
              </div>
              <div class="w-full bg-white/20 rounded-full h-4">
                <div 
                  class="bg-gradient-to-r from-yellow-400 to-green-400 h-4 rounded-full transition-all duration-1000 ease-out"
                  [style.width.%]="report.puntajes.ig_ia_0a100">
                </div>
              </div>
              <div class="flex justify-between text-xs text-blue-200 mt-1">
                <span>0-19</span>
                <span>20-39</span>
                <span>40-59</span>
                <span>60-79</span>
                <span>80-100</span>
              </div>
            </div>

            <!-- Share actions -->
            <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button (click)="share()" class="px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Compartir resultados
              </button>
              <button (click)="shareFacebook()" class="px-3 py-2 bg-[#1877F2] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" aria-label="Compartir en Facebook">
                Facebook
              </button>
              <button (click)="shareLinkedIn()" class="px-3 py-2 bg-[#0A66C2] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" aria-label="Compartir en LinkedIn">
                LinkedIn
              </button>
              <button (click)="shareInstagram()" class="px-3 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" aria-label="Compartir en Instagram">
                Instagram
              </button>
              <button (click)="downloadShareImage()" class="px-3 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors" aria-label="Descargar imagen de resultados">
                Descargar imagen
              </button>
            </div>
          </div>
        </div>

        <!-- Dimensions Analysis -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
            <span class="text-4xl mr-3">📊</span>
            Análisis por Dimensiones
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (dimension of report.puntajes.dimensiones; track dimension.nombre) {
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-500"
                   (click)="openDimensionDetail(dimension.nombre)">
                
                <!-- Click indicator -->
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                    <span class="text-2xl mr-2">{{ getDimensionIcon(dimension.nombre) }}</span>
                    {{ dimension.nombre }}
                  </h3>
                  <div class="text-blue-500 dark:text-blue-400 opacity-70 hover:opacity-100 transition-opacity">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Score Circle -->
                <div class="flex items-center justify-between mb-4">
                  <div class="relative w-20 h-20">
                    <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" 
                              stroke-width="2" class="text-gray-200 dark:text-gray-600"></circle>
                      <circle cx="18" cy="18" r="16" fill="transparent" 
                              [attr.stroke]="getDimensionColor(dimension.indice_0_100)" 
                              stroke-width="3" stroke-linecap="round"
                              [attr.stroke-dasharray]="100.53"
                              [attr.stroke-dashoffset]="100.53 - (dimension.indice_0_100 * 100.53) / 100">
                      </circle>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-xl font-bold" [style.color]="getDimensionColor(dimension.indice_0_100)">
                        {{ dimension.indice_0_100 }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <div class="text-2xl font-bold" [style.color]="getDimensionColor(dimension.indice_0_100)">
                      {{ dimension.nota_1_7 }}/7
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [class]="getLevelBadgeColor(dimension.indice_0_100)">
                      {{ dimension.nivel }}
                    </span>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div class="h-2 rounded-full transition-all duration-1000 ease-out"
                       [style.background-color]="getDimensionColor(dimension.indice_0_100)"
                       [style.width.%]="dimension.indice_0_100">
                  </div>
                </div>

                <!-- Click hint -->
                <div class="text-center text-xs text-gray-500 dark:text-gray-400 opacity-75">
                  🔍 Haz clic para más detalles
                </div>
              </div>
            }
          </div>

          <!-- Dimension Detail Modal -->
          @if (selectedDimension()) {
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="closeDimensionDetail()">
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
                @if (getDimensionDetail(selectedDimension()!) && getDimensionScore(selectedDimension()!)) {
                  <div class="p-8">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-6">
                      <div class="flex items-center">
                        <span class="text-4xl mr-4">{{ getDimensionDetail(selectedDimension()!)?.icon }}</span>
                        <div>
                          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                            {{ selectedDimension() }}
                          </h2>
                          <p class="text-gray-600 dark:text-gray-300 mt-1">
                            Análisis detallado de tu nivel de madurez
                          </p>
                        </div>
                      </div>
                      <button (click)="closeDimensionDetail()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>

                    <!-- Current Score -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
                      <div class="flex items-center justify-between">
                        <div>
                          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tu Puntuación Actual</h3>
                          <div class="flex items-center space-x-4">
                            <div class="text-4xl font-bold" [style.color]="getDimensionColor(getDimensionScore(selectedDimension()!)!.indice_0_100)">
                              {{ getDimensionScore(selectedDimension()!)?.indice_0_100 }}/100
                            </div>
                            <div>
                              <div class="text-lg font-semibold" [style.color]="getDimensionColor(getDimensionScore(selectedDimension()!)!.indice_0_100)">
                                Nota: {{ getDimensionScore(selectedDimension()!)?.nota_1_7 }}/7
                              </div>
                              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                    [class]="getLevelBadgeColor(getDimensionScore(selectedDimension()!)!.indice_0_100)">
                                Nivel {{ getDimensionScore(selectedDimension()!)?.nivel }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="relative w-24 h-24">
                          <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" 
                                    stroke-width="2" class="text-gray-200 dark:text-gray-600"></circle>
                            <circle cx="18" cy="18" r="16" fill="transparent" 
                                    [attr.stroke]="getDimensionColor(getDimensionScore(selectedDimension()!)!.indice_0_100)" 
                                    stroke-width="3" stroke-linecap="round"
                                    [attr.stroke-dasharray]="100.53"
                                    [attr.stroke-dashoffset]="100.53 - (getDimensionScore(selectedDimension()!)!.indice_0_100 * 100.53) / 100">
                            </circle>
                          </svg>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-lg font-bold" [style.color]="getDimensionColor(getDimensionScore(selectedDimension()!)!.indice_0_100)">
                              {{ getDimensionScore(selectedDimension()!)?.indice_0_100 }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- What this dimension means -->
                    <div class="mb-6">
                      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">¿Qué evalúa esta dimensión?</h3>
                      <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {{ getDimensionDetail(selectedDimension()!)?.description }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {{ getDimensionDetail(selectedDimension()!)?.whatItMeans }}
                      </p>
                    </div>

                    <!-- Current Level Analysis -->
                    @if (getCurrentLevelInfo()) {
                      <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
                                [style.background-color]="getDimensionColor(getDimensionScore(selectedDimension()!)!.indice_0_100)">
                            {{ getDimensionScore(selectedDimension()!)?.nivel?.charAt(0) }}
                          </span>
                          Tu Nivel Actual: {{ getDimensionScore(selectedDimension()!)?.nivel }}
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">¿Qué significa este nivel?</h4>
                            <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {{ getCurrentLevelInfo()?.description }}
                            </p>
                          </div>
                          <div>
                            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">¿Qué necesitas desarrollar?</h4>
                            <p class="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                              {{ getCurrentLevelInfo()?.whatYouNeed }}
                            </p>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- All Levels Explanation -->
                    <div>
                      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Niveles de Madurez en esta Dimensión</h3>
                      <div class="space-y-4">
                        @for (level of ['Incipiente', 'Básico', 'Intermedio', 'Avanzado', 'Transformador']; track level) {
                          <div class="border rounded-lg p-4 transition-colors"
                               [class]="level === getDimensionScore(selectedDimension()!)?.nivel ? 
                                 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                                 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'">
                            <div class="flex items-center justify-between mb-2">
                              <h4 class="font-semibold text-gray-900 dark:text-white flex items-center">
                                @if (level === getDimensionScore(selectedDimension()!)?.nivel) {
                                  <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">✓</span>
                                }
                                {{ level }}
                              </h4>
                              <span class="text-sm text-gray-500 dark:text-gray-400">
                                {{ getLevelScoreRange(level) }} puntos
                              </span>
                            </div>
                            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {{ getDimensionDetail(selectedDimension()!)?.levels[level]?.description }}
                            </p>
                            <p class="text-xs text-blue-600 dark:text-blue-400">
                              <strong>Para alcanzar/mantener este nivel:</strong> {{ getDimensionDetail(selectedDimension()!)?.levels[level]?.whatYouNeed }}
                            </p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Close button -->
                    <div class="mt-8 text-center">
                      <button (click)="closeDimensionDetail()" 
                              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Cerrar Análisis Detallado
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Executive Summary -->
        @if (report.planDeAccion && report.planDeAccion.resumenEjecutivo) {
          <div class="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-indigo-500">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span class="text-4xl mr-3">📋</span>
              Resumen Ejecutivo
            </h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ report.planDeAccion.resumenEjecutivo }}
              </p>
            </div>
          </div>
        }

        <!-- Strengths and Improvement Areas -->
        @if ((report.planDeAccion && report.planDeAccion.puntosFuertes && report.planDeAccion.puntosFuertes.length) || (report.planDeAccion && report.planDeAccion.areasMejora && report.planDeAccion.areasMejora.length)) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            <!-- Strengths -->
            @if (report.planDeAccion && report.planDeAccion.puntosFuertes && report.planDeAccion.puntosFuertes.length) {
              <div class="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl p-8">
                <h2 class="text-2xl font-bold text-green-800 dark:text-green-300 mb-6 flex items-center">
                  <span class="text-3xl mr-3">💪</span>
                  Puntos Fuertes
                </h2>
                <div class="space-y-4">
                  @for (punto of report.planDeAccion.puntosFuertes; track punto.punto) {
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <h3 class="font-semibold text-green-800 dark:text-green-300 mb-2">
                        {{ punto.punto }}
                      </h3>
                      <p class="text-sm text-gray-700 dark:text-gray-300">
                        {{ punto.justificacion }}
                      </p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Improvement Areas -->
            @if (report.planDeAccion && report.planDeAccion.areasMejora && report.planDeAccion.areasMejora.length) {
              <div class="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl p-8">
                <h2 class="text-2xl font-bold text-red-800 dark:text-red-300 mb-6 flex items-center">
                  <span class="text-3xl mr-3">🎯</span>
                  Áreas de Mejora
                </h2>
                <div class="space-y-4">
                  @for (area of report.planDeAccion.areasMejora; track area.area) {
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <h3 class="font-semibold text-red-800 dark:text-red-300 mb-2">
                        {{ area.area }}
                      </h3>
                      <p class="text-sm text-gray-700 dark:text-gray-300">
                        {{ area.justificacion }}
                      </p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Action Plan -->
        @if (report.planDeAccion && report.planDeAccion.recomendaciones) {
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
              <span class="text-4xl mr-3">🚀</span>
              Plan de Acción Estratégico
            </h2>
            
            <!-- Timeline Navigation -->
            <div class="flex flex-wrap gap-4 mb-8 justify-center">
              <button 
                (click)="activeTimeline.set('90')"
                class="px-6 py-3 rounded-lg font-semibold transition-colors"
                [class]="activeTimeline() === '90' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'">
                📅 Primeros 90 días
              </button>
              <button 
                (click)="activeTimeline.set('180')"
                class="px-6 py-3 rounded-lg font-semibold transition-colors"
                [class]="activeTimeline() === '180' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'">
                📅 6 meses (180 días)
              </button>
              <button 
                (click)="activeTimeline.set('365')"
                class="px-6 py-3 rounded-lg font-semibold transition-colors"
                [class]="activeTimeline() === '365' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'">
                📅 1 año (365 días)
              </button>
            </div>

            <!-- Action Items -->
            <div class="space-y-6">
              @if (activeTimeline() === '90' && report.planDeAccion.recomendaciones.horizonte_90_dias && report.planDeAccion.recomendaciones.horizonte_90_dias.length) {
                <div class="border-l-4 border-green-500 pl-6">
                  <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</span>
                    Primeros 90 días - Fundamentos
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (accion of report.planDeAccion.recomendaciones.horizonte_90_dias; track accion.accion) {
                      <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-6">
                        <h4 class="font-semibold text-green-800 dark:text-green-300 mb-3">
                          {{ accion.accion }}
                        </h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">
                          {{ accion.detalle }}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (activeTimeline() === '180' && report.planDeAccion.recomendaciones.horizonte_180_dias && report.planDeAccion.recomendaciones.horizonte_180_dias.length) {
                <div class="border-l-4 border-yellow-500 pl-6">
                  <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span class="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</span>
                    6 meses (180 días) - Desarrollo
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (accion of report.planDeAccion.recomendaciones.horizonte_180_dias; track accion.accion) {
                      <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 rounded-lg p-6">
                        <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                          {{ accion.accion }}
                        </h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">
                          {{ accion.detalle }}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (activeTimeline() === '365' && report.planDeAccion.recomendaciones.horizonte_365_dias && report.planDeAccion.recomendaciones.horizonte_365_dias.length) {
                <div class="border-l-4 border-purple-500 pl-6">
                  <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">3</span>
                    1 año (365 días) - Transformación
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (accion of report.planDeAccion.recomendaciones.horizonte_365_dias; track accion.accion) {
                      <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-6">
                        <h4 class="font-semibold text-purple-800 dark:text-purple-300 mb-3">
                          {{ accion.accion }}
                        </h4>
                        <p class="text-sm text-gray-700 dark:text-gray-300">
                          {{ accion.detalle }}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Next Steps -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white text-center">
          <h2 class="text-3xl font-bold mb-4">🎯 Próximos Pasos</h2>
          <p class="text-xl mb-8 text-blue-100">
            ¡Tu diagnóstico está completo! Ahora es momento de actuar
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div class="text-4xl mb-4">📚</div>
              <h3 class="text-xl font-semibold mb-2">Explora Nuestros Cursos</h3>
              <p class="text-blue-100 mb-4">Formación especializada en IA y transformación digital</p>
              <button (click)="goToCursos()" class="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
                Ver Cursos
              </button>
            </div>
            <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div class="text-4xl mb-4">🤝</div>
              <h3 class="text-xl font-semibold mb-2">Consultoría Personalizada</h3>
              <p class="text-blue-100 mb-4">Asesoramiento estratégico para tu organización</p>
              <button (click)="goToContacto()" class="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
                Contactar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class EmpresaResultsComponent {
  @Input({ required: true }) report!: ReporteDiagnosticoEmpresa;
  
  activeTimeline = signal('90');
  selectedDimension = signal<string | null>(null);
  private router = inject(Router);

  // --- Compartir resultados ---
  private getShareLandingUrl(): string {
    return 'https://www.subeia.tech';
  }

  private getShareText(): string {
    const empresa = this.report?.metadata?.razonSocial ?? 'mi empresa';
    const score100 = this.report?.puntajes?.ig_ia_0a100 ?? 0;
    const nivel = this.report?.puntajes?.ig_ia_nivel ?? '';
    return `Diagnóstico de Madurez en IA de ${empresa}: ${score100}/100 (${nivel}). Te invito a conocer tu nivel y a hacer el test en ${this.getShareLandingUrl()}`;
  }

  async share(): Promise<void> {
    const url = this.getShareLandingUrl();
    const text = this.getShareText();
    // Si está disponible la Web Share API intentamos compartir (con imagen si el navegador soporta archivos)
    if (navigator && (navigator as any).share) {
      try {
        const file = await this.createShareImageFile(`diagnostico-empresa-${(this.report?.metadata?.razonSocial || 'empresa').toString().replace(/\s+/g,'-')}.png`);
        if (file && (navigator as any).canShare?.({ files: [file] })) {
          await (navigator as any).share({ title: 'Resultados de Diagnóstico en IA', text, url, files: [file] });
        } else {
          await (navigator as any).share({ title: 'Resultados de Diagnóstico en IA', text, url });
        }
        return;
      } catch {
        // silencio: caemos al fallback en popup
      }
    }
    // Fallback: abrir ventana de LinkedIn como genérico
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    this.openCenteredPopup(shareUrl);
  }

  shareFacebook(): void {
    const url = this.getShareLandingUrl();
    const text = this.getShareText();
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    this.openCenteredPopup(fb);
  }

  shareLinkedIn(): void {
    const url = this.getShareLandingUrl();
    // Copiamos el texto para que el usuario lo pegue, ya que LinkedIn no acepta texto prefijado
    try { navigator.clipboard?.writeText(this.getShareText()); } catch {}
    const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    this.openCenteredPopup(li);
    alert('El texto con tus resultados fue copiado al portapapeles. Pégalo en la publicación de LinkedIn.');
  }

  async shareInstagram(): Promise<void> {
    // Intento 1: Web Share API con archivo (abre hoja de compartir y permite elegir "Historias de Instagram" en móviles)
    try {
      const file = await this.createShareImageFile(`diagnostico-empresa-${(this.report?.metadata?.razonSocial || 'empresa').toString().replace(/\s+/g,'-')}.png`);
      const text = this.getShareText();
      if (file && (navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], text, title: 'Resultados de Diagnóstico en IA' });
        return;
      }
    } catch {}

    // Fallback: abrir compositor de historias en web, descargar imagen y copiar texto
    try { await navigator.clipboard?.writeText(this.getShareText()); } catch {}
    await this.downloadShareImage();
    window.open('https://www.instagram.com/create/story', '_blank');
    alert('Abrimos Historias de Instagram en una nueva pestaña. La imagen se descargó y el texto fue copiado al portapapeles. Súbela como historia y pega el texto si corresponde.');
  }

  private openCenteredPopup(url: string): void {
    const width = 900; const height = 650;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    window.open(url, '_blank', `toolbar=0,status=0,width=${width},height=${height},left=${left},top=${top}`);
  }

  async downloadShareImage(): Promise<void> {
    const dataUrl = await this.generateShareImageDataUrl();
    const link = document.createElement('a');
    link.href = dataUrl;
    const empresa = (this.report?.metadata?.razonSocial ?? 'empresa').replace(/\s+/g, '-');
    link.download = `diagnostico-ia-${empresa}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private async createShareImageFile(filename: string): Promise<File | null> {
    const dataUrl = await this.generateShareImageDataUrl();
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], filename, { type: 'image/png' });
    } catch {
      return null;
    }
  }

  private async generateShareImageDataUrl(): Promise<string> {
    const width = 1200; const height = 630; // tamaño social (Open Graph)
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1d4ed8'); // blue-700
    gradient.addColorStop(1, '#7c3aed'); // purple-700
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Panel central
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(40, 40, width - 80, height - 80);

    // Texto título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('Diagnóstico de Madurez en IA', 80, 150);

    // Empresa
    const empresa = this.report?.metadata?.razonSocial ?? '';
    ctx.font = 'normal 32px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(empresa, 80, 200);

    // Puntaje grande
    const score = Math.round(this.report?.puntajes?.ig_ia_0a100 ?? 0);
    const nivel = this.report?.puntajes?.ig_ia_nivel ?? '';
    ctx.font = 'bold 200px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(String(score), 80, 430);

    // Nivel y nota
    ctx.font = 'bold 48px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(nivel, 350, 300);
    const nota17 = this.report?.puntajes?.ig_ia_1a7 ?? 0;
    ctx.font = 'normal 28px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(`Puntuación sobre 100  |  Nota ${nota17}/7`, 350, 340);

    // URL
    const url = this.getShareLandingUrl();
    ctx.font = 'bold 34px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(url.replace(/^https?:\/\//, ''), 80, height - 80);

    return canvas.toDataURL('image/png');
  }

  // Navegación Próximos Pasos
  goToCursos(): void {
    this.router.navigate(['/productos']);
  }

  goToContacto(): void {
    this.router.navigate(['/contacto']);
  }

  // Información detallada de cada dimensión
  dimensionDetails: { [key: string]: any } = {
    'Estrategia y Gobernanza de IA': {
      icon: '🎯',
      description: 'Evalúa la presencia de una estrategia formal de IA, marcos de gobernanza, gestión de riesgos y estructuras organizacionales para la supervisión responsable de la IA.',
      whatItMeans: 'Esta dimensión mide qué tan bien tu organización planifica, supervisa y gobierna sus iniciativas de IA de manera responsable y alineada con los objetivos de negocio.',
      levels: {
        'Incipiente': {
          description: 'No existe una estrategia formal de IA. Las iniciativas son ad-hoc y sin supervisión estructurada.',
          whatYouNeed: 'Desarrollar una estrategia básica de IA, establecer roles de supervisión y crear políticas iniciales de uso responsable.'
        },
        'Básico': {
          description: 'Existe una estrategia básica de IA, pero la gobernanza es limitada y los riesgos no se evalúan sistemáticamente.',
          whatYouNeed: 'Fortalecer la gobernanza, crear un comité de ética en IA y establecer procesos de evaluación de riesgos.'
        },
        'Intermedio': {
          description: 'La organización tiene una estrategia clara de IA con gobernanza establecida y evaluación regular de riesgos.',
          whatYouNeed: 'Refinar los procesos de gobernanza, mejorar la comunicación de la estrategia y fortalecer la gestión de riesgos éticos.'
        },
        'Avanzado': {
          description: 'Estrategia madura de IA con gobernanza robusta, evaluación sistemática de riesgos y estructuras organizacionales claras.',
          whatYouNeed: 'Optimizar la estrategia basada en resultados, liderar mejores prácticas en la industria y mentorear a otras organizaciones.'
        },
        'Transformador': {
          description: 'La organización es líder en gobernanza de IA, con estrategias innovadoras que establecen estándares en la industria.',
          whatYouNeed: 'Continuar innovando en gobernanza de IA y compartir conocimientos para elevar los estándares de toda la industria.'
        }
      }
    },
    'Competencias y Cultura Organizacional': {
      icon: '👥',
      description: 'Evalúa la inversión en formación, cultura de experimentación, equipos multidisciplinarios y programas de alfabetización en IA.',
      whatItMeans: 'Esta dimensión mide qué tan preparada está tu organización en términos de talento humano y cultura para adoptar y desarrollar IA exitosamente.',
      levels: {
        'Incipiente': {
          description: 'Muy poca inversión en formación en IA. La cultura no fomenta la experimentación y falta alfabetización básica.',
          whatYouNeed: 'Iniciar programas básicos de formación en IA, crear espacios para experimentación y desarrollar cultura de aprendizaje continuo.'
        },
        'Básico': {
          description: 'Inversión limitada en formación. Algunos esfuerzos de experimentación pero sin estructura formal.',
          whatYouNeed: 'Ampliar programas de formación, establecer equipos multidisciplinarios y crear programas de alfabetización en IA.'
        },
        'Intermedio': {
          description: 'Inversión consistente en formación. Cultura que apoya la experimentación con algunos equipos multidisciplinarios.',
          whatYouNeed: 'Escalar programas de formación, fortalecer la colaboración interdisciplinaria y expandir la cultura de innovación.'
        },
        'Avanzado': {
          description: 'Inversión significativa en desarrollo de competencias. Cultura madura de experimentación y equipos bien integrados.',
          whatYouNeed: 'Convertirse en centro de excelencia en IA, desarrollar talento especializado y liderar innovación en la industria.'
        },
        'Transformador': {
          description: 'La organización es reconocida por su excelencia en desarrollo de talento en IA y cultura de innovación.',
          whatYouNeed: 'Mantener el liderazgo en desarrollo de talento y ser referente en mejores prácticas de cultura organizacional en IA.'
        }
      }
    },
    'Uso Responsable y Ético de la IA': {
      icon: '⚖️',
      description: 'Evalúa la aplicación de principios de equidad, transparencia, explicabilidad, privacidad y auditorías de sesgos en los sistemas de IA.',
      whatItMeans: 'Esta dimensión mide qué tan comprometida está tu organización con el uso ético y responsable de la IA, protegiendo a usuarios y sociedad.',
      levels: {
        'Incipiente': {
          description: 'Poca consideración de aspectos éticos. No hay procesos para detectar sesgos o asegurar transparencia.',
          whatYouNeed: 'Establecer principios éticos básicos, implementar procesos de revisión ética y comenzar a evaluar sesgos en algoritmos.'
        },
        'Básico': {
          description: 'Algunos principios éticos establecidos pero aplicación inconsistente. Evaluación limitada de sesgos.',
          whatYouNeed: 'Fortalecer la aplicación de principios éticos, establecer auditorías regulares de sesgos y mejorar transparencia.'
        },
        'Intermedio': {
          description: 'Principios éticos bien establecidos con aplicación regular. Procesos de auditoría de sesgos en desarrollo.',
          whatYouNeed: 'Refinar procesos de auditoría, mejorar explicabilidad de modelos y fortalecer protección de privacidad.'
        },
        'Avanzado': {
          description: 'Uso ético maduro de IA con auditorías sistemáticas, alta transparencia y sólida protección de privacidad.',
          whatYouNeed: 'Liderar estándares éticos en la industria, innovar en técnicas de IA explicable y mentorear a otras organizaciones.'
        },
        'Transformador': {
          description: 'La organización establece nuevos estándares en ética de IA y es reconocida como líder en uso responsable.',
          whatYouNeed: 'Continuar innovando en ética de IA y influir en políticas públicas y estándares de la industria.'
        }
      }
    },
    'Agilidad y Sostenibilidad': {
      icon: '🔄',
      description: 'Evalúa el uso de metodologías ágiles, monitoreo continuo, consideración del impacto ambiental y escalabilidad a largo plazo.',
      whatItMeans: 'Esta dimensión mide qué tan adaptable y sostenible es tu organización en el desarrollo y mantenimiento de soluciones de IA.',
      levels: {
        'Incipiente': {
          description: 'Desarrollo de IA sin metodologías ágiles. Poco monitoreo y sin consideración del impacto ambiental.',
          whatYouNeed: 'Adoptar metodologías ágiles básicas, establecer monitoreo de modelos y comenzar a considerar sostenibilidad.'
        },
        'Básico': {
          description: 'Uso limitado de metodologías ágiles. Monitoreo básico de modelos con poca consideración de sostenibilidad.',
          whatYouNeed: 'Mejorar prácticas ágiles, implementar monitoreo continuo y desarrollar estrategias de sostenibilidad.'
        },
        'Intermedio': {
          description: 'Metodologías ágiles establecidas con monitoreo regular. Algunas consideraciones de impacto ambiental.',
          whatYouNeed: 'Optimizar procesos ágiles, mejorar monitoreo predictivo y fortalecer prácticas de sostenibilidad.'
        },
        'Avanzado': {
          description: 'Desarrollo ágil maduro con monitoreo avanzado. Fuerte consideración de sostenibilidad y escalabilidad.',
          whatYouNeed: 'Liderar innovación en desarrollo ágil de IA y establecer nuevos estándares de sostenibilidad.'
        },
        'Transformador': {
          description: 'La organización es pionera en desarrollo ágil y sostenible de IA, estableciendo mejores prácticas de la industria.',
          whatYouNeed: 'Mantener el liderazgo en innovación ágil y sostenible, influenciando estándares globales.'
        }
      }
    },
    'Infraestructura y Gestión de Datos': {
      icon: '🏗️',
      description: 'Evalúa la adecuación de la infraestructura tecnológica, estrategias de datos, calidad de datos y catálogos centralizados.',
      whatItMeans: 'Esta dimensión mide qué tan sólida es la base tecnológica y de datos de tu organización para soportar iniciativas de IA.',
      levels: {
        'Incipiente': {
          description: 'Infraestructura limitada para IA. Gestión de datos básica sin estrategia clara de calidad.',
          whatYouNeed: 'Mejorar infraestructura básica, establecer estrategia de datos y implementar controles básicos de calidad.'
        },
        'Básico': {
          description: 'Infraestructura adecuada para proyectos básicos. Gestión de datos en desarrollo con calidad inconsistente.',
          whatYouNeed: 'Escalar infraestructura, mejorar estrategia de datos y establecer procesos sistemáticos de calidad.'
        },
        'Intermedio': {
          description: 'Infraestructura sólida con buena gestión de datos. Calidad de datos establecida con catálogo básico.',
          whatYouNeed: 'Optimizar infraestructura para escala, expandir catálogo de datos y automatizar procesos de calidad.'
        },
        'Avanzado': {
          description: 'Infraestructura avanzada y escalable. Excelente gestión de datos con catálogo comprensivo y alta calidad.',
          whatYouNeed: 'Liderar innovación en infraestructura de IA y establecer nuevos estándares de gestión de datos.'
        },
        'Transformador': {
          description: 'Infraestructura de clase mundial que sirve como referencia. Gestión de datos ejemplar en la industria.',
          whatYouNeed: 'Mantener liderazgo tecnológico y compartir mejores prácticas con la comunidad global.'
        }
      }
    },
    'Impacto Organizacional y Social': {
      icon: '📈',
      description: 'Evalúa la medición de valor/ROI, gestión del impacto laboral, consideración del impacto social y rediseño de procesos.',
      whatItMeans: 'Esta dimensión mide qué tan efectiva es tu organización en crear valor real con IA y gestionar su impacto en personas y sociedad.',
      levels: {
        'Incipiente': {
          description: 'Poca medición del valor de IA. Impacto laboral y social no considerado sistemáticamente.',
          whatYouNeed: 'Establecer métricas básicas de ROI, comenzar a evaluar impacto laboral y considerar efectos sociales.'
        },
        'Básico': {
          description: 'Medición básica de valor. Algunas consideraciones de impacto laboral pero gestión limitada.',
          whatYouNeed: 'Mejorar medición de ROI, desarrollar estrategias de gestión de cambio laboral y evaluar impacto social.'
        },
        'Intermedio': {
          description: 'Medición consistente de valor con gestión proactiva del impacto laboral. Algunas consideraciones sociales.',
          whatYouNeed: 'Optimizar medición de impacto, fortalecer gestión del cambio y expandir consideraciones de responsabilidad social.'
        },
        'Avanzado': {
          description: 'Medición sofisticada de valor e impacto. Excelente gestión del cambio laboral y fuerte consideración social.',
          whatYouNeed: 'Liderar mejores prácticas en medición de impacto y convertirse en referente de IA socialmente responsable.'
        },
        'Transformador': {
          description: 'La organización establece nuevos estándares en creación de valor con IA y es líder en responsabilidad social.',
          whatYouNeed: 'Mantener liderazgo en impacto positivo y influir en políticas de IA socialmente responsable.'
        }
      }
    }
  };

  getSizeColor(size: string): string {
    switch (size) {
      case 'Micro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pequeña': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Mediana': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Grande': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getDimensionColor(score: number): string {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    if (score >= 40) return '#ef4444'; // red-500
    return '#6b7280'; // gray-500
  }

  getLevelBadgeColor(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  // Métodos para el modal de dimensiones
  openDimensionDetail(dimensionName: string): void {
    this.selectedDimension.set(dimensionName);
  }

  closeDimensionDetail(): void {
    this.selectedDimension.set(null);
  }

  getDimensionIcon(dimensionName: string): string {
    return this.dimensionDetails[dimensionName]?.icon || '📊';
  }

  getDimensionDetail(dimensionName: string): any {
    return this.dimensionDetails[dimensionName];
  }

  getDimensionScore(dimensionName: string): any {
    return this.report.puntajes.dimensiones.find(d => d.nombre === dimensionName);
  }

  getCurrentLevelInfo(): any {
    const dimension = this.selectedDimension();
    if (!dimension) return null;
    
    const score = this.getDimensionScore(dimension);
    if (!score) return null;
    
    const detail = this.getDimensionDetail(dimension);
    return detail?.levels[score.nivel];
  }

  getLevelScoreRange(level: string): string {
    switch (level) {
      case 'Incipiente': return '0-19';
      case 'Básico': return '20-39';
      case 'Intermedio': return '40-59';
      case 'Avanzado': return '60-79';
      case 'Transformador': return '80-100';
      default: return '0-100';
    }
  }
}
