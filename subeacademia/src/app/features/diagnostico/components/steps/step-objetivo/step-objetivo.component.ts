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
  template: `
    <div class="max-w-3xl mx-auto animate-fade-in">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          Objetivo Principal
        </h2>
        <p class="text-lg text-gray-300">
          Cuéntanos cuál es tu objetivo principal con la implementación de IA en tu organización
        </p>
      </div>

      <!-- Sugerencias de IA -->
      <div class="mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/30">
        <div class="flex items-center mb-4">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white">Sugerencias Personalizadas con IA</h3>
        </div>
        
        <div *ngIf="isLoadingSuggestions" class="text-center py-8">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-blue-200">Generando sugerencias personalizadas...</p>
        </div>

        <div *ngIf="!isLoadingSuggestions && suggestions.length > 0" class="space-y-3">
          <p class="text-blue-100 text-sm mb-4">
            Basado en tu perfil, aquí tienes algunas sugerencias de objetivos que podrían ser relevantes:
          </p>
          <div class="grid gap-3">
            <button 
              *ngFor="let suggestion of suggestions; let i = index"
              (click)="selectSuggestion(suggestion)"
              class="text-left p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 hover:scale-105 group">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <span class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full flex items-center justify-center mr-3">
                      {{ i + 1 }}
                    </span>
                    <span class="font-medium text-white group-hover:text-blue-200 transition-colors">
                      {{ suggestion }}
                    </span>
                  </div>
                </div>
                <svg class="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div *ngIf="!isLoadingSuggestions && suggestions.length === 0" class="text-center py-4">
          <p class="text-blue-200 text-sm">No se pudieron generar sugerencias en este momento. Puedes escribir tu objetivo personalizado abajo.</p>
        </div>
      </div>

      <form [formGroup]="objectiveForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Objetivo principal -->
        <div class="form-group">
          <label for="mainObjective" class="block text-sm font-medium text-gray-200 mb-2">
            ¿Cuál es tu objetivo principal con la implementación de IA? *
          </label>
          <textarea 
            id="mainObjective" 
            formControlName="mainObjective"
            rows="6"
            placeholder="Describe tu objetivo principal. Por ejemplo: 'Quiero automatizar procesos de atención al cliente para mejorar la eficiencia y reducir costos operativos'"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none">
          </textarea>
          <div *ngIf="objectiveForm.get('mainObjective')?.invalid && objectiveForm.get('mainObjective')?.touched" 
               class="mt-1 text-red-400 text-sm">
            Por favor describe tu objetivo principal
          </div>
          <div class="mt-2 text-sm text-gray-400">
            <p>Ejemplos de objetivos comunes:</p>
            <ul class="mt-2 space-y-1 text-left">
              <li>• Automatizar procesos repetitivos</li>
              <li>• Mejorar la toma de decisiones con datos</li>
              <li>• Optimizar la experiencia del cliente</li>
              <li>• Reducir costos operativos</li>
              <li>• Acelerar la innovación de productos</li>
            </ul>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="pt-4">
          <button 
            type="submit" 
            [disabled]="objectiveForm.invalid"
            class="w-full btn-primary py-3 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            Siguiente
          </button>
        </div>
      </form>
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
      const state = this.stateService.form.value;
      const contextPrompt = `Basado en una empresa del sector "${state.contexto?.industria || 'tecnología'}", con un tamaño de "${state.contexto?.tamano || 'mediana'}" y un presupuesto de "${state.contexto?.presupuesto || 'moderado'}", genera 3 objetivos de negocio concisos y accionables para un proyecto de inteligencia artificial. Devuelve solo un array JSON de strings. Ejemplo: ["Optimizar la logística de entrega en un 15%", "Reducir el tiempo de respuesta al cliente a menos de 5 minutos", "Personalizar las campañas de marketing para aumentar la conversión un 10%"]`;

      // Usar el servicio de IA para generar sugerencias
      const response = await this.generativeAiService.generateText(contextPrompt);
      if (response) {
        try {
          this.suggestions = JSON.parse(response);
        } catch (parseError) {
          console.error('Error al parsear sugerencias:', parseError);
          this.setDefaultSuggestions();
        }
      } else {
        this.setDefaultSuggestions();
      }
    } catch (error) {
      console.error('Error al generar sugerencias:', error);
      this.setDefaultSuggestions();
    } finally {
      this.isLoadingSuggestions = false;
    }
  }

  private setDefaultSuggestions(): void {
    this.suggestions = [
      'Optimizar procesos internos para aumentar la eficiencia operativa',
      'Mejorar la experiencia del cliente mediante personalización con IA',
      'Aumentar las ventas a través de análisis predictivo y automatización'
    ];
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
