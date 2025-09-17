import { Component, inject, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CUESTIONARIO_EMPRESAS } from './data/empresa-questions';
import { ReporteDiagnosticoEmpresa, MetadataEmpresa, RespuestaItem } from './data/empresa-diagnostic.models';
import { EmpresaScoringService } from './services/empresa-scoring.service';
import { DiagnosticsService } from './services/diagnostics.service';
import { GenerativeAiService } from '../../core/ai/generative-ai.service';
import { PROMPT_PLAN_DE_ACCION } from './data/empresa-prompt';
import { AiProcessingLoaderComponent } from './components/ui/ai-processing-loader/ai-processing-loader.component';
// Temporalmente quitamos el de resultados para crearlo después
// import { DiagnosticResultsComponent } from './components/ui/diagnostic-results/diagnostic-results.component';

@Component({
  selector: 'app-diagnostico-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AiProcessingLoaderComponent, JsonPipe],
  template: `
    <div class="container mx-auto p-4 md:p-8 text-gray-800 dark:text-white">
      @if (step() === 'metadata') {
        <div class="max-w-2xl mx-auto">
          <h1 class="text-3xl font-bold mb-4">Diagnóstico de Madurez en IA para Empresas</h1>
          <p class="mb-8 text-gray-600 dark:text-gray-300">Comencemos con algunos datos sobre tu empresa para contextualizar el resultado. Esta información es clave para generar un análisis preciso.</p>
          <form [formGroup]="metadataForm" (ngSubmit)="startSurvey()" class="space-y-4">
            <input formControlName="razonSocial" placeholder="Razón Social" class="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500">
            <input formControlName="nombreContacto" placeholder="Tu Nombre Completo" class="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500">
            <input formControlName="emailContacto" type="email" placeholder="Tu Email de Contacto" class="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500">
            <select formControlName="ventasUFAnual" class="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500">
              <option value="" disabled>Ventas Anuales en UF (año anterior)</option>
              <option value="0-2400">Hasta 2.400 UF (Micro empresa)</option>
              <option value="2401-25000">2.401 - 25.000 UF (Pequeña empresa)</option>
              <option value="25001-100000">25.001 - 100.000 UF (Mediana empresa)</option>
              <option value="100001+">Más de 100.000 UF (Grande empresa)</option>
            </select>
            <button type="submit" [disabled]="metadataForm.invalid" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Comenzar Diagnóstico</button>
          </form>
        </div>
      } @else if (isStepNumber() && getCurrentStepNumber() >= 0 && getCurrentStepNumber() < CUESTIONARIO_EMPRESAS.length) {
        <div class="max-w-3xl mx-auto">
          <div class="mb-4">
            <p class="text-sm text-gray-500">Dimensión {{ getCurrentStepNumber() + 1 }} de {{ CUESTIONARIO_EMPRESAS.length }}</p>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
              <div class="bg-blue-600 h-2.5 rounded-full" [style.width.%]="((getCurrentStepNumber() + 1) / CUESTIONARIO_EMPRESAS.length) * 100"></div>
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-6">{{ getCurrentDimension().nombre }}</h2>
          <form [formGroup]="getCurrentForm()" class="space-y-6">
              @for(item of getCurrentDimension().items; track item.n) {
                  <div class="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
                      <label class="block mb-3 font-semibold text-lg">{{ item.texto }}</label>
                      @if (item.tipo === 'Likert') {
                          <div class="flex justify-center gap-2 md:gap-4">
                              @for(option of getLikertOptions(); track option.value) {
                                  <label class="flex flex-col items-center space-y-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer min-w-[80px] text-center">
                                      <input type="radio" [formControlName]="'item' + item.n" [value]="option.value" class="form-radio h-4 w-4 text-blue-600">
                                      <span class="text-lg font-bold">{{option.value}}</span>
                                      <span class="text-xs text-gray-600 dark:text-gray-400 leading-tight">{{option.label}}</span>
                                  </label>
                              }
                          </div>
                      }
                      @if (item.tipo === 'VFNS') {
                          <div class="flex flex-wrap justify-center gap-4">
                              <label class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><input type="radio" [formControlName]="'item' + item.n" value="V" class="form-radio h-5 w-5 text-blue-600"> <span>Verdadero</span></label>
                              <label class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><input type="radio" [formControlName]="'item' + item.n" value="F" class="form-radio h-5 w-5 text-blue-600"> <span>Falso</span></label>
                              <label class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><input type="radio" [formControlName]="'item' + item.n" value="NS" class="form-radio h-5 w-5 text-blue-600"> <span>No sé</span></label>
                          </div>
                      }
                      @if (item.tipo === 'Madurez') {
                         <select [formControlName]="'item' + item.n" class="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:ring-blue-500">
                           <option [ngValue]="null" disabled>Selecciona un nivel...</option>
                           <option value="I">Incipiente</option>
                           <option value="B">Básico</option>
                           <option value="M">Intermedio</option>
                           <option value="A">Avanzado</option>
                           <option value="T">Transformador</option>
                         </select>
                      }
                  </div>
              }
          </form>
          <div class="flex justify-between mt-8">
              <button (click)="previousStep()" [disabled]="step() === 0" class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400">Anterior</button>
              <button (click)="nextStep()" [disabled]="getCurrentForm().invalid" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Siguiente</button>
          </div>
        </div>
      } @else if (step() === 'processing') {
          <app-ai-processing-loader [status]="processingStatus()"></app-ai-processing-loader>
      } @else if (step() === 'results' && finalReport()) {
          <h2 class="text-3xl font-bold mb-4">Resultados y Plan de Acción</h2>
          <p class="mb-6">¡Hemos completado tu diagnóstico! A continuación puedes ver el resumen de tus resultados y el plan de acción generado por nuestra IA.</p>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
             <!-- Aquí irá el componente de resultados, por ahora mostramos el JSON -->
             <pre class="whitespace-pre-wrap text-xs">{{ finalReport() | json }}</pre>
          </div>
      }
    </div>
  `,
})
export class DiagnosticoEmpresaComponent {
    private fb = inject(FormBuilder);
    private scoringService = inject(EmpresaScoringService);
    private diagnosticsService = inject(DiagnosticsService);
    private aiService = inject(GenerativeAiService);

