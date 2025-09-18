import { Injectable, inject } from '@angular/core';
import { CollaboratorsService } from '../data/collaborators.service';
import { Collaborator } from '../models/collaborator.model';

@Injectable({
  providedIn: 'root'
})
export class FoundersInitializationService {
  private collaboratorsService = inject(CollaboratorsService);

  /**
   * Datos de los fundadores basados en la sección "Nosotros"
   */
  private readonly foundersData: Omit<Collaborator, 'id'>[] = [
    {
      name: 'Rodrigo Carrillo',
      role: 'Cofundador y CEO',
      logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=RC',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=RC',
      website: 'https://www.linkedin.com/in/rorrocarrillo/',
      linkedinUrl: 'https://www.linkedin.com/in/rorrocarrillo/',
      description: 'Experto en innovación y transferencia tecnológica con más de 15 años de experiencia. Autor y Speaker internacional enfocado en IA para el desarrollo sostenible.',
      bio: 'Experto en innovación y transferencia tecnológica con más de 15 años de experiencia. Autor y Speaker internacional enfocado en IA para el desarrollo sostenible.',
      type: 'Fundador',
      isFounder: true,
      founderOrder: 0,
      displayOrder: 0,
      isActive: true,
      joinDate: new Date('2020-01-01'),
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
      logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=BV',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=BV',
      website: 'https://www.linkedin.com/in/brunovillalobosmu%C3%B1oz/',
      linkedinUrl: 'https://www.linkedin.com/in/brunovillalobosmu%C3%B1oz/',
      description: 'Especialista en IA y Big Data con una década de experiencia en tecnologías educativas. Creador de metodologías innovadoras para Prompt Engineering.',
      bio: 'Especialista en IA y Big Data con una década de experiencia en tecnologías educativas. Creador de metodologías innovadoras para Prompt Engineering.',
      type: 'Fundador',
      isFounder: true,
      founderOrder: 1,
      displayOrder: 1,
      isActive: true,
      joinDate: new Date('2020-01-01'),
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
      logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=MM',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=MM',
      website: 'https://www.linkedin.com/in/mariomunozvillalobos/',
      linkedinUrl: 'https://www.linkedin.com/in/mariomunozvillalobos/',
      description: 'Ingeniero Comercial experto en gestión de proyectos y negocios internacionales, liderando la expansión y operaciones de la academia.',
      bio: 'Ingeniero Comercial experto en gestión de proyectos y negocios internacionales, liderando la expansión y operaciones de la academia.',
      type: 'Fundador',
      isFounder: true,
      founderOrder: 2,
      displayOrder: 2,
      isActive: true,
      joinDate: new Date('2020-01-01'),
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
      logoUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=GA',
      imageUrl: 'https://placehold.co/500x500/1e293b/ffffff?text=GA',
      website: '#',
      linkedinUrl: '#',
      description: 'Asesor con amplia trayectoria en el sector público y privado, especializado en la articulación de proyectos de alto impacto tecnológico y social.',
      bio: 'Asesor con amplia trayectoria en el sector público y privado, especializado en la articulación de proyectos de alto impacto tecnológico y social.',
      type: 'Fundador',
      isFounder: true,
      founderOrder: 3,
      displayOrder: 3,
      isActive: true,
      joinDate: new Date('2020-01-01'),
      fullBio: [
        'Detalle del currículum de Guido Asencio aquí.',
        'Experiencia relevante 1.',
        'Experiencia relevante 2.'
      ]
    }
  ];

