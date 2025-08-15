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

      <!-- Slider principal -->
      <div class="mb-4">
        <div class="relative">
          <!-- Etiquetas de valores -->
          <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
            <span>{{ config.minValue }} - {{ config.labels[0] | i18nTranslate }}</span>
            <span>{{ Math.round((config.maxValue + config.minValue) / 2) }} - {{ config.labels[Math.floor(config.labels.length / 2)] | i18nTranslate }}</span>
            <span>{{ config.maxValue }} - {{ config.labels[config.labels.length - 1] | i18nTranslate }}</span>
          </div>
          
          <!-- Slider -->
          <input
            type="range"
            [min]="config.minValue"
            [max]="config.maxValue"
            [step]="config.step"
            [formControl]="config.formControl"
            class="w-full h-3 bg-slate-600 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            (input)="onSliderChange($event)">
          
          <!-- Marcadores de pasos -->
          <div class="flex justify-between mt-2">
            <div *ngFor="let label of config.labels; let i = index" 
                 class="text-center text-xs text-gray-400 dark:text-gray-500">
              <div class="w-2 h-2 bg-slate-500 dark:bg-slate-600 rounded-full mx-auto mb-1"></div>
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
    .slider {
      background: linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #475569 50%, #475569 100%);
    }
    
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .slider::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .slider::-ms-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Dark mode adjustments */
    .dark .slider {
      background: linear-gradient(to right, #60a5fa 0%, #60a5fa 50%, #64748b 50%, #64748b 100%);
    }
    
    .dark .slider::-webkit-slider-thumb {
      background: #60a5fa;
      border-color: #1e293b;
    }
    
    .dark .slider::-moz-range-thumb {
      background: #60a5fa;
      border-color: #1e293b;
    }
    
    .dark .slider::-ms-thumb {
      background: #60a5fa;
      border-color: #1e293b;
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

  openInfo(): void {
    this.modalText = this.config.tooltipKey;
    this.modalOpen = true;
  }
}
