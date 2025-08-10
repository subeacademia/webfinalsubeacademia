import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, NgZone, OnDestroy, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { SeoService } from '../../core/seo/seo.service';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { organizationJsonLd } from '../../core/seo/jsonld';
import { RevealOnScrollDirective } from '../../shared/ui/reveal-on-scroll.directive';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RevealOnScrollDirective, CardComponent],
  template: `
    <main>
      <!-- Hero -->
      <section class="relative min-h-[300px] md:min-h-[520px] overflow-hidden grid place-items-center px-6 py-20 md:py-28">
        <div class="absolute inset-0 -z-10 bg-gradient-to-b from-transparent/0 via-[var(--panel)]/30 to-[var(--panel)]/70 animate-[bgfade_12s_ease-in-out_infinite_alternate]" aria-hidden="true"></div>

        <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="font-grotesk text-5xl md:text-7xl leading-[0.95] tracking-tight" revealOnScroll="up">
              {{ i18n.getTranslations('hero.title') }}
            </h1>
            <p class="mt-5 text-lg text-[var(--muted)]" revealOnScroll="up" [revealDelay]="120">
              {{ i18n.getTranslations('hero.subtitle') }}
            </p>

            <div class="mt-8 flex flex-wrap gap-4" role="group" aria-label="Acciones principales" revealOnScroll="up" [revealDelay]="220">
              <app-card size="small" title="Cursos" description="Explora rutas aplicadas" actionLabel="Ver cursos" (action)="goTo(['/', i18n.currentLang(), 'cursos'])"></app-card>
              <app-card size="small" title="Blog" description="Lecturas y guías" actionLabel="Leer blog" (action)="goTo(['/', i18n.currentLang(), 'blog'])"></app-card>
            </div>

            <!-- Quick cards debajo de los botones -->
            <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Accesos rápidos">
              <app-card size="small" title="Blog" actionLabel="Abrir" revealOnScroll="up" (action)="goTo(['/', i18n.currentLang(), 'blog'])"></app-card>
              <app-card size="small" title="Cursos" actionLabel="Abrir" revealOnScroll="up" [revealDelay]="80" (action)="goTo(['/', i18n.currentLang(), 'cursos'])"></app-card>
              <app-card size="small" title="IA" actionLabel="Abrir" revealOnScroll="up" [revealDelay]="160" (action)="goTo(['/', i18n.currentLang(), 'ia'])"></app-card>
              <app-card size="small" title="Contacto" actionLabel="Abrir" revealOnScroll="up" [revealDelay]="240" (action)="goTo(['/', i18n.currentLang(), 'contacto'])"></app-card>
            </div>
          </div>

          <div class="relative overflow-hidden rounded-3xl border border-white/10 shadow-xl panel-3d aspect-[4/3] sm:aspect-[16/9] max-h-[320px] sm:max-h-[480px]" revealOnScroll="right">
            <canvas #hero3d id="hero3d" style="width:100%; height:100%; display:block" class="w-full h-full" aria-hidden="true"></canvas>
          </div>
        </div>
      </section>

      <!-- Qué hacemos -->
      <section class="py-16 md:py-24 px-6">
        <div class="max-w-6xl mx-auto">
          <h2 class="h2" revealOnScroll="up">{{ i18n.getTranslations('sections.whatWeDo.title') }}</h2>
          <div class="mt-6 grid md:grid-cols-3 gap-6">
            <article class="card" revealOnScroll="up"><h3 class="h3">{{ i18n.getTranslations('sections.whatWeDo.items.0.title') }}</h3><p class="muted mt-1">{{ i18n.getTranslations('sections.whatWeDo.items.0.text') }}</p></article>
            <article class="card" revealOnScroll="up" [revealDelay]="120"><h3 class="h3">{{ i18n.getTranslations('sections.whatWeDo.items.1.title') }}</h3><p class="muted mt-1">{{ i18n.getTranslations('sections.whatWeDo.items.1.text') }}</p></article>
            <article class="card" revealOnScroll="up" [revealDelay]="240"><h3 class="h3">{{ i18n.getTranslations('sections.whatWeDo.items.2.title') }}</h3><p class="muted mt-1">{{ i18n.getTranslations('sections.whatWeDo.items.2.text') }}</p></article>
          </div>
        </div>
      </section>

      <!-- Casos/Clientes -->
      <section class="py-16 md:py-24 px-6">
        <div class="max-w-6xl mx-auto">
          <h2 class="h2" revealOnScroll="up">{{ i18n.getTranslations('clients.title') }}</h2>
          <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-80">
            <div class="logo-skel" aria-label="Cliente 1" revealOnScroll="up"></div>
            <div class="logo-skel" aria-label="Cliente 2" revealOnScroll="up" [revealDelay]="80"></div>
            <div class="logo-skel" aria-label="Cliente 3" revealOnScroll="up" [revealDelay]="160"></div>
            <div class="logo-skel" aria-label="Cliente 4" revealOnScroll="up" [revealDelay]="240"></div>
          </div>
        </div>
      </section>

      <!-- Últimas publicaciones -->
      <section class="py-16 md:py-24 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-end justify-between gap-4">
            <div>
              <h2 class="h2" revealOnScroll="up">{{ i18n.getTranslations('blog.title') }}</h2>
              <p class="muted" revealOnScroll="up" [revealDelay]="100">{{ i18n.getTranslations('blog.subtitle') }}</p>
            </div>
            <app-card size="small" [title]="i18n.getTranslations('blog.viewAll')" actionLabel="Ir" (action)="goTo(['/', i18n.currentLang(), 'blog'])"></app-card>
          </div>
            <div class="mt-6 grid md:grid-cols-3 gap-6">
              <app-card size="small" title="Tácticas de prompting" description="Patrones para tareas críticas." [tags]="['Prompting', 'Productividad']" actionLabel="Leer" revealOnScroll="up" (action)="goTo(['/', i18n.currentLang(), 'blog'])"></app-card>
              <app-card size="small" title="RAG minimal" description="Conecta y entrega valor." [tags]="['RAG', 'Arquitectura']" actionLabel="Leer" revealOnScroll="up" [revealDelay]="120" (action)="goTo(['/', i18n.currentLang(), 'blog'])"></app-card>
              <app-card size="small" title="Evaluación de LLMs" description="Métricas que importan." [tags]="['Evaluación', 'LLM']" actionLabel="Leer" revealOnScroll="up" [revealDelay]="240" (action)="goTo(['/', i18n.currentLang(), 'blog'])"></app-card>
            </div>
        </div>
      </section>

      <!-- Cursos destacados -->
      <section class="py-16 md:py-24 px-6">
        <div class="max-w-6xl mx-auto">
          <h2 class="h2" revealOnScroll="up">{{ i18n.getTranslations('courses.title') }}</h2>
          <div class="mt-8 grid md:grid-cols-3 gap-6">
            <app-card size="medium" [title]="i18n.getTranslations('courses.items.0.title')" [description]="i18n.getTranslations('courses.items.0.text')" [tags]="['Curso', 'Práctico']" actionLabel="Ver curso" revealOnScroll="up" (action)="goTo(['/', i18n.currentLang(), 'cursos'])"></app-card>
            <app-card size="medium" [title]="i18n.getTranslations('courses.items.1.title')" [description]="i18n.getTranslations('courses.items.1.text')" [tags]="['Curso', 'Aplicado']" actionLabel="Ver curso" revealOnScroll="up" [revealDelay]="120" (action)="goTo(['/', i18n.currentLang(), 'cursos'])"></app-card>
            <app-card size="medium" [title]="i18n.getTranslations('courses.items.2.title')" [description]="i18n.getTranslations('courses.items.2.text')" [tags]="['Curso', 'Hands-on']" actionLabel="Ver curso" revealOnScroll="up" [revealDelay]="240" (action)="goTo(['/', i18n.currentLang(), 'cursos'])"></app-card>
          </div>
        </div>
      </section>

      <!-- CTA final -->
      <section class="py-20 md:py-28 px-6">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="font-grotesk text-3xl md:text-5xl" revealOnScroll="up">{{ i18n.getTranslations('cta.finalTitle') }}</h2>
          <p class="muted mt-4" revealOnScroll="up" [revealDelay]="120">{{ i18n.getTranslations('cta.finalText') }}</p>
          <div class="mt-8" revealOnScroll="up" [revealDelay]="220">
            <app-card size="small" [title]="i18n.getTranslations('cta.startNow')" actionLabel="Comenzar" (action)="goTo(['/', i18n.currentLang(), 'cursos'])"></app-card>
          </div>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hero3d', { static: false }) hero3dRef?: ElementRef<HTMLCanvasElement>;

  private isBrowser = false;
  private disposeFn: (() => void) | null = null;
  private readonly router = inject(Router);

  constructor(
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly seo: SeoService,
    public readonly i18n: I18nService,
    private readonly data: FirebaseDataService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Metadatos SEO para la landing
    this.seo.updateTags({
      title: 'Sube Academ-IA | Educación + Inteligencia Artificial',
      description:
        'Formación aplicada en IA para profesionales y equipos. Cursos, recursos y prácticas que generan impacto medible. Únete a Sube Academ-IA.',
      image: 'assets/og-placeholder.svg',
      type: 'website',
    });

    // JSON-LD Organization
    this.seo.setJsonLd(
      'org',
      organizationJsonLd({
        name: 'Sube Academ-IA',
        url: 'https://www.subeacademia.cl',
        logo: '/logo.svg',
        sameAs: [],
      })
    );
  }

  async ngAfterViewInit() {
    // Cargar destacados (no romper UI si falla)
    const sub = this.data.getHomeFeatured(this.i18n.currentLang()).subscribe({ next: () => {}, error: () => {} });

    if (!this.isBrowser) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { sub.unsubscribe(); return; }
    const isSmall = window.matchMedia('(max-width: 640px)').matches;

    const canvas = this.hero3dRef?.nativeElement;
    if (!canvas) { sub.unsubscribe(); return; }

    // Cargar Three.js de forma lazy
    const [THREE] = await Promise.all([
      import('three')
    ]);

    this.ngZone.runOutsideAngular(() => {
      const scene = new THREE.Scene();
      scene.background = null;
      const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.z = 6;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.25 : 1.8));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.shadowMap.enabled = false;
      renderer.shadowMap.autoUpdate = false;

      // Partículas discretas adaptadas a ancho
      const w = (canvas.parentElement?.clientWidth || canvas.clientWidth || window.innerWidth);
      const particlesCount = isSmall ? 80 : (w < 480 ? 120 : w < 768 ? 220 : 380);
      let positions = new Float32Array(particlesCount * 3);
      for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 6; // x
        positions[i + 1] = (Math.random() - 0.5) * 4; // y
        positions[i + 2] = (Math.random() - 0.5) * 2; // z
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00A3FF', size: isSmall ? 0.018 : 0.02 });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Líneas sutiles
      const lineMaterial = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.07 });
      const linesCount = isSmall ? 8 : 30;
      for (let i = 0; i < linesCount; i++) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2),
          new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2),
        ]);
        const line = new THREE.Line(geo, lineMaterial);
        scene.add(line);
      }

      let animationFrameId = 0;
      let last = performance.now();
      const targetFps = 60;
      const frameDuration = 1000 / targetFps;

      const onResize = () => {
        const wpx = canvas.clientWidth;
        const hpx = canvas.clientHeight;
        renderer.setSize(wpx, hpx, false);
        camera.aspect = wpx / Math.max(1, hpx);
        camera.updateProjectionMatrix();

        // Recalcular partículas según ancho
        const cw = (canvas.parentElement?.clientWidth || wpx);
        const newCount = cw < 480 ? 120 : cw < 768 ? 220 : 380;
        const currentCount = positions.length / 3;
        if (newCount !== currentCount) {
          positions = new Float32Array(newCount * 3);
          for (let i = 0; i < newCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 6;
            positions[i + 1] = (Math.random() - 0.5) * 4;
            positions[i + 2] = (Math.random() - 0.5) * 2;
          }
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          (geometry.attributes as any)['position'].needsUpdate = true;
          geometry.computeBoundingSphere();
        }
      };
      const resizeObs = new ResizeObserver(onResize);
      resizeObs.observe(canvas);
      onResize();

      const animate = (now: number) => {
        const delta = now - last;
        if (delta >= frameDuration) {
          last = now - (delta % frameDuration);
          points.rotation.y += 0.0008 * delta;
          points.rotation.x += 0.0003 * delta;
          renderer.render(scene, camera);
        }
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);

      // Pausar si sale de viewport
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!animationFrameId) animationFrameId = requestAnimationFrame(animate);
          } else {
            if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = 0 as any; }
          }
        }
      }, { root: null, threshold: 0 });
      io.observe(canvas);

      // Pausar cuando la pestaña no está visible
      const onVisibility = () => {
        if (document.hidden) {
          if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = 0 as any; }
        } else {
          if (!animationFrameId) animationFrameId = requestAnimationFrame(animate);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      this.disposeFn = () => {
        sub.unsubscribe();
        cancelAnimationFrame(animationFrameId);
        resizeObs.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        geometry.dispose();
        material.dispose();
        lineMaterial.dispose();
        renderer.dispose();
      };
    });
  }

  ngOnDestroy() {
    if (this.disposeFn) {
      this.disposeFn();
      this.disposeFn = null;
    }
  }

  goTo(commands: any[]) {
    void this.router.navigate(commands);
  }
}

