import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { GenerativeAiService } from '../../../../../core/ai/generative-ai.service';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-objetivo.component.html',
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .btn-primary {
      @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg;
    }

    .form-group {
      @apply space-y-2;
    }

    textarea {
      @apply font-sans;
    }

    textarea:focus {
      @apply outline-none;
    }
  `]
})
export class StepObjetivoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(DiagnosticStateService);
  private readonly router = inject(Router);
  private readonly generativeAiService = inject(GenerativeAiService);

  objectiveForm!: FormGroup;
  suggestions: string[] = [];
  selectedSuggestions: string[] = [];
  isLoadingSuggestions = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingData();
    this.getObjectiveSuggestions();
  }

  private initializeForm(): void {
    this.objectiveForm = this.fb.group({
      mainObjective: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  private loadExistingData(): void {
    const existingObjective = this.stateService.form.get('objetivo')?.value;
    if (existingObjective) {
      this.objectiveForm.patchValue({
        mainObjective: existingObjective
      });
    }
  }

  async getObjectiveSuggestions(): Promise<void> {
    this.isLoadingSuggestions = true;
    
    // Limpiar sugerencias anteriores y selección
    this.suggestions = [];
    this.selectedSuggestions = [];
    
    try {
      // Obtener datos del diagnóstico para personalizar al máximo
      const contextoData = this.stateService.getContextoData();
      const segmento = this.stateService.form.get('segmento')?.value;
      const aresData = this.stateService.aresForm.value;
      const competenciasData = this.stateService.competenciasForm.value;
      
      console.log('📊 Datos del contexto obtenidos:', contextoData);
      console.log('🎯 Segmento del usuario:', segmento);
      
      if (contextoData && contextoData.industria && contextoData.tamano && contextoData.presupuesto) {
        // Crear un prompt más personalizado y detallado con todo el diagnóstico disponible
        const contextPrompt = `Eres un consultor experto en transformación digital e IA.

Basado en el siguiente perfil y resultados preliminares del diagnóstico, genera EXACTAMENTE 4 objetivos de negocio específicos, accionables y personalizados para implementar IA.

Perfil de la organización:
- Sector/Industria: ${contextoData.industria}
- Tamaño: ${contextoData.tamano}
- Presupuesto disponible: ${contextoData.presupuesto}
- Segmento/Tipo de organización: ${segmento || 'empresa'}

Resultados del diagnóstico (valores 1-5):
- ARES (dimensiones clave): ${JSON.stringify(aresData)}
- Competencias (habilidades): ${JSON.stringify(competenciasData)}

Instrucciones:
1) Devuelve exactamente 4 objetivos distintos enfocados en resultados de negocio.
2) Aterriza los objetivos a la industria, tamaño y presupuesto informados.
3) Usa el diagnóstico (ARES/competencias) para priorizar dónde impactar primero.
4) Cada objetivo debe ser medible (incluye una métrica/indicador) y accionable.
5) Responde SOLO con un array JSON de strings sin texto adicional.

