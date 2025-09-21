import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';
import { Router, RouterModule } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
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
  imports: [CommonModule, RouterModule, HeroSceneComponent, LogoCarouselComponent, UiButtonComponent],
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
    private readonly cdr: ChangeDetectorRef
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
  
  // Propiedades para traducciones directas
  translations: any = {};
  
  // Traducciones hardcodeadas como fallback
  heroSubtitle = 'Descubre tu nivel de madurez en IA y transforma tu organización con nuestro diagnóstico inteligente basado en el Framework ARES-AI©';
  ctaPrimary = 'Inicia tu diagnóstico de madurez en IA Gratis';
  ctaSecondary = 'Habla con un asesor ahora';
  methodologyTitle = 'Nuestra Metodología ARES-AI';
  methodologySubtitle = 'Un marco de 5 fases que garantiza la implementación exitosa de IA, combinando agilidad, responsabilidad y resultados tangibles.';
  solutionsBadge = 'Soluciones Integrales de IA';
  solutionsTitle = 'Nuestras Soluciones para la Transformación Digital';
  solutionsSubtitle = 'Herramientas y servicios diseñados para acelerar tu adopción de IA de manera responsable y estratégica';
  trainingTitle = 'Capacitación Adaptativa';
  trainingSubtitle = '(AVE-AI)';
  trainingDescription = 'Nuestra Aula Virtual Evolutiva que personaliza el aprendizaje y desarrolla las 13 competencias clave de manera inteligente.';
  trainingBtn = 'Realizar Diagnóstico';
  
  // Traducciones adicionales para metodología
  methodologyCtaReady = '¿Listo para comenzar tu transformación con IA?';
  methodologyBtnStartDiagnostic = 'Comenzar Diagnóstico';
  methodologyBtnViewMethodology = 'Ver Metodología Completa';
  methodologyAdditionalText = 'Nuestro enfoque probado ha ayudado a más de 100 empresas a implementar IA exitosamente.';
  
  // Traducciones para soluciones
  solutionsConsultingTitle = 'Consultoría Estratégica';
  solutionsConsultingSubtitle = 'Estrategia y Planificación';
  solutionsConsultingDescription = 'Desarrollamos tu hoja de ruta personalizada para la adopción de IA, identificando oportunidades específicas y minimizando riesgos.';
  solutionsConsultingBtn = 'Contactar Asesor';
  
  solutionsImplementationTitle = 'Implementación y Desarrollo';
  solutionsImplementationDescription = 'Llevamos tu estrategia a la práctica con soluciones de IA personalizadas, integración completa y soporte continuo.';
  solutionsImplementationBtn = 'Ver Casos de Éxito';
  
  // Traducciones para confianza
  trustCompanies = 'Empresas que Confían en Nosotros';
  trustEducation = 'Instituciones Educativas';
  trustAlliances = 'Alianzas Estratégicas';
  trustFinalCta = 'Únete a las empresas que ya están transformando su futuro con IA';
  ctaFinal = 'Comienza tu Transformación Ahora';
  
  // Traducciones para deliverables
  deliverables = 'Entregables';
  
  // Método auxiliar para obtener traducciones con fallback
  getTranslation(key: string): string {
    console.log('🔍 getTranslation llamado para:', key);
    
    // Primero intentar con el servicio i18n
    const serviceTranslation = this.i18n.translate(key);
    console.log('📚 Traducción del servicio:', serviceTranslation);
    
    if (serviceTranslation !== key) {
      console.log('✅ Usando traducción del servicio');
      return serviceTranslation;
    }
    
    // Si no funciona, usar las traducciones cargadas manualmente
    if (this.translations && this.translations[key]) {
      console.log('📖 Usando traducción manual:', this.translations[key]);
      return this.translations[key];
    }
    
    // Fallback: usar traducciones hardcodeadas
    const hardcodedTranslation = this.getHardcodedTranslation(key);
    if (hardcodedTranslation) {
      console.log('🔧 Usando traducción hardcodeada:', hardcodedTranslation);
      return hardcodedTranslation;
    }
    
    console.log('⚠️ No se encontró traducción, devolviendo clave');
    // Fallback final: devolver la clave
    return key;
  }
  
  private getHardcodedTranslation(key: string): string | null {
    const translations: { [key: string]: string } = {
      'home.hero_subtitle': this.heroSubtitle,
      'home.cta_primary': this.ctaPrimary,
      'home.cta_secondary': this.ctaSecondary,
      'home.methodology.title': this.methodologyTitle,
      'home.methodology.subtitle': this.methodologySubtitle,
      'home.methodology.cta_ready': this.methodologyCtaReady,
      'home.methodology.btn_start_diagnostic': this.methodologyBtnStartDiagnostic,
      'home.methodology.btn_view_methodology': this.methodologyBtnViewMethodology,
      'home.methodology.additional_text': this.methodologyAdditionalText,
      
      // Traducciones para fases de metodología
      'home.methodology.phases.1.shortTitle': 'Análisis y Evaluación',
      'home.methodology.phases.1.title': 'Análisis y Evaluación Inicial',
      'home.methodology.phases.1.description': 'Evaluamos el estado actual de tu organización en IA, identificando fortalezas, debilidades y oportunidades de mejora.',
      'home.methodology.phases.1.deliverables.0': 'Diagnóstico completo de madurez en IA',
      'home.methodology.phases.1.deliverables.1': 'Análisis de capacidades actuales',
      'home.methodology.phases.1.deliverables.2': 'Identificación de brechas y oportunidades',
      
      'home.methodology.phases.2.shortTitle': 'Estrategia y Planificación',
      'home.methodology.phases.2.title': 'Estrategia y Planificación Estratégica',
      'home.methodology.phases.2.description': 'Desarrollamos tu hoja de ruta personalizada para la adopción de IA, definiendo objetivos, recursos y cronogramas.',
      'home.methodology.phases.2.deliverables.0': 'Plan estratégico de IA personalizado',
      'home.methodology.phases.2.deliverables.1': 'Definición de objetivos y KPIs',
      'home.methodology.phases.2.deliverables.2': 'Cronograma de implementación detallado',
      
      'home.methodology.phases.3.shortTitle': 'Implementación y Desarrollo',
      'home.methodology.phases.3.title': 'Implementación y Desarrollo de Soluciones',
      'home.methodology.phases.3.description': 'Llevamos tu estrategia a la práctica con soluciones de IA personalizadas, integración completa y soporte continuo.',
      'home.methodology.phases.3.deliverables.0': 'Soluciones de IA implementadas',
      'home.methodology.phases.3.deliverables.1': 'Integración con sistemas existentes',
      'home.methodology.phases.3.deliverables.2': 'Capacitación del equipo técnico',
      
      'home.methodology.phases.4.shortTitle': 'Despliegue y Monitoreo',
      'home.methodology.phases.4.title': 'Despliegue y Monitoreo Continuo',
      'home.methodology.phases.4.description': 'Implementamos sistemas de monitoreo y control para asegurar el rendimiento óptimo de las soluciones de IA.',
      'home.methodology.phases.4.deliverables.0': 'Sistema de monitoreo implementado',
      'home.methodology.phases.4.deliverables.1': 'Dashboards de rendimiento',
      'home.methodology.phases.4.deliverables.2': 'Protocolos de mantenimiento',
      
      'home.methodology.phases.5.shortTitle': 'Optimización y Escalabilidad',
      'home.methodology.phases.5.title': 'Optimización y Escalabilidad',
      'home.methodology.phases.5.description': 'Optimizamos continuamente las soluciones y preparamos tu organización para escalar la adopción de IA.',
      'home.methodology.phases.5.deliverables.0': 'Optimización de rendimiento',
      'home.methodology.phases.5.deliverables.1': 'Plan de escalabilidad',
      'home.methodology.phases.5.deliverables.2': 'Estrategia de crecimiento continuo',
      
      'home.solutions.badge': this.solutionsBadge,
      'home.solutions.title': this.solutionsTitle,
      'home.solutions.subtitle': this.solutionsSubtitle,
      'home.solutions.training.title': this.trainingTitle,
      'home.solutions.training.subtitle': this.trainingSubtitle,
      'home.solutions.training.description': this.trainingDescription,
      'home.solutions.training.btn': this.trainingBtn,
      'home.solutions.consulting.title': this.solutionsConsultingTitle,
      'home.solutions.consulting.subtitle': this.solutionsConsultingSubtitle,
      'home.solutions.consulting.description': this.solutionsConsultingDescription,
      'home.solutions.consulting.btn': this.solutionsConsultingBtn,
      'home.solutions.implementation.title': this.solutionsImplementationTitle,
      'home.solutions.implementation.description': this.solutionsImplementationDescription,
      'home.solutions.implementation.btn': this.solutionsImplementationBtn,
      'home.trust.companies': this.trustCompanies,
      'home.trust.education': this.trustEducation,
      'home.trust.alliances': this.trustAlliances,
      'home.trust.final_cta': this.trustFinalCta,
      'home.cta_final': this.ctaFinal,
      'shared.deliverables': this.deliverables
    };
    
    return translations[key] || null;
  }
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
  methodologyPhases: any[] = [];
  // Estado de tarjetas volteadas
  private flippedSet = new Set<number>();
  
  // Propiedades para el scroll-spying
  @ViewChildren('phaseNavItem') navItems!: QueryList<ElementRef>;
  @ViewChildren('phaseContentCard') contentCards!: QueryList<ElementRef>;
  private observer!: IntersectionObserver;
  
  // Solo mostrar logos reales de Firestore, sin fallbacks de ejemplo

  private async initializeI18n(): Promise<void> {
    try {
      // Obtener el idioma actual de la URL o usar español por defecto
      const currentLang = this.i18n.currentLang();
      console.log('🌐 Idioma actual detectado:', currentLang);
      
      // Forzar la carga del diccionario español primero
      await this.i18n.ensureLoaded('es');
      console.log('📚 Diccionario español cargado');
      
      // Luego establecer el idioma actual
      await this.i18n.setLang(currentLang);
      console.log('📚 Diccionario i18n inicializado correctamente');
      
      // Verificar que las traducciones estén disponibles
      const testTranslation = this.i18n.translate('home.solutions.title');
      console.log('🧪 Prueba de traducción:', testTranslation);
      
      if (testTranslation === 'home.solutions.title') {
        console.warn('⚠️ Las traducciones no se están cargando correctamente');
        // Intentar cargar manualmente el diccionario
        await this.loadDictionaryManually();
      }
      
      // Forzar la detección de cambios para actualizar la vista
      this.cdr.detectChanges();
      console.log('🔄 Detección de cambios forzada');
    } catch (error) {
      console.error('❌ Error inicializando i18n:', error);
      // Fallback: cargar diccionario manualmente
      await this.loadDictionaryManually();
    }
  }

  private async loadDictionaryManually(): Promise<void> {
    try {
      console.log('🔄 Intentando cargar diccionario manualmente...');
      const response = await fetch('/assets/i18n/es.json');
      if (response.ok) {
        const translations = await response.json();
        console.log('📚 Diccionario cargado manualmente:', translations);
        
        // Almacenar las traducciones en el componente como fallback
        this.translations = translations;
        
        // Forzar la detección de cambios
        this.cdr.detectChanges();
        console.log('🔄 Traducciones manuales cargadas y vista actualizada');
      }
    } catch (error) {
      console.error('❌ Error cargando diccionario manualmente:', error);
    }
  }

  ngOnInit(): void {
    console.log('🏠 HomeComponent: ngOnInit iniciado');
    console.log('🏷️ Título inicial:', this.tituloHome);
    
    // Asegurar que el servicio i18n esté inicializado
    this.initializeI18n();
    
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
      
      // Configurar fases de metodología con traducciones
      this.loadMethodologyPhases();
      
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

