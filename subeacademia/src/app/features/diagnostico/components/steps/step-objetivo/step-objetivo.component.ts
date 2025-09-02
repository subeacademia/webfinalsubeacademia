import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { BesselAiService, ObjetivoGenerado, ContextoCliente } from '../../../../../core/ai/bessel-ai.service';
import { ObjetivoProgressComponent, ProgresoGeneracion } from './objetivo-progress.component';

@Component({
  selector: 'app-step-objetivo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ObjetivoProgressComponent],
  templateUrl: './step-objetivo.component.html',
})
export class StepObjetivoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly state = inject(DiagnosticStateService);
  private readonly besselAi = inject(BesselAiService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Formulario local para capturar la descripción libre del usuario
  uiForm!: FormGroup;

  // FormArray referenciado directamente al estado global para los objetivos seleccionados
  selectedObjectives!: FormArray<FormControl<string>>;

  // Estado del flujo del componente
  readonly currentStep = signal<'input' | 'generating' | 'selection' | 'review'>('input');
  
  // UI state
  readonly isLoading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly suggestions = signal<ObjetivoGenerado[]>([]);
  
  // Pasos de generación para el componente de progreso
  readonly pasosGeneracion = signal<ProgresoGeneracion[]>([
    {
      paso: 'Analizando contexto',
      estado: 'pendiente',
      mensaje: 'Evaluando industria, tamaño, presupuesto y segmento',
      progreso: 0
    },
    {
      paso: 'Procesando diagnóstico ARES',
      estado: 'pendiente',
      mensaje: 'Identificando fortalezas y debilidades',
      progreso: 0
    },
    {
      paso: 'Evaluando competencias',
      estado: 'pendiente',
      mensaje: 'Analizando nivel de competencias del equipo',
      progreso: 0
    },
    {
      paso: 'Generando objetivos',
      estado: 'pendiente',
      mensaje: 'Creando objetivos SMART personalizados',
      progreso: 0
    }
  ]);
  
  // Computed properties
  readonly canProceed = computed(() => {
    const count = this.selectedCount();
    const canProceed = count > 0;
    console.log(`🔍 canProceed: ${count} objetivos seleccionados -> ${canProceed ? '✅ Puede continuar' : '❌ No puede continuar'}`);
    return canProceed;
  });
  readonly selectedCount = computed(() => {
    // 🔧 SOLUCIÓN: Contar directamente desde el FormArray sin filtrar
    const formArrayValues = this.selectedObjectives?.value || [];
    const count = Array.isArray(formArrayValues) ? formArrayValues.length : 0;
    
    // 🔧 DEBUG: Log del contador para verificar que funcione
    console.log(`🔢 selectedCount computed: ${count} objetivos`);
    console.log(`📋 Valores del FormArray:`, formArrayValues);
    
    // 🔧 SOLUCIÓN: Asegurar que el contador sea siempre un número válido
    return Math.max(0, count);
  });
  readonly hasGeneratedObjectives = computed(() => this.suggestions().length > 0);
  
  // Opciones predefinidas como fallback
  readonly predefinedObjectives: ObjetivoGenerado[] = [
    {
      id: 'pre-1',
      texto: 'Optimizar procesos con IA (automatización y eficiencia)',
      categoria: 'Procesos',
      prioridad: 'alta',
      tiempoEstimado: '3-6 meses',
      impacto: 'Reducción del 30% en tiempo de procesos'
    },
    {
      id: 'pre-2',
      texto: 'Formar al equipo en competencias clave de IA',
      categoria: 'Capacitación',
      prioridad: 'alta',
      tiempoEstimado: '6-12 meses',
      impacto: 'Mejora del 50% en competencias del equipo'
    },
    {
      id: 'pre-3',
      texto: 'Implementar analítica avanzada para toma de decisiones',
      categoria: 'Analítica',
      prioridad: 'media',
      tiempoEstimado: '4-8 meses',
      impacto: 'Mejora del 40% en precisión de decisiones'
    },
    {
      id: 'pre-4',
      texto: 'Mejorar la experiencia del cliente con IA generativa',
      categoria: 'CX',
      prioridad: 'media',
      tiempoEstimado: '2-4 meses',
      impacto: 'Incremento del 25% en satisfacción del cliente'
    },
    {
      id: 'pre-5',
      texto: 'Fortalecer la gobernanza y ética de datos',
      categoria: 'Gobernanza',
      prioridad: 'baja',
      tiempoEstimado: '6-12 meses',
      impacto: 'Cumplimiento del 100% en regulaciones'
    },
  ];

  ngOnInit(): void {
    // Enlazar el FormArray del estado global
    const fa = this.state.form.get('objetivo');
    this.selectedObjectives = (fa instanceof FormArray) ? fa as FormArray<FormControl<string>> : this.fb.array([]) as FormArray<FormControl<string>>;

    // Formulario de UI
    this.uiForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Si ya había objetivos seleccionados, ir al paso de revisión
    if (this.selectedCount() > 0) {
      this.currentStep.set('review');
    }

    // Si ya había objetivos generados, cargarlos
    this.deduplicateSelected();
  }

  // Generar sugerencias con IA usando Bessel
  async onGenerate(): Promise<void> {
    if (this.uiForm.invalid) {
      this.uiForm.markAllAsTouched();
      return;
    }

    this.currentStep.set('generating');
    this.isLoading.set(true);
    this.errorMsg.set(null);
    this.suggestions.set([]);

    // 🔧 LIMPIAR OBJETIVOS ANTERIORES - SOLUCIÓN AL PROBLEMA DEL CONTADOR
    this.selectedObjectives.clear();
    console.log('🧹 FormArray limpiado. Objetivos anteriores eliminados.');

    // Iniciar progreso de generación
    this.iniciarProgresoGeneracion();

    const desc = (this.uiForm.get('descripcion') as FormControl<string>).value ?? '';
    
    // Construir el contexto del cliente para Bessel
    const contextoCliente = this.construirContextoCliente(desc);
    
    // Generar objetivos usando el servicio de Bessel
    this.besselAi.generarObjetivos({
      contexto: contextoCliente,
      maxObjetivos: 8, // 🔧 CAMBIADO: De 6 a 8 objetivos para que cuadre la pantalla
      enfoque: 'general'
    }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (objetivos) => {
        if (objetivos && objetivos.length > 0) {
          this.suggestions.set(objetivos);
          this.completarProgresoGeneracion();
          this.currentStep.set('selection');
        } else {
          // Fallback a objetivos predefinidos
          this.handleGenerationError();
        }
      },
      error: (err) => {
        console.error('Error generando objetivos con Bessel:', err);
        this.handleGenerationError(err);
      }
    });
  }

  // Inicia el progreso de generación
  private iniciarProgresoGeneracion(): void {
    const pasos = this.pasosGeneracion();
    
    // Paso 1: Analizando contexto
    setTimeout(() => {
      this.actualizarPaso(0, 'procesando', 25);
    }, 500);
    
    // Paso 2: Procesando diagnóstico ARES
    setTimeout(() => {
      this.actualizarPaso(1, 'procesando', 50);
    }, 1500);
    
    // Paso 3: Evaluando competencias
    setTimeout(() => {
      this.actualizarPaso(2, 'procesando', 75);
    }, 2500);
    
    // Paso 4: Generando objetivos
    setTimeout(() => {
      this.actualizarPaso(3, 'procesando', 90);
    }, 3500);
  }

  // Completa el progreso de generación
  private completarProgresoGeneracion(): void {
    const pasos = this.pasosGeneracion();
    
    // Marcar todos los pasos como completados
    pasos.forEach((paso, index) => {
      this.actualizarPaso(index, 'completado', 100);
    });
  }

  // Actualiza un paso específico del progreso
  private actualizarPaso(index: number, estado: ProgresoGeneracion['estado'], progreso: number): void {
    const pasos = [...this.pasosGeneracion()];
    if (pasos[index]) {
      pasos[index] = { ...pasos[index], estado, progreso };
      this.pasosGeneracion.set(pasos);
    }
  }

  // Construye el contexto del cliente para enviar a Bessel
  private construirContextoCliente(descripcionUsuario: string): ContextoCliente {
    const contexto = this.state.getContextoData();
    const segmento = this.state.form.get('segmento')?.value ?? 'No especificado';

    const aresValues = this.state.aresForm.value as Record<string, number>;
    const competenciasValues = this.state.competenciasForm.value as Record<string, number>;

    // Extraer top debilidades y fortalezas ARES
    const aresArray = Object.entries(aresValues)
      .filter(([, v]) => typeof v === 'number')
      .map(([id, v]) => ({ id, score: v as number }));
    const weakestAres = [...aresArray].sort((a, b) => a.score - b.score).slice(0, 3).map(x => this.labelFromAresId(x.id));
    const strongestAres = [...aresArray].sort((a, b) => b.score - a.score).slice(0, 3).map(x => this.labelFromAresId(x.id));

    // Extraer competencias más bajas
    const compArray = Object.entries(competenciasValues)
      .filter(([, v]) => typeof v === 'number')
      .map(([id, v]) => ({ id, score: v as number }));
    const lowestCompetencias = [...compArray].sort((a, b) => a.score - b.score).slice(0, 4).map(x => this.labelFromCompetenciaId(x.id));

    return {
      industria: contexto?.industria ?? 'No especificada',
      tamano: contexto?.tamano ?? 'No especificado',
      presupuesto: contexto?.presupuesto ?? 'No especificado',
      segmento: segmento,
      descripcionUsuario: descripcionUsuario,
      aresDebilidades: weakestAres,
      aresFortalezas: strongestAres,
      competenciasBajas: lowestCompetencias
    };
  }

  private labelFromAresId(id: string): string {
    const item = this.state.aresItems?.find(x => x.id === id);
    return item?.labelKey ?? id;
  }

  private labelFromCompetenciaId(id: string): string {
    const comp = this.state.competencias?.find(x => x.id === id);
    return comp?.nameKey ?? id;
  }

  private handleGenerationError(error?: any): void {
    let errorMessage = 'No se pudieron generar sugerencias personalizadas con IA. Usando opciones predefinidas adaptadas a tu contexto.';
    
    // Personalizar mensaje según el tipo de error
    if (error?.status === 0) {
      errorMessage = 'No se pudo conectar con el servicio de IA. Usando opciones predefinidas adaptadas a tu contexto.';
    } else if (error?.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Usando opciones predefinidas adaptadas a tu contexto.';
    } else if (error?.status >= 500) {
      errorMessage = 'Error temporal del servicio de IA. Usando opciones predefinidas adaptadas a tu contexto.';
    }
    
    this.errorMsg.set(errorMessage);
    this.suggestions.set([...this.predefinedObjectives]);
    
    // Marcar progreso como error
    const pasos = [...this.pasosGeneracion()];
    pasos[3] = { ...pasos[3], estado: 'error', progreso: 100 };
    this.pasosGeneracion.set(pasos);
    
    this.currentStep.set('selection');
  }

  // Checkbox change handler
  onToggle(option: ObjetivoGenerado, checked: boolean): void {
    console.log(`🔄 Toggle objetivo: ${option.texto} - ${checked ? 'seleccionado' : 'deseleccionado'}`);
    
    if (checked) {
      this.addSelection(option.texto);
    } else {
      this.removeSelection(option.texto);
    }
    
    // 🔧 SOLUCIÓN: Forzar actualización del estado
    this.selectedObjectives.updateValueAndValidity();
    
    // Log del estado actual después del toggle
    const currentCount = this.selectedCount();
    console.log(`📊 Objetivos seleccionados después del toggle: ${currentCount}`);
    console.log(`📋 Lista actual:`, this.getObjetivosSeleccionados());
    
    // 🔧 SOLUCIÓN: Forzar detección de cambios para actualizar la UI
    this.cdr.detectChanges();
    
    // 🔧 SOLUCIÓN: Verificación adicional después de la detección de cambios
    setTimeout(() => {
      console.log(`🔄 Verificación final - Contador actual: ${this.selectedCount()}`);
      this.cdr.detectChanges();
      this.debugEstado(); // 🔧 DEBUG: Verificar estado completo
    }, 0);
    
    // 🔧 SOLUCIÓN: Forzar actualización del estado global
    this.state.form.updateValueAndValidity();
  }



  isSelected(option: ObjetivoGenerado): boolean {
    const values = (this.selectedObjectives.value || []) as string[];
    const isSelected = values.includes(option.texto);
    console.log(`🔍 isSelected "${option.texto}": ${isSelected ? '✅' : '❌'}`);
    return isSelected;
  }

  private addSelection(option: string): void {
    const values = (this.selectedObjectives.value || []) as string[];
    console.log(`➕ Agregando selección: "${option}"`);
    
    if (!values.includes(option)) {
      this.selectedObjectives.push(new FormControl<string>(option, { nonNullable: true }));
      console.log(`✅ Selección agregada exitosamente`);
      
      // 🔧 SOLUCIÓN: Forzar actualización inmediata del computed
      this.cdr.detectChanges();
    } else {
      console.log(`⚠️ La opción ya estaba seleccionada`);
    }
  }

  private removeSelection(option: string): void {
    const values = (this.selectedObjectives.value as string[]) || [];
    console.log(`➖ Removiendo selección: "${option}"`);
    
    const idx = values.findIndex(v => v === option);
    if (idx >= 0) {
      this.selectedObjectives.removeAt(idx);
      console.log(`✅ Selección removida exitosamente del índice ${idx}`);
      
      // 🔧 SOLUCIÓN: Forzar actualización inmediata del computed
      this.cdr.detectChanges();
    } else {
      console.log(`⚠️ La opción no se encontró para remover`);
    }
  }

  private deduplicateSelected(): void {
    const seen = new Set<string>();
    const toKeep: string[] = [];
    for (const v of (this.selectedObjectives.value as string[])) {
      if (!seen.has(v)) {
        seen.add(v);
        toKeep.push(v);
      }
    }
    if (toKeep.length !== this.selectedObjectives.length) {
      this.selectedObjectives.clear();
      toKeep.forEach(v => this.selectedObjectives.push(new FormControl<string>(v, { nonNullable: true })));
    }
  }

  // Navegación
  goNext(): void {
    console.log('🚀 Botón Siguiente presionado...');
    console.log(`🔍 canProceed(): ${this.canProceed()}`);
    console.log(`📊 selectedCount(): ${this.selectedCount()}`);
    
    if (!this.canProceed()) {
      console.log('❌ No se puede continuar - no hay objetivos seleccionados');
      this.debugEstado();
      return;
    }
    
    // 🔧 SOLUCIÓN: Ir al paso de revisión y NO navegar automáticamente
    this.currentStep.set('review');
    
    console.log('✅ Objetivos configurados. Usuario puede revisar y continuar cuando esté listo.');
    console.log('📊 Objetivos seleccionados:', this.getObjetivosSeleccionados().length);
  }

  goPrevious(): void {
    console.log('🔄 Navegando al paso anterior...');
    console.log(`📍 URL actual: ${this.router.url}`);
    
    const prev = this.state.getPreviousStepLink(this.router.url);
    console.log(`📍 Paso anterior: ${prev}`);
    
    if (prev) {
      // 🔧 SOLUCIÓN: Construir la URL correctamente considerando el idioma
      const currentUrl = this.router.url;
      const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
      const prevUrl = `${baseUrl}/${prev}`;
      
      console.log(`🔗 URL anterior: ${prevUrl}`);
      
      // Navegar al paso anterior
      this.router.navigate([prevUrl]).then(() => {
        console.log('✅ Navegación al paso anterior exitosa');
      }).catch(err => {
        console.error('❌ Error navegando al paso anterior:', err);
        console.log('🔄 Intentando navegación directa...');
        
        // Fallback: intentar navegación directa
        this.router.navigate(['/es', 'diagnostico', prev]).then(() => {
          console.log('✅ Navegación directa al paso anterior exitosa');
        }).catch(fallbackErr => {
          console.error('❌ Error en fallback de navegación anterior:', fallbackErr);
        });
      });
    } else {
      console.error('❌ No se pudo determinar el paso anterior');
      // Fallback: ir al inicio del diagnóstico
      this.router.navigate(['/es', 'diagnostico', 'inicio']).catch(err => {
        console.error('❌ Error navegando al inicio:', err);
      });
    }
  }

  // Utilidad para deduplicar arrays
  private unique(arr: string[]): string[] {
    return Array.from(new Set(arr.map(s => s.trim())));
  }

  // Métodos para el flujo del componente
  goBackToInput(): void {
    this.currentStep.set('input');
    this.suggestions.set([]);
    this.errorMsg.set(null);
    
    // 🔧 LIMPIAR OBJETIVOS SELECCIONADOS AL VOLVER
    this.selectedObjectives.clear();
    console.log('🧹 Objetivos limpiados al volver al input');
    
    // Resetear progreso
    const pasos = this.pasosGeneracion();
    pasos.forEach((paso, index) => {
      this.actualizarPaso(index, 'pendiente', 0);
    });
  }

  goBackToSelection(): void {
    this.currentStep.set('selection');
  }

  // Método para continuar al siguiente paso del diagnóstico
  continuarDiagnostico(): void {
    console.log('🚀 Continuando al siguiente paso del diagnóstico...');
    console.log(`📍 URL actual: ${this.router.url}`);
    
    // 🔧 SOLUCIÓN: Guardar los objetivos seleccionados antes de navegar
    const objetivosSeleccionados = this.getObjetivosSeleccionados();
    console.log('🎯 Objetivos seleccionados para guardar:', objetivosSeleccionados);
    
    // Asegurar que los objetivos se guarden en el estado global
    if (objetivosSeleccionados.length > 0) {
      // Limpiar el FormArray y agregar los objetivos seleccionados
      this.selectedObjectives.clear();
      objetivosSeleccionados.forEach(objetivo => {
        this.selectedObjectives.push(this.fb.control(objetivo, { nonNullable: true }));
      });
      
      // Forzar la actualización del estado
      this.state.form.updateValueAndValidity();
      console.log('✅ Objetivos guardados en el estado global');
    }
    
    // 🔧 SOLUCIÓN: Construir la ruta correctamente basada en la URL actual
    const currentUrl = this.router.url;
    const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
    const resultsUrl = `${baseUrl}/resultados`;
    
    console.log(`🎯 Navegando a: ${resultsUrl}`);
    
    // Navegación a resultados del diagnóstico
    this.router.navigate([resultsUrl]).then(() => {
      console.log('✅ Navegación exitosa a resultados del diagnóstico');
    }).catch(err => {
      console.error('❌ Error navegando a resultados:', err);
      
      // Fallback: intentar navegación usando la ruta completa con idioma
      console.log('🔄 Intentando navegación con ruta completa...');
      this.router.navigate(['/es', 'diagnostico', 'resultados']).then(() => {
        console.log('✅ Navegación con ruta completa exitosa');
      }).catch(fallbackErr => {
        console.error('❌ Error en navegación con ruta completa:', fallbackErr);
        
        // Último fallback: ir al home del diagnóstico
        console.log('🔄 Último fallback: navegando al home del diagnóstico...');
        this.router.navigate(['/es', 'diagnostico']).catch(finalErr => {
          console.error('❌ Error final navegando al home:', finalErr);
        });
      });
    });
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad) {
      case 'alta': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'media': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'baja': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  }

  getCategoriaIcon(categoria: string): string {
    switch (categoria.toLowerCase()) {
      case 'procesos': return '⚙️';
      case 'capacitación': return '🎓';
      case 'analítica': return '📊';
      case 'cx': return '💬';
      case 'gobernanza': return '🛡️';
      case 'innovación': return '💡';
      default: return '🎯';
    }
  }

  // Método para obtener los objetivos seleccionados para mostrar en la pantalla de revisión
  getObjetivosSeleccionados(): string[] {
    const values = this.selectedObjectives?.value;
    if (!values || !Array.isArray(values)) {
      console.log(`🔍 getObjetivosSeleccionados: valores inválidos -`, values);
      return [];
    }
    
    // 🔧 SOLUCIÓN: Usar directamente los valores del FormArray para consistencia
    const objetivosValidos = values.filter(v => v && typeof v === 'string');
    
    console.log(`🔍 getObjetivosSeleccionados: FormArray length=${values.length}, valores válidos=${objetivosValidos.length}`);
    console.log(`📋 Valores completos:`, values);
    console.log(`✅ Objetivos válidos:`, objetivosValidos);
    
    return objetivosValidos;
  }

  // TrackBy function para optimizar el rendimiento del *ngFor
  trackByObjetivo(index: number, objetivo: string): string {
    return objetivo;
  }
  
  // 🔧 MÉTODO DE DEBUG: Para verificar el estado actual
  debugEstado(): void {
    console.log('🔍 === DEBUG ESTADO ACTUAL ===');
    console.log(`📊 selectedCount(): ${this.selectedCount()}`);
    console.log(`🔍 canProceed(): ${this.canProceed()}`);
    console.log(`📋 FormArray length: ${this.selectedObjectives.length}`);
    console.log(`📋 FormArray value:`, this.selectedObjectives.value);
    console.log(`📋 getObjetivosSeleccionados():`, this.getObjetivosSeleccionados());
    console.log('🔍 === FIN DEBUG ===');
  }
}
