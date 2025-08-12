import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nTranslatePipe as I18nPipe } from '../../../core/i18n/i18n.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, I18nPipe],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  isLoading = false;
  messages: Message[] = [];
  starterQuestions: string[] = [
    'chatbot.starter1',
    'chatbot.starter2',
    'chatbot.starter3',
  ];

  constructor(private readonly i18n: I18nService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.initWelcome();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  async sendMessage(questionKey?: string): Promise<void> {
    const text = questionKey ? this.i18n.translate(questionKey) : this.userInput.trim();
    if (!text || this.isLoading) return;

    this.addUserMessage(text);
    this.userInput = '';
    this.isLoading = true;

    try {
      const response = await fetch('https://apisube-smoky.vercel.app/api/azure/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: text, history: [] }),
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      this.addBotMessage(data.response ?? '');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al llamar a la API de IA:', error);
      this.addBotMessage(this.i18n.translate('chatbot.error_response'));
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
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

  private async initWelcome(): Promise<void> {
    try {
      await this.i18n.ensureLoaded(this.i18n.currentLang() as any);
    } catch {}
    this.addBotMessage(this.i18n.translate('chatbot.welcome'));
  }
}


