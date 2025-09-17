import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui-kit/button/button';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-consentimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiButtonComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 md:px-6">
      <div class="mb-6 md:mb-8 text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
          Consentimiento Informado
        </h2>
        <p class="text-base md:text-lg text-gray-600 dark:text-gray-400">
          {{ isMenor ? 'Para menores de edad (8-17 años)' : 'Para adultos (18+ años)' }}
        </p>
      </div>

      <form [formGroup]="consentForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Contenido del consentimiento -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:p-6 text-xs md:text-sm leading-relaxed">
          <div *ngIf="!isMenor; else consentimientoMenor">
            <!-- Consentimiento para adultos -->
            <h3 class="font-semibold text-base md:text-lg mb-3 md:mb-4 text-gray-900 dark:text-white">
              Consentimiento para Adultos
            </h3>
            <div class="space-y-3 md:space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Autorizo el tratamiento de mis respuestas</strong> exclusivamente para elaborar mi diagnóstico personalizado de competencias en Inteligencia Artificial y sugerirme rutas formativas adaptadas a mis necesidades.
              </p>
              <p>
                <strong>Datos recopilados:</strong> Edad, respuestas al cuestionario, y resultados del diagnóstico. No se solicita información personal identificable como nombre, email o datos de contacto.
              </p>
              <p>
                <strong>Uso de la información:</strong> Los datos se utilizan únicamente para generar el diagnóstico y recomendaciones educativas. No se comparten con terceros.
              </p>
              <p>
                <strong>Derechos:</strong> Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos.
              </p>
            </div>
          </div>

          <ng-template #consentimientoMenor>
            <!-- Consentimiento para menores -->
            <h3 class="font-semibold text-base md:text-lg mb-3 md:mb-4 text-gray-900 dark:text-white">
              Consentimiento para Menores de Edad
            </h3>
            <div class="space-y-3 md:space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Como madre/padre/apoderado/a autorizo</strong> la participación de mi hijo/a de {{ edad }} años en este diagnóstico de competencias en Inteligencia Artificial.
              </p>
              <p>
                <strong>Objetivo:</strong> Evaluar las competencias en IA del menor para proporcionar recomendaciones educativas apropiadas para su edad.
              </p>
              <p>
                <strong>Datos recopilados:</strong> Edad, respuestas al cuestionario adaptado para menores, y resultados del diagnóstico. No se solicita información personal identificable.
              </p>
              <p>
                <strong>Uso de la información:</strong> Los datos se utilizan únicamente para generar el diagnóstico y recomendaciones educativas. No se comparten con terceros.
              </p>
            </div>
          </ng-template>
        </div>

        <!-- Campos del formulario -->
        <div class="space-y-4">
          <!-- Checkbox de aceptación -->
          <div class="flex items-start space-x-3">
            <input
              type="checkbox"
              formControlName="acepto"
              id="acepto"
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="acepto" class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
              <span *ngIf="!isMenor">
                He leído y acepto el consentimiento informado para el tratamiento de mis datos.
              </span>
              <span *ngIf="isMenor">
                Como padre/madre/apoderado/a, he leído y acepto el consentimiento para la participación de mi hijo/a.
              </span>
            </label>
          </div>

          <!-- Campo adicional para menores: nombre del tutor -->
          <div *ngIf="isMenor" class="space-y-2">
            <label for="tutor" class="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del padre/madre/apoderado/a (opcional)
            </label>
            <input
              type="text"
              formControlName="tutor"
              id="tutor"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base"
              placeholder="Tu nombre"
            />
          </div>

          <!-- Asentimiento del menor -->
          <div *ngIf="isMenor" class="flex items-start space-x-3">
            <input
              type="checkbox"
              formControlName="asentimientoMenor"
              id="asentimientoMenor"
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="asentimientoMenor" class="text-xs md:text-sm text-gray-700 dark:text-gray-300">
              <strong>Para el menor:</strong> ¿Quieres participar en este diagnóstico? Tus respuestas nos ayudan a mejorar tu aprendizaje. Puedes detenerte cuando quieras.
            </label>
          </div>
        </div>

        <!-- Mensajes de validación -->
        <div *ngIf="consentForm.get('acepto')?.invalid && consentForm.get('acepto')?.touched" class="text-red-600 dark:text-red-400 text-xs md:text-sm">
          Debes aceptar el consentimiento para continuar
        </div>

        <div *ngIf="isMenor && consentForm.get('asentimientoMenor')?.invalid && consentForm.get('asentimientoMenor')?.touched" class="text-red-600 dark:text-red-400 text-xs md:text-sm">
          El menor debe dar su asentimiento para participar
        </div>

        <!-- Botones -->
        <div class="flex flex-col sm:flex-row gap-4 pt-6">
          <app-ui-button
            type="button"
            variant="ghost"
            (clicked)="volver()"
            class="w-full sm:w-auto"
          >
            ← Volver
          </app-ui-button>
          
          <app-ui-button
            type="submit"
            variant="primary"
            size="lg"
            [disabled]="!consentForm.valid"
            class="w-full sm:w-auto"
          >
            Continuar al Cuestionario →
          </app-ui-button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentimientoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);

  consentForm: FormGroup;
  isMenor = false;
  edad = 0;

  constructor() {
    this.consentForm = this.fb.group({
      acepto: [false, Validators.requiredTrue],
      tutor: [''],
      asentimientoMenor: [false]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isMenor = params['group'] === 'menor';
      this.edad = parseInt(params['edad']) || 0;
      
      // Ajustar validaciones según el tipo de usuario
      if (this.isMenor) {
        this.consentForm.get('asentimientoMenor')?.setValidators([Validators.requiredTrue]);
      } else {
        this.consentForm.get('asentimientoMenor')?.clearValidators();
      }
      this.consentForm.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.consentForm.valid) {
      const group = this.isMenor ? 'menor' : 'adulto';
      
      // Crear sesión con los datos del consentimiento
      const consent = {
        acepto: this.consentForm.get('acepto')?.value,
        tutor: this.consentForm.get('tutor')?.value || '',
        asentimientoMenor: this.consentForm.get('asentimientoMenor')?.value || false
      };
      
      const sessionId = this.sessionService.createSession(this.edad, group, consent);
      console.log('✅ Sesión creada:', sessionId);
      
      this.router.navigate([`/es/diagnostico-persona/cuestionario/${group}`], {
        queryParams: { edad: this.edad }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/es/diagnostico-persona/edad']);
  }
}
