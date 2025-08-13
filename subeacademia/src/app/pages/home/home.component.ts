import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { Router, RouterModule } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SettingsService, HomePageContent } from '../../core/data/settings.service';
import { Subscription, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeroSceneComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    public readonly i18n: I18nService,
    private readonly settings: SettingsService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private contentSub?: Subscription;
  frasesDinamicas: string[] = [];
  tituloHome = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
  private typewriterElement?: HTMLElement | null;
  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: any;

  ngOnInit(): void {
    this.contentSub = this.i18n.currentLang$
      .pipe(
        distinctUntilChanged(),
        switchMap((lang: any) => this.settings.getHomePageContent(lang as 'es'|'en'|'pt'))
      )
      .subscribe((c: HomePageContent | undefined) => {
        this.frasesDinamicas = c?.typewriterPhrases?.length ? c.typewriterPhrases : [];
        if (!this.frasesDinamicas.length) {
          this.frasesDinamicas = [
            'Implementa IA de forma Ágil, Responsable y Sostenible con nuestro Framework ARES-AI©.',
            'Desarrolla las 13 competencias clave que tu equipo necesita para liderar la transformación digital.',
            'Transforma tu organización con nuestra plataforma de aprendizaje adaptativo AVE-AI.'
          ];
        }
        this.tituloHome = c?.title || 'Potencia tu Talento en la Era de la Inteligencia Artificial';
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
    if (!this.typewriterElement || !this.frasesDinamicas?.length) return;
    const current = this.frasesDinamicas[this.phraseIndex % this.frasesDinamicas.length];
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
      this.phraseIndex = (this.phraseIndex + 1) % this.frasesDinamicas.length;
    }

    this.charIndex = this.isDeleting ? Math.max(0, this.charIndex - 1) : Math.min(fullText.length, this.charIndex + 1);
    this.timeoutId = setTimeout(() => this.type(), typingSpeed);
  }

  iniciarDiagnostico(): void {
    const lang = this.i18n.currentLang();
    this.router.navigate(['/', lang, 'diagnostico']);
  }

  contactarAsesor(): void {
    const lang = this.i18n.currentLang();
    this.router.navigate(['/', lang, 'contacto']);
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
    clearTimeout(this.timeoutId);
  }
}

