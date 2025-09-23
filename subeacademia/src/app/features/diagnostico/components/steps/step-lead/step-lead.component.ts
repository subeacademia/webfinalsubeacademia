import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { DiagnosticsService } from '../../../services/diagnostics.service';
import { ToastService } from '../../../../../core/services/ui/toast/toast.service';
import { ScrollService } from '../../../../../core/services/scroll/scroll.service';

@Component({
  selector: 'app-step-lead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- Preloader elegante -->
    @if (isGenerating) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
          <!-- Animación de IA -->
          <div class="relative mb-6">
            <div class="w-20 h-20 mx-auto relative">
              <!-- Círculo exterior giratorio -->
              <div class="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
              <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
              
              <!-- Círculo interior con pulso -->
              <div class="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
              
              <!-- Icono de IA en el centro -->
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Texto principal -->
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 Inteligencia Artificial Trabajando
          </h3>
          
          <!-- Descripción -->
          <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Nuestra IA está analizando tus respuestas para crear un diagnóstico 
            <strong class="text-blue-600 dark:text-blue-400">completamente personalizado</strong> 
            y un plan de acción estratégico.
          </p>
          
          <!-- Progreso -->
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Analizando perfil profesional...</span>
              <span class="text-green-500">✓</span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Evaluando competencias en IA...</span>
              <span class="text-green-500">✓</span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Generando objetivos SMART...</span>
              <span class="text-green-500">✓</span>
            </div>
            <div class="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400">
              <span>Creando diagnóstico personalizado...</span>
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
              <span>Diseñando plan de acción estratégico...</span>
              <span class="text-gray-400">⏳</span>
            </div>
          </div>
          
          <!-- Tiempo estimado -->
          <div class="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              ⏱️ Tiempo estimado: 30-60 segundos
            </p>
          </div>
        </div>
      </div>
    }

    <!-- Formulario principal -->
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
        <h2 class="text-2xl font-bold mb-1 text-gray-800 dark:text-white">¡Ya casi terminamos!</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Completa tus datos para recibir tu diagnóstico personalizado.</p>
        
        <!-- Tipo de Lead (solo informativo) -->
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    [class]="diagnosticStateService.currentLeadType() === 'empresa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                {{ diagnosticStateService.currentLeadType() === 'empresa' ? '🏢 Empresa' : '👤 Persona Natural' }}
              </span>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                {{ diagnosticStateService.currentLeadType() === 'empresa' ? 'Diagnóstico organizacional' : 'Diagnóstico personal' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Datos personales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
            <input type="text" id="name" formControlName="name" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-red-500 text-sm mt-1">
              Tu nombre es requerido.
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" id="email" formControlName="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
            <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-500 text-sm mt-1">
              Por favor, ingresa un email válido.
            </div>
          </div>
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Opcional)</label>
          <input type="tel" id="phone" formControlName="phone" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Campos específicos para empresas -->
        @if (diagnosticStateService.currentLeadType() === 'empresa') {
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Datos de la Empresa</h3>
            
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label for="companyName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Empresa</label>
                <input type="text" id="companyName" formControlName="companyName" class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                <div *ngIf="form.get('companyName')?.invalid && form.get('companyName')?.touched" class="text-red-500 text-sm mt-1">
                  El nombre de la empresa es requerido.
                </div>
              </div>
            </div>
          </div>
        }

      
        <!-- Checkboxes de consentimiento -->
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="acceptTerms" formControlName="acceptTerms" type="checkbox" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700">
            </div>
            <div class="ml-3 text-sm">
              <label for="acceptTerms" class="font-medium text-gray-700 dark:text-gray-300">Acepto los <a routerLink="/terminos" target="_blank" class="text-blue-600 hover:underline">términos y condiciones</a></label>
            </div>
          </div>
          <div *ngIf="form.get('acceptTerms')?.invalid && form.get('acceptTerms')?.touched" class="text-red-500 text-sm">
            Debes aceptar los términos para continuar.
          </div>

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input id="acceptsCommunications" formControlName="acceptsCommunications" type="checkbox" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700">
            </div>
            <div class="ml-3 text-sm">
              <label for="acceptsCommunications" class="font-medium text-gray-700 dark:text-gray-300">
                Acepto recibir comunicaciones sobre servicios relacionados con IA y transformación digital
              </label>
            </div>
          </div>
        </div>
      
        <div class="flex justify-between items-center pt-4">
          <button type="button" (click)="diagnosticStateService.previousStep()" class="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Anterior
          </button>
          <button 
            type="submit" 
            class="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            [disabled]="form.invalid || isGenerating">
            @if (isGenerating) {
              <span class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </span>
            } @else {
              <span>Finalizar y Ver mi Diagnóstico</span>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class StepLeadComponent {
  @Output() diagnosticFinished = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private diagnosticsService = inject(DiagnosticsService);
  private toastService = inject(ToastService);
  private scrollService = inject(ScrollService);
  public diagnosticStateService = inject(DiagnosticStateService);

  isGenerating = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    // Campos específicos para empresas (solo los que no se piden en el perfil)
    companyName: [''],
    acceptsCommunications: [true, Validators.requiredTrue],
    acceptTerms: [false, Validators.requiredTrue]
  });

  async submit(retryCount = 0): Promise<void> {
    // Validación adicional para empresas
    if (this.diagnosticStateService.currentLeadType() === 'empresa') {
      this.form.get('companyName')?.setValidators([Validators.required]);
      this.form.get('companyName')?.updateValueAndValidity();
    } else {
      this.form.get('companyName')?.clearValidators();
      this.form.get('companyName')?.updateValueAndValidity();
    }

    if (this.form.valid && !this.isGenerating) {
      // Preparar datos del lead
      const leadData = {
        name: this.form.value.name,
        email: this.form.value.email,
        phone: this.form.value.phone,
        acceptsCommunications: this.form.value.acceptsCommunications,
        // Campos específicos para empresas (solo los que no se piden en el perfil)
        companyName: this.form.value.companyName
      };
      
      // Obtener el tipo de lead actual
      const leadType = this.diagnosticStateService.currentLeadType();
      console.log('🔍 StepLead: Tipo de lead actual:', leadType);
      
      // Si no hay tipo de lead, establecer uno por defecto basado en la URL
      if (!leadType) {
        const currentUrl = this.router.url;
        const isEmpresa = currentUrl.includes('/empresa') || currentUrl.includes('empresa');
        const defaultType = isEmpresa ? 'empresa' : 'persona_natural';
        console.log('🔍 StepLead: No hay tipo de lead, estableciendo:', defaultType);
        this.diagnosticStateService.setLeadType(defaultType);
      }
      
      // Actualizar el lead ANTES de la validación
      console.log('🔍 StepLead: Actualizando lead con datos:', leadData);
      this.diagnosticStateService.updateLead(leadData);
      
      // Verificar que el diagnóstico esté completo
      if (!this.diagnosticStateService.isComplete()) {
        this.toastService.show('error', 'Por favor, completa todos los pasos del diagnóstico.');
        return;
      }
      
      this.isGenerating = true;
      console.log('StepLead: Iniciando generación de reporte...');
      this.toastService.show('info', '🤖 Generando tu diagnóstico personalizado... Esto puede tomar hasta 2 minutos.');
      
      try {
        // Usar el nuevo flujo de generación de reporte que incluye el guardado
        console.log('🔍 StepLead: Usando nuevo flujo de generación de reporte...');
        await this.diagnosticStateService.handleDiagnosticFinished();
        
        // Navegar a resultados
        const currentUrl = this.router.url;
        const languagePrefix = currentUrl.match(/^\/([a-z]{2})\//)?.[1] || 'es';
        this.router.navigate([`/${languagePrefix}/diagnostico/resultados`]);
        
        // Hacer scroll automático hacia arriba después de la navegación
        setTimeout(() => {
          this.scrollService.scrollToTopForDiagnostic();
        }, 200);
        
        this.isGenerating = false; // Éxito, reset
        
      } catch (error) {
        console.error('Error al generar el diagnóstico:', error);
        
        // Intentar retry automático para errores de timeout (máximo 2 intentos)
        if (retryCount < 2 && error instanceof Error && 
            (error.message.includes('timeout') || error.message.includes('API tardó demasiado'))) {
          console.log(`🔄 Reintentando generación de diagnóstico (intento ${retryCount + 1}/2)...`);
          this.toastService.show('info', 'La IA tardó en responder. Reintentando...');
          
          // Esperar 3 segundos antes del retry
          setTimeout(() => {
            // No reset isGenerating aquí, se reseteará en la siguiente llamada
            this.submit(retryCount + 1);
          }, 3000);
          return; // IMPORTANTE: return aquí para evitar el manejo de error adicional
        }
        
        // Si llegamos aquí, significa que se agotaron los reintentos o es un error no reintentable
        let errorMessage = 'Hubo un problema al generar tu diagnóstico. Por favor, inténtalo de nuevo.';
        
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('API tardó demasiado')) {
            errorMessage = 'La IA tardó demasiado en responder después de varios intentos. Por favor, inténtalo más tarde.';
          } else if (error.message.includes('Error de conexión')) {
            errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
          } else if (error.message.includes('Demasiadas solicitudes')) {
            errorMessage = 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
          } else if (error.message.includes('Error interno del servidor')) {
            errorMessage = 'Error del servidor. Inténtalo más tarde.';
          } else if (error.message.includes('reporte nulo')) {
            errorMessage = 'La IA generó un reporte vacío o inválido. Por favor, inténtalo de nuevo.';
          }
        }
        
        this.toastService.show('error', errorMessage);
        this.isGenerating = false; // Error final, reset
      }
    } else if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }
}