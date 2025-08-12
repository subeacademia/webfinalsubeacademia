import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSceneComponent } from '../../features/home/hero-scene/hero-scene.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, HeroSceneComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Datos para secciones (fácil de editar)
  hero = {
    title: 'SubecademIA – Formación, Consultoría y Certificación en Inteligencia Artificial para Empresas y Universidades de Latinoamérica',
    subtitle: 'Ahorra tiempo. Transforma tu productividad. Vive una vida más feliz con Inteligencia Artificial.',
    ctaPrimary: { label: 'Agenda tu diagnóstico gratuito', href: '/contacto' },
    ctaSecondary: { label: 'Ver paquetes de servicios', href: '#servicios' }
  };

  propuestaValor = [
    {
      title: 'Metodología Propia ARES-AI',
      desc: 'Marco único de diagnóstico, capacitación y ejecución, probado en empresas y universidades de la región.',
      icon: '⚙️'
    },
    {
      title: 'Modalidad Flexible',
      desc: 'Online, híbrida y presencial — adaptada a cualquier país de Latinoamérica.',
      icon: '🌎'
    },
    {
      title: 'Resultados Medibles',
      desc: 'Mejoras reales: eficiencia, reducción de tiempos y decisiones más inteligentes.',
      icon: '📈'
    }
  ];

  segmentos = [
    {
      title: 'Empresas',
      desc: 'Formamos directivos y equipos para implementar IA que optimiza procesos, aumenta la productividad y mejora el ROI.',
      icon: '🏢'
    },
    {
      title: 'Educación Superior',
      desc: 'Actualizamos programas, fortalecemos competencias digitales y preparamos a estudiantes para el futuro laboral.',
      icon: '🎓'
    },
    {
      title: 'Profesionales',
      desc: 'Formación especializada y certificaciones para destacar en un mercado competitivo.',
      icon: '👩‍💼'
    }
  ];

  testimonios = [
    {
      quote: 'Gracias a SubecademIA, implementamos IA en nuestro flujo y redujimos tiempos de procesamiento en un 40% en menos de tres meses.',
      author: 'Gerente de Innovación',
      org: 'Empresa del sector industrial'
    },
    {
      quote: 'Nuestros docentes integran herramientas de IA en clases, y los estudiantes trabajan en proyectos reales con tecnología de vanguardia.',
      author: 'Vicerrector Académico',
      org: 'Universidad en Chile'
    }
  ];

  servicios = [
    {
      title: 'Pack Ejecutivo',
      desc: 'Capacitación para directivos y mandos medios. Enfoque estratégico y toma de decisiones asistida por IA.'
    },
    {
      title: 'Pack Jurídico',
      desc: 'IA aplicada a estudios y departamentos legales: eficiencia documental, análisis y compliance.'
    },
    {
      title: 'Pack Educación Superior',
      desc: 'Integración de IA en docencia e investigación: currículos, proyectos y cultura digital.'
    },
    {
      title: 'Pack Corporativo Full IA',
      desc: 'Diagnóstico, capacitación, pilotos y escalamiento transversal con métricas claras.'
    }
  ];

  metodologia = [
    { step: 'Diagnóstico Global', desc: 'Personas, procesos y oportunidades.' },
    { step: 'Capacitación Profesional', desc: 'Uso estratégico de IA generativa.' },
    { step: 'Casos Piloto y Métricas', desc: 'Validación en entornos reales.' },
    { step: 'Escalamiento', desc: 'Integración transversal en la organización.' },
    { step: 'Sostenibilidad', desc: 'Gobernanza ética, optimización y mejora continua.' }
  ];

  logos = ['Empresa A', 'Universidad B', 'Instituto C', 'Corp D', 'Startup E', 'Org F'];

  cifras = [
    { k: '+X', label: 'personas capacitadas' },
    { k: '+X', label: 'empresas y universidades' },
    { k: 'X',  label: 'países en Latinoamérica' }
  ];

  ctaFinal = {
    title: 'El momento de integrar la IA a tu organización es ahora.',
    desc: 'Agenda tu diagnóstico gratuito y descubre cómo podemos transformar tu productividad, optimizar procesos y preparar a tu equipo para el futuro.',
    primary: { label: 'Agenda tu diagnóstico gratuito', href: '/contacto' },
    secondary: { label: 'Escríbenos por WhatsApp', href: 'https://wa.me/56900000000' }
  };

  contacto = {
    email: 'contacto@subeia.tech',
    phone: '+56 9 XXX XXXX',
    web: 'https://www.subeia.tech'
  };

  year = new Date().getFullYear();
}

