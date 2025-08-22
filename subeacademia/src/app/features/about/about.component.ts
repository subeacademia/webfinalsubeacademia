import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import * as AnimeNS from 'animejs';
const animeFn: any = (AnimeNS as any).default ?? (AnimeNS as any);
import { CollaboratorsService } from '../../core/data/collaborators.service';
import { Observable, map } from 'rxjs';
import { Collaborator } from '../../core/models/collaborator.model';
import { HistoryTimelineComponent } from './components/history-timeline/history-timeline.component';

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
  imports: [CommonModule, I18nTranslatePipe, PageHeaderComponent, HistoryTimelineComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements AfterViewInit {
  selectedMember: TeamMember | null = null;
  collaborators$: Observable<Collaborator[]> | undefined;
  collaboratorsFallback: Collaborator[] = [];
  collaboratorCards$: Observable<TeamMember[]> | undefined;
  collaboratorCardsFallback: TeamMember[] = [];

  activeTab = 'mision';
  philosophyTabs = [
    { id: 'mision', title: 'Misión', content: 'Impulsar la evolución de profesionales y empresas a través de una educación en IA profundamente personalizada y práctica, transformando el paradigma de la enseñanza hacia el aprendizaje efectivo (matética).' },
    { id: 'vision', title: 'Visión', content: 'Ser el referente en Latinoamérica en la formación de talento en Inteligencia Artificial, reconocidos por nuestra metodología innovadora que garantiza resultados tangibles y de alto impacto.' },
    { id: 'valores', title: 'Valores', content: 'Excelencia, Innovación Constante, Integridad y un Compromiso real con el éxito de cada uno de nuestros estudiantes y socios.' }
  ];

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

  constructor(private collaboratorsService: CollaboratorsService) {
    // Fallback local si la colección está vacía
    const fallback: Collaborator[] = [
      { name: 'Nicolás Valenzuela', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=NV', description: 'Ingeniero de IA con foco en soluciones aplicadas y MLOps.', website: '#', type: 'Partner Tecnológico' },
      { name: 'Diego Ramírez', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=DR', description: 'Magíster en Gestión de RRHH y experto en IA para el desarrollo del talento.', website: '#', type: 'Partner Académico' },
      { name: 'Pablo Soto', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=PS', description: 'Especialista en SIG e inteligencia geoespacial con IA.', website: '#', type: 'Partner Académico' },
      { name: 'Ignacio Villarroel', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=IV', description: 'Investigador en cómputo cuántico y su integración con IA.', website: '#', type: 'Partner Tecnológico' },
    ];
    this.collaboratorsFallback = fallback;
    // Fallback ya mapeado a TeamMember por si no hay datos de Firestore al hidratar
    this.collaboratorCardsFallback = fallback.map((c): TeamMember => ({
      name: c.name || '',
      role: c.type || '',
      imageUrl: c.logoUrl || '',
      linkedinUrl: c.website || '#',
      bio: c.description || '',
      fullBio: (c.description ? c.description.split(/\n+|\.\s+/).map(s => s.trim()).filter(Boolean) : [])
    }));
    this.collaborators$ = this.collaboratorsService.getCollaborators().pipe(
      map(list => (list && list.length ? list : fallback))
    );

    // Mapea colaboradores al formato de TeamMember para reutilizar el mismo estilo de tarjetas
    this.collaboratorCards$ = this.collaborators$.pipe(
      map((items) => items.map((c): TeamMember => ({
        name: c.name,
        role: c.type ?? '',
        imageUrl: c.logoUrl,
        linkedinUrl: c.website ?? '#',
        bio: c.description ?? '',
        fullBio: (c.description ? c.description.split(/\n+|\.\s+/).map(s => s.trim()).filter(Boolean) : [])
      })))
    );
  }

  toggleFlip(member: TeamMember): void {
    member.flipped = !member.flipped;
  }

  openModal(member: TeamMember): void {
    this.selectedMember = member;
  }

  closeModal(): void {
    this.selectedMember = null;
  }

  ngAfterViewInit(): void {
    const tabs = document.querySelectorAll('.philosophy-content');
    if (!tabs || tabs.length === 0) return;
    animeFn({ targets: tabs, opacity: [0, 1], duration: 600, delay: 150, easing: 'easeOutQuad' });
  }

  setActiveTab(id: string): void {
    if (this.activeTab === id) return;
    this.activeTab = id;
  }
}