Ejemplo de salida válida:
["Reducir el tiempo de ciclo en un 25% mediante automatización de procesos en atención al cliente", "...", "...", "..."]`;

        console.log('🤖 Enviando prompt personalizado a IA:', contextPrompt);

        // Usar el servicio de IA para generar sugerencias
        const response = await this.generativeAiService.generateText(contextPrompt);
        if (response) {
          try {
            // Algunas veces la IA envía texto con explicaciones o ```json
            const jsonMatch = response.match(/\[([\s\S]*?)\]/);
            const rawJson = jsonMatch ? `[${jsonMatch[1]}]` : response;
            const parsedSuggestions = JSON.parse(rawJson);
            if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
              // Limitar a máximo 4 sugerencias
              this.suggestions = parsedSuggestions.slice(0, 4);
              console.log('✅ Sugerencias personalizadas generadas por IA:', this.suggestions);
            } else {
              console.warn('⚠️ Respuesta de IA no es un array válido:', parsedSuggestions);
              this.setDefaultSuggestions();
            }
          } catch (parseError) {
            console.error('❌ Error al parsear sugerencias:', parseError);
            console.log('📝 Respuesta cruda de IA:', response);
            this.setDefaultSuggestions();
          }
        } else {
          console.warn('⚠️ No se recibió respuesta de la IA');
          this.setDefaultSuggestions();
        }
      } else {
        console.warn('⚠️ No hay datos de contexto completos, usando sugerencias por defecto');
        this.setDefaultSuggestions();
      }
    } catch (error) {
      console.error('❌ Error al generar sugerencias:', error);
      this.setDefaultSuggestions();
    } finally {
      this.isLoadingSuggestions = false;
    }
  }

  private setDefaultSuggestions(): void {
    // Intentar generar sugerencias heurísticas usando el contexto disponible
    const contextoData = this.stateService.getContextoData();
    const segmento = this.stateService.form.get('segmento')?.value as string | null;
    const industria = contextoData?.industria;
    const presupuesto = contextoData?.presupuesto;

    const heuristic = this.buildHeuristicSuggestions({ industria: industria || null, tamano: contextoData?.tamano || null, presupuesto: presupuesto || null }, segmento || null);
    if (heuristic.length === 4) {
      this.suggestions = heuristic;
      console.log('✅ Sugerencias heurísticas generadas (fallback inteligente):', this.suggestions);
      return;
    }
    
    if (industria) {
      // Sugerencias específicas por industria
      const industrySuggestions: Record<string, string[]> = {
        'tecnologia': [
          'Automatizar el desarrollo de software con herramientas de IA generativa',
          'Implementar análisis predictivo para mejorar la experiencia del usuario',
          'Optimizar la infraestructura cloud con IA para reducir costos',
          'Crear chatbots inteligentes para soporte técnico 24/7'
        ],
        'salud': [
          'Implementar diagnóstico asistido por IA para mejorar la precisión médica',
          'Automatizar la gestión de citas y recordatorios para pacientes',
          'Optimizar la gestión de inventario de medicamentos con IA predictiva',
          'Crear sistemas de monitoreo remoto de pacientes con IA'
        ],
        'finanzas': [
          'Implementar detección de fraude en tiempo real con IA',
          'Automatizar la evaluación de riesgo crediticio con machine learning',
          'Optimizar la gestión de carteras de inversión con IA predictiva',
          'Crear chatbots financieros para atención al cliente'
        ],
        'retail': [
          'Implementar recomendaciones personalizadas de productos con IA',
          'Optimizar la gestión de inventario con IA predictiva',
          'Automatizar la atención al cliente con chatbots inteligentes',
          'Crear análisis de sentimiento para mejorar la experiencia del cliente'
        ],
        'manufactura': [
          'Implementar mantenimiento predictivo con sensores IoT y IA',
          'Optimizar la calidad del producto con visión por computadora',
          'Automatizar la planificación de producción con IA',
          'Crear sistemas de control de calidad inteligentes'
        ],
        'educacion': [
          'Implementar tutoría personalizada con IA adaptativa',
          'Automatizar la evaluación de tareas y exámenes',
          'Crear contenido educativo personalizado con IA generativa',
          'Optimizar la gestión administrativa con IA'
        ]
      };
      
      // Buscar sugerencias específicas para la industria
      const normalizedIndustria = industria.toLowerCase();
      for (const [key, suggestions] of Object.entries(industrySuggestions)) {
        if (normalizedIndustria.includes(key) || key.includes(normalizedIndustria)) {
          this.suggestions = suggestions;
          console.log('✅ Sugerencias por defecto específicas para industria:', industria);
          return;
        }
      }
    }
    
    // Sugerencias genéricas si no hay industria específica
    this.suggestions = [
      'Optimizar procesos internos para aumentar la eficiencia operativa',
      'Mejorar la experiencia del cliente mediante personalización con IA',
      'Aumentar las ventas a través de análisis predictivo y automatización',
      'Reducir costos operativos mediante automatización inteligente'
    ];
    
    console.log('✅ Sugerencias genéricas por defecto aplicadas');
  }

  // Fallback inteligente cuando la IA remota no responde o el contexto es parcial
  private buildHeuristicSuggestions(contexto: { industria: string | null; tamano: string | null; presupuesto: string | null }, segmento: string | null): string[] {
    if (!contexto.industria && !contexto.presupuesto && !segmento) {
      return [];
    }

    const ind = (contexto.industria || '').toLowerCase();
    const pres = (contexto.presupuesto || '').toLowerCase();
    const seg = (segmento || 'organización');

    const byIndustry = () => {
      if (ind.includes('salud')) return ['telesoporte y triage de pacientes', 'gestión de citas e inasistencias'];
      if (ind.includes('finan')) return ['detección de fraude en tiempo real', 'scoring de riesgo crediticio'];
      if (ind.includes('retail') || ind.includes('consumo') || ind.includes('e-commerce')) return ['recomendaciones personalizadas', 'optimización de inventario'];
      if (ind.includes('manufact')) return ['mantenimiento predictivo', 'control de calidad con visión'];
      if (ind.includes('educ')) return ['tutoría adaptativa', 'automatización de evaluación'];
      return ['automatización back-office', 'asistentes para atención'];
    };

    const [focus1, focus2] = byIndustry();

    let presupuestoNota = 'con foco en quick wins';
    if (pres.includes('bajo')) presupuestoNota = 'priorizando herramientas low-code/no-code';
    else if (pres.includes('medio')) presupuestoNota = 'comenzando con 1–2 PoC y métricas claras';
    else if (pres.includes('alto') || pres.includes('muy')) presupuestoNota = 'incluyendo MLOps y escalamiento a producción';

    // Cuatro objetivos concretos y medibles
    const objs: string[] = [
      `Implementar ${focus1} para ${seg} y reducir tiempos en 20–30% en 90 días (${presupuestoNota}).`,
      `Desplegar ${focus2} para ${seg} logrando +10–15% en KPI principal en 6 meses (${presupuestoNota}).`,
      `Establecer governance y métricas de impacto de IA (OKRs trimestrales) alineadas a presupuesto ${contexto.presupuesto || 'estimado'}.`,
      `Capacitar al equipo clave y documentar 3 casos de uso priorizados para pasar a piloto en 60–90 días.`
    ];

    return objs;
  }

  toggleSuggestion(suggestion: string): void {
    if (this.selectedSuggestions.includes(suggestion)) {
      this.selectedSuggestions = this.selectedSuggestions.filter(s => s !== suggestion);
    } else {
      this.selectedSuggestions.push(suggestion);
    }
  }

  applySelectedSuggestions(): void {
    if (this.selectedSuggestions.length > 0) {
      // Combinar sugerencias de manera más coherente
      let combinedText = '';
      
      if (this.selectedSuggestions.length === 1) {
        combinedText = this.selectedSuggestions[0];
      } else {
        // Para múltiples sugerencias, crear un texto más estructurado
        const objectives = this.selectedSuggestions.map((suggestion, index) => {
          // Limpiar la sugerencia y asegurar que termine con punto
          let cleanSuggestion = suggestion.trim();
          if (!cleanSuggestion.endsWith('.')) {
            cleanSuggestion += '.';
          }
          return cleanSuggestion;
        });
        
        combinedText = `Mi objetivo principal con la implementación de IA en mi organización es: ${objectives.join(' ')}`;
      }
      
      this.objectiveForm.patchValue({
        mainObjective: combinedText
      });
      
      // Limpiar selección
      this.selectedSuggestions = [];
      
      // Scroll suave al textarea
      const textarea = document.getElementById('mainObjective');
      if (textarea) {
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        textarea.focus();
      }
      
      // Mostrar mensaje de confirmación
      console.log('✅ Sugerencias aplicadas:', combinedText);
    }
  }

  selectSuggestion(suggestion: string): void {
    this.objectiveForm.patchValue({
      mainObjective: suggestion
    });
    
    // Scroll suave al textarea
    const textarea = document.getElementById('mainObjective');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textarea.focus();
    }
  }

  onSubmit(): void {
    if (this.objectiveForm.valid) {
      const formData = this.objectiveForm.value;
      
      // Guardar en el servicio de estado
      this.stateService.form.patchValue({
        objetivo: formData.mainObjective
      });

      // Navegar al siguiente paso
      this.navigateToNextStep();
    }
  }

  private navigateToNextStep(): void {
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const nextStepUrl = `${baseUrl}/lead`;
    
    this.router.navigate([nextStepUrl]).catch(error => {
      console.error('Error en navegación:', error);
      // Fallback: navegar usando la ruta completa
      this.router.navigate(['/es', 'diagnostico', 'lead']);
    });
  }
}
