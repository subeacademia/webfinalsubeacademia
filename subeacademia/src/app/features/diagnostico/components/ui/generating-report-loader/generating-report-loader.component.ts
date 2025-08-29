import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../../../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-generating-report-loader',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe],
  template: `
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div class="bg-[var(--panel)]/90 backdrop-blur-md rounded-3xl p-12 border border-[var(--border)] shadow-2xl max-w-md w-full mx-4">
        <!-- Logo/Icono animado -->
        <div class="text-center mb-8">
          <div class="relative w-24 h-24 mx-auto mb-6">
            <!-- Círculo exterior animado -->
            <div class="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-pulse"></div>
            
            <!-- Círculo de progreso -->
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
            
            <!-- Círculo interior con gradiente -->
            <div class="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Texto principal -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-[var(--fg)] mb-3">
            {{ 'diagnostico.loader.title' | i18nTranslate }}
          </h2>
          <p class="text-[var(--muted)] text-lg leading-relaxed">
            {{ 'diagnostico.loader.subtitle' | i18nTranslate }}
          </p>
        </div>
        
        <!-- Indicadores de progreso -->
        <div class="space-y-4 mb-8">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-[var(--muted)] text-sm">{{ 'diagnostico.loader.step1' | i18nTranslate }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
            <span class="text-[var(--muted)] text-sm">{{ 'diagnostico.loader.step2' | i18nTranslate }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 1s"></div>
            <span class="text-[var(--muted)] text-sm">{{ 'diagnostico.loader.step3' | i18nTranslate }}</span>
          </div>
        </div>
        
        <!-- Barra de progreso -->
        <div class="w-full bg-[var(--border)] rounded-full h-2 mb-6">
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style="width: 85%"></div>
        </div>
        
        <!-- Mensaje de estado -->
        <div class="text-center">
          <p class="text-[var(--muted)] text-sm font-medium">
            {{ currentMessage }}
          </p>
          <div class="flex justify-center space-x-1 mt-3">
            <div class="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .animate-spin {
      animation: spin 3s linear infinite;
    }
    
    .animate-bounce {
      animation: bounce 1.4s ease-in-out infinite both;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
    
    /* Efecto de brillo en el borde */
    .border-t-blue-500 {
      background: linear-gradient(90deg, transparent, #3b82f6, transparent);
      background-size: 200% 100%;
      animation: shine 2s ease-in-out infinite;
    }
    
    @keyframes shine {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class GeneratingReportLoaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('loaderSvg') loaderSvg!: ElementRef;
  @ViewChild('progressCircle') progressCircle!: ElementRef;

  currentMessage = '';
  private messages: string[] = [];
  private messageIndex = 0;
  private messageInterval: any;
  
  constructor(private readonly i18n: I18nService) {
    this.loadMessages();
  }

  ngAfterViewInit(): void {
    this.startMessageRotation();
  }

  private loadMessages(): void {
    this.messages = [
      this.i18n.translate('diagnostico.loader.msg1'),
      this.i18n.translate('diagnostico.loader.msg2'),
      this.i18n.translate('diagnostico.loader.msg3'),
      this.i18n.translate('diagnostico.loader.msg4'),
      this.i18n.translate('diagnostico.loader.msg5'),
    ];
    this.currentMessage = this.messages[0] || '';
  }

  private startMessageRotation(): void {
    this.messageInterval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      this.currentMessage = this.messages[this.messageIndex];
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  }
}
