import { Component, OnInit, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ToastService } from '../../../../../core/services/ui/toast/toast.service';
import { ShareService } from '../../../../../core/services/share.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Tu Diagnóstico de Madurez en IA
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Análisis personalizado basado en tus respuestas
          </p>
        </div>

        <!-- Lead Information -->
        @if (leadData()) {
          <div class="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="text-3xl mr-3">👤</span>
              Información del Participante
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Datos Personales</h3>
                <div class="space-y-2 text-sm">
                  <div><span class="font-medium text-gray-600 dark:text-gray-400">Nombre:</span> {{ leadData()?.name }}</div>
                  <div><span class="font-medium text-gray-600 dark:text-gray-400">Email:</span> {{ leadData()?.email }}</div>
                  @if (leadData()?.phone) {
                    <div><span class="font-medium text-gray-600 dark:text-gray-400">Teléfono:</span> {{ leadData()?.phone }}</div>
                  }
                  <div><span class="font-medium text-gray-600 dark:text-gray-400">Tipo:</span> 
                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                      {{ leadData()?.type === 'empresa' ? 'Empresa' : 'Persona Natural' }}
                    </span>
                  </div>
                </div>
              </div>
              
              @if (leadData()?.type === 'empresa') {
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Datos de la Empresa</h3>
                  <div class="space-y-2 text-sm">
                    @if (leadData()?.companyName) {
                      <div><span class="font-medium text-gray-600 dark:text-gray-400">Empresa:</span> {{ leadData()?.companyName }}</div>
                    }
                    @if (leadData()?.position) {
                      <div><span class="font-medium text-gray-600 dark:text-gray-400">Cargo:</span> {{ leadData()?.position }}</div>
                    }
                    @if (leadData()?.industry) {
                      <div><span class="font-medium text-gray-600 dark:text-gray-400">Industria:</span> {{ leadData()?.industry }}</div>
                    }
                    @if (leadData()?.companySize) {
                      <div><span class="font-medium text-gray-600 dark:text-gray-400">Tamaño:</span> {{ leadData()?.companySize }}</div>
                    }
                  </div>
                </div>
              }
              
              <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Preferencias</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center">
                    <span class="font-medium text-gray-600 dark:text-gray-400 mr-2">Comunicaciones:</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" 
                          [class]="leadData()?.acceptsCommunications ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'">
                      {{ leadData()?.acceptsCommunications ? 'Acepta' : 'No acepta' }}
                    </span>
                  </div>
                  <div><span class="font-medium text-gray-600 dark:text-gray-400">Fecha:</span> {{ leadData()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
              </div>
            </div>
          </div>
        }

        @if (error()) {
          <!-- Error State -->
          <div class="text-center py-20">
            <div class="text-6xl mb-4">⚠️</div>
            <h2 class="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Ocurrió un error al generar tu reporte
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {{ error() }}
            </p>
            <div class="flex gap-4 justify-center">
              <button 
                (click)="retryReport()"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                🔄 Reintentar
              </button>
              <button 
                (click)="startNewDiagnostic()"
                class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Nuevo Diagnóstico
              </button>
            </div>
          </div>
        } @else if (isLoading()) {
          <!-- Loading State -->
          <div class="flex justify-center items-center py-20">
            <div class="text-center">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-300">Cargando tu diagnóstico...</p>
            </div>
          </div>
        } @else if (report()) {
          <!-- Results Content -->
          <div class="space-y-8" #shareCard>
            
            <!-- Executive Summary -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span class="text-4xl mr-3">📊</span>
                Resumen Ejecutivo
              </h2>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div class="prose prose-lg max-w-none dark:prose-invert">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {{ report()?.executiveSummary || 'Tu diagnóstico está siendo procesado...' }}
                  </p>
                </div>
                @if (report()?.companyContext) {
                  <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Contexto de tu Organización</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span class="font-medium text-gray-600 dark:text-gray-400">Industria:</span>
                        <span class="text-gray-900 dark:text-white ml-2">{{ report()?.companyContext?.industry || 'No especificada' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-600 dark:text-gray-400">Tamaño:</span>
                        <span class="text-gray-900 dark:text-white ml-2">{{ report()?.companyContext?.size || 'No especificado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-600 dark:text-gray-400">Objetivo Principal:</span>
                        <span class="text-gray-900 dark:text-white ml-2">{{ report()?.companyContext?.mainObjective || 'No especificado' }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- AI Maturity Level -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
              <h2 class="text-3xl font-bold mb-6 flex items-center">
                <span class="text-4xl mr-3">🚀</span>
                Nivel de Madurez en IA
              </h2>
              
              <!-- Métricas principales -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="text-center bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <div class="text-5xl font-bold mb-2">{{ report()?.aiMaturity?.level || 'N/A' }}</div>
                  <div class="text-blue-100 text-lg font-medium">Nivel Actual</div>
                  <div class="text-blue-200 text-sm mt-1">Basado en tu evaluación</div>
                </div>
                <div class="text-center bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <div class="text-5xl font-bold mb-2">{{ (report()?.aiMaturity?.score ?? 'N/A') }}/100</div>
                  <div class="text-blue-100 text-lg font-medium">Puntuación Total</div>
                  <div class="text-blue-200 text-sm mt-1">Competencias + ARES</div>
                </div>
                <div class="text-center bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <div class="text-5xl font-bold mb-2">{{ getMaturityGap() }}</div>
                  <div class="text-blue-100 text-lg font-medium">Próximo Nivel</div>
                  <div class="text-blue-200 text-sm mt-1">{{ getPointsToNextLevel() }} puntos para alcanzarlo</div>
                </div>
              </div>

              <!-- Barra de progreso visual -->
              <div class="mb-6">
                <div class="flex justify-between text-sm text-blue-100 mb-2">
                  <span>Incipiente (0-20)</span>
                  <span>En Desarrollo (21-40)</span>
                  <span>Establecido (41-60)</span>
                  <span>Estratégico (61-80)</span>
                  <span>Transformador (81-100)</span>
                </div>
                <div class="w-full bg-white/20 rounded-full h-4">
                  <div 
                    class="bg-gradient-to-r from-yellow-400 to-green-400 h-4 rounded-full transition-all duration-1000 ease-out"
                    [style.width.%]="(report()?.aiMaturity?.score ?? 0)">
                  </div>
                </div>
              </div>

              @if (report()?.aiMaturity?.summary) {
                <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <h3 class="text-lg font-semibold mb-3 text-blue-100">Análisis Detallado</h3>
                  <p class="text-blue-100 leading-relaxed">
                    {{ report()?.aiMaturity?.summary }}
                  </p>
                </div>
              }
            </div>

            <!-- ARES Phase Analysis -->
            @if (report()?.aresPhaseAnalysis) {
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span class="text-4xl mr-3">📊</span>
                  Análisis de Fases ARES
                </h2>
                <p class="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  Evaluación detallada del estado de madurez en cada fase del framework ARES
                </p>
                
                <!-- Fase General -->
                <div class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-8">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Fase Actual</h3>
                    <span class="px-4 py-2 bg-indigo-600 text-white rounded-full font-medium">
                      {{ report()?.aresPhaseAnalysis?.overallPhase || 'N/A' }}
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 mb-4">
                    {{ report()?.aresPhaseAnalysis?.phaseGap || 'Análisis en progreso...' }}
                  </p>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Próxima Fase:</strong> {{ report()?.aresPhaseAnalysis?.nextPhase || 'N/A' }}
                  </div>
                </div>

                <!-- Fases Individuales -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Preparación</h4>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {{ report()?.aresPhaseAnalysis?.preparacion?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="report()?.aresPhaseAnalysis?.preparacion?.score || 0"></div>
                    </div>
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" [class]="getPhaseStatusColor(report()?.aresPhaseAnalysis?.preparacion?.status)">
                      {{ report()?.aresPhaseAnalysis?.preparacion?.status || 'N/A' }}
                    </span>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-3">
                      {{ report()?.aresPhaseAnalysis?.preparacion?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>

                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Diseño</h4>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {{ report()?.aresPhaseAnalysis?.diseno?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div class="bg-green-600 h-2 rounded-full" [style.width.%]="report()?.aresPhaseAnalysis?.diseno?.score || 0"></div>
                    </div>
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" [class]="getPhaseStatusColor(report()?.aresPhaseAnalysis?.diseno?.status)">
                      {{ report()?.aresPhaseAnalysis?.diseno?.status || 'N/A' }}
                    </span>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-3">
                      {{ report()?.aresPhaseAnalysis?.diseno?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>

                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Desarrollo</h4>
                    <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {{ report()?.aresPhaseAnalysis?.desarrollo?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div class="bg-yellow-600 h-2 rounded-full" [style.width.%]="report()?.aresPhaseAnalysis?.desarrollo?.score || 0"></div>
                    </div>
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" [class]="getPhaseStatusColor(report()?.aresPhaseAnalysis?.desarrollo?.status)">
                      {{ report()?.aresPhaseAnalysis?.desarrollo?.status || 'N/A' }}
                    </span>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-3">
                      {{ report()?.aresPhaseAnalysis?.desarrollo?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>

                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Monitoreo</h4>
                    <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {{ report()?.aresPhaseAnalysis?.monitoreo?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div class="bg-purple-600 h-2 rounded-full" [style.width.%]="report()?.aresPhaseAnalysis?.monitoreo?.score || 0"></div>
                    </div>
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" [class]="getPhaseStatusColor(report()?.aresPhaseAnalysis?.monitoreo?.status)">
                      {{ report()?.aresPhaseAnalysis?.monitoreo?.status || 'N/A' }}
                    </span>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-3">
                      {{ report()?.aresPhaseAnalysis?.monitoreo?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- Organizational Maturity -->
            @if (report()?.organizationalMaturity) {
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span class="text-4xl mr-3">🏢</span>
                  Madurez Organizacional en IA
                </h2>
                <p class="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  Evaluación de los pilares fundamentales para la transformación digital
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-6">
                    <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-3">Cultura</h3>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {{ report()?.organizationalMaturity?.culture?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
                      <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="report()?.organizationalMaturity?.culture?.score || 0"></div>
                    </div>
                    <p class="text-sm text-blue-700 dark:text-blue-300">
                      {{ report()?.organizationalMaturity?.culture?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>

                  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-lg p-6">
                    <h3 class="font-semibold text-green-800 dark:text-green-300 mb-3">Procesos</h3>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {{ report()?.organizationalMaturity?.processes?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mb-3">
                      <div class="bg-green-600 h-2 rounded-full" [style.width.%]="report()?.organizationalMaturity?.processes?.score || 0"></div>
                    </div>
                    <p class="text-sm text-green-700 dark:text-green-300">
                      {{ report()?.organizationalMaturity?.processes?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>

                  <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 rounded-lg p-6">
                    <h3 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">Tecnología</h3>
                    <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {{ report()?.organizationalMaturity?.technology?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2 mb-3">
                      <div class="bg-yellow-600 h-2 rounded-full" [style.width.%]="report()?.organizationalMaturity?.technology?.score || 0"></div>
                    </div>
                    <p class="text-sm text-yellow-700 dark:text-yellow-300">
                      {{ report()?.organizationalMaturity?.technology?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>

                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-lg p-6">
                    <h3 class="font-semibold text-purple-800 dark:text-purple-300 mb-3">Gobernanza</h3>
                    <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {{ report()?.organizationalMaturity?.governance?.score || 0 }}/100
                    </div>
                    <div class="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mb-3">
                      <div class="bg-purple-600 h-2 rounded-full" [style.width.%]="report()?.organizationalMaturity?.governance?.score || 0"></div>
                    </div>
                    <p class="text-sm text-purple-700 dark:text-purple-300">
                      {{ report()?.organizationalMaturity?.governance?.description || 'Análisis en progreso...' }}
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- Competency Analysis -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span class="text-4xl mr-3">🎯</span>
                Análisis de Competencias
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Evaluación detallada de las 13 competencias clave para la transformación digital con IA
              </p>
              
              <!-- Resumen de competencias -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ getHighCompetencies() }}</div>
                  <div class="text-sm text-green-700 dark:text-green-300">Fortalezas (80+)</div>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ getMediumCompetencies() }}</div>
                  <div class="text-sm text-yellow-700 dark:text-yellow-300">Intermedias (50-79)</div>
                </div>
                <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ getLowCompetencies() }}</div>
                  <div class="text-sm text-red-700 dark:text-red-300">Críticas (<50)</div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ getAverageScore() }}</div>
                  <div class="text-sm text-blue-700 dark:text-blue-300">Promedio General</div>
                </div>
              </div>

              <!-- Grid de competencias mejorado -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (competency of report()?.competencyScores || []; track competency.id) {
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
                        {{ competency.name }}
                      </h3>
                      <span class="text-2xl font-bold" [class]="getScoreColor(competency.score)">
                        {{ competency.score }}
                      </span>
                    </div>
                    
                    <!-- Barra de progreso mejorada -->
                    <div class="mb-4">
                      <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          class="h-3 rounded-full transition-all duration-1000 ease-out"
                          [class]="getScoreBarColor(competency.score)"
                          [style.width.%]="competency.score">
                        </div>
                      </div>
                    </div>

                    <!-- Descripción y nivel -->
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {{ getCompetencyDescription(competency.id) }}
                    </p>
                    
                    <!-- Nivel de competencia -->
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-medium px-2 py-1 rounded-full" [class]="getLevelBadgeColor(competency.score)">
                        {{ getCompetencyLevel(competency.score) }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ competency.score }}/100
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Action Plan -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span class="text-4xl mr-3">📋</span>
                Plan de Acción Estratégico
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Hoja de ruta personalizada para acelerar tu transformación digital con IA
              </p>
              
              <div class="space-y-8">
                @for (area of report()?.actionPlan || []; track area.area; let i = $index) {
                  <div class="border-l-4 border-blue-500 pl-6 relative">
                    <!-- Número de área -->
                    <div class="absolute -left-4 top-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {{ i + 1 }}
                    </div>
                    
                    <!-- Header del área -->
                    <div class="mb-6 mt-2">
                      <div class="flex items-center justify-between mb-2">
                        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
                          {{ area.area }}
                        </h3>
                        @if (area.priority) {
                          <span class="px-3 py-1 rounded-full text-sm font-medium" [class]="getPriorityColor(area.priority)">
                            {{ area.priority }}
                          </span>
                        }
                      </div>
                      @if (area.description) {
                        <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                          {{ area.description }}
                        </p>
                      }
                      @if (area.timeline) {
                        <div class="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span class="mr-2">📅</span>
                          <span>Timeline: {{ area.timeline }}</span>
                        </div>
                      }
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      @for (action of area.actions; track action.accion; let j = $index) {
                        <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div class="flex items-start justify-between mb-4">
                            <h4 class="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                              {{ action.accion }}
                            </h4>
                            <span class="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              Paso {{ j + 1 }}
                            </span>
                          </div>
                          
                          <p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                            {{ action.descripcion }}
                          </p>
                          
                          @if (action.recursos && action.recursos.length > 0) {
                            <div class="mb-4">
                              <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recursos necesarios:</h5>
                              <div class="flex flex-wrap gap-2">
                                @for (recurso of action.recursos; track recurso) {
                                  <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                    {{ recurso }}
                                  </span>
                                }
                              </div>
                            </div>
                          }

                          @if (action.kpis && action.kpis.length > 0) {
                            <div class="mb-4">
                              <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">KPIs a medir:</h5>
                              <div class="flex flex-wrap gap-2">
                                @for (kpi of action.kpis; track kpi) {
                                  <span class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                    {{ kpi }}
                                  </span>
                                }
                              </div>
                            </div>
                          }

                          @if (action.painPoint) {
                            <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <h5 class="text-sm font-medium text-red-800 dark:text-red-300 mb-1">⚠️ Dolor que atacamos:</h5>
                              <p class="text-sm text-red-700 dark:text-red-200">{{ action.painPoint }}</p>
                            </div>
                          }

                          @if (action.expectedOutcome) {
                            <div class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <h5 class="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">✅ Resultado esperado:</h5>
                              <p class="text-sm text-yellow-700 dark:text-yellow-200">{{ action.expectedOutcome }}</p>
                            </div>
                          }
                          
                          <!-- Timeline, competencia objetivo y dimensión ARES -->
                          <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div class="flex items-center">
                              <span class="mr-2">⏱️</span>
                              <span>{{ action.timeline || getEstimatedTime(action.accion) }}</span>
                            </div>
                            <div class="flex items-center gap-4">
                              @if (action.competencyTarget) {
                                <div class="flex items-center">
                                  <span class="mr-2">🎯</span>
                                  <span>{{ getCompetencyName(action.competencyTarget) }}</span>
                                </div>
                              }
                              @if (action.aresDimension) {
                                <div class="flex items-center">
                                  <span class="mr-2">🏗️</span>
                                  <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                    ARES: {{ action.aresDimension }}
                                  </span>
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
              
              <!-- Resumen del plan -->
              <div class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen del Plan</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ getTotalActions() }}</div>
                    <div class="text-gray-600 dark:text-gray-300">Acciones Planificadas</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ getTotalAreas() }}</div>
                    <div class="text-gray-600 dark:text-gray-300">Áreas de Mejora</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ getEstimatedTotalTime() }}</div>
                    <div class="text-gray-600 dark:text-gray-300">Tiempo Total</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 rounded-xl shadow-lg p-8 text-white">
              <h2 class="text-2xl font-bold mb-4 flex items-center text-white">
                💡 Recomendaciones Generales
              </h2>
              <div class="prose prose-lg max-w-none prose-invert">
                <p class="leading-relaxed text-white">
                  {{ report()?.executiveSummary || 'Tus recomendaciones están siendo generadas...' }}
                </p>
              </div>
            </div>

            <!-- Strengths and Weaknesses Analysis -->
            @if (report()?.strengthsAnalysis && report()?.strengthsAnalysis.length > 0) {
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Strengths -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-8">
                  <h2 class="text-2xl font-bold text-green-800 dark:text-green-300 mb-6 flex items-center">
                    💪 Fortalezas Clave
                  </h2>
                  <div class="space-y-4">
                    @for (strength of report()?.strengthsAnalysis || []; track strength.competencyId) {
                      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 class="font-semibold text-green-800 dark:text-green-300 mb-2">
                          {{ strength.competencyName }} ({{ strength.score }}/100)
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">
                          {{ strength.analysis }}
                        </p>
                      </div>
                    }
                  </div>
                </div>

                <!-- Weaknesses -->
                <div class="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl shadow-lg p-8">
                  <h2 class="text-2xl font-bold text-red-800 dark:text-red-300 mb-6 flex items-center">
                    ⚠️ Áreas de Mejora
                  </h2>
                  <div class="space-y-4">
                    @for (weakness of report()?.weaknessesAnalysis || []; track weakness.competencyId) {
                      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 class="font-semibold text-red-800 dark:text-red-300 mb-2">
                          {{ weakness.competencyName }} ({{ weakness.score }}/100)
                        </h3>
                        <p class="text-sm text-gray-700 dark:text-gray-300">
                          {{ weakness.analysis }}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Strategic Insights -->
            @if (report()?.insights && report()?.insights.length > 0) {
              <div class="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
                <h2 class="text-2xl font-bold mb-6 flex items-center">
                  🔍 Insights Estratégicos
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (insight of report()?.insights || []; track insight.title) {
                    <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div class="flex items-center mb-2">
                        <span class="text-sm font-medium px-2 py-1 bg-white/20 rounded-full mr-2">
                          {{ insight.type }}
                        </span>
                      </div>
                      <h3 class="font-semibold mb-2">{{ insight.title }}</h3>
                      <p class="text-sm text-white/90">{{ insight.description }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Next Steps -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                🚀 Próximos Pasos
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div class="text-4xl mb-4">📚</div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Explora Nuestros Cursos
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Accede a formación especializada en IA y transformación digital
                  </p>
                  <button 
                    (click)="navigateToCourses()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Cursos
                  </button>
                </div>
                
                <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div class="text-4xl mb-4">🤝</div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Consultoría Personalizada
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Obtén asesoramiento estratégico para tu organización
                  </p>
                  <button 
                    (click)="navigateToContact()"
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Contactar
                  </button>
                </div>
              </div>
            </div>

            <!-- Tarjeta OG para compartir (oculta) -->
            <div #shareCardOg style="position:absolute; left:-99999px; top:0; width:1200px; height:630px;">
              <div class="w-[1200px] h-[630px] rounded-2xl overflow-hidden relative"
                   style="background: radial-gradient(1000px 500px at 10% 10%, rgba(255,255,255,0.15), transparent), radial-gradient(900px 500px at 90% 90%, rgba(255,255,255,0.1), transparent), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)">
                <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(2px 2px at 20px 20px, #38bdf8 2px, transparent 2px), radial-gradient(2px 2px at 60px 60px, #60a5fa 2px, transparent 2px); background-size: 120px 120px;"></div>
                <div class="relative z-10 flex flex-col justify-between h-full p-16 text-white">
                  <div>
                    <div class="text-5xl font-extrabold tracking-tight mb-4">Diagnóstico de Madurez en IA</div>
                    <div class="text-xl opacity-90">Resultados personalizados de tu evaluación</div>
                  </div>
                  <div class="grid grid-cols-3 gap-6">
                    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div class="text-6xl font-black leading-none">{{ report()?.aiMaturity?.level || 'N/A' }}</div>
                      <div class="mt-2 text-sm opacity-80">Nivel Actual</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div class="text-6xl font-black leading-none">{{ (report()?.aiMaturity?.score ?? '0') }}/100</div>
                      <div class="mt-2 text-sm opacity-80">Puntuación Total</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div class="text-6xl font-black leading-none">{{ getMaturityGap() }}</div>
                      <div class="mt-2 text-sm opacity-80">Próximo Nivel</div>
                    </div>
                  </div>
                  <div class="flex items-end justify-between">
                    <div>
                      <div class="text-3xl font-bold">Sube IA</div>
                      <div class="text-lg opacity-90">Evalúa tu madurez en IA como empresa o persona</div>
                    </div>
                    <div class="text-2xl font-semibold">{{ windowOrigin }}/{{ currentLang }}/diagnostico</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Download Report and Actions -->
            <div class="text-center space-y-4">
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  (click)="downloadReport()"
                  class="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg flex items-center gap-2">
                  📄 Descargar Reporte Completo
                </button>
                <button 
                  (click)="shareReport()"
                  class="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
                  🔗 Compartir Diagnóstico
                </button>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Tu diagnóstico personalizado está listo. Compártelo con tu equipo o descárgalo para referencia futura.
              </p>
            </div>

          </div>
        } @else {
          <!-- No Results State -->
          <div class="text-center py-20">
            <div class="text-6xl mb-4">😔</div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No se encontró el diagnóstico
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-8">
              Parece que no hay un diagnóstico disponible. Intenta completar el proceso nuevamente.
            </p>
            <button 
              (click)="startNewDiagnostic()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Iniciar Nuevo Diagnóstico
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class DiagnosticResultsComponent implements OnInit {
  private router = inject(Router);
  private diagnosticsService = inject(DiagnosticsService);
  private diagnosticStateService = inject(DiagnosticStateService);
  private toastService = inject(ToastService);
  private shareService = inject(ShareService);

  @ViewChild('shareCard') shareCardRef?: ElementRef<HTMLDivElement>;
  @ViewChild('shareCardOg') shareCardOgRef?: ElementRef<HTMLDivElement>;

  windowOrigin = window?.location?.origin || 'https://subeia.tech';
  get currentLang(): string {
    const match = this.router.url.match(/^\/(\w{2})\//);
    return match ? match[1] : 'es';
  }

  report = signal<any>(null);
  leadData = signal<any>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadReport();
  }

  private async loadReport(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      // Obtener el reporte real del servicio
      const currentReport = this.diagnosticsService.getCurrentReport();
      if (currentReport) {
        console.log('📊 Reporte encontrado:', currentReport);
        this.report.set(currentReport);
      } else {
        // Intentar generar el reporte si no existe
        const diagnosticData = this.diagnosticStateService.state();
        if (diagnosticData && this.diagnosticStateService.isComplete()) {
          console.log('🔄 Generando reporte automáticamente...');
          const newReport = await this.diagnosticsService.generateReport(diagnosticData);
          if (newReport) {
            this.report.set(newReport);
          } else {
            throw new Error('No se pudo generar el reporte automáticamente');
          }
        } else {
          console.log('⚠️ No hay reporte disponible, redirigiendo al diagnóstico...');
          this.isLoading.set(false);
          this.startNewDiagnostic();
          return;
        }
      }
      
      // Obtener los datos del lead desde el estado del diagnóstico
      const diagnosticData = this.diagnosticStateService.state();
      if (diagnosticData?.lead) {
        this.leadData.set(diagnosticData.lead);
        console.log('✅ Datos del lead cargados:', diagnosticData.lead);
      } else {
        console.warn('⚠️ No hay datos del lead disponibles');
      }
    } catch (error: any) {
      console.error('❌ Error cargando el reporte:', error);
      this.error.set(error.message || 'Error desconocido al cargar el reporte');
      this.toastService.show('error', 'Error en Reporte: Ocurrió un error al generar tu reporte. Por favor, intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  retryReport(): void {
    this.loadReport();
  }


  navigateToCourses(): void {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/productos`]);
  }

  navigateToContact(): void {
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/contacto`]);
  }

  downloadReport(): void {
    this.toastService.show('info', 'Función de descarga próximamente disponible');
  }

  async shareReport(): Promise<void> {
    try {
      const el = (this.shareCardOgRef?.nativeElement || this.shareCardRef?.nativeElement);
      if (!el) { this.toastService.show('error', 'No se pudo capturar la tarjeta de resultados'); return; }
      const blob = await this.shareService.captureElementAsBlob(el, 2);

      // Mensaje estándar invitando a realizar el diagnóstico
      const msg = '🚀 Acabo de completar el Diagnóstico de Madurez en IA en Sube IA. ¡Te invito a evaluar tu empresa o como persona y descubrir tu nivel!';

      // Intentar compartir directo con Web Share (con archivo)
      const shared = await this.shareService.shareViaDevice(blob, msg);
      if (shared) return;

      // Si no hay Web Share con archivos, subimos la imagen y abrimos redes
      const imageUrl = await this.shareService.uploadAndGetUrl(blob);
      // Por accesibilidad y compatibilidad, abrimos una nueva pestaña con LinkedIn share; el usuario puede pegar el mensaje si corresponde
      this.shareService.openLinkedInShare(imageUrl);
      this.shareService.openFacebookShare(imageUrl, msg);
      this.toastService.show('success', 'Se abrió la ventana de compartir. Imagen generada automáticamente.');
    } catch (e:any) {
      console.error(e);
      this.toastService.show('error', 'No se pudo compartir automáticamente.');
    }
  }

  startNewDiagnostic(): void {
    this.diagnosticStateService.reset();
    const currentUrl = this.router.url;
    const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
    this.router.navigate([`/${languagePrefix}/diagnostico`]);
  }

  getMaturityGap(): string {
    const score = this.report()?.aiMaturity?.score;
    if (score === null || score === undefined) return 'N/A';
    
    // Calcular el próximo nivel basado en el score actual
    if (score >= 81) return 'Transformador'; // Ya es Transformador, no hay siguiente
    if (score >= 61) return 'Transformador'; // Ya es Estratégico, próximo es Transformador
    if (score >= 41) return 'Estratégico';   // Ya es Establecido, próximo es Estratégico
    if (score >= 21) return 'Establecido';   // Ya es En Desarrollo, próximo es Establecido
    return 'En Desarrollo'; // Ya es Incipiente (incluye 0), próximo es En Desarrollo
  }

  getPointsToNextLevel(): string {
    const score = this.report()?.aiMaturity?.score;
    if (score === null || score === undefined) return 'N/A';
    
    // Calcular puntos exactos necesarios para el próximo nivel
    if (score >= 81) return '0'; // Ya es Transformador, no hay siguiente
    if (score >= 61) return (81 - score).toString();  // Para llegar a Transformador (81)
    if (score >= 41) return (61 - score).toString();  // Para llegar a Estratégico (61)
    if (score >= 21) return (41 - score).toString();  // Para llegar a Establecido (41)
    return (21 - score).toString(); // Para llegar a En Desarrollo (21) - incluye score 0
  }

  getCompetencyDescription(competencyId: string): string {
    const descriptions: Record<string, string> = {
      'pensamiento-critico': 'Análisis objetivo y toma de decisiones lógicas',
      'resolucion-problemas': 'Abordar desafíos complejos con soluciones efectivas',
      'alfabetizacion-datos': 'Interpretar, analizar y comunicar información basada en datos',
      'comunicacion-efectiva': 'Transmitir ideas de manera clara y persuasiva',
      'colaboracion-equipo': 'Trabajar efectivamente en equipos diversos',
      'creatividad-innovacion': 'Generar ideas originales y soluciones innovadoras',
      'diseno-tecnologico': 'Crear soluciones tecnológicas centradas en el usuario',
      'automatizacion-agentes-ia': 'Implementar y gestionar sistemas automatizados',
      'adaptabilidad-flexibilidad': 'Ajustarse a cambios y nuevas situaciones',
      'etica-responsabilidad': 'Actuar con integridad y responsabilidad social',
      'sostenibilidad': 'Considerar el impacto ambiental y social a largo plazo',
      'aprendizaje-continuo': 'Desarrollar habilidades constantemente',
      'liderazgo-ia': 'Guiar equipos en la transformación digital'
    };
    return descriptions[competencyId] || 'Competencia clave para la transformación digital';
  }

  getHighCompetencies(): number {
    const scores = this.report()?.competencyScores || [];
    return scores.filter((c: any) => c.score >= 80).length;
  }

  getMediumCompetencies(): number {
    const scores = this.report()?.competencyScores || [];
    return scores.filter((c: any) => c.score >= 50 && c.score < 80).length;
  }

  getLowCompetencies(): number {
    const scores = this.report()?.competencyScores || [];
    return scores.filter((c: any) => c.score < 50).length;
  }

  getAverageScore(): number {
    const scores = this.report()?.competencyScores || [];
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum: number, c: any) => sum + c.score, 0);
    return Math.round(total / scores.length);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getScoreBarColor(score: number): string {
    if (score >= 80) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (score >= 40) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  }

  getLevelBadgeColor(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  getCompetencyLevel(score: number): string {
    if (score >= 90) return 'Experto';
    if (score >= 80) return 'Avanzado';
    if (score >= 60) return 'Intermedio';
    if (score >= 40) return 'Básico';
    return 'Incipiente';
  }

  getEstimatedTime(action: string): string {
    // Estimaciones basadas en el tipo de acción
    if (action.toLowerCase().includes('curso') || action.toLowerCase().includes('formación')) {
      return '2-4 semanas';
    }
    if (action.toLowerCase().includes('proyecto') || action.toLowerCase().includes('implementar')) {
      return '1-3 meses';
    }
    if (action.toLowerCase().includes('roadmap') || action.toLowerCase().includes('estratégico')) {
      return '2-6 meses';
    }
    if (action.toLowerCase().includes('análisis') || action.toLowerCase().includes('evaluación')) {
      return '1-2 semanas';
    }
    return '2-4 semanas';
  }

  getTotalActions(): number {
    const actionPlan = this.report()?.actionPlan || [];
    return actionPlan.reduce((total: number, area: any) => total + (area.actions?.length || 0), 0);
  }

  getTotalAreas(): number {
    return this.report()?.actionPlan?.length || 0;
  }

  getEstimatedTotalTime(): string {
    const totalActions = this.getTotalActions();
    if (totalActions <= 2) return '1-2 meses';
    if (totalActions <= 4) return '3-6 meses';
    if (totalActions <= 6) return '6-12 meses';
    return '12+ meses';
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baja':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getCompetencyName(competencyId: string): string {
    const competency = this.report()?.competencyScores?.find((c: any) => c.id === competencyId);
    return competency?.name || competencyId;
  }

  getPhaseStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'en progreso':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pendiente':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
}