import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService } from './ia.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="container mx-auto p-6">
      <h2 class="text-3xl font-semibold">Laboratorio IA</h2>
      <p class="text-muted mt-2">Interactúa con nuestro asistente.</p>

      <form class="mt-6 grid gap-3 max-w-3xl" (ngSubmit)="onAsk()">
        <textarea [ngModel]="prompt()" (ngModelChange)="prompt.set($event)" name="prompt" rows="4" class="ui-input" placeholder="Escribe tu pregunta..." required></textarea>
        <div class="flex items-center gap-3">
          <button class="ui-btn" type="submit" [disabled]="loading()">{{ loading() ? 'Enviando…' : 'Preguntar' }}</button>
          <span class="muted" *ngIf="!isBrowser">La IA solo funciona en el navegador.</span>
        </div>
      </form>

      <div class="mt-8 max-w-3xl">
        <h3 class="h3" *ngIf="answer()">Respuesta</h3>
        <pre class="mt-2 whitespace-pre-wrap">{{ answer() }}</pre>
        <p class="text-red-400 mt-2" *ngIf="error()">{{ error() }}</p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaComponent {
  prompt = signal('');
  answer = signal('');
  error = signal('');
  loading = signal(false);
  isBrowser = false;

  constructor(
    private readonly ia: IaService,
    private readonly seo: SeoService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.seo.updateTags({
      title: 'Asistente IA | Sube Academ-IA',
      description: 'Haz preguntas y obtén respuestas de nuestro asistente IA.',
      image: 'assets/og-placeholder.svg',
    });
  }

  async onAsk() {
    this.error.set('');
    this.answer.set('');
    const q = this.prompt().trim();
    if (!q || !this.isBrowser) return;
    this.loading.set(true);
    try {
      // La API espera un esquema tipo OpenAI: { messages: [{role, content}], ... }
      const payload = {
        messages: [
          { role: 'system', content: 'Eres un asistente de Sube Academ-IA. Responde de forma breve, clara y útil.' },
          { role: 'user', content: q }
        ],
        maxTokens: 600,
        temperature: 0.7
      };
      const res = await this.ia.generarTextoAzureOnce(payload);
      const text = (res as any)?.choices?.[0]?.message?.content
        || (res as any)?.content
        || (res as any)?.text
        || (res as any)?.message
        || (typeof res === 'string' ? res : JSON.stringify(res));
      this.answer.set(text);
    } catch (err: any) {
      const raw = err?.error;
      const friendly = (typeof raw === 'string' && raw)
        || raw?.error
        || raw?.message
        || err?.message
        || 'Error al consultar el asistente';
      this.error.set(friendly);
    } finally {
      this.loading.set(false);
    }
  }
}

