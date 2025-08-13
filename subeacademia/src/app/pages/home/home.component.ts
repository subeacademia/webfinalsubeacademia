import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { SettingsService, HomePageContent } from '../../core/data/settings.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterModule, HeroSceneComponent, I18nTranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(public readonly i18n: I18nService, private readonly settings: SettingsService, @Inject(PLATFORM_ID) private platformId: object) {}

  private contentSub?: Subscription;
  phrases: string[] = ['Cargando frases...'];

  private typewriterElement?: HTMLElement | null;
  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: any;

  ngOnInit(): void {
    this.contentSub = this.settings.getHomePageContent().subscribe((c: HomePageContent | undefined) => {
      this.phrases = c?.typewriterPhrases?.length ? c.typewriterPhrases : ['Transformar tu Empresa.'];
      if (typeof document !== 'undefined') {
        this.typewriterElement = document.getElementById('typewriter');
        if (this.typewriterElement) {
          clearTimeout(this.timeoutId);
          this.resetTypewriterState();
          this.type();
        }
      }
    });
  }

  private resetTypewriterState() {
    this.phraseIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
  }

  private type(): void {
    if (!this.typewriterElement || !this.phrases?.length) return;
    const current = this.phrases[this.phraseIndex % this.phrases.length];
    const fullText = current;
    const displayed = this.isDeleting ? fullText.substring(0, this.charIndex - 1) : fullText.substring(0, this.charIndex + 1);
    this.typewriterElement.textContent = displayed;

    const typingSpeed = this.isDeleting ? 50 : 110;
    const pauseAtEnd = 1200;

    if (!this.isDeleting && displayed === fullText) {
      this.isDeleting = true;
      this.timeoutId = setTimeout(() => this.type(), pauseAtEnd);
      return;
    }

    if (this.isDeleting && displayed === '') {
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
    }

    this.charIndex = this.isDeleting ? Math.max(0, this.charIndex - 1) : Math.min(fullText.length, this.charIndex + 1);
    this.timeoutId = setTimeout(() => this.type(), typingSpeed);
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
    clearTimeout(this.timeoutId);
  }
}

