import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui-kit/button/button';
import { SessionService } from '../../services/session.service';
import { ScoringService, ScoreResult } from '../../services/scoring.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tu Diagnóstico de Competencias en IA
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Análisis personalizado basado en tus respuestas
        </p>
      </div>

      <!-- IP-IA Score -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-12 text-white text-center">
        <h2 class="text-2xl font-bold mb-4">Índice de Preparación en IA (IP-IA)</h2>
        <div class="text-6xl font-bold mb-4">{{ Math.round(scoreResult?.ip_ia || 0) }}</div>
        <div class="text-xl mb-2">de 5.0</div>
        <div class="text-lg opacity-90">{{ getIPIADescription(scoreResult?.ip_ia || 0) }}</div>

        <!-- Share actions -->
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
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

      <!-- Subescalas -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Análisis por Competencias
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let subescala of getSubescalasArray()" 
               class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ getSubescalaName(subescala.key) }}
              </h3>
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="getBandClass(subescala.value.band)">
                {{ getBandLabel(subescala.value.band) }}
              </span>
            </div>
            
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progreso</span>
                <span>{{ Math.round(subescala.value.value * 20) }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-300"
                     [ngClass]="getProgressBarClass(subescala.value.band)"
                     [style.width.%]="subescala.value.value * 20">
                </div>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ getSubescalaExplanation(subescala.key, subescala.value.band) }}
            </p>
            
            <div class="space-y-2">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Acciones recomendadas:</h4>
              <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li *ngFor="let accion of getSubescalaActions(subescala.key)" class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  {{ accion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Competencias SUBE -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Mapa de Competencias SUBE
        </h2>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let competencia of getCompetenciasArray()" 
                 class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ getCompetenciaName(competencia.key) }}
              </span>
              <div class="flex items-center">
                <div class="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                  <div class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                       [style.width.%]="competencia.value * 20">
                  </div>
                </div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {{ Math.round(competencia.value * 20) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recomendaciones -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Tu Ruta de Desarrollo Sugerida
        </h2>
        
        <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Próximos Pasos (4-6 semanas)
              </h3>
              <ol class="space-y-3 text-gray-700 dark:text-gray-300">
                <li class="flex items-start">
                  <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <span>Módulo de Fundamentos de IA</span>
                </li>
                <li class="flex items-start">
                  <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <span>Taller de Ingeniería de Prompts</span>
                </li>
                <li class="flex items-start">
                  <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <span>Curso de Evaluación Crítica de IA</span>
                </li>
                <li class="flex items-start">
                  <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  <span>Proyecto Práctico de Aplicación</span>
                </li>
              </ol>
            </div>
            
            <div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recursos Recomendados
              </h3>
              <div class="space-y-3">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 class="font-medium text-gray-900 dark:text-white">Curso: "IA para Principiantes"</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Perfecto para tu nivel actual</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 class="font-medium text-gray-900 dark:text-white">Taller: "Prompts Efectivos"</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Mejora tu comunicación con IA</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 class="font-medium text-gray-900 dark:text-white">Proyecto: "Mi Primera App con IA"</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Aplicación práctica de lo aprendido</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <app-ui-button
          variant="primary"
          size="lg"
          (clicked)="descargarPDF()"
          class="flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Descargar PDF
        </app-ui-button>

        <app-ui-button
          variant="secondary"
          size="lg"
          (clicked)="nuevoDiagnostico()"
          class="flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nuevo Diagnóstico
        </app-ui-button>

        <app-ui-button
          variant="ghost"
          size="lg"
          (clicked)="verCursos()"
          class="flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          Ver Cursos
        </app-ui-button>
      </div>

      <!-- Información adicional -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Este diagnóstico se basa en el Framework ARES-AI© y las 13 Competencias SUBE para la era de la IA.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadosComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private scoringService = inject(ScoringService);

  scoreResult: ScoreResult | null = null;
  sessionData: any = null;

  // Exponer Math para el template
  Math = Math;

  // --- Compartir resultados (persona) ---
  private getShareLandingUrl(): string {
    return 'https://www.subeia.tech';
  }

  private getShareText(): string {
    const nombre = this.sessionData?.nombre || 'Yo';
    const ipia = Math.round((this.scoreResult?.ip_ia || 0) * 20) / 20; // 0-5 con 0.05 pasos
    return `${nombre} obtuvo un IP-IA de ${ipia}/5 en su diagnóstico de competencias en IA. Conoce tu nivel y haz el test en ${this.getShareLandingUrl()}`;
  }

  async share(): Promise<void> {
    const url = this.getShareLandingUrl();
    const text = this.getShareText();
    if (navigator && (navigator as any).share) {
      try {
        const file = await this.createShareImageFile(`mi-diagnostico-ia-${(this.sessionData?.nombre || 'persona').toString().replace(/\s+/g,'-')}.png`);
        if (file && (navigator as any).canShare?.({ files: [file] })) {
          await (navigator as any).share({ title: 'Mi Diagnóstico en IA', text, url, files: [file] });
        } else {
          await (navigator as any).share({ title: 'Mi Diagnóstico en IA', text, url });
        }
        return;
      } catch {}
    }
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    this.openCenteredPopup(shareUrl);
  }

  shareFacebook(): void {
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.getShareLandingUrl())}&quote=${encodeURIComponent(this.getShareText())}`;
    this.openCenteredPopup(fb);
  }

  shareLinkedIn(): void {
    try { navigator.clipboard?.writeText(this.getShareText()); } catch {}
    const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.getShareLandingUrl())}`;
    this.openCenteredPopup(li);
    alert('El texto con tus resultados fue copiado al portapapeles. Pégalo en la publicación de LinkedIn.');
  }

  async shareInstagram(): Promise<void> {
    // Intento Web Share con archivo para permitir enviar a Historias desde móviles
    try {
      const file = await this.createShareImageFile(`mi-diagnostico-ia-${(this.sessionData?.nombre || 'persona').toString().replace(/\s+/g,'-')}.png`);
      const text = this.getShareText();
      if (file && (navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], text, title: 'Mi Diagnóstico en IA' });
        return;
      }
    } catch {}

    // Fallback: compositor de historias + descarga + copiar texto
    try { await navigator.clipboard?.writeText(this.getShareText()); } catch {}
    await this.downloadShareImage();
    window.open('https://www.instagram.com/create/story', '_blank');
    alert('Abrimos Historias de Instagram. La imagen se descargó y el texto fue copiado al portapapeles. Súbela como historia y pega el texto.');
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
    const nombre = (this.sessionData?.nombre || 'diagnostico').replace(/\s+/g, '-');
    link.download = `mi-diagnostico-ia-${nombre}.png`;
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
    const width = 1200; const height = 630;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Fondo
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#9333ea');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);

    // Contenedor
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(40, 40, width - 80, height - 80);

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('Índice de Preparación en IA (IP-IA)', 80, 150);

    // Puntaje
    const ipia = Math.round((this.scoreResult?.ip_ia || 0) * 100) / 100; // 2 decimales
    ctx.font = 'bold 180px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(String(ipia), 80, 400);
    ctx.font = 'bold 48px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('de 5.0', 80, 460);

    // Descripción
    const desc = this.getIPIADescription(this.scoreResult?.ip_ia || 0);
    ctx.font = 'normal 36px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(desc, 80, 520);

    // URL
    const url = this.getShareLandingUrl();
    ctx.font = 'bold 34px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText(url.replace(/^https?:\/\//, ''), 80, height - 80);

    return canvas.toDataURL('image/png');
  }

  ngOnInit(): void {
    this.loadSessionData();
    this.calculateResults();
  }

  private loadSessionData(): void {
    this.sessionData = this.sessionService.currentSessionData();
  }

  private calculateResults(): void {
    if (this.sessionData) {
      const responses = this.sessionService.currentResponses();
      this.scoreResult = this.scoringService.calculateScore(responses, this.sessionData.group);
    }
  }

  getSubescalasArray(): Array<{ key: string; value: any }> {
    if (!this.scoreResult) return [];
    return Object.entries(this.scoreResult.subescalas).map(([key, value]) => ({ key, value }));
  }

  getCompetenciasArray(): Array<{ key: string; value: number }> {
    if (!this.scoreResult) return [];
    return Object.entries(this.scoreResult.competencias).map(([key, value]) => ({ key, value }));
  }

  getSubescalaName(key: string): string {
    const names: Record<string, string> = {
      conocimiento: 'Conocimiento Técnico',
      indagacion_critica: 'Indagación Crítica',
      etica_seguridad: 'Ética y Seguridad',
      actitudes_emociones: 'Actitudes y Emociones',
      conocimiento_tecnico: 'Conocimiento Técnico',
      prompting: 'Ingeniería de Prompts',
      evaluacion_critica: 'Evaluación Crítica',
      aplicacion_innovadora: 'Aplicación e Innovación',
      etica_regulacion: 'Ética y Regulación'
    };
    return names[key] || key;
  }

  getCompetenciaName(key: string): string {
    const names: Record<string, string> = {
      pensamiento_analitico_innovacion: 'Pensamiento Analítico e Innovación',
      aprendizaje_activo_continuo: 'Aprendizaje Activo Continuo',
      resolucion_problemas_complejos: 'Resolución de Problemas Complejos',
      pensamiento_critico_analisis: 'Pensamiento Crítico y Análisis',
      creatividad_originalidad: 'Creatividad y Originalidad',
      competencias_digitales: 'Competencias Digitales',
      programacion_diseno_tec: 'Programación y Diseño Técnico',
      liderazgo_influencia: 'Liderazgo e Influencia',
      resiliencia_adaptabilidad: 'Resiliencia y Adaptabilidad',
      pensamiento_sistemico: 'Pensamiento Sistémico',
      inteligencia_emocional_empatia: 'Inteligencia Emocional y Empatía',
      comunicacion_colaboracion: 'Comunicación y Colaboración',
      conciencia_etica_responsabilidad: 'Conciencia Ética y Responsabilidad'
    };
    return names[key] || key;
  }

  getBandLabel(band: string): string {
    const labels: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      sin_datos: 'Sin datos'
    };
    return labels[band] || band;
  }

  getBandClass(band: string): string {
    const classes: Record<string, string> = {
      bajo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      alto: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      sin_datos: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return classes[band] || 'bg-gray-100 text-gray-800';
  }

  getProgressBarClass(band: string): string {
    const classes: Record<string, string> = {
      bajo: 'bg-red-500',
      medio: 'bg-yellow-500',
      alto: 'bg-green-500',
      sin_datos: 'bg-gray-400'
    };
    return classes[band] || 'bg-gray-400';
  }

  getSubescalaExplanation(key: string, band: string): string {
    if (!this.scoreResult?.explicaciones[key]) return '';
    return this.scoreResult.explicaciones[key].texto;
  }

  getSubescalaActions(key: string): string[] {
    if (!this.scoreResult?.explicaciones[key]) return [];
    return this.scoreResult.explicaciones[key].acciones;
  }

  getIPIADescription(score: number): string {
    if (score >= 4) return 'Excelente nivel de preparación en IA';
    if (score >= 3) return 'Buen nivel de preparación en IA';
    if (score >= 2) return 'Nivel básico de preparación en IA';
    return 'Nivel inicial de preparación en IA';
  }

  descargarPDF(): void {
    // En un caso real, esto generaría y descargaría un PDF
    console.log('Generando PDF...');
    alert('Funcionalidad de PDF en desarrollo');
  }

  nuevoDiagnostico(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/es/diagnostico-persona/edad']);
  }

  verCursos(): void {
    this.router.navigate(['/productos']);
  }
}
