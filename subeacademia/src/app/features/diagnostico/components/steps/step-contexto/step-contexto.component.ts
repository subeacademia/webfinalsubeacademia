import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DiagnosticStateService } from '../../../services/diagnostic-state.service';
import { CompanyProfile } from '../../../data/diagnostic.models';

@Component({
  selector: 'app-step-contexto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
        1. Perfil de la Empresa
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Para personalizar el diagnóstico, necesitamos conocer un poco sobre tu organización.
      </p>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Rubro / Industria -->
        <div>
          <label for="industry" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Rubro / Industria</label>
          <input type="text" id="industry" formControlName="industry"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 placeholder="Ej: Tecnología, Salud, Finanzas, Educación, Retail, Manufactura...">
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Describe tu sector específico para personalizar el diagnóstico</p>
          @if (profileForm.get('industry')?.invalid && profileForm.get('industry')?.touched) {
            <p class="text-red-500 text-xs mt-1">Este campo es requerido.</p>
          }
        </div>

        <!-- Tamaño de la Empresa -->
        <div>
          <label for="size" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tamaño de la Empresa</label>
          <select id="size" formControlName="size"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="1-10">1-10 empleados</option>
            <option value="11-50">11-50 empleados</option>
            <option value="51-200">51-200 empleados</option>
            <option value="201-1000">201-1000 empleados</option>
            <option value="1001+">1001+ empleados</option>
          </select>
        </div>

        <!-- Presupuesto en IA -->
        <div>
          <label for="iaBudgetUSD" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Presupuesto anual para IA (USD)</label>
          <input type="number" id="iaBudgetUSD" formControlName="iaBudgetUSD"
                 class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 placeholder="Ej: 50000, 100000, 500000..."
                 min="0" step="1000">
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Incluye herramientas, personal, infraestructura y proyectos de IA</p>
           @if (profileForm.get('iaBudgetUSD')?.invalid && profileForm.get('iaBudgetUSD')?.touched) {
            <p class="text-red-500 text-xs mt-1">Por favor, introduce un número válido (0 o mayor).</p>
          }
        </div>

        <div class="flex justify-end pt-4">
          <button type="submit" [disabled]="profileForm.invalid"
                  class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Siguiente
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepContextoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private stateService = inject(DiagnosticStateService);

  profileForm!: FormGroup;

  ngOnInit(): void {
    const currentProfile = this.stateService.profile();
    this.profileForm = this.fb.group({
      industry: [currentProfile.industry, Validators.required],
      size: [currentProfile.size, Validators.required],
      iaBudgetUSD: [currentProfile.iaBudgetUSD, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      // Desestructuramos los valores del formulario para asegurar un objeto limpio
      const { industry, size, iaBudgetUSD } = this.profileForm.value;

      // Creamos el objeto parcial de datos con la estructura correcta
      const profileData: CompanyProfile = {
        industry: industry || '',
        size: size || '1-10',
        iaBudgetUSD: iaBudgetUSD || null
      };

      // Actualizamos el estado con el objeto correctamente formado
      this.stateService.updateProfile(profileData);
      
      // Llamamos al método nextStep del servicio
      this.stateService.nextStep();
      
      // Navegación relativa para mantener el idioma en la URL
      this.router.navigate(['ares'], { relativeTo: this.route.parent }).then(() => {
        console.log('✅ Navegación exitosa a ARES');
      }).catch(error => {
        console.error('❌ Error en navegación relativa:', error);
        // Fallback: navegar usando la ruta completa con idioma
        this.router.navigate(['/es', 'diagnostico', 'ares']).catch(fallbackErr => {
          console.error('❌ Error en fallback de navegación:', fallbackErr);
        });
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores de validación
      this.profileForm.markAllAsTouched();
    }
  }
}