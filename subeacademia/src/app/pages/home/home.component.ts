import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { TechLinesSceneComponent } from '../../features/home/tech-lines-scene/tech-lines-scene.component';
import { ElegantNetworkSceneComponent } from '../../features/home/elegant-network-scene/elegant-network-scene.component';
import { AiNeuralFlowSceneComponent } from '../../features/home/ai-neural-flow-scene/ai-neural-flow-scene.component';
import { NeuralNetworkBackgroundComponent } from '../../features/home/circuit-neural-background/neural-network-background.component';
import { NeuralNetworkBackgroundV2Component } from '../../features/home/circuit-neural-background/neural-network-background-v2.component';
import { Router, RouterModule } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { HomeConfigService, HomePageContent } from '../../core/data/home-config.service';
import { SettingsService as DataSettingsService, SiteSettings } from '../../core/data/settings.service';
import { Subscription, distinctUntilChanged, switchMap, Observable, combineLatest } from 'rxjs';
import { LogosService } from '../../core/data/logos.service';
import { Logo } from '../../core/models/logo.model';
import { LogoCarouselComponent } from '../../shared/ui/logo-carousel/logo-carousel.component';
import { TestimonialsCarouselComponent } from '../../shared/ui/testimonials-carousel/testimonials-carousel.component';
import { UiButtonComponent } from '../../shared/ui-kit/button/button';
import { AnimationService } from '../../core/services/animation.service';
import { SeoService } from '../../core/seo/seo.service';
import { LocalSettingsService } from '../../core/services/local-settings.service';
import { ThemeService } from '../../shared/theme.service';
import { DigitalGlobe } from '../../digital-globe/digital-globe';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeroSceneComponent, TechLinesSceneComponent, ElegantNetworkSceneComponent, AiNeuralFlowSceneComponent, NeuralNetworkBackgroundComponent, NeuralNetworkBackgroundV2Component, DigitalGlobe, LogoCarouselComponent, TestimonialsCarouselComponent, UiButtonComponent, I18nTranslatePipe],
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
    private readonly settings: LocalSettingsService,
    private readonly dataSettings: DataSettingsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService
  ) {
    // Valor por defecto para asegurar que el título se muestre
    this.tituloHome = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
    
    // Inicializar observables de logos
    this.companyLogos$ = this.logos.listByType('Empresa');
    this.educationLogos$ = this.logos.listByType('Institución Educativa');
    this.allianceLogos$ = this.logos.listByType('Alianza Estratégica');
    
    // Inicializar fases de metodología
    this.loadMethodologyPhases();
  }

  private contentSub?: Subscription;
  frasesDinamicas: string[] = [];
  tituloHome = 'Potencia tu Talento en la Era de la Inteligencia Artificial';
  selectedHomeBgKey: string = 'digital-globe-v1'; // Inicializar con valor por defecto correcto
  isDarkTheme = false;

  // Clave efectiva para evitar duplicación entre variantes light/dark
  get displayedHomeBgKey(): string {
    const key = this.selectedHomeBgKey;
    if (key === 'circuit-tech-v2' || key === 'circuit-tech-v2-light') {
      return this.isDarkTheme ? 'circuit-tech-v2' : 'circuit-tech-v2-light';
    }
    if (key === 'circuit-tech-v1') {
      // En v1 mantenemos la versión única
      return 'circuit-tech-v1';
    }
    return key;
  }
  
  // Propiedades simplificadas para el componente
  
  // Los métodos de traducción ya no son necesarios - usamos el pipe i18nTranslate
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
  // Propiedades para el carrusel 3D
  activePhaseIndex = 0; // Índice de la fase activa (centro)
  carouselRotation = 0; // Ángulo de rotación del carrusel
  private isDragging = false; // Flag para detectar arrastre
  private dragStartX = 0; // Posición inicial del arrastre
  private dragStartRotation = 0; // Rotación inicial del arrastre
  private autoRotateTimer: any; // Timer para auto-rotación
  isFlipped: boolean[] = [false, false, false, false, false]; // Estado de flip para cada tarjeta

  // Array con toda la información enriquecida de las fases
  methodologyPhases: any[] = [];
  // Estado de tarjetas volteadas
  private flippedSet = new Set<number>();
  
  // Solo mostrar logos reales de Firestore, sin fallbacks de ejemplo

  private async initializeI18n(): Promise<void> {
    try {
      // Obtener el idioma actual de la URL o usar español por defecto
      const currentLang = this.i18n.currentLang();
      console.log('🌐 Idioma actual detectado:', currentLang);
      
      // Asegurar que el diccionario esté cargado
      await this.i18n.ensureLoaded(currentLang);
      await this.i18n.setLang(currentLang);
      
      console.log('📚 Sistema i18n inicializado correctamente');
      
      // Forzar la detección de cambios para actualizar la vista
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error inicializando i18n:', error);
    }
  }

  // Método eliminado - ya no necesitamos carga manual de traducciones

  ngOnInit(): void {
    console.log('🏠 HomeComponent: ngOnInit iniciado');
    console.log('🏷️ Título inicial:', this.tituloHome);
    
    // Asegurar que el servicio i18n esté inicializado
    this.initializeI18n();
    // Suscribirse al tema para alternar la variante del fondo sin duplicación
    this.isDarkTheme = this.themeService.current() === 'dark'; // Inicializar inmediatamente
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.cdr.detectChanges();
    });
    
    // Configurar contenido del home combinando ajustes locales y remotos por idioma
    this.contentSub = this.i18n.currentLang$
      .pipe(distinctUntilChanged(), switchMap((lang) =>
        combineLatest([
          this.settings.get(),
          this.dataSettings.get(),
          this.dataSettings.getHomePageContent(lang as 'es'|'en'|'pt'),
          this.settings.getTypewriterPhrasesAsArray(lang as 'es'|'en'|'pt')
        ])
      ))
      .subscribe(([localSettings, remoteSettings, homeDoc, typewriterPhrases]) => {
        // Título prioriza doc público -> settings remotos -> locales
        const finalTitle = (homeDoc as any)?.title || (remoteSettings as any)?.homeTitle || (localSettings as any)?.homeTitle || this.tituloHome;
        this.tituloHome = finalTitle;

        // Fondo prioriza doc público -> settings remotos -> locales -> default
        const newBgKey = (homeDoc as any)?.homeBackgroundKey
          || (remoteSettings as any)?.homeBackgroundKey
          || (localSettings as any)?.homeBackgroundKey
          || 'digital-globe-v1';
        
        // Solo actualizar si es diferente para evitar parpadeos
        if (newBgKey !== this.selectedHomeBgKey) {
          this.selectedHomeBgKey = newBgKey;
          console.log('🎨 Fondo del Home actualizado:', this.selectedHomeBgKey);
          this.cdr.detectChanges();
        }

        // Frases del typewriter
        this.frasesDinamicas = Array.isArray(typewriterPhrases) && typewriterPhrases.length ? typewriterPhrases : this.frasesDinamicas;

        // SEO dinámico por idioma
        this.seo.updateTags({ title: this.tituloHome, description: 'Formación aplicada en IA con enfoque en resultados y competencias.' });

        // Inicializar typewriter
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

  private loadMethodologyPhases(): void {
    const phases = [
      {
        id: 1,
        title: 'Análisis y Evaluación',
        shortTitle: 'Análisis y Evaluación',
        imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600'
      },
      {
        id: 2,
        title: 'Estrategia y Planificación',
        shortTitle: 'Estrategia y Planificación',
        imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600'
      },
      {
        id: 3,
        title: 'Implementación y Desarrollo',
        shortTitle: 'Implementación y Desarrollo',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600'
      },
      {
        id: 4,
        title: 'Despliegue y Monitoreo',
        shortTitle: 'Despliegue y Monitoreo',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600'
      },
      {
        id: 5,
        title: 'Optimización y Escalabilidad',
        shortTitle: 'Optimización y Escalabilidad',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600'
      }
    ];
    
    this.methodologyPhases = phases;
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

  // Método para obtener entregables de una fase
  getPhaseDeliverables(phaseId: number): string[] {
    // Retorna un array con índices para usar con las traducciones
    return ['0', '1', '2']; // Siempre 3 entregables por fase
  }

  // Métodos del carrusel 3D
  
  // Navegar a la fase siguiente
  nextPhase(): void {
    this.activePhaseIndex = (this.activePhaseIndex + 1) % this.methodologyPhases.length;
    this.updateCarouselRotation();
  }

  // Navegar a la fase anterior
  previousPhase(): void {
    this.activePhaseIndex = this.activePhaseIndex === 0 
      ? this.methodologyPhases.length - 1 
      : this.activePhaseIndex - 1;
    this.updateCarouselRotation();
  }

  // Ir a una fase específica
  goToPhase(index: number): void {
    this.activePhaseIndex = index;
    this.updateCarouselRotation();
  }

  // Actualizar la rotación del carrusel basada en la fase activa
  private updateCarouselRotation(): void {
    const anglePerPhase = 72; // 360° / 5 fases = 72° por fase
    const targetRotation = -this.activePhaseIndex * anglePerPhase;
    
    // Aplicar transición suave
    this.carouselRotation = targetRotation;
    this.cdr.detectChanges();
  }

  // Eventos de arrastre con mouse
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartRotation = this.carouselRotation;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const sensitivity = 0.5; // Sensibilidad del arrastre
    this.carouselRotation = this.dragStartRotation + (deltaX * sensitivity);
    this.cdr.detectChanges();
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.snapToNearestPhase();
  }

  // Eventos de arrastre táctil
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartRotation = this.carouselRotation;
      event.preventDefault();
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;
    
    const deltaX = event.touches[0].clientX - this.dragStartX;
    const sensitivity = 0.5;
    this.carouselRotation = this.dragStartRotation + (deltaX * sensitivity);
    this.cdr.detectChanges();
    event.preventDefault();
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.snapToNearestPhase();
  }

  // Ajustar automáticamente a la fase más cercana
  private snapToNearestPhase(): void {
    const anglePerPhase = 72;
    const currentAngle = Math.abs(this.carouselRotation) % 360;
    const nearestPhaseIndex = Math.round(currentAngle / anglePerPhase) % this.methodologyPhases.length;
    
    this.activePhaseIndex = nearestPhaseIndex;
    this.updateCarouselRotation();
  }

  // Método para voltear las flash cards
  flipCard(index: number): void {
    this.isFlipped[index] = !this.isFlipped[index];
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



  ngAfterViewInit(): void {
    // Aseguramos que el título sea visible
    const titleEl = document.querySelector('#hero-title');
    if (titleEl) {
      (titleEl as HTMLElement).style.opacity = '1';
      (titleEl as HTMLElement).style.visibility = 'visible';
    }

    // Inicializar el carrusel 3D
    this.initializeCarousel();
  }

  // Inicializar el carrusel 3D
  private initializeCarousel(): void {
    // Establecer la rotación inicial
    this.updateCarouselRotation();
    
    // Configurar auto-rotación opcional (descomentado si se desea)
    // this.startAutoRotation();
  }

  // Auto-rotación del carrusel (opcional)
  private startAutoRotation(): void {
    this.autoRotateTimer = setInterval(() => {
      if (!this.isDragging) {
        this.nextPhase();
      }
    }, 5000); // Cambiar cada 5 segundos
  }

  // Detener auto-rotación
  private stopAutoRotation(): void {
    if (this.autoRotateTimer) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
    clearTimeout(this.timeoutId);
    this.stopAutoRotation();
  }
}

