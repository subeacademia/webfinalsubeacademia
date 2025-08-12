import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nTranslatePipe as I18nPipe } from '../../../core/i18n/i18n.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AsistenteIaService } from './asistente-ia.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface MensajeHistorial {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, I18nPipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  providers: [I18nPipe],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  isLoading = false;
  messages: Message[] = [];
  historialMensajes: MensajeHistorial[] = [];
  private promptSistema =
    'Eres el asistente virtual oficial de Sube Academ-IA. Responde de manera breve, cordial y profesional. Si no sabes algo, invita a contactar a un asesor desde la página de contacto.';
  starterQuestions: string[] = [
    'chatbot.starter1',
    'chatbot.starter2',
    'chatbot.starter3',
  ];

  private readonly iaService = inject(AsistenteIaService);
  constructor(
    private readonly i18nPipe: I18nPipe,
    private readonly i18n: I18nService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.initI18nAndWelcome();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  async sendMessage(questionKey?: string): Promise<void> {
    const text = questionKey ? this.i18nPipe.transform(questionKey) : this.userInput.trim();
    if (!text || this.isLoading) return;

    this.addUserMessage(text);
    this.userInput = '';
    this.isLoading = true;

    // Actualizar historial con el mensaje del usuario
    this.agregarAlHistorial('user', text);

    const payload = {
      messages: [
        { role: 'system', content: this.promptSistema },
        ...this.historialMensajes,
      ],
      maxTokens: 800,
      temperature: 0.7,
    };

    this.iaService.generarTextoAzure(payload).subscribe({
      next: (res: any) => {
        let contenido = '';
        if (res?.choices?.[0]?.message?.content) contenido = res.choices[0].message.content;
        else if (typeof res?.text === 'string') contenido = res.text;
        else if (typeof res === 'string') contenido = res;
        else contenido = this.i18nPipe.transform('chatbot.error_response');

        this.addBotMessage(contenido);
        this.agregarAlHistorial('assistant', contenido);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Error al llamar a la API de IA:', err);
        this.addBotMessage(this.i18nPipe.transform('chatbot.error_response'));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private addBotMessage(text: string): void {
    this.messages.push({ text, sender: 'bot' });
  }

  private addUserMessage(text: string): void {
    this.messages.push({ text, sender: 'user' });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch {}
  }

  private async initI18nAndWelcome(): Promise<void> {
    try {
      await this.i18n.setLang(this.i18n.currentLang() as any);
    } catch {}
    this.addBotMessage(this.i18nPipe.transform('chatbot.welcome'));
    this.cdr.detectChanges();
  }

  private agregarAlHistorial(role: 'user' | 'assistant', content: string): void {
    this.historialMensajes.push({ role, content });
    if (this.historialMensajes.length > 20) {
      this.historialMensajes = this.historialMensajes.slice(-20);
    }
  }
}


