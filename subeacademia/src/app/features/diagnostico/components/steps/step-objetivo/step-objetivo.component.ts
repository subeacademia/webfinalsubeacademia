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
    
    try {
      // Obtener datos del contexto del servicio de estado
      const contextoData = this.stateService.getContextoData();
      console.log('📊 Datos del contexto obtenidos:', contextoData);
      
      if (contextoData && contextoData.industria && contextoData.tamano && contextoData.presupuesto) {
        const contextPrompt = `Basado en una empresa del sector "${contextoData.industria}", con un tamaño de "${contextoData.tamano}" y un presupuesto de "${contextoData.presupuesto}", genera 5 objetivos de negocio concisos y accionables para un proyecto de inteligencia artificial. Devuelve solo un array JSON de strings. Ejemplo: ["Optimizar la logística de entrega en un 15%", "Reducir el tiempo de respuesta al cliente a menos de 5 minutos", "Personalizar las campañas de marketing para aumentar la conversión un 10%"]`;

        console.log('🤖 Enviando prompt a IA:', contextPrompt);

        // Usar el servicio de IA para generar sugerencias
        const response = await this.generativeAiService.generateText(contextPrompt);
        if (response) {
          try {
            const parsedSuggestions = JSON.parse(response);
            if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
              this.suggestions = parsedSuggestions;
              console.log('✅ Sugerencias generadas por IA:', this.suggestions);
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
    this.suggestions = [
      'Optimizar procesos internos para aumentar la eficiencia operativa',
      'Mejorar la experiencia del cliente mediante personalización con IA',
      'Aumentar las ventas a través de análisis predictivo y automatización',
      'Reducir costos operativos mediante automatización inteligente',
      'Mejorar la toma de decisiones con análisis de datos en tiempo real'
    ];
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
      const combinedText = this.selectedSuggestions.join('. ');
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
