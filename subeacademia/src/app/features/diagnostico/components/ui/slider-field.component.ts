import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { I18nTranslatePipe } from '../../../../core/i18n/i18n.pipe';
import { ThemeService } from '../../../../shared/theme.service';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { Subscription } from 'rxjs';

export interface SliderFieldConfig {
  id: string;
  labelKey: string;
  descriptionKey: string;
  tooltipKey: string;
  dimension: string;
  phase: string;
  minValue: number;
  maxValue: number;
  step: number;
  labels: string[];
  formControl: FormControl;
}

@Component({
  selector: 'app-slider-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, I18nTranslatePipe, InfoModalComponent],
  template: `
    <div class="bg-slate-800 dark:bg-slate-900 rounded-lg p-6 shadow-xl border border-slate-700 dark:border-slate-600">
      <!-- Header con título, fase y botón de información -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-lg font-semibold text-white dark:text-white">
              {{ config.labelKey | i18nTranslate }}
            </h3>
            <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
              {{ config.phase }}
            </span>
          </div>
          <p class="text-sm text-gray-300 dark:text-gray-400">
            {{ config.descriptionKey | i18nTranslate }}
          </p>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Dimensión: <span class="text-blue-300 dark:text-blue-400">{{ config.dimension }}</span>
          </div>
        </div>
        
        <!-- Botón de información -->
        <button 
          type="button" 
          class="ml-4 p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors duration-200"
          (click)="openInfo()"
          [attr.aria-label]="'Más información sobre ' + (config.labelKey | i18nTranslate)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
      </div>

      <!-- Barra de progreso visual -->
      <div class="mb-4">
        <div class="relative">
          <!-- Etiquetas de valores -->
          <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
            <span>{{ config.minValue }} - {{ config.labels[0] | i18nTranslate }}</span>
            <span>{{ Math.round((config.maxValue + config.minValue) / 2) }} - {{ config.labels[Math.floor(config.labels.length / 2)] | i18nTranslate }}</span>
            <span>{{ config.maxValue }} - {{ config.labels[config.labels.length - 1] | i18nTranslate }}</span>
          </div>
          
          <!-- Barra de progreso visual clickeable -->
          <div class="w-full h-3 bg-slate-600 dark:bg-slate-700 rounded-lg overflow-hidden mb-4 relative cursor-pointer group"
               (click)="onBarClick($event)">
            <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out relative"
                 [style.width.%]="getProgressPercentage()">
              <!-- Indicador de valor actual -->
              <div class="absolute right-0 top-0 w-1 h-full bg-white shadow-lg transform translate-x-1/2"></div>
            </div>
            <!-- Overlay para mostrar hover effect -->
            <div class="absolute inset-0 bg-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
          
          <!-- Slider (oculto visualmente pero funcional para accesibilidad) -->
          <input
            type="range"
            [min]="config.minValue"
            [max]="config.maxValue"
            [step]="config.step"
            [formControl]="config.formControl"
            class="sr-only"
            (input)="onSliderChange($event)">
          
          <!-- Marcadores de pasos con indicadores clickeables -->
          <div class="flex justify-between mt-2 relative">
            <div *ngFor="let label of config.labels; let i = index" 
                 class="text-center text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-blue-400 transition-colors duration-200"
                 (click)="setValueFromStep(i)">
              <div class="w-3 h-3 bg-slate-500 dark:bg-slate-600 rounded-full mx-auto mb-1 hover:bg-blue-500 transition-colors duration-200"></div>
              <span class="block w-16">{{ label | i18nTranslate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Valor actual y etiqueta -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-300 dark:text-gray-400">
          Valor actual: <span class="font-semibold text-white dark:text-white">{{ currentValue }}</span>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-blue-400 dark:text-blue-300">
            {{ getCurrentLabel() | i18nTranslate }}
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500">
            {{ getCurrentDescription() | i18nTranslate }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de información -->
    <app-info-modal 
      [open]="modalOpen" 
      [content]="modalText" 
      (close)="modalOpen = false">
    </app-info-modal>
  `,
  styles: [`
    /* Estilos para la barra de progreso interactiva */
    .cursor-pointer {
      cursor: pointer;
    }
    
    /* Efecto hover en los marcadores de pasos */
    .hover\\:bg-blue-500:hover {
      background-color: #3b82f6;
    }
    
    .hover\\:text-blue-400:hover {
      color: #60a5fa;
    }
    
    /* Transiciones suaves */
    .transition-colors {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    
    .transition-opacity {
      transition-property: opacity;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    
    /* Indicador de valor actual en la barra */
    .bg-white {
      background-color: #ffffff;
    }
    
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderFieldComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: SliderFieldConfig;
  @Output() valueChange = new EventEmitter<number>();

  modalOpen = false;
  modalText = '';
  currentValue: number = 1;
  
  protected readonly Math = Math;
  private readonly themeService = inject(ThemeService);
  private subscription?: Subscription;

  ngOnInit(): void {
    // Inicializar el valor del slider
    this.currentValue = this.config.formControl.value || this.config.minValue;
    
    // Suscribirse a cambios en el formControl
    this.subscription = this.config.formControl.valueChanges.subscribe(value => {
      this.currentValue = value || this.config.minValue;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSliderChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.currentValue = value;
    this.config.formControl.setValue(value);
    this.valueChange.emit(value);
  }

  getCurrentLabel(): string {
    const value = this.currentValue;
    const index = Math.round(((value - this.config.minValue) / (this.config.maxValue - this.config.minValue)) * (this.config.labels.length - 1));
    return this.config.labels[Math.max(0, Math.min(index, this.config.labels.length - 1))];
  }

  getCurrentDescription(): string {
    const value = this.currentValue;
    const descriptions = [
      'Nivel muy básico, requiere desarrollo fundamental',
      'Nivel básico, con algunas capacidades iniciales',
      'Nivel intermedio, con implementación parcial',
      'Nivel avanzado, con implementación sólida',
      'Nivel líder, con excelencia operativa'
    ];
    const index = Math.round(((value - this.config.minValue) / (this.config.maxValue - this.config.minValue)) * (descriptions.length - 1));
    return descriptions[Math.max(0, Math.min(index, descriptions.length - 1))];
  }

  getProgressPercentage(): number {
    const value = this.currentValue;
    const min = this.config.minValue;
    const max = this.config.maxValue;
    const percentage = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, percentage));
  }

  openInfo(): void {
    this.modalText = this.config.tooltipKey;
    this.modalOpen = true;
  }

  onBarClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    // Calcular el valor basado en el porcentaje
    const value = Math.round(
      this.config.minValue + (percentage / 100) * (this.config.maxValue - this.config.minValue)
    );
    
    // Asegurar que el valor esté dentro del rango y en los pasos correctos
    const clampedValue = Math.max(this.config.minValue, Math.min(this.config.maxValue, value));
    const steppedValue = Math.round(clampedValue / this.config.step) * this.config.step;
    
    this.currentValue = steppedValue;
    this.config.formControl.setValue(steppedValue);
    this.valueChange.emit(steppedValue);
  }

  setValueFromStep(index: number): void {
    // Calcular el valor basado en el índice del paso
    const value = this.config.minValue + index;
    
    // Asegurar que el valor esté dentro del rango
    const clampedValue = Math.max(this.config.minValue, Math.min(this.config.maxValue, value));
    
    this.currentValue = clampedValue;
    this.config.formControl.setValue(clampedValue);
    this.valueChange.emit(clampedValue);
  }
}
