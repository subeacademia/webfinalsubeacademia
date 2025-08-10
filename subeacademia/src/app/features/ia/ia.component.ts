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
        <textarea [ngModel]="prompt()" (ngModelChange)="prompt.set($event)" name="prompt" rows="4" class="input" placeholder="Escribe tu pregunta..." required></textarea>
        <div class="flex items-center gap-3">
          <button class="btn btn-primary" type="submit" [disabled]="loading()">{{ loading() ? 'Enviando…' : 'Preguntar' }}</button>
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
      const res = await this.ia.askOnce<{ prompt: string }, { text?: string; answer?: string; content?: string; message?: string }>({ prompt: q });
      const text = (res as any)?.text || (res as any)?.answer || (res as any)?.content || (res as any)?.message || JSON.stringify(res);
      this.answer.set(text);
    } catch (err: any) {
      this.error.set(err?.message || 'Error al consultar el asistente');
    } finally {
      this.loading.set(false);
    }
  }
}

