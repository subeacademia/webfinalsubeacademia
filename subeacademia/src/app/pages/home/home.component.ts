import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { Router, RouterModule } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { HomeConfigService, HomePageContent } from '../../core/data/home-config.service';
import { Subscription, distinctUntilChanged, switchMap, Observable, combineLatest } from 'rxjs';
import { LogosService } from '../../core/data/logos.service';
import { Logo } from '../../core/models/logo.model';
import { LogoCarouselComponent } from '../../shared/ui/logo-carousel/logo-carousel.component';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';
import { AnimationService } from '../../core/services/animation.service';
import { SeoService } from '../../core/seo/seo.service';
import { LocalSettingsService } from '../../core/services/local-settings.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeroSceneComponent, LogoCarouselComponent, UiButtonComponent, I18nTranslatePipe],
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
    private readonly animationService: AnimationService,
    private readonly seo: SeoService,
    private readonly settings: LocalSettingsService
  ) {
    // Valor por defecto para asegurar que el título se muestre
    this.tituloHome = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
    
    // Inicializar observables de logos
    this.companyLogos$ = this.logos.listByType('Empresa');
    this.educationLogos$ = this.logos.listByType('Institución Educativa');
    this.allianceLogos$ = this.logos.listByType('Alianza Estratégica');
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
  allianceLogos: Logo[] = [];
  companyLogos$: Observable<Logo[]>;
  educationLogos$: Observable<Logo[]>;
  allianceLogos$: Observable<Logo[]>;
  // Variable para controlar la pestaña activa, inicializada en la primera fase
  activePhase = 1;

  // Array con toda la información enriquecida de las fases
  methodologyPhases = [
    {
      id: 1,
      title: 'Fase 1: Preparación y Evaluación',
      shortTitle: 'Evaluación', // Título corto para la navegación
      description: 'Establecemos cimientos sólidos, analizando tus necesidades y auditando tus datos para asegurar que cada paso sea estratégico y esté alineado con tus objetivos.',
      imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600',
      deliverables: [
        'Diagnóstico de Madurez de IA',
        'Auditoría de Datos y Ética',
        'Roadmap Estratégico'
      ]
    },
    {
      id: 2,
      title: 'Fase 2: Diseño y Prototipado',
      shortTitle: 'Prototipado',
      description: 'Co-creamos y visualizamos la solución de IA. Desarrollamos prototipos funcionales rápidos para validar el enfoque y garantizar que el resultado final cumpla tus expectativas.',
      imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600',
      deliverables: [
        'Diseño de Arquitectura',
        'Pruebas de Concepto (PoC)',
        'Selección de Modelos y Algoritmos'
      ]
    },
    {
      id: 3,
      title: 'Fase 3: Desarrollo e Implementación',
      shortTitle: 'Implementación',
      description: 'Construimos una solución de IA robusta, ética y escalable, integrándola de manera fluida en tus sistemas existentes para potenciar tus operaciones sin fricciones.',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600',
      deliverables: [
        'Modelos de IA Entrenados',
        'Integración vía APIs',
        'Despliegue en Producción'
      ]
    },
    {
      id: 4,
      title: 'Fase 4: Monitoreo y Optimización',
      shortTitle: 'Optimización',
      description: 'Acompañamos el proceso post-entrega. Monitoreamos el rendimiento en tiempo real y optimizamos los modelos para asegurar la máxima eficiencia y un impacto continuo.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600',
      deliverables: [
        'Dashboard de Monitoreo',
        'Informes de Rendimiento',
        'Ciclos de Reentrenamiento Continuo'
      ]
    },
    {
      id: 5,
      title: 'Fase 5: Escalado y Sostenibilidad',
      shortTitle: 'Sostenibilidad',
      description: 'Miramos hacia el futuro. Te ayudamos a escalar la solución en toda tu organización, asegurando que la IA crezca contigo de manera ética, responsable y sostenible.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600',
      deliverables: [
        'Estrategia de Escalado',
        'Marco de Gobernanza de IA',
        'Programas de Capacitación'
      ]
    }
  ];
  // Estado de tarjetas volteadas
  private flippedSet = new Set<number>();
  
  // Propiedades para el scroll-spying
  @ViewChildren('phaseNavItem') navItems!: QueryList<ElementRef>;
  @ViewChildren('phaseContentCard') contentCards!: QueryList<ElementRef>;
  private observer!: IntersectionObserver;
  
  // Solo mostrar logos reales de Firestore, sin fallbacks de ejemplo

  ngOnInit(): void {
    console.log('🏠 HomeComponent: ngOnInit iniciado');
    console.log('🏷️ Título inicial:', this.tituloHome);
    
    // Configurar contenido del home combinando ajustes locales y contenido dinámico
    this.contentSub = combineLatest([
      this.i18n.currentLang$.pipe(distinctUntilChanged()),
      this.settings.get()
    ]).pipe(
      switchMap(([lang, localSettings]) => {
        console.log('🌐 Cambio de idioma detectado:', lang);
        console.log('⚙️ Ajustes locales del sitio:', localSettings);
        
        // Obtener frases del typewriter desde ajustes locales
        return this.settings.getTypewriterPhrasesAsArray(lang as 'es'|'en'|'pt').pipe(
          switchMap(typewriterPhrases => {
            console.log('📝 Frases del typewriter desde ajustes locales:', typewriterPhrases);
            
            // Usar título desde ajustes locales
            const finalTitle = localSettings?.homeTitle || 
                              'Potencia tu Talento en la Era de la Inteligencia Artificial';
            
            return [{ 
              typewriterPhrases,
              title: finalTitle,
              localSettings 
            }];
          })
        );
      })
    ).subscribe((data: any) => {
      const c = data as HomePageContent & { localSettings?: any };
      console.log('📥 Datos finales combinados:', c);
      
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
      
      // Configurar título (ahora viene de los ajustes locales del admin)
      this.tituloHome = c?.title || 'Potencia tu Talento en la Era de la Inteligencia Artificial';
      console.log('🏷️ Título del home configurado desde ajustes locales:', this.tituloHome);

      // SEO dinámico por idioma
      this.seo.updateTags({
        title: this.tituloHome,
        description: 'Formación aplicada en IA con enfoque en resultados y competencias.'
      });
      
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

    this.allianceLogos$.subscribe(v => {
      this.allianceLogos = v;
      console.log('HomeComponent: Logos de alianzas estratégicas cargados desde Firestore:', this.allianceLogos.length, this.allianceLogos);
    });
  }

  // Método para obtener logos a mostrar, solo logos reales de Firestore
  getLogosToDisplay(type: 'company' | 'education' | 'alliance'): Logo[] {
    switch (type) {
      case 'company':
        return this.companyLogos || [];
      case 'education':
        return this.educationLogos || [];
      case 'alliance':
        return this.allianceLogos || [];
      default:
        return [];
    }
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

  navegarACasosDeExito(): void {
    const lang = this.i18n.currentLang();
    this.router.navigate(['/', lang, 'proyectos']);
  }

  toggleFlip(phaseId: number): void {
    if (this.flippedSet.has(phaseId)) {
      this.flippedSet.delete(phaseId);
    } else {
      this.flippedSet.add(phaseId);
    }
  }

  isFlipped(phaseId: number): boolean {
    return this.flippedSet.has(phaseId);
  }

  // Función para cambiar la fase activa
  selectPhase(phaseId: number): void {
    this.activePhase = phaseId;
  }

  ngAfterViewInit(): void {
    // Aseguramos que el título sea visible
    const titleEl = document.querySelector('#hero-title');
    if (titleEl) {
      (titleEl as HTMLElement).style.opacity = '1';
      (titleEl as HTMLElement).style.visibility = 'visible';
    }

    // Inicializar el scroll-spying solo en desktop y en el navegador
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setTimeout(() => {
        this.initObserver();
      }, 100);
    }
  }

  private initObserver(): void {
    const options = {
      root: null,
      rootMargin: '-20% 0px -50% 0px', // Activa cuando el elemento está visible en la parte superior
      threshold: 0.3 // Se activa cuando el 30% del elemento es visible
    };

    this.observer = new IntersectionObserver(entries => {
      // Encuentra la entrada que está más intersectando
      let mostVisible = entries.reduce((prev, current) => {
        return (current.intersectionRatio > prev.intersectionRatio) ? current : prev;
      });

      if (mostVisible && mostVisible.isIntersecting) {
        const id = mostVisible.target.getAttribute('id');
        const currentPhaseId = parseInt(id?.replace('phase-card-', '') || '1');
        
        const navItem = this.navItems.find(
          item => item.nativeElement.getAttribute('fragment') === `fase-${currentPhaseId}`
        );

        // Primero, quita 'active' de todos los items de navegación
        this.navItems.forEach(item => {
          item.nativeElement.classList.remove('active');
          item.nativeElement.style.backgroundColor = '';
          item.nativeElement.style.borderColor = '';
          item.nativeElement.style.transform = '';
          const textSpan = item.nativeElement.querySelector('span:last-child');
          if (textSpan) {
            textSpan.style.color = '';
          }
        });

        // Maneja las clases de deslizamiento para las tarjetas
        this.contentCards.forEach((card, index) => {
          const cardPhaseId = index + 1;
          if (cardPhaseId < currentPhaseId) {
            // Las tarjetas anteriores se deslizan hacia arriba
            card.nativeElement.classList.add('slide-up');
          } else {
            // Las tarjetas actuales y posteriores vuelven a su posición normal
            card.nativeElement.classList.remove('slide-up');
          }
        });
        
        // Luego, añade 'active' solo al item de navegación que corresponde
        if (navItem) {
          navItem.nativeElement.classList.add('active');
          // Forzar estilos por si las clases de DaisyUI no se aplican dinámicamente
          navItem.nativeElement.style.backgroundColor = 'var(--fallback-b2, oklch(var(--b2) / 0.7))';
          navItem.nativeElement.style.borderColor = 'var(--fallback-p, oklch(var(--p) / 0.3))';
          navItem.nativeElement.style.transform = 'translateX(10px)';
          const textSpan = navItem.nativeElement.querySelector('span:last-child');
          if (textSpan) {
            textSpan.style.color = 'var(--fallback-bc, oklch(var(--bc)))';
          }
        }
      }
    }, options);

    this.contentCards.forEach(card => {
      this.observer.observe(card.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
    clearTimeout(this.timeoutId);
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

