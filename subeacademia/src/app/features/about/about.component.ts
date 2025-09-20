import { AfterViewInit, Component, OnInit } from '@angular/core';
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
export class AboutComponent implements AfterViewInit, OnInit {
  selectedMember: TeamMember | null = null;
  collaborators$: Observable<Collaborator[]> | undefined;
  collaboratorsFallback: Collaborator[] = [];
  collaboratorCards$: Observable<TeamMember[]> | undefined;
  collaboratorCardsFallback: TeamMember[] = [];

  activeTab = 'mision';
  philosophyTabs = [
    { id: 'mision', titleKey: 'about.mvv.mission_title', contentKey: 'about.mvv.mission_desc' },
    { id: 'vision', titleKey: 'about.mvv.vision_title', contentKey: 'about.mvv.vision_desc' },
    { id: 'valores', titleKey: 'about.mvv.values_title', contentKey: 'about.mvv.values_desc' }
  ];

  founders: TeamMember[] = [];
  foundersFromDB$: Observable<TeamMember[]> | undefined;

  ngOnInit() {
    this.initializeDataIfNeeded();
  }

  constructor(private collaboratorsService: CollaboratorsService) {
    // Configurar FUNDADORES desde la base de datos
    this.foundersFromDB$ = this.collaboratorsService.getCollaborators().pipe(
      map(list => {
        console.log('🔍 Todos los colaboradores:', list);
        console.log('🔍 Filtrando fundadores...');
        
        const foundersFromDB = list
          .filter(c => {
            const isFounder = c.isFounder === true;
            const isActive = c.isActive !== false;
            console.log(`👤 ${c.name}: isFounder=${isFounder}, isActive=${isActive}`);
            return isFounder && isActive;
          })
          .sort((a, b) => (a.founderOrder || 0) - (b.founderOrder || 0))
          .map((c): TeamMember => {
            const founder: TeamMember = {
              name: c.name,
              role: c.role || '',
              imageUrl: c.imageUrl || c.logoUrl || `https://placehold.co/500x500/1e293b/ffffff?text=${c.name.split(' ').map(n => n[0]).join('')}`,
              linkedinUrl: c.linkedinUrl || c.website || '#',
              bio: c.bio || c.description || '',
              fullBio: c.fullBio || (c.bio ? c.bio.split(/\n+|\.\s+/).map(s => s.trim()).filter(Boolean) : [])
            };
            console.log(`✅ Fundador procesado: ${founder.name}, Imagen: ${founder.imageUrl}`);
            return founder;
          });
        
        console.log(`📊 Fundadores encontrados: ${foundersFromDB.length}`);
        
        // Si no hay fundadores en la DB, usar fallback
        if (foundersFromDB.length === 0) {
          console.log('⚠️ No hay fundadores en DB, usando fallback');
          const fallbackFounders = this.getFoundersFallback();
          this.founders = fallbackFounders;
          return fallbackFounders;
        }
        
        this.founders = foundersFromDB;
        return foundersFromDB;
      })
    );

    // Configurar COLABORADORES (solo no-fundadores) desde la base de datos
    const collaboratorsFallback: Collaborator[] = [
      { name: 'Nicolás Valenzuela', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=NV', description: 'Ingeniero de IA con foco en soluciones aplicadas y MLOps.', website: '#', type: 'Partner Tecnológico' },
      { name: 'Diego Ramírez', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=DR', description: 'Magíster en Gestión de RRHH y experto en IA para el desarrollo del talento.', website: '#', type: 'Partner Académico' },
      { name: 'Pablo Soto', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=PS', description: 'Especialista en SIG e inteligencia geoespacial con IA.', website: '#', type: 'Partner Académico' },
      { name: 'Ignacio Villarroel', logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=IV', description: 'Investigador en cómputo cuántico y su integración con IA.', website: '#', type: 'Partner Tecnológico' },
    ];
    
    this.collaboratorsFallback = collaboratorsFallback;
    this.collaboratorCardsFallback = collaboratorsFallback.map((c): TeamMember => ({
      name: c.name || '',
      role: c.type || '',
      imageUrl: c.logoUrl || '',
      linkedinUrl: c.website || '#',
      bio: c.description || '',
      fullBio: (c.description ? c.description.split(/\n+|\.\s+/).map(s => s.trim()).filter(Boolean) : [])
    }));

    // COLABORADORES (excluir fundadores)
    this.collaborators$ = this.collaboratorsService.getCollaborators().pipe(
      map(list => {
        console.log('🔍 Filtrando colaboradores (no fundadores)...');
        const nonFounders = list.filter(c => {
          const isNotFounder = !c.isFounder;
          const isActive = c.isActive !== false;
          console.log(`🤝 ${c.name}: isNotFounder=${isNotFounder}, isActive=${isActive}`);
          return isNotFounder && isActive;
        });
        
        console.log(`📊 Colaboradores encontrados: ${nonFounders.length}`);
        return nonFounders.length > 0 ? nonFounders : collaboratorsFallback;
      })
    );
    
    this.collaboratorCards$ = this.collaborators$.pipe(
      map(list => list.map((c): TeamMember => ({
        name: c.name || '',
        role: c.type || '',
        imageUrl: c.imageUrl || c.logoUrl || `https://placehold.co/200x200/1e293b/ffffff?text=${c.name.split(' ').map(n => n[0]).join('')}`,
        linkedinUrl: c.linkedinUrl || c.website || '#',
        bio: c.bio || c.description || '',
        fullBio: c.fullBio || (c.description ? c.description.split(/\n+|\.\s+/).map(s => s.trim()).filter(Boolean) : [])
      })))
    );
  }

  private getFoundersFallback(): TeamMember[] {
    return [
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
          'Asesor con amplia trayectoria en el sector público y privado.',
          'Especializado en la articulación de proyectos de alto impacto tecnológico y social.',
          'Experiencia en desarrollo de estrategias organizacionales.'
        ]
      }
    ];
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

  /**
   * Inicializa los datos si no existen en la base de datos
   */
  private async initializeDataIfNeeded(): Promise<void> {
    try {
      const existingCollaborators = await this.collaboratorsService.getCollaboratorsAsPromise();
      
      // Si no hay datos en la DB, migrar automáticamente
      if (existingCollaborators.length === 0) {
        console.log('Base de datos vacía. Migrando datos iniciales...');
        await this.migrateFoundersToDatabase();
        await this.migrateCollaboratorsToDatabase();
        console.log('Migración completada exitosamente');
      }
    } catch (error) {
      console.error('Error en la inicialización automática:', error);
    }
  }

  /**
   * Migra los fundadores hardcodeados a la base de datos
   */
  private async migrateFoundersToDatabase(): Promise<void> {
    const foundersData = [
      {
        name: 'Rodrigo Carrillo',
        role: 'Cofundador y CEO',
        logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=RC',
        imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=RC',
        website: 'https://www.linkedin.com/in/rorrocarrillo/',
        linkedinUrl: 'https://www.linkedin.com/in/rorrocarrillo/',
        description: 'Experto en innovación y transferencia tecnológica con más de 15 años de experiencia. Autor y Speaker internacional enfocado en IA para el desarrollo sostenible.',
        bio: 'Experto en innovación y transferencia tecnológica con más de 15 años de experiencia. Autor y Speaker internacional enfocado en IA para el desarrollo sostenible.',
        fullBio: [
          'Ingeniero Civil Industrial, Mención Informática, Universidad de La Frontera.',
          'Máster en Gestión de la Ciencia y la Innovación, Universidad Politécnica de Valencia.',
          'Fellow del prestigioso programa Stanford Ignite, GSB Stanford University.',
          'Autor del libro "La revolución de la Inteligencia Artificial para alcanzar los Objetivos de Desarrollo Sostenible".',
          'Creador del ARES-AI Framework para la implementación responsable de IA.',
          'Cofundador y Vicepresidente de la Asociación Chilena de IA para el Desarrollo Sostenible (ACHIADS).'
        ],
        type: 'Fundador' as const,
        isFounder: true,
        founderOrder: 0,
        displayOrder: 0,
        isActive: true,
        joinDate: new Date('2020-01-01')
      },
      {
        name: 'Bruno Villalobos',
        role: 'Cofundador y CTO',
        logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=BV',
        imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=BV',
        website: 'https://www.linkedin.com/in/brunovillalobosmu%C3%B1oz/',
        linkedinUrl: 'https://www.linkedin.com/in/brunovillalobosmu%C3%B1oz/',
        description: 'Especialista en IA y Big Data con una década de experiencia en tecnologías educativas. Creador de metodologías innovadoras para Prompt Engineering.',
        bio: 'Especialista en IA y Big Data con una década de experiencia en tecnologías educativas. Creador de metodologías innovadoras para Prompt Engineering.',
        fullBio: [
          'Ingeniero Civil Industrial, Universidad Austral de Chile.',
          'Máster en Inteligencia Artificial e Ingeniería del Conocimiento, TECH University.',
          'Global Máster Business Administration, Universidad Isabel I.',
          'Máster en Big Data y Business Intelligence, ENEB.',
          'Autor del libro "Teoría y Práctica de la IA: El renacimiento del talento humano".',
          'Creador del método RIP-RIF para prompt engineering de IA Generativa.',
          'Fundador y Presidente de ACHIADS.'
        ],
        type: 'Fundador' as const,
        isFounder: true,
        founderOrder: 1,
        displayOrder: 1,
        isActive: true,
        joinDate: new Date('2020-01-01')
      },
      {
        name: 'Mario Muñoz',
        role: 'Cofundador y COO',
        logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=MM',
        imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=MM',
        website: 'https://www.linkedin.com/in/mariomunozvillalobos/',
        linkedinUrl: 'https://www.linkedin.com/in/mariomunozvillalobos/',
        description: 'Ingeniero Comercial experto en gestión de proyectos y negocios internacionales, liderando la expansión y operaciones de la academia.',
        bio: 'Ingeniero Comercial experto en gestión de proyectos y negocios internacionales, liderando la expansión y operaciones de la academia.',
        fullBio: [
          'Ingeniero Comercial, Universidad de los Lagos.',
          'Diplomado en International Business, ILSC Education Group.',
          'Diplomado en Project Management, Greenwich Business Institute.',
          'Experiencia en la gestión y escalamiento de proyectos tecnológicos y educativos.'
        ],
        type: 'Fundador' as const,
        isFounder: true,
        founderOrder: 2,
        displayOrder: 2,
        isActive: true,
        joinDate: new Date('2020-01-01')
      },
      {
        name: 'Guido Asencio',
        role: 'Asesor Estratégico',
        logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=GA',
        imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=GA',
        website: '#',
        linkedinUrl: '#',
        description: 'Asesor con amplia trayectoria en el sector público y privado, especializado en la articulación de proyectos de alto impacto tecnológico y social.',
        bio: 'Asesor con amplia trayectoria en el sector público y privado, especializado en la articulación de proyectos de alto impacto tecnológico y social.',
        fullBio: [
          'Asesor con amplia trayectoria en el sector público y privado.',
          'Especializado en la articulación de proyectos de alto impacto tecnológico y social.',
          'Experiencia en desarrollo de estrategias organizacionales.'
        ],
        type: 'Fundador' as const,
        isFounder: true,
        founderOrder: 3,
        displayOrder: 3,
        isActive: true,
        joinDate: new Date('2020-01-01')
      }
    ];

    for (const founder of foundersData) {
      try {
        await this.collaboratorsService.addCollaborator(founder);
        console.log(`Fundador ${founder.name} migrado exitosamente`);
      } catch (error) {
        console.error(`Error migrando fundador ${founder.name}:`, error);
      }
    }
  }

  /**
   * Migra los colaboradores hardcodeados a la base de datos
   */
  private async migrateCollaboratorsToDatabase(): Promise<void> {
    const collaboratorsData = [
      { 
        name: 'Nicolás Valenzuela', 
        role: 'Ingeniero de IA',
        logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=NV', 
        imageUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=NV',
        description: 'Ingeniero de IA con foco en soluciones aplicadas y MLOps.', 
        bio: 'Ingeniero de IA con foco en soluciones aplicadas y MLOps.',
        website: '#', 
        linkedinUrl: '#',
        type: 'Partner Tecnológico' as const,
        isFounder: false,
        displayOrder: 10,
        isActive: true,
        joinDate: new Date('2021-01-01')
      },
      { 
        name: 'Diego Ramírez', 
        role: 'Especialista en RRHH',
        logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=DR', 
        imageUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=DR',
        description: 'Magíster en Gestión de RRHH y experto en IA para el desarrollo del talento.', 
        bio: 'Magíster en Gestión de RRHH y experto en IA para el desarrollo del talento.',
        website: '#', 
        linkedinUrl: '#',
        type: 'Partner Académico' as const,
        isFounder: false,
        displayOrder: 11,
        isActive: true,
        joinDate: new Date('2021-06-01')
      },
      { 
        name: 'Pablo Soto', 
        role: 'Especialista en SIG',
        logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=PS', 
        imageUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=PS',
        description: 'Especialista en SIG e inteligencia geoespacial con IA.', 
        bio: 'Especialista en SIG e inteligencia geoespacial con IA.',
        website: '#', 
        linkedinUrl: '#',
        type: 'Partner Académico' as const,
        isFounder: false,
        displayOrder: 12,
        isActive: true,
        joinDate: new Date('2022-01-01')
      },
      { 
        name: 'Ignacio Villarroel', 
        role: 'Investigador en Cómputo Cuántico',
        logoUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=IV', 
        imageUrl: 'https://placehold.co/200x200/1e293b/ffffff?text=IV',
        description: 'Investigador en cómputo cuántico y su integración con IA.', 
        bio: 'Investigador en cómputo cuántico y su integración con IA.',
        website: '#', 
        linkedinUrl: '#',
        type: 'Partner Tecnológico' as const,
        isFounder: false,
        displayOrder: 13,
        isActive: true,
        joinDate: new Date('2022-06-01')
      }
    ];

    for (const collaborator of collaboratorsData) {
      try {
        await this.collaboratorsService.addCollaborator(collaborator);
        console.log(`Colaborador ${collaborator.name} migrado exitosamente`);
      } catch (error) {
        console.error(`Error migrando colaborador ${collaborator.name}:`, error);
      }
    }
  }
}