    CUESTIONARIO_EMPRESAS = CUESTIONARIO_EMPRESAS;
    step = signal<'metadata' | number | 'processing' | 'results'>('metadata');
    processingStatus = signal('Calculando puntajes...');
    finalReport = signal<ReporteDiagnosticoEmpresa | null>(null);

    metadataForm: FormGroup;
    questionForms: FormGroup[] = [];

    constructor() {
      this.metadataForm = this.fb.group({
        razonSocial: ['', Validators.required],
        sectorCiiu: ['' ], // Opcional por ahora
        regionPais: [''], // Opcional por ahora
        ventasUFAnual: ['', Validators.required],
        dotacion: [null], // Opcional por ahora
        modalidad: ['Mixta'], // Opcional por ahora
        rolRespondente: [''], // Opcional por ahora
        nombreContacto: ['', Validators.required],
        emailContacto: ['', [Validators.required, Validators.email]],
      });

      CUESTIONARIO_EMPRESAS.forEach(dimension => {
        const group: { [key: string]: any } = {};
        dimension.items.forEach(item => {
          group['item' + item.n] = [null, Validators.required];
        });
        this.questionForms.push(this.fb.group(group));
      });
    }

    startSurvey() { if (this.metadataForm.valid) this.step.set(0); }

    // Método para obtener las opciones de la escala Likert con etiquetas
    getLikertOptions() {
      return [
        { value: 1, label: 'Totalmente en desacuerdo' },
        { value: 2, label: 'En desacuerdo' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'De acuerdo' },
        { value: 5, label: 'Totalmente de acuerdo' }
      ];
    }

    // Métodos auxiliares para el template
    getCurrentStepNumber(): number {
      return typeof this.step() === 'number' ? this.step() as number : 0;
    }

    getCurrentDimension() {
      const stepNum = this.getCurrentStepNumber();
      return CUESTIONARIO_EMPRESAS[stepNum];
    }

    getCurrentForm() {
      const stepNum = this.getCurrentStepNumber();
      return this.questionForms[stepNum];
    }

    isStepNumber(): boolean {
      return typeof this.step() === 'number';
    }
    nextStep() {
      if (this.step() as number < CUESTIONARIO_EMPRESAS.length - 1) {
        this.step.update(s => (s as number) + 1);
      } else {
        this.submitFullSurvey();
      }
    }
    previousStep() {
      if (this.step() as number > 0) {
        this.step.update(s => (s as number) - 1);
      } else {
        this.step.set('metadata');
      }
    }

    async submitFullSurvey() {
        this.step.set('processing');
        const metadata: MetadataEmpresa = {
          ...this.metadataForm.value,
          fecha: Date.now(),
          categoriaTamano: this.scoringService.getCategoriaPorVentasUF(this.metadataForm.value.ventasUFAnual)
        };
        const respuestas: RespuestaItem[] = [];
        CUESTIONARIO_EMPRESAS.forEach((dim, dimIndex) => {
            dim.items.forEach(item => {
                respuestas.push({
                    n: item.n,
                    dimension: dim.nombre,
                    texto: item.texto,
                    tipo: item.tipo as 'Likert' | 'VFNS' | 'Madurez',
                    respuesta: this.questionForms[dimIndex].value['item' + item.n],
                    puntaje_0_100: 0
                });
            });
        });
        let reporte: ReporteDiagnosticoEmpresa = {
            metadata,
            respuestas,
            puntajes: { dimensiones: [], ig_ia_0a100: 0, ig_ia_1a7: 0, ig_ia_nivel: 'Incipiente' }
        };
        
        this.processingStatus.set('Calculando puntajes de madurez...');
        reporte = this.scoringService.calcularResultados(reporte);

        this.processingStatus.set('Guardando diagnóstico de forma segura...');
        try {
            const docId = await this.diagnosticsService.saveEmpresaDiagnostic(reporte);
            reporte.metadata.id = docId;
        } catch (error) { console.error("Error al guardar en Firestore:", error); this.step.set('metadata'); return; }

        this.processingStatus.set('Generando plan de acción personalizado con IA...');
        try {
          const prompt = PROMPT_PLAN_DE_ACCION.replace('{{DATOS_DIAGNOSTICO}}', JSON.stringify(reporte, null, 2));
          const planDeAccionStr = await this.aiService.generateText(prompt);
          reporte.planDeAccion = JSON.parse(planDeAccionStr);
        } catch(e) { console.error("Error generando plan de acción con IA:", e); }

        this.finalReport.set(reporte);
        this.step.set('results');
    }
}
