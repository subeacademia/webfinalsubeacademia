import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { Router, RouterModule } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { HomeConfigService, HomePageContent } from '../../core/data/home-config.service';
import { Subscription, distinctUntilChanged, switchMap, Observable } from 'rxjs';
import { LogosService } from '../../core/data/logos.service';
import { Logo } from '../../core/models/logo.model';
import { LogoCarouselComponent } from '../../shared/ui/logo-carousel/logo-carousel.component';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';
import { AnimationService } from '../../core/services/animation.service';
import { AnimateOnScrollDirective } from '../../shared/ui/animate-on-scroll.directive';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeroSceneComponent, LogoCarouselComponent, UiButtonComponent, AnimateOnScrollDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public readonly i18n: I18nService,
    private readonly homeConfig: HomeConfigService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private readonly logos: LogosService,
    private readonly animationService: AnimationService
  ) {
    // Valor por defecto para asegurar que el título se muestre
    this.tituloHome = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
    
    // Inicializar observables de logos
    this.companyLogos$ = this.logos.listByType('Empresa');
    this.educationLogos$ = this.logos.listByType('Institución Educativa');
  }

  private contentSub?: Subscription;
  frasesDinamicas: string[] = [];
  tituloHome = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
  private typewriterElement?: HTMLElement | null;
  private phraseIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: any;
  companyLogos: Logo[] = [];
  educationLogos: Logo[] = [];
  companyLogos$: Observable<Logo[]>;
  educationLogos$: Observable<Logo[]>;
  logosDePrueba: Logo[] = [
    {
      id: '1',
      name: 'Empresa de Prueba 1',
      imageUrl: 'https://via.placeholder.com/140x70/3B82F6/FFFFFF?text=Logo+1',
      type: 'Empresa'
    },
    {
      id: '2',
      name: 'Empresa de Prueba 2',
      imageUrl: 'https://via.placeholder.com/140x70/8B5CF6/FFFFFF?text=Logo+2',
      type: 'Empresa'
    },
    {
      id: '3',
      name: 'Empresa de Prueba 3',
      imageUrl: 'https://via.placeholder.com/140x70/EF4444/FFFFFF?text=Logo+3',
      type: 'Empresa'
    },
    {
      id: '4',
      name: 'Empresa de Prueba 4',
      imageUrl: 'https://via.placeholder.com/140x70/10B981/FFFFFF?text=Logo+4',
      type: 'Empresa'
    },
    {
      id: '5',
      name: 'Empresa de Prueba 5',
      imageUrl: 'https://via.placeholder.com/140x70/F59E0B/FFFFFF?text=Logo+5',
      type: 'Empresa'
    },
    {
      id: '6',
      name: 'Empresa de Prueba 6',
      imageUrl: 'https://via.placeholder.com/140x70/EC4899/FFFFFF?text=Logo+6',
      type: 'Empresa'
    },
    {
      id: '7',
      name: 'Empresa de Prueba 7',
      imageUrl: 'https://via.placeholder.com/140x70/06B6D4/FFFFFF?text=Logo+7',
      type: 'Empresa'
    },
    {
      id: '8',
      name: 'Empresa de Prueba 8',
      imageUrl: 'https://via.placeholder.com/140x70/84CC16/FFFFFF?text=Logo+8',
      type: 'Empresa'
    }
  ];

  ngOnInit(): void {
    console.log('🏠 HomeComponent: ngOnInit iniciado');
    console.log('🏷️ Título inicial:', this.tituloHome);
    
    // Configurar contenido del home usando el servicio local
    this.contentSub = this.i18n.currentLang$
      .pipe(
        distinctUntilChanged(),
        switchMap((lang: any) => {
          console.log('🌐 Cambio de idioma detectado:', lang);
          return this.homeConfig.getHomePageContent(lang as 'es'|'en'|'pt');
        })
      )
      .subscribe((c: HomePageContent) => {
        console.log('📥 Contenido recibido del servicio:', c);
        
        // Configurar frases dinámicas
        this.frasesDinamicas = c?.typewriterPhrases?.length ? c.typewriterPhrases : [];
        if (!this.frasesDinamicas.length) {
          console.log('📝 Usando frases por defecto');
          this.frasesDinamicas = [
            'Implementa IA de forma Ágil, Responsable y Sostenible con nuestro Framework ARES-AI©.',
            'Desarrolla las 13 competencias clave que tu equipo necesita para liderar la transformación digital.',
            'Transforma tu organización con nuestra plataforma de aprendizaje adaptativo AVE-AI.'
          ];
        }
        console.log('📝 Frases dinámicas configuradas:', this.frasesDinamicas);
        
        // Configurar título
        this.tituloHome = c?.title || 'Potencia tu Talento en la Era de la Inteligencia Artificial';
        console.log('🏷️ Título del home configurado:', this.tituloHome);
        
        // Configurar typewriter
        if (typeof document !== 'undefined') {
          this.typewriterElement = document.getElementById('typewriter');
          if (this.typewriterElement) {
            clearTimeout(this.timeoutId);
            this.resetTypewriterState();
            this.type();
          }
        }
      });

    // Cargar logos desde Firestore
    this.loadLogos();
  }

  private loadLogos(): void {
    // Los observables ya están configurados en el constructor
    // Solo necesitamos suscribirnos para mantener los arrays locales actualizados
    this.companyLogos$.subscribe(v => {
      this.companyLogos = v;
      console.log('HomeComponent: Logos de empresas cargados desde Firestore:', this.companyLogos.length, this.companyLogos);
    });

    this.educationLogos$.subscribe(v => {
      this.educationLogos = v;
      console.log('HomeComponent: Logos de instituciones cargados desde Firestore:', this.educationLogos.length, this.educationLogos);
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

  ngAfterViewInit(): void {
    // Aseguramos que el título sea visible
    const titleEl = document.querySelector('#hero-title');
    if (titleEl) {
      (titleEl as HTMLElement).style.opacity = '1';
      (titleEl as HTMLElement).style.visibility = 'visible';
    }
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
    clearTimeout(this.timeoutId);
  }
}

