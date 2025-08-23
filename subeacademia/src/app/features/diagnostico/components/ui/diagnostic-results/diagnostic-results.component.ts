import { Component, OnInit, inject, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { ScoringService } from '../../../services/scoring.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';
import { DiagnosticReport } from '../../../data/report.model';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { PdfService } from '../../../services/pdf.service';
import { SemaforoAresComponent } from '../semaforo-ares.component';
import { CompetencyBarChartComponent } from '../competency-bar-chart/competency-bar-chart.component';
import { GeneratingReportLoaderComponent } from '../generating-report-loader/generating-report-loader.component';
import { AnimationService } from '../../../../../core/services/animation.service';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { COMPETENCIAS } from '../../../data/competencias';
import { SocialShareModalComponent } from '../social-share-modal/social-share-modal.component';
import { ToastService } from '../../../../../core/ui/toast/toast.service';

@Component({
  selector: 'app-diagnostic-results',
  standalone: true,
  imports: [CommonModule, SemaforoAresComponent, CompetencyBarChartComponent, GeneratingReportLoaderComponent, BaseChartDirective, SocialShareModalComponent],
  templateUrl: './diagnostic-results.component.html',
  styleUrls: ['./diagnostic-results.component.css', './diagnostic-results.print.css']
})
export class DiagnosticResultsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('resultsContainer') resultsContainer!: ElementRef;
  
  private stateService = inject(DiagnosticStateService);
  private scoringService = inject(ScoringService);
  private generativeAiService = inject(GenerativeAiService);
  private diagnosticsService = inject(DiagnosticsService);
  private pdfService = inject(PdfService);
  private animationService = inject(AnimationService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  scores: any;
  report: DiagnosticReport | null = null;
  isLoadingReport = true;
  loadingError = false;
  pdfUrl: string | null = null;
  isGeneratingPdf = false;
  isGeneratingReport = false;

  // Datos del gráfico radar
  public radarChartData!: ChartConfiguration<'radar'>['data'];
  public competencyChartData?: ChartConfiguration<'bar'>['data'];
  private finalScores: number[] = [];
  private finalLabels: string[] = [];

  showShareModal = false;

  ngOnInit(): void {
    console.log('🚀 DiagnosticResultsComponent.ngOnInit() iniciado');
    
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        // Modo sólo lectura desde Firestore por ID
        this.diagnosticsService.getById(id).subscribe((doc: any) => {
          try {
            const diagnosticData = doc?.diagnosticData || doc?.form || {};
            const scores = doc?.scores || null;
            if (scores) {
              this.scores = scores;
            } else {
              this.scores = {
                ares: this.scoringService.computeAresScore(diagnosticData),
                competencias: this.scoringService.computeCompetencyScores(diagnosticData)
              } as any;
            }
            this.prepareRadarChartData();
            this.report = doc?.report || null;
            this.isGeneratingReport = false;
            this.isLoadingReport = false;
          } catch (e) {
            console.error('Error procesando doc diagnóstico:', e);
            this.loadingError = true; this.isLoadingReport = false; this.isGeneratingReport = false;
          }
        });
        return;
      }
      const diagnosticData = this.stateService.getDiagnosticData();
      console.log('📊 Datos del diagnóstico completos:', diagnosticData);
      console.log('📊 Datos de competencias:', diagnosticData.competencias);
      console.log('📊 Datos ARES:', diagnosticData.ares);
      
      // 1. Calcula y muestra los scores inmediatamente.
      const ares = this.scoringService.computeAresScore(diagnosticData);
      const competencias = this.scoringService.computeCompetencyScores(diagnosticData);
      this.scores = { ares, competencias };
      
      console.log('📈 Scores calculados:', this.scores);
      console.log('📈 Scores ARES:', this.scores.ares);
      console.log('📈 Scores competencias:', this.scores.competencias);
      
      // Verificar el formato de los datos de competencias
      if (Array.isArray(this.scores.competencias)) {
        console.log('📊 Formato de competencias: ARRAY');
        this.scores.competencias.forEach((comp: any, index: number) => {
          console.log(`📊 Competencia ${index}:`, comp);
        });
      } else {
        console.log('📊 Formato de competencias: OBJETO');
        console.log('📊 Claves de competencias:', Object.keys(this.scores.competencias || {}));
      }

      // 2. Prepara los datos del gráfico radar
      this.prepareRadarChartData();

      // 3. Forzar la detección de cambios para los componentes hijos
      setTimeout(() => {
        console.log('🔄 Forzando detección de cambios para componentes hijos');
        console.log('🔄 Estado final de scores:', this.scores);
        console.log('🔄 Llamando a competencyScoresForChart:', this.competencyScoresForChart);
        console.log('🔄 Llamando a aresDataForSemaforo:', this.aresDataForSemaforo);
        this.scores = { ...this.scores };
      }, 200);

      // 4. Activar loader y llamar a la IA para generar el reporte detallado.
      this.isGeneratingReport = true;
      this.generateReport(diagnosticData);
      
    } catch (error) {
      console.error('❌ Error al inicializar resultados:', error);
      this.loadingError = true;
      this.isLoadingReport = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scores'] && this.scores) {
      this.prepareChartData();
    }
  }

  ngAfterViewInit(): void {
    // Animar el número del puntaje final
    if (this.scores?.ares?.promedio !== undefined) {
      this.animationService.countUp('#total-score', this.scores.ares.promedio);
    }

    // Animar la aparición de elementos en secuencia
    setTimeout(() => {
      this.animationService.cascadeIn([
        '.diagnostic-results-container h1',
        '.diagnostic-results-container .grid',
        '.diagnostic-results-container section'
      ], 300);
    }, 500);

    // Animar la aparición del gráfico radar
    setTimeout(() => {
      this.animateChart();
    }, 2000);
  }

  private prepareChartData(): void {
    if (!this.scores?.competencias) return;

    // Extrae los labels y los datos de tu `scores`
    const labels = Object.keys(this.scores.competencias);
    const finalScores = Object.values(this.scores.competencias) as number[];

    this.radarChartData = {
      labels: labels,
      datasets: [{
        data: finalScores,
        label: 'Resultado',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }]
    };

    // Preparar datos para gráfico de barras horizontal
    this.competencyChartData = {
      labels: labels,
      datasets: [
        {
          data: finalScores,
          label: 'Competencias (%)',
          backgroundColor: finalScores.map(v => this.getBarColor(v)),
          borderWidth: 0
        }
      ]
    };

    // Llama a las animaciones después de que los datos estén listos
    setTimeout(() => this.animateResults(), 100);
  }

  private prepareRadarChartData(): void {
    if (!this.scores?.competencias) return;

    console.log('📊 Scores de competencias recibidos:', this.scores.competencias);

    // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
    if (Array.isArray(this.scores.competencias)) {
      // Obtener los nombres de las competencias usando COMPETENCIAS
      const competencyEntries = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        return [competency?.nameKey || comp.competenciaId, comp.puntaje];
      });

      this.finalLabels = competencyEntries.map(([name]: [string, any]) => name);
      this.finalScores = competencyEntries.map(([, score]: [string, any]) => {
        const scoreValue = typeof score === 'number' ? score : 0;
        return scoreValue;
      });
    } else {
      // Fallback para formato de objeto
      const competencyEntries = Object.entries(this.scores.competencias);
      this.finalLabels = competencyEntries.map(([name]) => name);
      this.finalScores = competencyEntries.map(([, score]) => {
        const scoreValue = typeof score === 'number' ? score : 0;
        return scoreValue;
      });
    }

    console.log('📊 Datos del gráfico radar preparados:', {
      labels: this.finalLabels,
      scores: this.finalScores
    });

    // INICIALIZA EL GRÁFICO CON LOS DATOS REALES DEL DIAGNÓSTICO
    this.radarChartData = {
      labels: this.finalLabels,
      datasets: [{
        data: [...this.finalScores], // Usar los scores reales, no ceros
        label: 'Puntaje de Competencias',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }]
    };

    // Además preparar chartData para barras
    this.competencyChartData = {
      labels: [...this.finalLabels],
      datasets: [
        {
          data: [...this.finalScores],
          label: 'Competencias (%)',
          backgroundColor: this.finalScores.map(v => this.getBarColor(v)),
          borderWidth: 0
        }
      ]
    };

    console.log('📊 Gráfico radar inicializado con datos:', this.radarChartData);
  }

  private animateResults(): void {
    // Animación de conteo para el puntaje total
    if (this.scores?.ares?.promedio !== undefined) {
      this.animationService.countUp('#total-score', this.scores.ares.promedio);
    }

    // Animación de aparición para el gráfico
    const anime = (window as any).anime;
    if (anime) {
      anime({
        targets: '#radar-chart-container',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1200,
        easing: 'easeOutExpo'
      });
    }
  }

  animateChart(): void {
    if (!this.finalScores.length) return;

    console.log('🎬 Iniciando animación del gráfico radar...');

    // Crear una copia de los scores finales para la animación
    const scoresCopy = [...this.finalScores];
    
    // Inicializar datos de animación en 0
    const animatedData = scoresCopy.map(() => 0);

    // Usar anime.js para animar los datos
    const anime = (window as any).anime;
    if (anime) {
      anime({
        targets: animatedData,
        // Animar desde 0 hasta los valores finales
        ...scoresCopy.reduce((acc, val, i) => ({ ...acc, [i]: val }), {}),
        easing: 'easeInOutExpo',
        duration: 2000,
        round: 1,
        update: () => {
          // En cada frame de la animación, actualizamos los datos del gráfico
          this.radarChartData.datasets[0].data = [...animatedData];
          
          // Forzar la actualización del gráfico
          this.radarChartData = { ...this.radarChartData };
        }
      });
    } else {
      console.warn('⚠️ anime.js no está disponible, usando fallback');
      // Fallback: mostrar directamente los scores finales
      setTimeout(() => {
        this.radarChartData.datasets[0].data = [...this.finalScores];
        this.radarChartData = { ...this.radarChartData };
      }, 500);
    }
  }

  private generateReport(diagnosticData: any): void {
    console.log('🤖 Iniciando generación del reporte con Gemini...');
    this.isLoadingReport = true;
    this.loadingError = false;
    
    // Identificar la competencia más débil para el CTA dinámico
    const weakestCompetency = this.identifyWeakestCompetency();
    const ctaPrompt = this.generateCTAPrompt(weakestCompetency);
    
    this.generativeAiService.generateActionPlan(diagnosticData, this.scores, ctaPrompt)
      .subscribe({
        next: (report) => {
          console.log('✅ Reporte generado con Gemini:', report);
          if (report) {
            this.report = report;
            // 3. Guarda el reporte en Firestore.
            this.diagnosticsService.saveDiagnosticWithReport(report, this.scores, diagnosticData).then(docRef => {
              console.log('💾 Reporte guardado en Firestore:', docRef);
            }).catch(error => {
              console.warn('⚠️ No se pudo guardar en Firestore:', error);
            });
          } else {
            console.error('❌ No se pudo generar el reporte con Gemini');
            this.loadingError = true;
          }
          this.isLoadingReport = false;
          this.isGeneratingReport = false;
        },
        error: (error) => {
          console.error('❌ Error al generar reporte con Gemini:', error);
          this.loadingError = true;
          this.isLoadingReport = false;
          this.isGeneratingReport = false;
        }
      });
  }

  private identifyWeakestCompetency(): { name: string, score: number } | null {
    if (!this.scores?.competencias) return null;
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      const competenciesArray = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        return {
          name: competency?.nameKey || comp.competenciaId,
          score: comp.puntaje || 0
        };
      });
      
      if (competenciesArray.length === 0) return null;
      
      // Encontrar la competencia con el puntaje más bajo
      const weakest = competenciesArray.reduce((min: any, current: any) => {
        return current.score < min.score ? current : min;
      });
      
      console.log('🎯 Competencia más débil identificada:', weakest);
      return weakest;
    } else {
      // Fallback para formato de objeto
      const competenciesArray = Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0
      }));
      
      if (competenciesArray.length === 0) return null;
      
      // Encontrar la competencia con el puntaje más bajo
      const weakest = competenciesArray.reduce((min: any, current: any) => {
        return current.score < min.score ? current : min;
      });
      
      console.log('🎯 Competencia más débil identificada:', weakest);
      return weakest;
    }
  }

  private generateCTAPrompt(weakestCompetency: { name: string, score: number } | null): string {
    if (!weakestCompetency) return '';
    
    // Determinar el tipo de producto recomendado basado en la competencia
    let productType = 'curso';
    let productName = 'curso especializado';
    
    if (weakestCompetency.score < 30) {
      productType = 'asesoría';
      productName = 'asesoría personalizada';
    } else if (weakestCompetency.score < 50) {
      productType = 'certificación';
      productName = 'programa de certificación';
    }
    
    const ctaPrompt = `
      IMPORTANTE: Al final del plan de acción, incluye una recomendación específica para una ${productName} 
      relacionada con "${weakestCompetency.name}" que ayude a mejorar esta competencia. 
      
      El CTA debe ser convincente y específico, mencionando que esta ${productName} acelerará significativamente 
      el proceso de mejora en esta área crítica.
      
      Formato sugerido: "Para acelerar tu desarrollo en ${weakestCompetency.name}, te recomendamos encarecidamente 
      nuestra ${productName} [Nombre del Producto], diseñada específicamente para fortalecer esta competencia clave."
    `;
    
    console.log('📝 Prompt de CTA generado:', ctaPrompt);
    return ctaPrompt;
  }

  async generatePdf(): Promise<void> {
    if (!this.report || !this.scores) {
      console.error('❌ No hay reporte o scores para generar PDF');
      this.toastService.error('No hay datos suficientes para generar el PDF.');
      return;
    }

    try {
      this.isGeneratingPdf = true;
      console.log('�� Iniciando generación de PDF...');

      // Esperar un momento para asegurar que las animaciones del gráfico hayan terminado
      setTimeout(async () => {
        if (this.resultsContainer?.nativeElement && this.report) {
          // Generar el PDF
          await this.pdfService.generateDiagnosticReport(
            this.report,
            this.scores,
            this.resultsContainer.nativeElement
          );
          this.toastService.success('PDF generado y descargado correctamente.');
          console.log('✅ PDF generado exitosamente');
        } else {
          console.error('❌ No se encontró el contenedor de resultados');
          this.toastService.error('No se encontró el contenido para generar el PDF.');
        }
        this.isGeneratingPdf = false;
      }, 2500); // Esperar 2.5 segundos para que las animaciones terminen

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      this.toastService.error('Error al generar el PDF. Intenta nuevamente.');
      this.isGeneratingPdf = false;
    }
  }

  retryGeneration(): void {
    console.log('🔄 Reintentando generación del reporte...');
    const diagnosticData = this.stateService.getDiagnosticData();
    this.generateReport(diagnosticData);
  }

  compartirResultados(): void {
    this.showShareModal = true;
  }

  onShareModalClose(): void {
    this.showShareModal = false;
  }

  onShareResults(platforms: string[]): void {
    console.log('Compartiendo en plataformas:', platforms);
    
    // Aquí puedes implementar la lógica específica para cada plataforma
    platforms.forEach(platform => {
      switch (platform) {
        case 'linkedin':
          this.shareOnLinkedIn();
          break;
        case 'facebook':
          this.shareOnFacebook();
          break;
        case 'instagram':
          this.shareOnInstagram();
          break;
        case 'tiktok':
          this.shareOnTikTok();
          break;
      }
    });
    
    this.showShareModal = false;
  }

  private shareOnLinkedIn(): void {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Resultados de mi diagnóstico de IA - SubeAcademia');
    const summary = encodeURIComponent('He completado mi diagnóstico de competencias en IA. ¡Descubre tus fortalezas!');
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    window.open(linkedInUrl, '_blank');
  }

  private shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent('He completado mi diagnóstico de competencias en IA. ¡Descubre tus fortalezas!');
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    window.open(facebookUrl, '_blank');
  }

  private shareOnInstagram(): void {
    // Instagram no tiene API de compartir directa, mostrar instrucciones
    alert('Para compartir en Instagram:\n1. Toma una captura de pantalla de tus resultados\n2. Compártela en tu historia o feed\n3. Agrega el hashtag #SubeAcademia');
  }

  private shareOnTikTok(): void {
    // TikTok no tiene API de compartir directa, mostrar instrucciones
    alert('Para compartir en TikTok:\n1. Toma una captura de pantalla de tus resultados\n2. Crea un video creativo\n3. Agrega el hashtag #SubeAcademia');
  }

  // Getters para los datos de los gráficos
  get competencyScoresForChart(): Array<{name: string, score: number}> {
    console.log('🔍 GETTER competencyScoresForChart ejecutado');
    const result = this.getCompetencyScoresForChart();
    console.log('🔍 GETTER competencyScoresForChart retorna:', result);
    return result;
  }

  get aresDataForSemaforo(): Record<string, any> {
    return this.getAresDataForSemaforo();
  }

  // Método para convertir datos de competencias al formato del gráfico de barras
  getCompetencyScoresForChart(): Array<{name: string, score: number}> {
    console.log('🔍 getCompetencyScoresForChart() llamado - INICIO');
    console.log('🔍 Estado actual de scores:', this.scores);
    
    if (!this.scores?.competencias) {
      console.warn('⚠️ No hay scores de competencias disponibles');
      return [];
    }
    
    console.log('🔍 Obteniendo scores para gráfico de barras:', this.scores.competencias);
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      const result = this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        const score = comp.puntaje || 0;
        const name = competency?.nameKey || comp.competenciaId;
        console.log(`📊 Competencia ${comp.competenciaId}: ${name} = ${score} (nivel: ${comp.nivel})`);
        return {
          name: name,
          score: score
        };
      });
      
      console.log('📈 Scores formateados para gráfico de barras:', result);
      return result;
    } else {
      // Fallback para formato de objeto
      const result = Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0
      }));
      
      console.log('📈 Scores formateados para gráfico de barras (fallback):', result);
      return result;
    }
  }

  // Método para obtener datos ARES en el formato correcto para el semáforo
  getAresDataForSemaforo(): Record<string, any> {
    console.log('🔍 getAresDataForSemaforo() llamado');
    console.log('🔍 Estado actual de scores:', this.scores);
    
    if (!this.scores?.ares) {
      console.warn('⚠️ No hay scores ARES disponibles');
      return {};
    }
    
    console.log('🔍 Obteniendo datos ARES para semáforo:', this.scores.ares);
    
    // Mapear las dimensiones ARES a las fases del semáforo
    const aresData: Record<string, any> = {};
    
    // F1 - Preparación: datos, talento, gobernanza
    if (this.scores.ares.datos || this.scores.ares.talento || this.scores.ares.gobernanza) {
      const scores = [this.scores.ares.datos, this.scores.ares.talento, this.scores.ares.gobernanza].filter(s => s !== undefined);
      aresData['F1'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F1 - Preparación: scores=${scores}, promedio=${aresData['F1'].score}`);
    }
    
    // F2 - Diseño: valor, etica, riesgos, transparencia
    if (this.scores.ares.valor || this.scores.ares.etica || this.scores.ares.riesgos || this.scores.ares.transparencia) {
      const scores = [this.scores.ares.valor, this.scores.ares.etica, this.scores.ares.riesgos, this.scores.ares.transparencia].filter(s => s !== undefined);
      aresData['F2'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F2 - Diseño: scores=${scores}, promedio=${aresData['F2'].score}`);
    }
    
    // F3 - Desarrollo: tecnologia, integracion, capacidad
    if (this.scores.ares.tecnologia || this.scores.ares.integracion || this.scores.ares.capacidad) {
      const scores = [this.scores.ares.tecnologia, this.scores.ares.integracion, this.scores.ares.capacidad].filter(s => s !== undefined);
      aresData['F3'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F3 - Desarrollo: scores=${scores}, promedio=${aresData['F3'].score}`);
    }
    
    // F4 - Operación: operacion, seguridad, cumplimiento
    if (this.scores.ares.operacion || this.scores.ares.seguridad || this.scores.ares.cumplimiento) {
      const scores = [this.scores.ares.operacion, this.scores.ares.seguridad, this.scores.ares.cumplimiento].filter(s => s !== undefined);
      aresData['F4'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F4 - Operación: scores=${scores}, promedio=${aresData['F4'].score}`);
    }
    
    // F5 - Escalamiento: adopcion, sostenibilidad
    if (this.scores.ares.adopcion || this.scores.ares.sostenibilidad) {
      const scores = [this.scores.ares.adopcion, this.scores.ares.sostenibilidad].filter(s => s !== undefined);
      aresData['F5'] = {
        score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        total: 100,
        items: []
      };
      console.log(`📊 F5 - Escalamiento: scores=${scores}, promedio=${aresData['F5'].score}`);
    }
    
    // Si no hay datos mapeados, crear fases por defecto
    if (Object.keys(aresData).length === 0) {
      console.log('⚠️ No hay datos ARES mapeados, creando fases por defecto');
      ['F1', 'F2', 'F3', 'F4', 'F5'].forEach(phase => {
        aresData[phase] = {
          score: 0,
          total: 100,
          items: []
        };
      });
    }
    
    console.log('📈 Datos ARES formateados para semáforo:', aresData);
    return aresData;
  }

  // Métodos auxiliares para el nuevo diseño
  getTopCompetencies(): Array<{name: string, score: number}> {
    if (!this.scores?.competencias) return [];
    
    if (Array.isArray(this.scores.competencias)) {
      // computeCompetencyScores devuelve un array de objetos con competenciaId, puntaje, nivel
      return this.scores.competencias.map((comp: any) => {
        const competency = COMPETENCIAS.find((c: any) => c.id === comp.competenciaId);
        return {
          name: competency?.nameKey || comp.competenciaId,
          score: comp.puntaje || 0
        };
      }).sort((a: any, b: any) => b.score - a.score).slice(0, 4);
    } else {
      // Fallback para formato de objeto
      return Object.entries(this.scores.competencias).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0
      })).sort((a, b) => b.score - a.score).slice(0, 4);
    }
  }

  getAresPhases(): Array<{name: string, score: number}> {
    if (!this.scores?.ares) return [];
    
    return Object.entries(this.scores.ares)
      .filter(([key]) => key !== 'promedio')
      .map(([name, score]) => ({ 
        name, 
        score: typeof score === 'number' ? score : 0 
      }))
      .sort((a, b) => b.score - a.score);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getScoreColorClass(score: number): string {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  }

  getScoreDescription(score: number): string {
    if (score >= 80) return 'Excelente - Nivel avanzado';
    if (score >= 60) return 'Bueno - Nivel intermedio';
    if (score >= 40) return 'Regular - Necesita mejora';
    return 'Crítico - Requiere atención inmediata';
  }

  getAresScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getAresStatusColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Método para descargar el plan completo
  async downloadPlan(): Promise<void> {
    if (!this.report || !this.scores) {
      console.error('❌ No hay reporte o scores para descargar');
      return;
    }

    try {
      console.log('📥 Iniciando descarga del plan...');
      
      // Crear el contenido del plan
      const planContent = this.generatePlanContent();
      
      // Crear y descargar el archivo
      const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plan-accion-ia-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Plan descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar el plan:', error);
      alert('Error al descargar el plan. Por favor, intenta de nuevo.');
    }
  }

  // Método para generar datos de prueba
  generateTestData(): void {
    console.log('🧪 Generando datos de prueba...');
    
    // Generar datos ARES de prueba
    const testAresData = {
      datos: 4,
      talento: 3,
      gobernanza: 4,
      valor: 3,
      etica: 4,
      riesgos: 3,
      transparencia: 4,
      tecnologia: 3,
      integracion: 4,
      capacidad: 3,
      operacion: 4,
      seguridad: 3,
      cumplimiento: 4,
      adopcion: 3,
      sostenibilidad: 4
    };
    
    // Generar datos de competencias de prueba
    const testCompetenciasData = {
      pensamiento_critico: 4,
      resolucion_problemas: 3,
      alfabetizacion_datos: 4,
      comunicacion_efectiva: 3,
      colaboracion_equipo: 4,
      creatividad_innovacion: 3,
      diseno_tecnologico: 4,
      automatizacion_ia: 3,
      seguridad_privacidad: 4,
      etica_responsabilidad: 3,
      sostenibilidad: 4,
      aprendizaje_continuo: 3,
      liderazgo_ia: 4
    };
    
    // Crear datos de diagnóstico de prueba
    const testDiagnosticData = {
      contexto: {
        industria: 'Tecnología',
        tamano: 'Mediana',
        presupuesto: 'Alto'
      },
      ares: testAresData,
      competencias: testCompetenciasData,
      objetivo: 'Mejorar la madurez en IA' as any,
      lead: {
        nombre: 'Usuario de Prueba',
        email: 'test@example.com',
        telefono: '+1234567890',
        aceptaComunicaciones: true
      },
      segmento: 'empresa' as any
    } as any;
    
    console.log('🧪 Datos de prueba generados:', testDiagnosticData);
    
    // Calcular scores con los datos de prueba
    const ares = this.scoringService.computeAresScore(testDiagnosticData);
    const competencias = this.scoringService.computeCompetencyScores(testDiagnosticData);
    this.scores = { ares, competencias };
    
    console.log('🧪 Scores calculados con datos de prueba:', this.scores);
    console.log('🧪 Scores ARES:', ares);
    console.log('🧪 Scores competencias:', competencias);
    console.log('🧪 Tipo de competencias:', typeof competencias, Array.isArray(competencias));
    
    if (Array.isArray(competencias)) {
      competencias.forEach((comp: any, index: number) => {
        console.log(`🧪 Competencia ${index}:`, comp);
      });
    }
    
    // Preparar datos del gráfico radar
    this.prepareRadarChartData();
    
    // Forzar actualización de componentes hijos
    setTimeout(() => {
      console.log('🔄 Forzando actualización con datos de prueba');
      console.log('🔄 Estado final de scores:', this.scores);
      console.log('🔄 Llamando a competencyScoresForChart:', this.competencyScoresForChart);
      this.scores = { ...this.scores };
    }, 100);
  }

  private generatePlanContent(): string {
    if (!this.report || !this.scores) return '';
    
    let content = 'PLAN DE ACCIÓN ESTRATÉGICO - DIAGNÓSTICO DE IA\n';
    content += '================================================\n\n';
    
    // Información del diagnóstico
    content += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
    content += `Puntaje Total ARES: ${this.scores.ares?.total || 0}/100\n\n`;
    
    // Resumen ejecutivo
    if (this.report.resumen_ejecutivo) {
      content += 'RESUMEN EJECUTIVO:\n';
      content += '-------------------\n';
      content += this.report.resumen_ejecutivo + '\n\n';
    }
    
    // Plan de acción
    if (this.report.plan_de_accion && this.report.plan_de_accion.length > 0) {
      content += 'PLAN DE ACCIÓN:\n';
      content += '----------------\n';
      this.report.plan_de_accion.forEach((seccion, index) => {
        content += `${index + 1}. ${seccion.area_mejora}\n`;
        content += `   Problema: ${seccion.descripcion_problema}\n`;
        content += `   Acciones recomendadas:\n`;
        seccion.acciones_recomendadas.forEach((accion, accionIndex) => {
          content += `     ${accionIndex + 1}. ${accion.accion}\n`;
          content += `        ${accion.detalle}\n`;
        });
        content += '\n';
      });
    }
    
    // Análisis ARES
    if (this.report.analisis_ares && this.report.analisis_ares.length > 0) {
      content += 'ANÁLISIS ARES:\n';
      content += '---------------\n';
      this.report.analisis_ares.forEach((seccion, index) => {
        content += `${index + 1}. ${seccion.dimension}: ${seccion.puntaje}/100\n`;
        content += `   ${seccion.analisis}\n\n`;
      });
    }
    
    content += '================================================\n';
    content += 'Generado por Sube Academia - Herramienta de Diagnóstico de IA\n';
    content += 'Contacto: +56 9 8228 1888 | WhatsApp: +56 9 8228 1888\n';
    
    return content;
  }

  // =====================
  // Insights y Score General
  // =====================
  getGeneralScore(): number {
    if (!this.scores) return 0;

    // Promedio de competencias
    let competenciasAvg = 0;
    if (this.scores.competencias) {
      if (Array.isArray(this.scores.competencias)) {
        const values = this.scores.competencias.map((c: any) => typeof c.puntaje === 'number' ? c.puntaje : 0);
        competenciasAvg = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      } else {
        const values = Object.values(this.scores.competencias).map((v: any) => typeof v === 'number' ? v : 0) as number[];
        competenciasAvg = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      }
    }

    // Promedio ARES
    let aresAvg = 0;
    if (this.scores.ares) {
      const entries = Object.entries(this.scores.ares).filter(([key]) => key !== 'promedio');
      const values = entries.map(([, v]) => typeof v === 'number' ? v : 0) as number[];
      aresAvg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    return Math.round((competenciasAvg + aresAvg) / 2);
  }

  private getBarColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  }

  getQuickInsights(): Array<{ type: string; title: string; description: string }>{
    const insights: Array<{ type: string; title: string; description: string }> = [];

    if (this.scores?.competencias) {
      const topComp = this.getTopCompetencies()[0];
      if (topComp && topComp.score >= 80) {
        insights.push({
          type: 'success',
          title: 'Fortaleza Identificada',
          description: `${topComp.name} es tu área más fuerte`
        });
      }
    }

    if (this.scores?.ares) {
      const lowestPhase = this.getAresPhases().sort((a, b) => a.score - b.score)[0];
      if (lowestPhase && lowestPhase.score < 60) {
        insights.push({
          type: 'warning',
          title: 'Área de Oportunidad',
          description: `${lowestPhase.name} necesita atención prioritaria`
        });
      }
    }

    insights.push({
      type: 'info',
      title: 'Próximo Paso',
      description: 'Revisa el plan de acción completo para priorizar tareas'
    });

    return insights;
  }

  getInsightBorderColor(type: string): string {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  }

  getInsightDotColor(type: string): string {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  showDetailedInsights(): void {
    // Placeholder para interacción futura (modal o navegación)
    console.log('Mostrando insights detallados...');
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }
}