  /**
   * Inicializa los fundadores en la base de datos si no existen
   */
  async initializeFounders(): Promise<void> {
    try {
      // Obtener colaboradores existentes
      const existingCollaborators = await this.collaboratorsService.getCollaboratorsAsPromise();
      
      // Verificar qué fundadores ya existen
      const existingFounders = existingCollaborators.filter(c => c.isFounder);
      const existingFounderNames = existingFounders.map(f => f.name);

      // Agregar fundadores que no existen
      for (const founderData of this.foundersData) {
        if (!existingFounderNames.includes(founderData.name)) {
          console.log(`Inicializando fundador: ${founderData.name}`);
          await this.collaboratorsService.addCollaborator(founderData);
        }
      }

      // Actualizar fundadores existentes con datos completos si es necesario
      for (const existingFounder of existingFounders) {
        const founderData = this.foundersData.find(f => f.name === existingFounder.name);
        if (founderData && existingFounder.id) {
          // Verificar si necesita actualización (si faltan campos nuevos)
          const needsUpdate = !existingFounder.fullBio || 
                             !existingFounder.bio || 
                             !existingFounder.founderOrder !== undefined ||
                             !existingFounder.displayOrder !== undefined;
          
          if (needsUpdate) {
            console.log(`Actualizando datos del fundador: ${existingFounder.name}`);
            await this.collaboratorsService.updateCollaborator(existingFounder.id, {
              ...founderData,
              logoUrl: existingFounder.logoUrl || founderData.logoUrl, // Mantener imagen actual si existe
              imageUrl: existingFounder.imageUrl || founderData.imageUrl
            });
          }
        }
      }

    } catch (error) {
      console.error('Error inicializando fundadores:', error);
    }
  }

  /**
   * Verifica si un colaborador es fundador
   */
  isFounder(collaboratorName: string): boolean {
    return this.foundersData.some(f => f.name === collaboratorName);
  }

  /**
   * Obtiene los datos base de un fundador
   */
  getFounderData(collaboratorName: string): Omit<Collaborator, 'id'> | null {
    return this.foundersData.find(f => f.name === collaboratorName) || null;
  }

  /**
   * Obtiene todos los datos de fundadores
   */
  getAllFoundersData(): Omit<Collaborator, 'id'>[] {
    return [...this.foundersData];
  }

  /**
   * Actualiza los datos de un fundador manteniendo la coherencia
   */
  async updateFounderData(founderId: string, updates: Partial<Collaborator>): Promise<void> {
    // Limpiar campos undefined antes de enviar a Firestore
    const cleanUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      // Para URLs de imágenes, permitir valores válidos aunque sean strings vacíos
      if (key === 'imageUrl' || key === 'logoUrl') {
        if (value !== undefined && value !== null) {
          cleanUpdates[key] = value;
          console.log(`🖼️ Actualizando ${key}:`, value);
        }
      } else if (value !== undefined && value !== null && value !== '') {
        cleanUpdates[key] = value;
      }
    });

    // Asegurar que mantiene las propiedades de fundador
    cleanUpdates.isFounder = true;
    cleanUpdates.type = 'Fundador';

    console.log('🔄 Actualizando fundador con datos limpios:', cleanUpdates);
    await this.collaboratorsService.updateCollaborator(founderId, cleanUpdates);
  }

  /**
   * Migra colaboradores existentes para incluir nuevos campos
   */
  async migrateExistingCollaborators(): Promise<void> {
    try {
      const existingCollaborators = await this.collaboratorsService.getCollaboratorsAsPromise();
      
      for (const collaborator of existingCollaborators) {
        if (collaborator.id) {
          const updates: Partial<Collaborator> = {};
          let needsUpdate = false;

          // Agregar campos faltantes
          if (collaborator.isActive === undefined) {
            updates.isActive = true;
            needsUpdate = true;
          }

          if (collaborator.displayOrder === undefined) {
            updates.displayOrder = collaborator.isFounder ? (collaborator.founderOrder || 0) : 100;
            needsUpdate = true;
          }

          if (!collaborator.bio && collaborator.description) {
            updates.bio = collaborator.description;
            needsUpdate = true;
          }

          if (!collaborator.imageUrl && collaborator.logoUrl) {
            updates.imageUrl = collaborator.logoUrl;
            needsUpdate = true;
          }

          if (!collaborator.linkedinUrl && collaborator.website) {
            updates.linkedinUrl = collaborator.website;
            needsUpdate = true;
          }

          if (needsUpdate) {
            console.log(`Migrando colaborador: ${collaborator.name}`);
            await this.collaboratorsService.updateCollaborator(collaborator.id, updates);
          }
        }
      }
    } catch (error) {
      console.error('Error migrando colaboradores:', error);
    }
  }
}
