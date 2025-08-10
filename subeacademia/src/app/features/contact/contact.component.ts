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
  <section class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-semibold mb-4">Contacto</h1>
    <form (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required class="w-full border rounded p-2" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" type="email" required class="w-full border rounded p-2" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Mensaje</label>
        <textarea [ngModel]="message()" (ngModelChange)="message.set($event)" name="message" rows="5" required class="w-full border rounded p-2"></textarea>
      </div>
      <button type="submit" [disabled]="loading()" class="bg-blue-600 text-white px-4 py-2 rounded">
        {{ loading() ? 'Enviando…' : 'Enviar' }}
      </button>
      <p *ngIf="success()" class="text-green-600">Mensaje enviado correctamente.</p>
      <p *ngIf="error()" class="text-red-600">{{ error() }}</p>
    </form>
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
      this.success.set(true);
      this.name.set('');
      this.email.set('');
      this.message.set('');
    } catch (e: any) {
      const msg = e?.error?.error || e?.message || 'Error al enviar';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

