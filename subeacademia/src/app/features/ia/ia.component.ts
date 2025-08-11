import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule, NgFor, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService } from './ia.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor],
  template: `
    <section class="container mx-auto p-0 md:p-6">
      <div class="mx-auto max-w-3xl rounded-lg border border-white/10 bg-[var(--panel)]/40 overflow-hidden">
        <header class="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-[var(--panel)]/60 backdrop-blur">
          <div class="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center font-bold">IA</div>
          <div>
            <div class="font-semibold">Sube Academ-IA</div>
            <div class="text-xs text-[var(--muted)]">Asistente impulsado por Azure</div>
          </div>
          <span class="flex-1"></span>
          <span *ngIf="loading()" class="text-xs text-[var(--muted)] animate-pulse">pensando…</span>
        </header>

        <div #chatScroll class="h-[65vh] md:h-[70vh] overflow-y-auto px-3 md:px-4 py-4 space-y-4 scroll-smooth">
          <div *ngFor="let m of messages()" class="flex gap-3" [class.flex-row-reverse]="m.role === 'user'">
            <div class="h-8 w-8 shrink-0 rounded-full grid place-items-center text-sm"
                 [ngClass]="m.role==='assistant' ? 'bg-gradient-to-br from-emerald-500 to-cyan-600' : 'bg-white/10'">
              {{ m.role==='assistant' ? 'IA' : 'Tú' }}
            </div>
            <div class="max-w-[80%] rounded-xl px-3 py-2 leading-relaxed shadow-sm"
                 [ngClass]="m.role==='assistant' ? 'bg-white/5' : 'bg-[var(--accent)]/20'">
              <div class="whitespace-pre-wrap">{{ m.content }}</div>
            </div>
          </div>
          <div *ngIf="loading()" class="flex gap-3">
            <div class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 grid place-items-center text-sm">IA</div>
            <div class="rounded-xl px-3 py-2 bg-white/5">
              <span class="inline-flex gap-1 items-center">
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:-0.2s]"></span>
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0.2s]"></span>
              </span>
            </div>
          </div>
        </div>

        <form class="border-t border-white/10 p-3 md:p-4 bg-[var(--panel)]/60 backdrop-blur" (ngSubmit)="onAsk()">
          <div class="flex items-end gap-3">
            <textarea [ngModel]="prompt()" (ngModelChange)="prompt.set($event)" name="prompt" rows="2"
                      class="ui-input flex-1 resize-none" placeholder="Escribe tu mensaje…" required></textarea>
            <button class="ui-btn" type="submit" [disabled]="loading() || !prompt().trim()">Enviar</button>
          </div>
          <p class="text-red-400 mt-2" *ngIf="error()">{{ error() }}</p>
        </form>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaComponent {
  prompt = signal('');
  messages = signal<{ role: 'user'|'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hola, soy tu asistente de Sube Academ-IA. ¿En qué puedo ayudarte hoy?' }
  ]);
  error = signal('');
  loading = signal(false);
  isBrowser = false;
  @ViewChild('chatScroll') private chatEl?: ElementRef<HTMLDivElement>;

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
    const q = this.prompt().trim();
    if (!q || !this.isBrowser) return;
    this.loading.set(true);
    // Añadir mensaje de usuario al hilo
    this.messages.update(arr => [...arr, { role: 'user', content: q }]);
    this.prompt.set('');
    this.scrollToBottomSoon();
    try {
      // La API espera un esquema tipo OpenAI: { messages: [{role, content}], ... }
      const payload = {
        messages: [
          { role: 'system', content: 'Eres un asistente de Sube Academ-IA. Responde de forma breve, clara y útil.' },
          ...this.messages().map(m => ({ role: m.role, content: m.content })),
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
      this.messages.update(arr => [...arr, { role: 'assistant', content: text }]);
      this.scrollToBottomSoon();
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

  private scrollToBottomSoon(){
    if (!this.isBrowser) return;
    setTimeout(() => {
      try {
        const el = this.chatEl?.nativeElement; if (!el) return;
        el.scrollTop = el.scrollHeight;
      } catch { /* noop */ }
    }, 0);
  }
}

