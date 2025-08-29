import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RecaptchaV3Service } from '../../core/services/recaptcha-v3.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
  <section class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-16">
    <div class="max-w-4xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Habla con un 
          <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Asesor Especializado</span>
        </h1>
        <p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Nuestros expertos en IA están listos para ayudarte a transformar tu organización. 
          Cuéntanos sobre tu proyecto y te responderemos en menos de 24 horas.
        </p>
      </div>

      <!-- Formulario -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12">
        <form (ngSubmit)="submit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nombre completo *
              </label>
              <input 
                [ngModel]="name()" 
                (ngModelChange)="name.set($event)" 
                name="name" 
                required 
                class="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-4 text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="Tu nombre completo" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email corporativo *
              </label>
              <input 
                [ngModel]="email()" 
                (ngModelChange)="email.set($event)" 
                name="email" 
                type="email" 
                required 
                class="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-4 text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="tu@empresa.com" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ¿En qué podemos ayudarte? *
            </label>
            <textarea 
              [ngModel]="message()" 
              (ngModelChange)="message.set($event)" 
              name="message" 
              rows="6" 
              required 
              class="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-4 text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none" 
              placeholder="Describe tu proyecto, objetivos o consulta. Por ejemplo: 'Quiero implementar IA en mi empresa para automatizar procesos de atención al cliente...'"></textarea>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              [disabled]="loading()" 
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              <span *ngIf="!loading()" class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                Enviar mensaje
              </span>
              <span *ngIf="loading()" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            </button>
          </div>

          <!-- Mensajes de estado -->
          <div *ngIf="success()" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
            <div class="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="font-medium">¡Mensaje enviado correctamente!</span>
            </div>
            <p class="text-green-600 dark:text-green-400 text-sm mt-1">
              Te responderemos en menos de 24 horas.
            </p>
          </div>
          
          <div *ngIf="error()" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
            <div class="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-medium">Error al enviar el mensaje</span>
            </div>
            <p class="text-red-600 dark:text-red-400 text-sm mt-1">{{ error() }}</p>
          </div>
        </form>
      </div>

      <!-- Información adicional -->
      <div class="mt-12 text-center">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Respuesta rápida</h3>
            <p class="text-slate-600 dark:text-slate-400">Te respondemos en menos de 24 horas</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Consulta gratuita</h3>
            <p class="text-slate-600 dark:text-slate-400">Primera consulta sin costo</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Equipo experto</h3>
            <p class="text-slate-600 dark:text-slate-400">Especialistas certificados en IA</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  `,
})
export class ContactComponent {
  private readonly http = inject(HttpClient);
  private readonly recaptcha = inject(RecaptchaV3Service);
  private readonly endpoint = (environment.contactEndpoint || '').trim();

  name = signal('');
  email = signal('');
  message = signal('');
  loading = signal(false);
  success = signal(false);
  error = signal('');

  async submit(): Promise<void> {
    this.error.set('');
    this.success.set(false);
    
    // Validar campos requeridos
    if (!this.name() || !this.email() || !this.message()) {
      this.error.set('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.error.set('Por favor, ingresa un email válido.');
      return;
    }
    
    if (!this.endpoint) {
      this.error.set('Endpoint no configurado.');
      return;
    }
    
    this.loading.set(true);
    try {
      const recaptchaToken = await this.recaptcha.execute('contact_submit');
      const payload = {
        name: this.name(),
        email: this.email(),
        message: this.message(),
        recaptchaToken,
      };
      await this.http.post(this.endpoint, payload, { withCredentials: false }).toPromise();
      
      // Mensaje de éxito personalizado
      this.success.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
      
      // Mostrar mensaje de éxito por más tiempo y agregar mensaje de confirmación
      setTimeout(() => {
        this.success.set(false);
      }, 8000);
    } catch (e: any) {
      const msg = e?.error?.error || e?.message || 'Error al enviar';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

