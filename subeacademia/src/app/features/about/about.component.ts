import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  linkedinUrl: string;
  bio: string;
  fullBio: string[];
  flipped?: boolean;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, I18nTranslatePipe],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  selectedMember: TeamMember | null = null;

  founders: TeamMember[] = [
    {
      name: 'Rodrigo Carrillo',
      role: 'Cofundador y CEO',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=RC',
      linkedinUrl: 'https://www.linkedin.com/in/rorrocarrillo/',
      bio: 'Experto en innovación y transferencia tecnológica con más de 15 años de experiencia. Autor y Speaker internacional enfocado en IA para el desarrollo sostenible.',
      fullBio: [
        'Ingeniero Civil Industrial, Mención Informática, Universidad de La Frontera.',
        'Máster en Gestión de la Ciencia y la Innovación, Universidad Politécnica de Valencia.',
        'Fellow del prestigioso programa Stanford Ignite, GSB Stanford University.',
        'Autor del libro "La revolución de la Inteligencia Artificial para alcanzar los Objetivos de Desarrollo Sostenible".',
        'Creador del ARES-AI Framework para la implementación responsable de IA.',
        'Cofundador y Vicepresidente de la Asociación Chilena de IA para el Desarrollo Sostenible (ACHIADS).'
      ]
    },
    {
      name: 'Bruno Villalobos',
      role: 'Cofundador y CTO',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=BV',
      linkedinUrl: 'https://www.linkedin.com/in/brunovillalobosmu%C3%B1oz/',
      bio: 'Especialista en IA y Big Data con una década de experiencia en tecnologías educativas. Creador de metodologías innovadoras para Prompt Engineering.',
      fullBio: [
        'Ingeniero Civil Industrial, Universidad Austral de Chile.',
        'Máster en Inteligencia Artificial e Ingeniería del Conocimiento, TECH University.',
        'Global Máster Business Administration, Universidad Isabel I.',
        'Máster en Big Data y Business Intelligence, ENEB.',
        'Autor del libro "Teoría y Práctica de la IA: El renacimiento del talento humano".',
        'Creador del método RIP-RIF para prompt engineering de IA Generativa.',
        'Fundador y Presidente de ACHIADS.'
      ]
    },
    {
      name: 'Mario Muñoz',
      role: 'Cofundador y COO',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=MM',
      linkedinUrl: 'https://www.linkedin.com/in/mariomunozvillalobos/',
      bio: 'Ingeniero Comercial experto en gestión de proyectos y negocios internacionales, liderando la expansión y operaciones de la academia.',
      fullBio: [
        'Ingeniero Comercial, Universidad de los Lagos.',
        'Diplomado en International Business, ILSC Education Group.',
        'Diplomado en Project Management, Greenwich Business Institute.',
        'Experiencia en la gestión y escalamiento de proyectos tecnológicos y educativos.'
      ]
    },
    {
      name: 'Guido Asencio',
      role: 'Asesor Estratégico',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=GA',
      linkedinUrl: '#',
      bio: 'Asesor con amplia trayectoria en el sector público y privado, especializado en la articulación de proyectos de alto impacto tecnológico y social.',
      fullBio: [
        'Detalle del currículum de Guido Asencio aquí.',
        'Experiencia relevante 1.',
        'Experiencia relevante 2.'
      ]
    }
  ];

  collaborators = [
    { name: 'Nataly Saavedra', role: 'Abogada Especialista' },
    { name: 'Lina Barraza', role: 'Psicóloga Clínica' },
    { name: 'Ignacio Lipski', role: 'Marketing Digital' },
    { name: 'Carlos Baldovinos', role: 'Geógrafo' },
    { name: 'Jorge Vásquez', role: 'Historiador y experto en Robótica' },
    { name: 'Diego Ramirez', role: 'Psicólogo Organizacional' },
    { name: 'Nicolás Valenzuela', role: 'Ingeniero de IA' },
  ];

  toggleFlip(member: TeamMember): void {
    member.flipped = !member.flipped;
  }

  openModal(member: TeamMember): void {
    this.selectedMember = member;
  }

  closeModal(): void {
    this.selectedMember = null;
  }
}


