import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule],
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
            <div class="text-center text-gray-400">
              <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
              </svg>
              <p>Gráfico de Radar ARES</p>
              <p class="text-sm">Implementar con ng2-charts</p>
            </div>
          </div>
        </div>

        <!-- Semáforo ARES -->
        <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 class="text-xl font-semibold text-white mb-4">Estado por Fase ARES</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-300">Fase 1: Fundamentos</span>
              <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F1')"></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-300">Fase 2: Desarrollo</span>
              <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F2')"></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-300">Fase 3: Optimización</span>
              <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F3')"></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-300">Fase 4: Innovación</span>
              <div class="w-4 h-4 rounded-full" [class]="getPhaseStatusClass('F4')"></div>
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
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              {{ oportunidad }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Plan de Inicio Rápido -->
      <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
        <h3 class="text-xl font-semibold text-blue-200 mb-4">Plan de Inicio Rápido</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-800/30 rounded-lg">
            <div class="text-2xl font-bold text-blue-400 mb-2">1</div>
            <h4 class="font-medium text-white mb-2">Priorizar Competencias</h4>
            <p class="text-sm text-blue-200">Enfócate en las áreas con mayor impacto</p>
          </div>
          <div class="text-center p-4 bg-blue-800/30 rounded-lg">
            <div class="text-2xl font-bold text-blue-400 mb-2">2</div>
            <h4 class="font-medium text-white mb-2">Capacitar Equipo</h4>
            <p class="text-sm text-blue-200">Invierte en formación y desarrollo</p>
          </div>
          <div class="text-center p-4 bg-blue-800/30 rounded-lg">
            <div class="text-2xl font-bold text-blue-400 mb-2">3</div>
            <h4 class="font-medium text-white mb-2">Implementar Pilotos</h4>
            <p class="text-sm text-blue-200">Comienza con proyectos pequeños</p>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          (click)="descargarPDF()"
          class="btn-primary flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Descargar PDF Completo
        </button>
        
        <button 
          (click)="agendarSesion()"
          class="btn-secondary flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Agendar Sesión de Consultoría
        </button>
      </div>

      <!-- Información de Contacto -->
      <div class="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-white mb-2">¿Necesitas Ayuda?</h3>
          <p class="text-gray-300 mb-4">
            Nuestro equipo de expertos está listo para ayudarte a implementar tu plan de transformación digital
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <div class="flex items-center text-blue-400">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <span>consultoria@subeacademia.com</span>
            </div>
            <div class="flex items-center text-blue-400">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 011.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
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
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
    
    .btn-secondary {
      @apply bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200;
    }
  `]
})
export class DiagnosticResultsComponent implements OnInit {
  private readonly diagnosticState = inject(DiagnosticStateService);
  private readonly scoringService = inject(ScoringService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Verificar que el diagnóstico esté completado
    if (!this.diagnosticState.isCompleted()) {
      this.router.navigate(['/es', 'diagnostico', 'inicio']);
    }
  }

  getOverallScore(): number {
    const aresScore = this.getAresScore();
    const competenciasScore = this.getCompetenciasScore();
    return Math.round((aresScore + competenciasScore) / 2);
  }

  getAresScore(): number {
    const aresData = this.diagnosticState.aresForm.value;
    if (!aresData) return 0;
    
    const totalItems = Object.keys(aresData).length;
    const totalScore = Object.values(aresData).reduce((sum: number, value: any) => sum + (value || 0), 0);
    return Math.round((totalScore / (totalItems * 5)) * 100);
  }

  getCompetenciasScore(): number {
    const competenciasData = this.diagnosticState.competenciasForm.value;
    if (!competenciasData) return 0;
    
    const totalItems = Object.keys(competenciasData).length;
    const totalScore = Object.values(competenciasData).reduce((sum: number, value: any) => sum + (value || 0), 0);
    return Math.round((totalScore / (totalItems * 5)) * 100);
  }

  getPhaseStatusClass(phase: string): string {
    const aresData = this.diagnosticState.aresForm.value;
    const phaseItems = this.diagnosticState.aresItems.filter(item => item.phase === phase);
    const phaseScore = phaseItems.reduce((sum, item) => {
      const value = aresData[item.id];
      return sum + (value || 0);
    }, 0);
    const avgScore = phaseScore / phaseItems.length;
    
    if (avgScore >= 4) return 'bg-green-500';
    if (avgScore >= 3) return 'bg-yellow-500';
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

  descargarPDF(): void {
    // Implementar descarga de PDF
    console.log('Descargando PDF...');
    // this.scoringService.generatePDF();
  }

  agendarSesion(): void {
    // Implementar agendamiento de sesión
    console.log('Agendando sesión de consultoría...');
    // Redirigir a formulario de contacto o calendario
  }
}
