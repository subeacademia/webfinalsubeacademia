import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface HomePageContent {
  typewriterPhrases: string[];
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class HomeConfigService {
  
  // Configuración local por defecto
  private defaultConfig: { [key: string]: HomePageContent } = {
    'es': {
      title: 'Potencia tu Talento en la Era de la Inteligencia Artificial',
      typewriterPhrases: [
        'Implementa IA de forma Ágil, Responsable y Sostenible con nuestro Framework ARES-AI©.',
        'Desarrolla las 13 competencias clave que tu equipo necesita para liderar la transformación digital.',
        'Transforma tu organización con nuestra plataforma de aprendizaje adaptativo AVE-AI.'
      ]
    },
    'en': {
      title: 'Power Your Talent in the Age of Artificial Intelligence',
      typewriterPhrases: [
        'Implement AI in an Agile, Responsible and Sustainable way with our ARES-AI© Framework.',
        'Develop the 13 key competencies your team needs to lead digital transformation.',
        'Transform your organization with our adaptive learning platform AVE-AI.'
      ]
    },
    'pt': {
      title: 'Potencialize seu Talento na Era da Inteligência Artificial',
      typewriterPhrases: [
        'Implemente IA de forma Ágil, Responsável e Sustentável com nosso Framework ARES-AI©.',
        'Desenvolva as 13 competências-chave que sua equipe precisa para liderar a transformação digital.',
        'Transforme sua organização com nossa plataforma de aprendizado adaptativo AVE-AI.'
      ]
    }
  };

  getHomePageContent(lang: 'es' | 'en' | 'pt'): Observable<HomePageContent> {
    console.log('🏠 HomeConfigService: Obteniendo contenido para idioma:', lang);
    const content = this.defaultConfig[lang] || this.defaultConfig['es'];
    console.log('📄 Contenido retornado:', content);
    return of(content);
  }

  // Método para actualizar la configuración (para uso futuro del admin)
  updateHomeTitle(lang: 'es' | 'en' | 'pt', title: string): void {
    if (this.defaultConfig[lang]) {
      this.defaultConfig[lang].title = title;
      console.log('✅ Título actualizado para', lang, ':', title);
    }
  }

  updateTypewriterPhrases(lang: 'es' | 'en' | 'pt', phrases: string[]): void {
    if (this.defaultConfig[lang]) {
      this.defaultConfig[lang].typewriterPhrases = phrases;
      console.log('✅ Frases actualizadas para', lang, ':', phrases);
    }
  }

  // Método de prueba para compatibilidad
  async testAndInitializeHomeContent(lang: 'es' | 'en' | 'pt'): Promise<void> {
    console.log('🧪 HomeConfigService: Inicialización simulada para idioma:', lang);
    // No hay nada que inicializar en este servicio local
    return Promise.resolve();
  }
}
