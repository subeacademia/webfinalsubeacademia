import { Component, computed, inject, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService, ActionPlan, PersonalizedActionPlan } from '../../../services/scoring.service';
import { GenerativeAiService, DiagnosticAnalysisData } from '../../../../../core/ai/generative-ai.service';
import { ApiHealthService } from '../../../../../core/ai/api-health.service';
import { ApiProgressBarComponent } from '../api-progress-bar/api-progress-bar.component';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import 'chart.js/auto';
import { ARES_ITEMS } from '../../../data/ares-items';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Course } from '../../../../../core/models/course.model';
import { Post } from '../../../../../core/models/post.model';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, ApiProgressBarComponent],
  template: `
    <div class="animate-fade-in">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">
          ¡Diagnóstico Completado!
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Has completado exitosamente el diagnóstico de madurez ARES-AI. 
          Aquí tienes tu reporte personalizado y plan de acción.
        </p>
      </div>
      
      <!-- Resumen Ejecutivo -->
      <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Resumen Ejecutivo</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-400 mb-2">{{ getOverallScore() }}%</div>
            <div class="text-gray-300">Madurez General</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">{{ getAresScore() }}%</div>
            <div class="text-gray-300">Madurez ARES</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-400 mb-2">{{ getCompetenciasScore() }}%</div>
            <div class="text-gray-300">Competencias</div>
          </div>
        </div>
      </div>

      <!-- Gráficos de Resultados -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Gráfico de Radar ARES -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-semibold text-white mb-4">Evaluación ARES por Fase</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas #aresChart width="300" height="300"></canvas>
          </div>
        </div>

        <!-- Semáforo ARES Mejorado -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-semibold text-white mb-4">Estado por Fase ARES</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 1: Fundamentos</span>
                <p class="text-xs text-gray-400">Infraestructura básica y capacidades iniciales</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F1')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F1') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 2: Estrategia</span>
                <p class="text-xs text-gray-400">Planificación y gobernanza</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F2')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F2') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 3: Capacidades</span>
                <p class="text-xs text-gray-400">Desarrollo y tecnología</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F3')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F3') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 4: Operación</span>
                <p class="text-xs text-gray-400">Monitoreo y mejora continua</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F4')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F4') }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span class="text-gray-300 font-medium">Fase 5: Transformación</span>
                <p class="text-xs text-gray-400">Innovación y liderazgo</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F5')"></div>
                <span class="text-xs text-gray-400">{{ getPhaseScore('F5') }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Leyenda del Semáforo -->
          <div class="mt-4 p-3 bg-gray-700/30 rounded-lg">
            <h4 class="text-sm font-medium text-gray-200 mb-2">Leyenda:</h4>
            <div class="flex items-center space-x-4 text-xs">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-gray-400">0-20% (Crítico)</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span class="text-gray-400">21-40% (Bajo)</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-gray-400">41-60% (Medio)</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="text-gray-400">61-100% (Alto)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fortalezas y Oportunidades -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-green-200 mb-4">Fortalezas Principales</h3>
          <ul class="space-y-2 text-green-100">
            <li *ngFor="let fortaleza of getFortalezas()" class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              {{ fortaleza }}
            </li>
          </ul>
        </div>

        <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h3 class="text-xl font-semibold text-yellow-200 mb-4">Oportunidades de Mejora</h3>
          <ul class="space-y-2 text-yellow-100">
            <li *ngFor="let oportunidad of getOportunidades()" class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
              </svg>
              {{ oportunidad }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Plan de Acción Recomendado Mejorado -->
      <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-8 mb-8">
        <h3 class="text-3xl font-bold text-white mb-6 text-center">Plan de Acción Recomendado</h3>
        
        <!-- Reconocimiento de Fortalezas -->
        <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
          <h4 class="text-xl font-semibold text-green-200 mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            Reconocimiento de Fortalezas
          </h4>
          <p class="text-green-100 leading-relaxed">{{ getActionPlan().reconocimientoFortalezas }}</p>
        </div>

        <!-- Áreas de Desarrollo Clave -->
        <div class="mb-6">
          <h4 class="text-xl font-semibold text-blue-200 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            Áreas de Desarrollo Clave
          </h4>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div *ngFor="let area of getActionPlan().areasDesarrollo" class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-5">
              <h5 class="text-lg font-semibold text-yellow-200 mb-3">{{ area.competencia }}</h5>
              <p class="text-yellow-100 text-sm mb-4 leading-relaxed">{{ area.importancia }}</p>
              <div class="space-y-2">
                <h6 class="text-sm font-medium text-yellow-300">Acciones Específicas:</h6>
                <ul class="space-y-2">
                  <li *ngFor="let accion of area.acciones" class="flex items-start text-sm text-yellow-100">
                    <svg class="w-3 h-3 mr-2 mt-1 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    {{ accion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Recursos Recomendados -->
        <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
          <h4 class="text-xl font-semibold text-purple-200 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.591a1 1 0 00.941 0l6-1.75A1 1 0 0019 12V6a1 1 0 00-.606-.92l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9 12v2a1 1 0 001 1h1a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1zm5-1a1 1 0 011-1h1a1 1 0 011 1v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-6z"></path>
            </svg>
            Recursos Recomendados
          </h4>
          
          <!-- Cursos Recomendados -->
          <div class="mb-6">
            <h5 class="text-lg font-medium text-purple-300 mb-3">Cursos de la Plataforma</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let curso of getActionPlan().recursos.cursos" class="bg-purple-800/20 border border-purple-400/30 rounded-lg p-4">
                <h6 class="font-semibold text-purple-200 mb-2">{{ curso.titulo }}</h6>
                <p class="text-purple-100 text-sm mb-2">{{ curso.descripcion }}</p>
                <div class="flex items-center justify-between text-xs text-purple-300">
                  <span>Duración: {{ curso.duracion }}</span>
                  <span class="bg-purple-600/50 px-2 py-1 rounded">Recomendado</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lectura Recomendada -->
          <div>
            <h5 class="text-lg font-medium text-purple-300 mb-3">Lectura Complementaria</h5>
            <div class="bg-purple-800/20 border border-purple-400/30 rounded-lg p-4">
              <p class="text-purple-100">{{ getActionPlan().recursos.lectura }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección para el Análisis Personalizado por IA -->
      <div class="mt-8">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Análisis y Plan de Acción por IA
        </h3>
        
        <!-- ESTADO DE CARGA MEJORADO -->
        <div *ngIf="isLoadingAnalysis" class="p-6 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <!-- Puedes usar un ícono SVG de cerebro o similar aquí -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p class="text-lg font-semibold text-gray-700 dark:text-gray-300">Analizando tu perfil...</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ loadingMessage }}</p>
            </div>
          </div>
        </div>

        <!-- CONTENIDO DEL ANÁLISIS UNA VEZ CARGADO -->
        <div *ngIf="!(isLoadingAnalysis) && (generativeAnalysis$ | async) as analysis">
          <div class="prose prose-lg dark:prose-invert max-w-none p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div [innerHTML]="analysis" class="text-gray-200 leading-relaxed"></div>
          </div>
        </div>
      </div>

      <!-- Tu Plan de Acción Personalizado -->
      <div class="bg-gradient-to-r from-indigo-900/20 to-cyan-900/20 border border-indigo-500/30 rounded-lg p-8 mb-8">
        <h3 class="text-3xl font-bold text-white mb-6 text-center">Tu Plan de Acción Personalizado</h3>
        
        <!-- Plan de Acción Generado por IA -->
        <div class="mb-8">
          <h4 class="text-2xl font-semibold text-indigo-200 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.663 17.119a1 1 0 01-1.414 0L.293 9.414a1 1 0 010-1.414l7.956-7.956a1 1 0 011.414 0l7.956 7.956a1 1 0 010 1.414L9.663 17.119z" clip-rule="evenodd"></path>
            </svg>
            Plan de Acción Generado con IA
          </h4>
          
          <!-- Indicador de carga del plan de acción -->
          <div *ngIf="isLoadingActionPlan" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
            <p class="text-indigo-200">Generando plan de acción personalizado con IA...</p>
          </div>

          <!-- Contenido del plan de acción cuando está cargado -->
          <div *ngIf="!isLoadingActionPlan" class="bg-indigo-800/20 border border-indigo-400/30 rounded-lg p-6">
            <div [innerHTML]="aiGeneratedActionPlan$ | async" class="text-indigo-100 leading-relaxed prose prose-invert max-w-none"></div>
          </div>
        </div>

        <!-- Indicador de carga -->
        <div *ngIf="loadingRecommendations" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p class="text-indigo-200">Cargando recomendaciones personalizadas...</p>
        </div>

       <!-- Contenido cuando las recomendaciones están cargadas -->
       <div *ngIf="!loadingRecommendations">
         <!-- Cursos Recomendados -->
         <div *ngIf="recommendedCourses.length > 0" class="mb-8">
           <h4 class="text-2xl font-semibold text-indigo-200 mb-4 flex items-center">
             <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
               <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.591a1 1 0 00.941 0l6-1.75A1 1 0 0019 12V6a1 1 0 00-.606-.92l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9 12v2a1 1 0 001 1h1a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1zm5-1a1 1 0 011-1h1a1 1 0 011 1v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-6z"></path>
             </svg>
             Cursos Recomendados para Ti
           </h4>
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div *ngFor="let course of recommendedCourses" class="bg-indigo-800/20 border border-indigo-400/30 rounded-lg p-6 hover:bg-indigo-800/30 transition-colors">
               <div class="flex items-center justify-between mb-3">
                 <h5 class="text-lg font-semibold text-indigo-200">{{ course.title }}</h5>
                 <span class="bg-indigo-600/50 px-2 py-1 rounded text-xs text-indigo-100">{{ course.level || 'Principiante' }}</span>
               </div>
               <p *ngIf="course.description" class="text-indigo-100 text-sm mb-4 line-clamp-3">{{ course.description }}</p>
               <div class="flex items-center justify-between text-xs text-indigo-300 mb-4">
                 <span *ngIf="course.duration">Duración: {{ course.duration }}</span>
                 <span *ngIf="course.lessonCount">{{ course.lessonCount }} lecciones</span>
               </div>
               <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                 Ver Curso
               </button>
             </div>
           </div>
         </div>

         <!-- Artículos Recomendados -->
         <div *ngIf="recommendedPosts.length > 0" class="mb-8">
           <h4 class="text-2xl font-semibold text-cyan-200 mb-4 flex items-center">
             <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
             </svg>
             Artículos Recomendados para Ti
           </h4>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div *ngFor="let post of recommendedPosts" class="bg-cyan-800/20 border border-cyan-400/30 rounded-lg p-6 hover:bg-cyan-800/30 transition-colors">
               <h5 class="text-lg font-semibold text-cyan-200 mb-3">{{ post.title }}</h5>
               <p *ngIf="post.summary" class="text-cyan-100 text-sm mb-4 line-clamp-3">{{ post.summary }}</p>
               <div class="flex items-center justify-between">
                 <span class="text-xs text-cyan-300">{{ post.authors?.[0]?.name || 'Autor' }}</span>
                 <button class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                   Leer Artículo
                 </button>
               </div>
             </div>
           </div>
         </div>

         <!-- Micro-acciones -->
         <div class="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-lg p-6">
           <h4 class="text-xl font-semibold text-emerald-200 mb-4 flex items-center">
             <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
             </svg>
             Micro-acciones para Esta Semana
           </h4>
           <div class="space-y-3">
             <div *ngFor="let action of microActions; let i = index" class="flex items-start">
               <div class="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                 {{ i + 1 }}
               </div>
               <p class="text-emerald-100">{{ action }}</p>
             </div>
           </div>
         </div>
       </div>
     </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          (click)="downloadPDF()"
          class="btn-primary flex items-center justify-center px-6 py-3 text-lg font-semibold">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Descargar PDF Completo
        </button>
        
        <button 
          (click)="scheduleConsulting()"
          class="btn-secondary flex items-center justify-center px-6 py-3 text-lg font-semibold">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Agendar Sesión de Consultoría
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .btn-primary {
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gray-700 hover:bg-gray-600 text-white rounded-lg transform hover:scale-105 transition-all duration-200;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .hover\\:bg-indigo-800\\/30:hover {
      background-color: rgba(67, 56, 202, 0.3);
    }

    .hover\\:bg-cyan-800\\/30:hover {
      background-color: rgba(14, 116, 144, 0.3);
    }
  `]
})
export class DiagnosticResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('aresChart', { static: false }) aresChartRef!: ElementRef<HTMLCanvasElement>;
  
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly scoringService = inject(ScoringService);
  private readonly generativeAiService = inject(GenerativeAiService);
  private readonly apiHealthService = inject(ApiHealthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private aresChart: Chart | null = null;

  // Propiedades para las recomendaciones
  recommendedCourses: Course[] = [];
  recommendedPosts: Post[] = [];
  microActions: string[] = [];
  loadingRecommendations = false;

  // Propiedades para el análisis de IA
  isLoadingAnalysis = true;
  generativeAnalysis$: Observable<string> = of('');
  aiGeneratedActionPlan$: Observable<string> = of('');
  isLoadingActionPlan = true;
  
  // Propiedades para el estado de la API
  apiStatus: { isHealthy: boolean; recommendation: string; fallbackAvailable: boolean } | null = null;
  showApiStatus = false;

  // Propiedades para el mensaje de carga dinámico
  loadingMessage: string = 'Preparando tu análisis...';
  private loadingInterval: any;

  // Pool de mensajes de carga (copiado del chatbot para consistencia)
  private mensajesCarga = [
    'Pensando en la mejor respuesta para ti... 🤔',
    'Consultando nuestra base de datos de Sube Academia... 📊',
    'Buscando la información más precisa... 🔍',
    'Procesando tu consulta con IA... ⚡',
    'Analizando tus resultados... 📈',
    'Preparando una respuesta detallada... ✨',
    'Generando un plan de acción personalizado... 🎯',
    'Elaborando el mejor feedback para ti... 💡'
  ];

  ngOnInit(): void {
    // Inicialización del componente
    this.debugDiagnosticState();
    
    // Verificar estado de la API
    this.checkApiStatus();
    
    // Iniciar el ciclo de mensajes de carga
    this.startLoadingMessages();
    
    // Forzar recarga de datos desde localStorage
    setTimeout(() => {
      this.reloadDiagnosticData();
      this.loadPersonalizedRecommendations();
      this.generateAiAnalysis();
      this.generateActionPlanWithAI();
    }, 100);
  }

  private startLoadingMessages(): void {
    this.loadingInterval = setInterval(() => {
      this.loadingMessage = this.mensajesCarga[Math.floor(Math.random() * this.mensajesCarga.length)];
      this.cdr.detectChanges();
    }, 2000); // Cambia el mensaje cada 2 segundos
  }

  private stopLoadingMessages(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
  }

  ngOnDestroy() {
    this.stopLoadingMessages(); // Asegurarse de limpiar el intervalo al destruir el componente
  }

  private reloadDiagnosticData(): void {
    console.log('=== RELOADING DIAGNOSTIC DATA ===');
    
    // Forzar recarga desde localStorage
    const stored = localStorage.getItem('diagnostico.aresai.v1');
    console.log('Stored Data:', stored);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        console.log('Parsed Data:', data);
        
        // Actualizar formularios si es necesario
        if (data.aresForm) {
          this.diagnosticState.aresForm.patchValue(data.aresForm);
          console.log('ARES Form updated with:', data.aresForm);
        }
        
        if (data.competenciasForm) {
          this.diagnosticState.competenciasForm.patchValue(data.competenciasForm);
          console.log('Competencias Form updated with:', data.competenciasForm);
        }
        
        // Forzar actualización del gráfico
        setTimeout(() => {
          if (this.aresChart) {
            this.aresChart.destroy();
            this.aresChart = null;
          }
          this.initializeAresChart();
        }, 200);
        
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    
    console.log('=== END RELOAD ===');
  }

  private debugDiagnosticState(): void {
    console.log('=== DEBUG DIAGNOSTIC STATE ===');
    console.log('ARES Form:', this.diagnosticState.aresForm);
    console.log('ARES Form Value:', this.diagnosticState.aresForm.value);
    console.log('Competencias Form:', this.diagnosticState.competenciasForm);
    console.log('Competencias Form Value:', this.diagnosticState.competenciasForm.value);
    console.log('Contexto Controls:', this.diagnosticState.contextoControls);
    console.log('Lead Form:', this.diagnosticState.leadForm.value);
    console.log('Main Form:', this.diagnosticState.form.value);
    console.log('ARES Items:', this.diagnosticState.aresItems);
    console.log('Competencias:', this.diagnosticState.competencias);
    console.log('=== END DEBUG ===');
  }

  ngAfterViewInit(): void {
    this.initializeAresChart();
  }

  private initializeAresChart(): void {
    if (!this.aresChartRef) return;

    const ctx = this.aresChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData: ChartData<'radar'> = {
      labels: ['Fundamentos', 'Estrategia', 'Capacidades', 'Operación', 'Transformación'],
      datasets: [{
        label: 'Madurez ARES',
        data: [
          this.getPhaseScore('F1'),
          this.getPhaseScore('F2'),
          this.getPhaseScore('F3'),
          this.getPhaseScore('F4'),
          this.getPhaseScore('F5')
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }]
    };

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              color: '#9CA3AF',
              backdropColor: 'transparent'
            },
            grid: {
              color: '#374151'
            },
            pointLabels: {
              color: '#E5E7EB',
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#E5E7EB'
            }
          }
        }
      }
    };

    this.aresChart = new Chart(ctx, config);
  }

  getOverallScore(): number {
    const aresScore = this.getAresScore();
    const competenciasScore = this.getCompetenciasScore();
    const overall = Math.round((aresScore + competenciasScore) / 2);
    console.log('Overall Score:', { aresScore, competenciasScore, overall });
    return overall;
  }

  getAresScore(): number {
    const aresData = this.diagnosticState.aresForm.value;
    console.log('ARES Form Data:', aresData);
    
    if (!aresData) return 0;
    
    const totalItems = Object.keys(aresData).length;
    if (totalItems === 0) return 0;
    
    const totalScore = Object.values(aresData).reduce((sum: number, value: any) => {
      const numValue = Number(value) || 0;
      console.log('ARES Item Score:', { value, numValue });
      return sum + numValue;
    }, 0);
    
    const score = Math.round((totalScore / (totalItems * 4)) * 100); // Escala 0-4
    console.log('ARES Score Calculation:', { totalItems, totalScore, score });
    return score;
  }

  getCompetenciasScore(): number {
    const competenciasData = this.diagnosticState.competenciasForm.value;
    console.log('Competencias Form Data:', competenciasData);
    
    if (!competenciasData) return 0;
    
    const totalItems = Object.keys(competenciasData).length;
    if (totalItems === 0) return 0;
    
    const totalScore = Object.values(competenciasData).reduce((sum: number, value: any) => {
      const numValue = Number(value) || 0;
      console.log('Competencia Score:', { value, numValue });
      return sum + numValue;
    }, 0);
    
    const score = Math.round((totalScore / (totalItems * 4)) * 100); // Escala 0-4
    console.log('Competencias Score Calculation:', { totalItems, totalScore, score });
    return score;
  }

  getPhaseScore(phase: string): number {
    const aresData = this.diagnosticState.aresForm.value;
    console.log(`Getting Phase Score for ${phase}:`, aresData);
    
    if (!aresData) return 0;
    
    const phaseItems = ARES_ITEMS.filter(item => item.phase === phase);
    console.log(`Phase ${phase} items:`, phaseItems);
    
    if (phaseItems.length === 0) return 0;
    
    const phaseScore = phaseItems.reduce((sum, item) => {
      const value = aresData[item.id];
      const numValue = Number(value) || 0;
      console.log(`Phase ${phase} item ${item.id}:`, { value, numValue });
      return sum + numValue;
    }, 0);
    
    const score = Math.round((phaseScore / (phaseItems.length * 4)) * 100); // Escala 0-4
    console.log(`Phase ${phase} Score:`, { phaseItems: phaseItems.length, phaseScore, score });
    return score;
  }

  getPhaseStatusClass(phase: string): string {
    const score = this.getPhaseScore(phase);
    if (score >= 61) return 'bg-green-500';
    if (score >= 41) return 'bg-blue-500';
    if (score >= 21) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getFortalezas(): string[] {
    const score = this.getOverallScore();
    if (score >= 80) {
      return [
        'Excelente infraestructura tecnológica',
        'Equipo altamente capacitado',
        'Procesos bien establecidos'
      ];
    } else if (score >= 60) {
      return [
        'Buenas bases tecnológicas',
        'Equipo con potencial de crecimiento',
        'Procesos en desarrollo'
      ];
    } else {
      return [
        'Compromiso con la transformación',
        'Oportunidad de mejora significativa',
        'Potencial de crecimiento alto'
      ];
    }
  }

  getOportunidades(): string[] {
    const score = this.getOverallScore();
    if (score >= 80) {
      return [
        'Optimizar procesos existentes',
        'Explorar tecnologías emergentes',
        'Compartir mejores prácticas'
      ];
    } else if (score >= 60) {
      return [
        'Fortalecer competencias del equipo',
        'Implementar mejores prácticas',
        'Invertir en infraestructura'
      ];
    } else {
      return [
        'Desarrollar competencias básicas',
        'Establecer procesos fundamentales',
        'Invertir en formación del equipo'
      ];
    }
  }

  getAccionesInmediatas(): string[] {
    const score = this.getOverallScore();
    if (score >= 60) {
      return [
        'Optimizar procesos existentes',
        'Capacitar equipo en nuevas tecnologías',
        'Implementar pilotos de mejora'
      ];
    } else {
      return [
        'Desarrollar competencias básicas del equipo',
        'Establecer procesos fundamentales',
        'Invertir en infraestructura básica'
      ];
    }
  }

  getAccionesMedioPlazo(): string[] {
    const score = this.getOverallScore();
    if (score >= 60) {
      return [
        'Escalar soluciones exitosas',
        'Implementar gobernanza avanzada',
        'Explorar tecnologías emergentes'
      ];
    } else {
      return [
        'Fortalecer competencias del equipo',
        'Implementar mejores prácticas',
        'Desarrollar capacidades de innovación'
      ];
    }
  }

  getActionPlan(): ActionPlan {
    const formData = {
      segmento: this.diagnosticState.form.value.segmento,
      contexto: this.diagnosticState.form.value.contexto,
      objetivo: this.diagnosticState.form.value.objetivo,
      ares: this.diagnosticState.form.value.ares,
      competencias: this.diagnosticState.form.value.competencias,
      lead: this.diagnosticState.form.value.lead
    };
    
    return this.scoringService.generateActionPlan(formData);
  }

  downloadPDF(): void {
    console.log('Generando PDF del diagnóstico...');
    
    // Mostrar indicador de carga
    const button = event?.target as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generando PDF...';
    button.disabled = true;

    try {
      this.generateDiagnosticPDF().then(() => {
        console.log('PDF generado exitosamente');
        // Restaurar botón
        button.innerHTML = originalText;
        button.disabled = false;
      }).catch(error => {
        console.error('Error generando PDF:', error);
        alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        // Restaurar botón
        button.innerHTML = originalText;
        button.disabled = false;
      });
    } catch (error) {
      console.error('Error en downloadPDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      // Restaurar botón
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }

  private async generateDiagnosticPDF(): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let yPosition = margin;
    
    // Título principal
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246); // Azul
    pdf.text('Diagnóstico ARES-AI Completado', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Fecha
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // Gris
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Generado el: ${fecha}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Resumen Ejecutivo
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Resumen Ejecutivo', margin, yPosition);
    yPosition += 10;
    
    // Métricas principales
    const overallScore = this.getOverallScore();
    const aresScore = this.getAresScore();
    const competenciasScore = this.getCompetenciasScore();
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    
    // Madurez General
    pdf.setTextColor(59, 130, 246); // Azul
    pdf.text(`Madurez General: ${overallScore}%`, margin, yPosition);
    yPosition += 8;
    
    // Madurez ARES
    pdf.setTextColor(34, 197, 94); // Verde
    pdf.text(`Madurez ARES: ${aresScore}%`, margin, yPosition);
    yPosition += 8;
    
    // Competencias
    pdf.setTextColor(147, 51, 234); // Púrpura
    pdf.text(`Competencias: ${competenciasScore}%`, margin, yPosition);
    yPosition += 15;
    
    // Evaluación por Fases ARES
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Evaluación por Fases ARES', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const fases = ['F1', 'F2', 'F3', 'F4', 'F5'];
    const nombresFases = ['Fundamentos', 'Estrategia', 'Capacidades', 'Operación', 'Transformación'];
    
    fases.forEach((fase, index) => {
      const score = this.getPhaseScore(fase);
      const nombre = nombresFases[index];
      
      // Color según el score
      if (score >= 61) pdf.setTextColor(34, 197, 94); // Verde
      else if (score >= 41) pdf.setTextColor(59, 130, 246); // Azul
      else if (score >= 21) pdf.setTextColor(245, 158, 11); // Amarillo
      else pdf.setTextColor(239, 68, 68); // Rojo
      
      pdf.text(`${fase}: ${nombre} - ${score}%`, margin, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Fortalezas y Oportunidades
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Análisis de Resultados', margin, yPosition);
    yPosition += 10;
    
    // Fortalezas
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 197, 94); // Verde
    pdf.text('Fortalezas Principales:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const fortalezas = this.getFortalezas();
    fortalezas.forEach(fortaleza => {
      pdf.text(`• ${fortaleza}`, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 5;
    
    // Oportunidades
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 158, 11); // Amarillo
    pdf.text('Oportunidades de Mejora:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const oportunidades = this.getOportunidades();
    oportunidades.forEach(oportunidad => {
      pdf.text(`• ${oportunidad}`, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Plan de Acción Recomendado Mejorado
    if (yPosition > pageHeight - 120) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Plan de Acción Recomendado', margin, yPosition);
    yPosition += 10;
    
    // Reconocimiento de Fortalezas
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 197, 94); // Verde
    pdf.text('Reconocimiento de Fortalezas:', margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const actionPlan = this.getActionPlan();
    const reconocimientoText = actionPlan.reconocimientoFortalezas;
    
    // Dividir el texto en líneas que quepan en la página
    const maxWidth = contentWidth - 10;
    const lines = this.splitTextIntoLines(reconocimientoText, maxWidth, pdf);
    lines.forEach(line => {
      pdf.text(line, margin + 5, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Áreas de Desarrollo Clave
    if (yPosition > pageHeight - 150) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 158, 11); // Amarillo
    pdf.text('Áreas de Desarrollo Clave:', margin, yPosition);
    yPosition += 8;
    
    actionPlan.areasDesarrollo.forEach((area, index) => {
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Nombre de la competencia
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${area.competencia}:`, margin, yPosition);
      yPosition += 8;
      
      // Importancia
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const importanciaLines = this.splitTextIntoLines(area.importancia, maxWidth, pdf);
      importanciaLines.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 6;
      });
      
      yPosition += 5;
      
      // Acciones específicas
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246); // Azul
      pdf.text('Acciones Específicas:', margin + 5, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      area.acciones.forEach((accion, accionIndex) => {
        const accionText = `${accionIndex + 1}. ${accion}`;
        const accionLines = this.splitTextIntoLines(accionText, maxWidth - 10, pdf);
        accionLines.forEach(line => {
          pdf.text(line, margin + 10, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      });
      
      yPosition += 8;
    });
    
    // Recursos Recomendados
    if (yPosition > pageHeight - 120) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(147, 51, 234); // Púrpura
    pdf.text('Recursos Recomendados:', margin, yPosition);
    yPosition += 8;
    
    // Cursos recomendados
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Cursos de la Plataforma:', margin + 5, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    actionPlan.recursos.cursos.forEach((curso, index) => {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(147, 51, 234); // Púrpura
      pdf.text(`${index + 1}. ${curso.titulo}`, margin + 10, yPosition);
      yPosition += 6;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const descripcionLines = this.splitTextIntoLines(curso.descripcion, maxWidth - 15, pdf);
      descripcionLines.forEach(line => {
        pdf.text(line, margin + 15, yPosition);
        yPosition += 5;
      });
      
      pdf.text(`Duración: ${curso.duracion}`, margin + 15, yPosition);
      yPosition += 8;
    });
    
    // Lectura recomendada
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Lectura Complementaria:', margin + 5, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const lecturaLines = this.splitTextIntoLines(actionPlan.recursos.lectura, maxWidth - 10, pdf);
    lecturaLines.forEach(line => {
      pdf.text(line, margin + 10, yPosition);
      yPosition += 6;
    });
    
    // Tu Plan de Acción Personalizado
    if (yPosition > pageHeight - 120) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Tu Plan de Acción Personalizado', margin, yPosition);
    yPosition += 10;

    // Cursos Recomendados para Ti
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(147, 51, 234); // Púrpura
    pdf.text('Cursos Recomendados para Ti:', margin + 5, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    this.recommendedCourses.forEach((course: Course, index: number) => {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(147, 51, 234); // Púrpura
      pdf.text(`${index + 1}. ${course.title}`, margin + 10, yPosition);
      yPosition += 6;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      const courseDescriptionLines = this.splitTextIntoLines(course.description || '', maxWidth - 15, pdf);
      courseDescriptionLines.forEach(line => {
        pdf.text(line, margin + 15, yPosition);
        yPosition += 5;
      });

      pdf.text(`Duración: ${course.duration}`, margin + 15, yPosition);
      yPosition += 8;
    });

    // Artículos Recomendados para Ti
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(245, 158, 11); // Amarillo
    pdf.text('Artículos Recomendados para Ti:', margin + 5, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    this.recommendedPosts.forEach((post: Post, index: number) => {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${index + 1}. ${post.title}`, margin + 10, yPosition);
      yPosition += 6;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      const postSummaryLines = this.splitTextIntoLines(post.summary || '', maxWidth - 15, pdf);
      postSummaryLines.forEach(line => {
        pdf.text(line, margin + 15, yPosition);
        yPosition += 5;
      });

      pdf.text(`Autor: ${post.authors?.[0]?.name || 'Desconocido'}`, margin + 15, yPosition);
      yPosition += 8;
    });

    // Micro-acciones para Esta Semana
    if (yPosition > pageHeight - 120) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 197, 94); // Verde
    pdf.text('Micro-acciones para Esta Semana:', margin + 5, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    this.microActions.forEach((action: string, index: number) => {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94); // Verde
      pdf.text(`${index + 1}. ${action}`, margin + 10, yPosition);
      yPosition += 6;
    });
    
    // Pie de página
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }
    
    yPosition += 20;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(107, 114, 128); // Gris
    pdf.text('Este reporte fue generado automáticamente por el sistema de diagnóstico ARES-AI.', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    pdf.text('Para más información o consultoría personalizada, contacta con nuestro equipo.', pageWidth / 2, yPosition, { align: 'center' });
    
    // Generar nombre del archivo
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `diagnostico-ares-ai-${timestamp}.pdf`;
    
    // Guardar PDF
    pdf.save(filename);
    
    console.log('PDF generado y descargado:', filename);
  }

  scheduleConsulting(): void {
    // Implementar agendamiento de consultoría
    console.log('Agendando consultoría...');
    // Aquí iría la lógica real de agendamiento
    alert('Funcionalidad de agendamiento en desarrollo');
  }

  private splitTextIntoLines(text: string, maxWidth: number, pdf: jsPDF): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = pdf.getTextWidth(testLine);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  private generateAiAnalysis(): void {
    try {
      const leadForm = this.diagnosticState.leadForm.value;
      const competenciasData = this.diagnosticState.competenciasForm.value;
      
      if (!leadForm || !competenciasData) {
        console.log('Datos insuficientes para generar análisis de IA');
        this.isLoadingAnalysis = false;
        this.stopLoadingMessages(); // Detener el ciclo de mensajes
        return;
      }

      // Verificar que los datos no estén vacíos
      if (Object.keys(competenciasData).length === 0) {
        console.log('No hay datos de competencias para analizar');
        this.isLoadingAnalysis = false;
        this.stopLoadingMessages(); // Detener el ciclo de mensajes
        return;
      }

      // Obtener las competencias con sus puntajes
      const competencias = Object.entries(competenciasData).map(([competenciaId, nivel]) => {
        const puntaje = nivel ? this.getCompetencyScore(nivel as string) : 0;
        return { name: competenciaId, score: puntaje };
      });

      // Ordenar por puntaje (más altas primero para fortalezas, más bajas para oportunidades)
      const topCompetencies = competencias.sort((a, b) => b.score - a.score).slice(0, 3);
      const lowestCompetencies = competencias.sort((a, b) => a.score - b.score).slice(0, 3);

      const analysisData: DiagnosticAnalysisData = {
        userName: leadForm.nombre || 'Usuario',
        userRole: leadForm.cargo || 'Profesional',
        userIndustry: leadForm.industria || 'Tecnología',
        topCompetencies,
        lowestCompetencies
      };

      console.log('Generando análisis de IA con datos:', analysisData);

      this.generativeAnalysis$ = this.generativeAiService.generateDiagnosticAnalysis(analysisData).pipe(
        finalize(() => {
          console.log('Análisis de IA completado');
          this.isLoadingAnalysis = false;
          this.stopLoadingMessages(); // Detener el ciclo de mensajes
          this.cdr.detectChanges(); // Forzar la detección de cambios
        })
      );
    } catch (error) {
      console.error('Error en generateAiAnalysis:', error);
      this.isLoadingAnalysis = false;
      this.stopLoadingMessages(); // Detener el ciclo de mensajes
    }
  }

  private generateActionPlanWithAI(): void {
    try {
      const leadForm = this.diagnosticState.leadForm.value;
      const competenciasData = this.diagnosticState.competenciasForm.value;
      
      if (!leadForm || !competenciasData) {
        console.log('Datos insuficientes para generar plan de acción con IA');
        this.isLoadingActionPlan = false;
        return;
      }

      // Verificar que los datos no estén vacíos
      if (Object.keys(competenciasData).length === 0) {
        console.log('No hay datos de competencias para generar plan de acción');
        this.isLoadingActionPlan = false;
        return;
      }

      // Obtener las competencias con sus puntajes
      const competencias = Object.entries(competenciasData).map(([competenciaId, nivel]) => {
        const puntaje = nivel ? this.getCompetencyScore(nivel as string) : 0;
        return { name: competenciaId, score: puntaje };
      });

      // Ordenar por puntaje (más altas primero para fortalezas, más bajas para oportunidades)
      const topCompetencies = competencias.sort((a, b) => b.score - a.score).slice(0, 3);
      const lowestCompetencies = competencias.sort((a, b) => a.score - b.score).slice(0, 3);

      const analysisData: DiagnosticAnalysisData = {
        userName: leadForm.nombre || 'Usuario',
        userRole: leadForm.cargo || 'Profesional',
        userIndustry: leadForm.industria || 'Tecnología',
        topCompetencies,
        lowestCompetencies
      };

      console.log('Generando plan de acción con IA para:', analysisData);

      this.aiGeneratedActionPlan$ = this.generativeAiService.generateActionPlanWithAI(analysisData).pipe(
        finalize(() => {
          console.log('Plan de acción con IA completado');
          this.isLoadingActionPlan = false;
          this.cdr.detectChanges(); // Forzar la detección de cambios
        })
      );
    } catch (error) {
      console.error('Error en generateActionPlanWithAI:', error);
      this.isLoadingActionPlan = false;
    }
  }

  private loadPersonalizedRecommendations(): void {
    this.loadingRecommendations = true;
    
    // Obtener las 3 competencias más bajas
    const competenciasData = this.diagnosticState.competenciasForm.value;
    if (!competenciasData) {
      this.loadingRecommendations = false;
      return;
    }

    const competencias = Object.entries(competenciasData).map(([competenciaId, nivel]) => {
      const puntaje = nivel ? this.getCompetencyScore(nivel as string) : 0;
      return { id: competenciaId, name: competenciaId, score: puntaje };
    });

    // Ordenar por puntaje ascendente (las más bajas primero)
    const lowestCompetencies = competencias.sort((a, b) => a.score - b.score).slice(0, 3);

    // Obtener recomendaciones personalizadas
    this.scoringService.getPersonalizedActionPlan(lowestCompetencies).subscribe({
      next: (actionPlan: PersonalizedActionPlan) => {
        this.recommendedCourses = actionPlan.recommendedCourses;
        this.recommendedPosts = actionPlan.recommendedPosts;
        this.microActions = actionPlan.microActions;
        this.loadingRecommendations = false;
      },
      error: (error) => {
        console.error('Error cargando recomendaciones:', error);
        this.loadingRecommendations = false;
      }
    });
  }

  private getCompetencyScore(nivel: string): number {
    const scoreMap: { [key: string]: number } = {
      'incipiente': 0,
      'explorador': 20,
      'aprendiz': 40,
      'practicante': 60,
      'avanzado': 80,
      'experto': 100
    };
    return scoreMap[nivel] || 0;
  }

  private checkApiStatus(): void {
    console.log('🔍 Verificando estado de la API...');
    this.apiHealthService.checkApiHealth().subscribe({
      next: (isHealthy: boolean) => {
        if (isHealthy) {
          this.apiStatus = {
            isHealthy: true,
            recommendation: 'API externa funcionando correctamente. Usando IA externa.',
            fallbackAvailable: true
          };
        } else {
          this.apiStatus = {
            isHealthy: false,
            recommendation: 'API externa no disponible. Usando análisis local de alta calidad.',
            fallbackAvailable: true
          };
        }
        this.showApiStatus = true;
        console.log('📊 Estado de la API:', this.apiStatus);
      },
      error: (error: unknown) => {
        console.error('❌ Error verificando estado de la API:', error);
        this.apiStatus = {
          isHealthy: false,
          recommendation: 'Error verificando API. Usando análisis local.',
          fallbackAvailable: true
        };
        this.showApiStatus = true;
      }
    });
  }
}
