import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../shared/ui/animate-on-scroll.directive';
import { AnimationService } from '../../core/services/animation.service';
import { ValuePropositionCardComponent } from '../../shared/ui/value-proposition-card/value-proposition-card.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, AnimateOnScrollDirective, ValuePropositionCardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header de la sección -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">Nuestros Productos</h1>
        <div class="max-w-4xl mx-auto">
          <p class="text-xl md:text-2xl text-center max-w-3xl mx-auto leading-relaxed">
            Nuestros servicios son premium porque fusionamos la
            <span class="highlight">matética</span> con la IA, enfocándonos en
            <span class="highlight">cómo aprendes</span>, no solo en cómo enseñamos.
            Nuestro modelo es un balance perfecto:
            <span class="font-bold text-5xl block my-4 balance">
              <span class="text-cyan-400">50%</span> Contenido Estándar y <span class="text-fuchsia-500">50%</span> Personalización Total.
            </span>
            Es la fórmula que la competencia no puede replicar.
          </p>
        </div>
      </div>

      <!-- Grid de categorías de productos -->
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <!-- Asesorías -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">💡</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Asesorías</h3>
            <p class="text-gray-600 mb-4">
              Consultoría personalizada para implementar IA en tu empresa
            </p>
            <a [routerLink]="['asesorias']" 
               class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Ver Asesorías
            </a>
          </div>
        </div>

        <!-- Cursos -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📚</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Cursos</h3>
            <p class="text-gray-600 mb-4">
              Formación especializada en Inteligencia Artificial
            </p>
            <a [routerLink]="['cursos']" 
               class="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Ver Cursos
            </a>
          </div>
        </div>

        <!-- Certificaciones -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🏆</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Certificaciones</h3>
            <p class="text-gray-600 mb-4">
              Certificaciones oficiales en tecnologías de IA
            </p>
            <a [routerLink]="['certificaciones']" 
               class="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Ver Certificaciones
            </a>
          </div>
        </div>
      </div>

      <!-- Propuesta de Valor Rediseñada -->
      <div class="mt-20 py-16 bg-gray-800/50 rounded-xl">
        <div class="container mx-auto px-6">
          <h2 class="text-4xl font-bold text-center text-white mb-12">El Enfoque <span class="text-cyan-400">Sube-Academia</span></h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4" [appAnimateOnScroll]="'.value-card'">

            <!-- Tarjeta 1: Personalización -->
            <app-value-proposition-card 
              class="value-card"
              title="Personalización Matética"
              shortDescription="Dejamos atrás la didáctica tradicional. Creamos una ruta de aprendizaje única para ti, optimizando cómo aprendes y aplicas el conocimiento."
              detailedDescription="Nuestro modelo 50/50 es revolucionario. Combina una base sólida de conocimiento estándar con un 50% de contenido y proyectos totalmente adaptados a tus metas y a tu contexto real. Utilizamos la IA no solo como un tema de estudio, sino como la herramienta principal para personalizar tu experiencia educativa a un nivel de detalle y eficacia sin precedentes, asegurando que cada minuto invertido se traduzca en un avance tangible."
              icon="user-gear">
            </app-value-proposition-card>

            <!-- Tarjeta 2: Experiencia Práctica -->
            <app-value-proposition-card 
              class="value-card"
              title="Experiencia Práctica Acelerada"
              shortDescription="Te enfrentarás a desafíos empresariales reales y complejos desde el primer día. Aquí no hay espacio para la teoría abstracta y desconectada."
              detailedDescription="Cada módulo está diseñado meticulosamente para culminar en un proyecto tangible y aplicable que simula un entorno profesional real. No solo aprenderás a manejar herramientas de IA, sino que resolverás problemas complejos, construyendo un portafolio robusto que demuestra tu capacidad para generar resultados medibles y de alto impacto. Es la diferencia entre saber y saber hacer."
              icon="rocket-launch">
            </app-value-proposition-card>

            <!-- Tarjeta 3: Calidad Premium -->
            <app-value-proposition-card 
              class="value-card"
              title="Calidad Premium y Vanguardia"
              shortDescription="Accede a contenido de élite, desarrollado y curado por un equipo senior con experiencia probada en proyectos de transformación digital a gran escala."
              detailedDescription="Nos mantenemos obsesivamente en la frontera del conocimiento, actualizando nuestro contenido en tiempo real para reflejar las últimas tendencias, herramientas y arquitecturas del ecosistema de la IA. Nuestro equipo no solo enseña; aplica activamente la IA en el campo de batalla empresarial, garantizando que recibas un conocimiento que no solo es relevante, sino que ha sido probado y validado en proyectos de alto impacto."
              icon="diamond">
            </app-value-proposition-card>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductosComponent implements AfterViewInit {
  constructor(
    private readonly animationService: AnimationService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngAfterViewInit(): void {
    const w = (globalThis as any);
    const anime = w && w.anime ? w.anime : null;
    if (anime) {
      anime({
        targets: '.highlight',
        backgroundColor: ['rgba(167, 139, 250, 0)', 'rgba(167, 139, 250, 0.2)'],
        delay: anime.stagger(200, { start: 500 }),
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.balance',
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 1500,
        delay: 1000,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      // Fallback suave si anime.js no está disponible
      this.animationService.fadeInScale('.balance', 500);
    }
  }
}
