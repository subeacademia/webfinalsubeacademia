import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-processing-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 🚀 LOADER PREMIUM PARA PROCESAMIENTO DE IA -->
    <div class="fixed inset-0 bg-gradient-to-br from-blue-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-xl flex justify-center items-center z-50">
      
      <!-- Contenedor principal con efecto glassmorphism -->
      <div class="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        
        <!-- Efectos de fondo animados -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl"></div>
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-3xl"></div>
        
        <!-- Partículas flotantes -->
        <div class="absolute inset-0 overflow-hidden rounded-3xl">
          <div class="floating-particle" style="--delay: 0s; --x: 10%; --y: 20%"></div>
          <div class="floating-particle" style="--delay: 1s; --x: 80%; --y: 60%"></div>
          <div class="floating-particle" style="--delay: 2s; --x: 30%; --y: 80%"></div>
          <div class="floating-particle" style="--delay: 3s; --x: 70%; --y: 30%"></div>
        </div>

        <!-- Logo/Icono principal animado -->
        <div class="relative text-center mb-8">
          <div class="relative w-32 h-32 mx-auto mb-6">
            
            <!-- Círculo exterior con gradiente animado -->
            <div class="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow"></div>
            
            <!-- Círculo de progreso pulsante -->
            <div class="absolute inset-2 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <!-- Icono de IA -->
              <div class="relative">
                <svg class="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                
                <!-- Punto de notificación animado -->
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <!-- Anillos concéntricos animados -->
            <div class="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" style="animation-delay: 0.5s"></div>
            <div class="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping" style="animation-delay: 1s"></div>
          </div>
        </div>
        
        <!-- Título principal con efecto de texto brillante -->
        <div class="relative text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-3 relative">
            <span class="bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
              Procesando con Inteligencia Artificial
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent blur-sm opacity-50 animate-pulse"></div>
          </h2>
          
          <p class="text-blue-100 text-lg leading-relaxed max-w-md mx-auto">
            Nuestra IA está analizando tus respuestas para crear un diagnóstico integral y un plan de acción personalizado
          </p>
        </div>
        
        <!-- Indicadores de progreso con animaciones -->
        <div class="space-y-4 mb-8">
          <div class="progress-step" [class.active]="currentStep() >= 1">
            <div class="flex items-center space-x-4">
              <div class="step-indicator">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <span class="text-blue-100 text-sm font-medium">Analizando respuestas del diagnóstico</span>
            </div>
          </div>
          
          <div class="progress-step" [class.active]="currentStep() >= 2">
            <div class="flex items-center space-x-4">
              <div class="step-indicator">
                <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
              </div>
              <span class="text-blue-100 text-sm font-medium">Evaluando competencias y madurez</span>
            </div>
          </div>
          
          <div class="progress-step" [class.active]="currentStep() >= 3">
            <div class="flex items-center space-x-4">
              <div class="step-indicator">
                <div class="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 1s"></div>
              </div>
              <span class="text-blue-100 text-sm font-medium">Generando análisis personalizado</span>
            </div>
          </div>
          
          <div class="progress-step" [class.active]="currentStep() >= 4">
            <div class="flex items-center space-x-4">
              <div class="step-indicator">
                <div class="w-3 h-3 bg-pink-400 rounded-full animate-pulse" style="animation-delay: 1.5s"></div>
              </div>
              <span class="text-blue-100 text-sm font-medium">Finalizando reporte</span>
            </div>
          </div>
        </div>
        
        <!-- Barra de progreso con gradiente animado -->
        <div class="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
          <div class="progress-bar h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
        </div>
        
        <!-- Mensaje de estado con rotación -->
        <div class="text-center">
          <p class="text-blue-100 text-sm font-medium mb-3">
            {{ currentMessage() }}
          </p>
          
          <!-- Indicadores de carga -->
          <div class="flex justify-center space-x-2">
            <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-white/60 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
        
        <!-- Información adicional -->
        <div class="mt-6 text-center">
          <p class="text-blue-200/70 text-xs">
            Tiempo estimado: ~{{ estimatedTime() }} segundos
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Animaciones personalizadas */
    .animate-spin-slow {
      animation: spin 4s linear infinite;
    }
    
    .animate-ping {
      animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .animate-bounce {
      animation: bounce 1.4s ease-in-out infinite both;
    }
    
    /* Partículas flotantes */
    .floating-particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
      animation-delay: var(--delay);
      left: var(--x);
      top: var(--y);
    }
    
    /* Pasos de progreso */
    .progress-step {
      opacity: 0.5;
      transition: all 0.3s ease;
    }
    
    .progress-step.active {
      opacity: 1;
    }
    
    .progress-step.active .step-indicator {
      transform: scale(1.2);
    }
    
    /* Barra de progreso */
    .progress-bar {
      background-size: 200% 100%;
      animation: gradient-shift 3s ease-in-out infinite;
    }
    
    /* Keyframes */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
      50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
    }
    
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    /* Efectos de hover */
    .step-indicator {
      transition: transform 0.3s ease;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .max-w-2xl {
        max-width: 90vw;
      }
      
      .p-12 {
        padding: 2rem;
      }
      
      .w-32 {
        width: 6rem;
      }
      
      .h-32 {
        height: 6rem;
      }
    }
  `]
})
export class AiProcessingLoaderComponent implements OnInit, OnDestroy {

  
  currentStep = signal(1);
  currentMessage = signal('');
  estimatedTime = signal(30);
  
  private messages: string[] = [];
  private messageIndex = 0;
  private messageInterval: any;
  private stepInterval: any;
  private timeInterval: any;
  
  ngOnInit(): void {
    this.loadMessages();
    this.startMessageRotation();
    this.startStepProgression();
    this.startTimeCountdown();
  }
  
  ngOnDestroy(): void {
    if (this.messageInterval) clearInterval(this.messageInterval);
    if (this.stepInterval) clearInterval(this.stepInterval);
    if (this.timeInterval) clearInterval(this.timeInterval);
  }
  
  private loadMessages(): void {
    this.messages = [
      'Analizando respuestas del diagnóstico...',
      'Evaluando competencias y madurez organizacional...',
      'Generando análisis personalizado con IA...',
      'Construyendo plan de acción estratégico...',
      'Finalizando reporte profesional...',
      'Preparando visualizaciones interactivas...',
      'Optimizando recomendaciones personalizadas...'
    ];
    this.currentMessage.set(this.messages[0] || '');
  }
  
  private startMessageRotation(): void {
    this.messageInterval = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.messages.length;
      this.currentMessage.set(this.messages[this.messageIndex]);
    }, 3000);
  }
  
  private startStepProgression(): void {
    this.stepInterval = setInterval(() => {
      if (this.currentStep() < 4) {
        this.currentStep.update(step => step + 1);
      }
    }, 4000);
  }
  
  private startTimeCountdown(): void {
    this.timeInterval = setInterval(() => {
      if (this.estimatedTime() > 0) {
        this.estimatedTime.update(time => Math.max(0, time - 1));
      }
    }, 1000);
  }
}
