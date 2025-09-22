import { Component, computed, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CollaboratorsService } from '../../core/data/collaborators.service';
import { Collaborator } from '../../core/models/collaborator.model';
import { MediaService } from '../../core/data/media.service';
import { FoundersInitializationService } from '../../core/services/founders-initialization.service';

@Component({
  selector: 'app-admin-collaborators-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Equipo y Colaboradores</h1>
    <div class="flex gap-2">
      <button class="btn btn-primary" (click)="openCreate()">Añadir Colaborador</button>
    </div>
  </div>

  <div class="overflow-x-auto border border-white/10 rounded-lg">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left bg-white/5">
          <th class="p-3">Foto/Logo</th>
          <th class="p-3">Nombre</th>
          <th class="p-3">Rol</th>
          <th class="p-3">Tipo</th>
          <th class="p-3">Estado</th>
          <th class="p-3">Sitio</th>
          <th class="p-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of sortedCollaborators()" class="border-t border-white/10" [class.bg-blue-500/10]="c.isFounder">
          <td class="p-3">
            <div class="relative">
              <img [src]="getDisplayImage(c)" [alt]="c.name" class="h-12 w-12 object-cover rounded-full bg-white/5 border-2" [class.ring-2]="c.isFounder" [class.ring-blue-400]="c.isFounder" [class.border-blue-400]="c.isFounder" [class.border-gray-300]="!c.isFounder" />
              <div *ngIf="c.isFounder" class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </td>
          <td class="p-3">
            <div class="font-medium">{{ c.name }}</div>
            <div *ngIf="c.isFounder" class="text-xs text-blue-400">Fundador</div>
          </td>
          <td class="p-3">{{ c.role || '-' }}</td>
          <td class="p-3">
            <span class="px-2 py-1 text-xs rounded-full" [class]="getTypeClass(c.type)">
              {{ c.type }}
            </span>
          </td>
          <td class="p-3">
            <span class="px-2 py-1 text-xs rounded-full" [class]="c.isActive !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'">
              {{ c.isActive !== false ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td class="p-3">
            <a *ngIf="c.linkedinUrl && c.linkedinUrl !== '#'" class="text-blue-400 hover:underline" [href]="c.linkedinUrl" target="_blank">LinkedIn</a>
            <a *ngIf="!c.linkedinUrl || c.linkedinUrl === '#'" class="text-blue-400 hover:underline" [href]="c.website" target="_blank">Web</a>
          </td>
          <td class="p-3 text-right space-x-2">
            <button class="btn" (click)="openEdit(c)">Editar</button>
            <button *ngIf="!c.isFounder" class="btn btn-danger" (click)="remove(c)">Eliminar</button>
            <button *ngIf="c.isFounder" class="btn btn-warning" (click)="toggleFounderStatus(c)">
              {{ c.isActive !== false ? 'Desactivar' : 'Activar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Modal -->
  <div *ngIf="isOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" (click)="close()">
    <div class="relative bg-[var(--panel)] rounded-lg w-full max-w-4xl max-h-[90vh] border border-white/10 flex flex-col" (click)="$event.stopPropagation()">
      <!-- Header fijo -->
      <div class="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
        <h2 class="text-lg font-semibold">{{ editingId() ? 'Editar' : 'Añadir' }} {{ isEditingFounder() ? 'Fundador' : 'Colaborador' }}</h2>
        <button type="button" (click)="close()" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Contenido con scroll -->
      <div class="flex-1 overflow-y-auto p-6">
        <form id="collaboratorForm" [formGroup]="form" class="space-y-6" (ngSubmit)="save()">
          <!-- Información básica -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Información Básica</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</span>
                <input class="input" formControlName="name" [readonly]="isEditingFounder()" />
                <span *ngIf="isEditingFounder()" class="text-xs text-blue-400">Los nombres de fundadores no se pueden editar</span>
          </label>
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rol *</span>
            <input class="input" formControlName="role" placeholder="Ej: Ingeniero de IA" />
          </label>
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo *</span>
                <select class="input" formControlName="type" [disabled]="isEditingFounder()">
                  <option value="Fundador">Fundador</option>
              <option value="Partner Tecnológico">Partner Tecnológico</option>
              <option value="Partner Académico">Partner Académico</option>
              <option value="Cliente Destacado">Cliente Destacado</option>
            </select>
          </label>
              <div class="grid grid-cols-2 gap-2">
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</span>
                  <select class="input" formControlName="isActive">
                    <option [value]="true">Activo</option>
                    <option [value]="false">Inactivo</option>
                  </select>
                </label>
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Orden</span>
                  <input type="number" class="input" formControlName="displayOrder" min="0" />
                </label>
              </div>
            </div>
          </div>
          <!-- Descripción y biografía -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Descripción y Biografía</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción Corta *</span>
                <textarea class="input" rows="3" formControlName="description" placeholder="Descripción breve para la tarjeta"></textarea>
              </label>
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Biografía Extendida</span>
                <textarea class="input" rows="3" formControlName="bio" placeholder="Biografía más detallada (opcional)"></textarea>
              </label>
            </div>
            
            <div *ngIf="isEditingFounder()" class="mt-4">
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Biografía Completa <span class="text-xs text-gray-500">(una línea por punto)</span></span>
                <textarea class="input" rows="6" formControlName="fullBioText" placeholder="Cada línea será un punto de la biografía completa\nEjemplo:\nIngeniero Civil Industrial, Universidad...\nMáster en IA, Universidad..."></textarea>
              </label>
            </div>
        </div>
          <!-- Enlaces y redes sociales -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Enlaces y Redes Sociales</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</span>
                <input class="input" formControlName="linkedinUrl" placeholder="https://linkedin.com/in/usuario" />
              </label>
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sitio Web</span>
                <input class="input" formControlName="website" placeholder="https://sitio-web.com" />
        </label>
            </div>
          </div>
        
          <!-- Imágenes -->
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Imágenes</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <label class="grid gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ isEditingFounder() ? 'Foto Personal' : 'Logo/Foto Principal' }}</span>
                <input type="file" accept="image/*" (change)="onFileChange($event, 'main')" class="input" />
                <span class="text-xs text-gray-500">Formatos: JPG, PNG, WebP. Máx: 5MB</span>
          </label>
              <div *ngIf="isEditingFounder()">
                <label class="grid gap-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Logo Alternativo</span>
                  <input type="file" accept="image/*" (change)="onFileChange($event, 'logo')" class="input" />
                  <span class="text-xs text-gray-500">Logo corporativo o alternativo</span>
          </label>
        </div>
            </div>
            
            <!-- Preview de imágenes -->
            <div class="flex items-center gap-6 mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
              <div *ngIf="previewMainUrl()" class="text-center">
                <img [src]="previewMainUrl()!" class="h-20 w-20 object-cover rounded-full bg-white/5 border-2 border-gray-200 dark:border-gray-600" />
                <span class="text-xs text-gray-600 dark:text-gray-400 mt-1 block">{{ isEditingFounder() ? 'Foto Personal' : 'Principal' }}</span>
              </div>
              <div *ngIf="previewLogoUrl() && isEditingFounder()" class="text-center">
                <img [src]="previewLogoUrl()!" class="h-20 w-20 object-contain bg-white/5 rounded border-2 border-gray-200 dark:border-gray-600" />
                <span class="text-xs text-gray-600 dark:text-gray-400 mt-1 block">Logo</span>
              </div>
              <div *ngIf="uploadProgress() >= 0" class="flex-1">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subiendo imagen: {{ uploadProgress() }}%</div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div class="bg-blue-600 h-3 rounded-full transition-all duration-300" [style.width.%]="uploadProgress()"></div>
                </div>
              </div>
              <div *ngIf="!previewMainUrl() && uploadProgress() < 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm">No hay imagen seleccionada</p>
              </div>
        </div>
        </div>
      </form>
      </div>
      
      <!-- Footer fijo -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-white/10 flex-shrink-0 bg-[var(--panel)]">
        <button type="button" class="btn" (click)="close()">Cancelar</button>
        <button type="submit" form="collaboratorForm" class="btn btn-primary" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</div>
  `
})
export class CollaboratorsPageComponent {
  private fb = inject(FormBuilder);
  private svc = inject(CollaboratorsService);
  private media = inject(MediaService);
  private foundersService = inject(FoundersInitializationService);
  private cdr = inject(ChangeDetectorRef);

  collaborators = signal<Collaborator[]>([]);
  isOpen = signal(false);
  editingId = signal<string | null>(null);
  previewMainUrl = signal<string | null>(null);
  previewLogoUrl = signal<string | null>(null);
  uploadProgress = signal<number>(-1);
  saving = signal(false);
  isInitializing = signal(false);

  // Computed para colaboradores ordenados
  sortedCollaborators = computed(() => {
    return this.collaborators().sort((a, b) => {
      // Fundadores primero, luego por displayOrder
      if (a.isFounder && !b.isFounder) return -1;
      if (!a.isFounder && b.isFounder) return 1;
      if (a.isFounder && b.isFounder) {
        return (a.founderOrder || 0) - (b.founderOrder || 0);
      }
      return (a.displayOrder || 999) - (b.displayOrder || 999);
    });
  });

  // Computed para verificar si está editando un fundador
  isEditingFounder = computed(() => {
    const id = this.editingId();
    if (!id) return false;
    const collaborator = this.collaborators().find(c => c.id === id);
    return collaborator?.isFounder || false;
  });

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: ['', [Validators.required]],
    logoUrl: [''],
    imageUrl: [''],
    website: ['', [Validators.pattern(/^https?:\/\//i)]],
    linkedinUrl: ['', [Validators.pattern(/^https?:\/\//i)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    bio: [''],
    fullBioText: [''], // Para manejar fullBio como texto
    type: ['Partner Tecnológico' as Collaborator['type'], [Validators.required]],
    isFounder: [false],
    founderOrder: [null as number | null],
    displayOrder: [100],
    isActive: [true]
  });

  constructor(){
    // Cargar datos al inicializar
    this.initializeComponent();
  }

  private async initializeComponent() {
    try {
      console.log('🚀 Inicializando componente de colaboradores...');
      
      // Resetear señales por si estaban en estado inconsistente
      this.isInitializing.set(false);
      this.saving.set(false);
      
      await this.loadCollaborators();
      
      // Si no hay datos, migrarlos automáticamente
      const currentData = this.collaborators();
      if (currentData.length === 0) {
        console.log('📥 No hay datos, migrando automáticamente...');
        await this.migrateInitialData();
        await this.loadCollaborators();
      }
      
      console.log('✅ Componente inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando componente:', error);
      // Asegurar que las señales estén en estado correcto
      this.isInitializing.set(false);
      this.saving.set(false);
    }
  }

  private async loadCollaborators() {
    try {
      console.log('🔄 Cargando colaboradores desde Firestore...');
      const list = await this.svc.getCollaboratorsAsPromise();
      this.collaborators.set(list);
      console.log('📊 Colaboradores cargados:', list.length);
      
      if (list.length > 0) {
        // Log detallado de fundadores con imágenes
        const founders = list.filter(c => c.isFounder);
        const collaborators = list.filter(c => !c.isFounder);
        
        console.log('👥 Fundadores encontrados:', founders.length);
        console.log('🤝 Colaboradores encontrados:', collaborators.length);
        
        founders.forEach(f => {
          console.log(`👤 Fundador: ${f.name}`, {
            role: f.role,
            imageUrl: f.imageUrl,
            logoUrl: f.logoUrl,
            displayImage: this.getDisplayImage(f)
          });
        });
        
        collaborators.forEach(c => {
          console.log(`🤝 Colaborador: ${c.name}`, {
            type: c.type,
            imageUrl: c.imageUrl,
            logoUrl: c.logoUrl,
            displayImage: this.getDisplayImage(c)
          });
        });
      } else {
        console.log('⚠️ No se encontraron colaboradores en Firestore');
      }
      
      return list;
    } catch (error) {
      console.error('❌ Error cargando colaboradores:', error);
      return [];
    }
  }

  /**
   * Migra automáticamente los datos iniciales (fundadores y colaboradores)
   */
  private async migrateInitialData(): Promise<void> {
    try {
      console.log('📊 Migrando datos iniciales de fundadores y colaboradores...');
      
      // Datos de los 4 fundadores
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

      // Datos de los colaboradores
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

      // Migrar fundadores
      for (const founder of foundersData) {
        try {
          await this.svc.addCollaborator(founder);
          console.log(`✅ Fundador migrado: ${founder.name}`);
        } catch (error) {
          console.error(`❌ Error migrando fundador ${founder.name}:`, error);
        }
      }

      // Migrar colaboradores
      for (const collaborator of collaboratorsData) {
        try {
          await this.svc.addCollaborator(collaborator);
          console.log(`✅ Colaborador migrado: ${collaborator.name}`);
        } catch (error) {
          console.error(`❌ Error migrando colaborador ${collaborator.name}:`, error);
        }
      }

      console.log('🎉 Migración inicial completada');
      
    } catch (error) {
      console.error('❌ Error en migración inicial:', error);
      throw error;
    }
  }

  openCreate(){
    this.editingId.set(null);
    this.previewMainUrl.set(null);
    this.previewLogoUrl.set(null);
    this.form.reset({
      name: '',
      role: '',
      logoUrl: '',
      imageUrl: '',
      website: '',
      linkedinUrl: '',
      description: '',
      bio: '',
      fullBioText: '',
      type: 'Partner Tecnológico',
      isFounder: false,
      founderOrder: null,
      displayOrder: 100,
      isActive: true
    });
    this.isOpen.set(true);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }
  
  openEdit(c: Collaborator){
    this.editingId.set(c.id ?? null);
    
    // Para fundadores, priorizar imageUrl para preview principal
    if (c.isFounder) {
      this.previewMainUrl.set(c.imageUrl || null);
      this.previewLogoUrl.set(c.logoUrl || null);
    } else {
      this.previewMainUrl.set(c.logoUrl || c.imageUrl || null);
      this.previewLogoUrl.set(null);
    }
    
    // Convertir fullBio array a texto
    const fullBioText = c.fullBio ? c.fullBio.join('\n') : '';
    
    console.log('📝 Editando colaborador:', {
      name: c.name,
      imageUrl: c.imageUrl,
      logoUrl: c.logoUrl,
      isFounder: c.isFounder
    });
    
    this.form.patchValue({
      name: c.name,
      role: c.role || '',
      logoUrl: c.logoUrl || '',
      imageUrl: c.imageUrl || '',
      website: c.website || '',
      linkedinUrl: c.linkedinUrl || c.website || '',
      description: c.description || '',
      bio: c.bio || c.description || '',
      fullBioText: fullBioText,
      type: c.type || 'Partner Tecnológico',
      isFounder: c.isFounder || false,
      founderOrder: c.founderOrder || null,
      displayOrder: c.displayOrder || 100,
      isActive: c.isActive !== false
    });
    this.isOpen.set(true);
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }
  
  close(){ 
    this.isOpen.set(false); 
    this.uploadProgress.set(-1);
    this.previewMainUrl.set(null);
    this.previewLogoUrl.set(null);
    // Restaurar scroll del body
    document.body.style.overflow = '';
  }

  async onFileChange(e: Event, type: 'main' | 'logo' = 'main'){
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    // Para fundadores, las fotos personales se procesan diferente que los logos
    const isPersonalPhoto = type === 'main' && this.isEditingFounder();
    
    let processedFile: File;
    if (isPersonalPhoto) {
      // Para fotos personales, mantener aspecto original pero optimizar
      processedFile = file;
    } else {
      // Para logos, normalizar para nitidez uniforme
      processedFile = await this.media.normalizeLogoImage(file) || file;
    }
    
    this.media.uploadPublic(processedFile).subscribe({
      next: v => {
        if (v.state === 'running') {
          this.uploadProgress.set(v.progress);
        }
        const finalUrl = v.url || v.downloadURL;
        if (v.state === 'success' && finalUrl) {
          console.log(`✅ Imagen subida exitosamente: ${v.url}`);
          
          if (type === 'main') {
            // Para imagen principal
            this.form.controls.imageUrl.setValue(finalUrl);
            this.previewMainUrl.set(finalUrl);
            
            // Si no es fundador, también actualizar logoUrl
            if (!this.isEditingFounder()) {
              this.form.controls.logoUrl.setValue(finalUrl);
            }
            
            console.log(`📸 Imagen principal actualizada: ${finalUrl}`);
          } else if (type === 'logo') {
            // Para logo alternativo (solo fundadores)
          this.form.controls.logoUrl.setValue(finalUrl);
            this.previewLogoUrl.set(finalUrl);
            console.log(`🏢 Logo alternativo actualizado: ${finalUrl}`);
          }
          
          this.uploadProgress.set(100);
          setTimeout(() => this.uploadProgress.set(-1), 2000);
        }
      },
      error: (error) => {
        console.error('❌ Error subiendo imagen:', error);
        this.uploadProgress.set(-1);
        alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
      }
    });
  }

  async save(){
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const formValue = this.form.getRawValue();
      
      // Verificar duplicados solo si es un nuevo colaborador o si cambió el nombre
      const editingId = this.editingId();
      if (!editingId || this.hasNameChanged()) {
        const exists = await this.collaboratorExists(formValue.name);
        if (exists) {
          alert(`Ya existe un colaborador con el nombre "${formValue.name}". Por favor usa un nombre diferente.`);
          this.saving.set(false);
          return;
        }
      }
      
      // Procesar fullBio: convertir texto a array
      const fullBio = formValue.fullBioText 
        ? formValue.fullBioText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        : undefined;
      
      // Construir objeto colaborador (sin campos undefined)
      const collaboratorData: any = {
        name: formValue.name || '',
        role: formValue.role || '',
        website: formValue.website || '',
        description: formValue.description || '',
        type: formValue.type || 'Partner Tecnológico',
        isFounder: formValue.isFounder || false,
        displayOrder: formValue.displayOrder || 100,
        isActive: formValue.isActive !== false,
        joinDate: new Date()
      };

      // Manejar imágenes según el tipo de colaborador
      if (formValue.isFounder) {
        // Para fundadores: imageUrl es la foto personal, logoUrl es opcional
        if (formValue.imageUrl) {
          collaboratorData.imageUrl = formValue.imageUrl;
          collaboratorData.logoUrl = formValue.logoUrl || formValue.imageUrl; // espejo por consistencia
          console.log('📸 Fundador - Guardando imageUrl y espejo en logoUrl:', formValue.imageUrl);
        } else if (formValue.logoUrl) {
          // Si solo subieron logo, úsalo también como foto para evitar huecos
          collaboratorData.imageUrl = formValue.logoUrl;
          collaboratorData.logoUrl = formValue.logoUrl;
          console.log('🏢 Fundador - Usando logoUrl también como imageUrl:', formValue.logoUrl);
        }
      } else {
        // Para colaboradores: logoUrl es la imagen principal
        if (formValue.imageUrl) {
          collaboratorData.logoUrl = formValue.imageUrl;
          collaboratorData.imageUrl = formValue.imageUrl;
          console.log('🤝 Colaborador - Guardando imagen como logoUrl e imageUrl:', formValue.imageUrl);
        } else if (formValue.logoUrl) {
          collaboratorData.logoUrl = formValue.logoUrl;
          console.log('🤝 Colaborador - Guardando logoUrl:', formValue.logoUrl);
        }
      }

      // Agregar campos opcionales solo si tienen valor
      if (formValue.linkedinUrl) {
        collaboratorData.linkedinUrl = formValue.linkedinUrl;
      }
      if (formValue.bio) {
        collaboratorData.bio = formValue.bio;
      }
      if (fullBio && fullBio.length > 0) {
        collaboratorData.fullBio = fullBio;
      }
      if (formValue.isFounder && formValue.founderOrder !== null && formValue.founderOrder !== undefined) {
        collaboratorData.founderOrder = formValue.founderOrder;
      }

      console.log('💾 Datos completos a guardar:', collaboratorData);
      
      if (editingId) {
        console.log(`🔄 Actualizando ${formValue.isFounder ? 'fundador' : 'colaborador'}: ${formValue.name}`);
        
        if (this.isEditingFounder()) {
          await this.foundersService.updateFounderData(editingId, collaboratorData);
          console.log('✅ Fundador actualizado en Firestore');
        } else {
          await this.svc.updateCollaborator(editingId, collaboratorData);
          console.log('✅ Colaborador actualizado en Firestore');
        }
      } else {
        console.log(`➕ Creando nuevo ${formValue.isFounder ? 'fundador' : 'colaborador'}: ${formValue.name}`);
        await this.svc.addCollaborator(collaboratorData);
        console.log('✅ Nuevo colaborador creado en Firestore');
      }
      
      console.log('⏳ Esperando a que Firestore procese la actualización...');
      // Pequeño delay para asegurar que Firestore haya procesado la actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Recargando datos de la tabla...');
      await this.loadCollaborators();
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      console.log('🔄 Change detection forzado');
      
      console.log('🚪 Cerrando modal...');
      this.close();
      
      // Mensaje de confirmación
      alert('✅ Colaborador guardado exitosamente. Los cambios se reflejarán en la sección pública.');
      console.log('🎉 Proceso de guardado completado exitosamente');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(c: Collaborator){
    if (!c.id || c.isFounder) return;
    if (confirm(`¿Eliminar a ${c.name}?`)) {
      await this.svc.deleteCollaborator(c.id);
      this.loadCollaborators();
    }
  }
  
  async initializeFounders() {
    if (this.isInitializing()) {
      console.log('⚠️ Proceso ya en curso, ignorando...');
      return;
    }

    this.isInitializing.set(true);
    try {
      console.log('🚀 Iniciando proceso de inicialización/limpieza...');
      
      // Verificar si ya existen datos
      const existingCollaborators = await this.svc.getCollaboratorsAsPromise();
      console.log(`📊 Colaboradores existentes: ${existingCollaborators.length}`);
      
      if (existingCollaborators.length > 0) {
        const shouldContinue = confirm(
          `Ya existen ${existingCollaborators.length} colaboradores en la base de datos.\n\n` +
          '¿Qué deseas hacer?\n\n' +
          'OK = Limpiar duplicados y reorganizar\n' +
          'Cancelar = No hacer nada'
        );
        
        if (shouldContinue) {
          console.log('🧹 Limpiando duplicados y reorganizando...');
          await this.cleanupDuplicatesAndReorganize();
        } else {
          console.log('⏹️ Proceso cancelado por el usuario');
        }
      } else {
        // Si no hay datos, migrar por primera vez
        console.log('📥 Migrando datos por primera vez...');
        await this.migrateAllExistingData();
      }
      
      await this.loadCollaborators();
      alert('✅ Proceso completado exitosamente');
      console.log('✅ Inicialización completada');
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      alert(`❌ Error durante la inicialización: ${error}`);
    } finally {
      this.isInitializing.set(false);
      console.log('🔄 Estado de inicialización reseteado');
    }
  }

  /**
   * Migra todos los datos existentes de fundadores y colaboradores
   */
  private async migrateAllExistingData(): Promise<void> {
    // Datos de fundadores desde la sección Nosotros
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

    // Datos de colaboradores desde la sección Nosotros
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

    console.log('Iniciando migración de datos...');

    // Migrar fundadores (verificando duplicados)
    for (const founder of foundersData) {
      try {
        const exists = await this.collaboratorExists(founder.name);
        if (!exists) {
          await this.svc.addCollaborator(founder);
          console.log(`✅ Fundador ${founder.name} migrado exitosamente`);
        } else {
          console.log(`⚠️ Fundador ${founder.name} ya existe, omitiendo...`);
        }
      } catch (error) {
        console.error(`❌ Error migrando fundador ${founder.name}:`, error);
      }
    }

    // Migrar colaboradores (verificando duplicados)
    for (const collaborator of collaboratorsData) {
      try {
        const exists = await this.collaboratorExists(collaborator.name);
        if (!exists) {
          await this.svc.addCollaborator(collaborator);
          console.log(`✅ Colaborador ${collaborator.name} migrado exitosamente`);
        } else {
          console.log(`⚠️ Colaborador ${collaborator.name} ya existe, omitiendo...`);
        }
      } catch (error) {
        console.error(`❌ Error migrando colaborador ${collaborator.name}:`, error);
      }
    }

    console.log('🎉 Migración completada');
  }

  /**
   * Limpia duplicados y reorganiza los datos
   */
  private async cleanupDuplicatesAndReorganize(): Promise<void> {
    console.log('🧹 Iniciando limpieza de duplicados...');
    
    try {
      // Obtener todos los colaboradores existentes
      const existingCollaborators = await this.svc.getCollaboratorsAsPromise();
      console.log(`📊 Total de colaboradores encontrados: ${existingCollaborators.length}`);
      
      if (existingCollaborators.length === 0) {
        console.log('⚠️ No hay colaboradores para limpiar');
        return;
      }
      
      // Agrupar por nombre para identificar duplicados
      const collaboratorsByName = new Map<string, (Collaborator & { id: string })[]>();
      let totalDuplicates = 0;
      
      existingCollaborators.forEach(collaborator => {
        if (collaborator.id) {
          const name = collaborator.name.trim().toLowerCase();
          if (!collaboratorsByName.has(name)) {
            collaboratorsByName.set(name, []);
          }
          collaboratorsByName.get(name)!.push(collaborator as Collaborator & { id: string });
        }
      });

      // Contar duplicados
      for (const [name, duplicates] of collaboratorsByName) {
        if (duplicates.length > 1) {
          totalDuplicates += duplicates.length - 1; // -1 porque uno se mantiene
        }
      }

      console.log(`🔍 Total de duplicados a eliminar: ${totalDuplicates}`);

      if (totalDuplicates === 0) {
        console.log('✅ No se encontraron duplicados');
        return;
      }

      let eliminados = 0;
      
      // Eliminar duplicados (mantener el más reciente)
      for (const [name, duplicates] of collaboratorsByName) {
        if (duplicates.length > 1) {
          console.log(`🔍 Procesando ${duplicates.length} duplicados para: ${duplicates[0].name}`);
          
          // Ordenar por timestamp interno de Firestore o usar índice como fallback
          duplicates.sort((a, b) => {
            // Usar el ID como criterio de "más reciente" (los IDs de Firestore son cronológicos)
            return b.id.localeCompare(a.id);
          });

          // Mantener el primero (más reciente), eliminar el resto
          const toKeep = duplicates[0];
          const toDelete = duplicates.slice(1);

          console.log(`✅ Manteniendo: ${toKeep.name} (ID: ${toKeep.id})`);
          
          for (const duplicate of toDelete) {
            try {
              console.log(`🗑️ Eliminando duplicado: ${duplicate.name} (ID: ${duplicate.id})`);
              await this.svc.deleteCollaborator(duplicate.id);
              eliminados++;
              console.log(`✅ Eliminado exitosamente`);
              
              // Pausa pequeña para no saturar Firestore
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.error(`❌ Error eliminando duplicado ${duplicate.name} (ID: ${duplicate.id}):`, error);
            }
          }
        }
      }

      console.log(`✨ Limpieza completada. ${eliminados} duplicados eliminados de ${totalDuplicates} detectados.`);
      
    } catch (error) {
      console.error('❌ Error durante la limpieza de duplicados:', error);
      throw error;
    }
  }

  /**
   * Verifica si un colaborador ya existe por nombre
   */
  private async collaboratorExists(name: string): Promise<boolean> {
    const existingCollaborators = await this.svc.getCollaboratorsAsPromise();
    return existingCollaborators.some(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
  }

  /**
   * Verifica si el nombre del colaborador cambió durante la edición
   */
  private hasNameChanged(): boolean {
    const id = this.editingId();
    if (!id) return false;
    
    const currentCollaborator = this.collaborators().find(c => c.id === id);
    if (!currentCollaborator) return false;
    
    const originalName = currentCollaborator.name.trim().toLowerCase();
    const newName = this.form.get('name')?.value?.trim().toLowerCase() || '';
    
    return originalName !== newName;
  }

  /**
   * Método para limpiar duplicados manualmente (botón de emergencia)
   */
  async cleanupDuplicatesManually() {
    if (!confirm('¿Estás seguro de que quieres limpiar todos los duplicados? Esta acción no se puede deshacer.')) {
      return;
    }

    this.isInitializing.set(true);
    
    try {
      console.log('🧹 Iniciando limpieza manual de duplicados...');
      
      // Obtener colaboradores existentes
      const existingCollaborators = await this.svc.getCollaboratorsAsPromise() as (Collaborator & { id: string })[];
      
      console.log(`📊 Colaboradores encontrados: ${existingCollaborators.length}`);
      
      if (existingCollaborators.length === 0) {
        alert('No hay colaboradores en la base de datos');
        return;
      }
      
      // Identificar duplicados por nombre
      const duplicateGroups = this.identifyDuplicates(existingCollaborators);
      
      if (duplicateGroups.length === 0) {
        alert('No se encontraron duplicados para limpiar');
        return;
      }
      
      console.log(`🔍 Grupos de duplicados encontrados: ${duplicateGroups.length}`);
      
      let totalEliminados = 0;
      
      // Procesar cada grupo de duplicados
      for (const group of duplicateGroups) {
        const [toKeep, ...toDelete] = group;
        console.log(`🔄 Procesando grupo: ${toKeep.name} (${group.length} duplicados)`);
        
        for (const duplicate of toDelete) {
          try {
            console.log(`🗑️ Eliminando: ${duplicate.name} (ID: ${duplicate.id})`);
            await this.svc.deleteCollaborator(duplicate.id);
            totalEliminados++;
            console.log(`✅ Eliminado exitosamente`);
            
            // Pausa para no saturar Firestore
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error) {
            console.error(`❌ Error eliminando ${duplicate.name}:`, error);
          }
        }
      }
      
      console.log(`🎉 Limpieza completada: ${totalEliminados} duplicados eliminados`);
      
      // Recargar datos
      this.loadCollaborators();
      
      alert(`Limpieza completada exitosamente.\n${totalEliminados} duplicados eliminados.`);
      
    } catch (error) {
      console.error('❌ Error en limpieza manual:', error);
      alert(`Error durante la limpieza: ${error}`);
    } finally {
      this.isInitializing.set(false);
    }
  }

  /**
   * Identifica grupos de duplicados
   */
  private identifyDuplicates(collaborators: (Collaborator & { id: string })[]): (Collaborator & { id: string })[][] {
    const groups: (Collaborator & { id: string })[][] = [];
    const processed = new Set<string>();
    
    for (const collaborator of collaborators) {
      if (processed.has(collaborator.id)) continue;
      
      const name = collaborator.name.trim().toLowerCase();
      const duplicates = collaborators.filter(c => 
        c.name.trim().toLowerCase() === name && !processed.has(c.id)
      );
      
      if (duplicates.length > 1) {
        // Ordenar por ID (más reciente primero en Firestore)
        duplicates.sort((a, b) => b.id.localeCompare(a.id));
        groups.push(duplicates);
        
        // Marcar como procesados
        duplicates.forEach(d => processed.add(d.id));
      } else {
        processed.add(collaborator.id);
      }
    }
    
    return groups;
  }
  
  async toggleFounderStatus(c: Collaborator) {
    if (!c.id || !c.isFounder) return;
    const newStatus = !c.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a ${c.name}?`)) {
      try {
        await this.foundersService.updateFounderData(c.id, { isActive: newStatus });
        this.loadCollaborators();
      } catch (error) {
        console.error('Error actualizando estado del fundador:', error);
        alert('Error al actualizar el estado');
      }
    }
  }
  
  getTypeClass(type?: string): string {
    switch (type) {
      case 'Fundador': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Partner Tecnológico': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Partner Académico': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Cliente Destacado': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  /**
   * Obtiene la imagen correcta para mostrar (prioriza imageUrl para fundadores)
   */
  getDisplayImage(collaborator: Collaborator): string {
    if (collaborator.isFounder) {
      // Para fundadores, priorizar imageUrl (foto personal)
      const imageUrl = collaborator.imageUrl || collaborator.logoUrl || 'https://placehold.co/200x200/1e293b/ffffff?text=' + (collaborator.name.split(' ').map(n => n[0]).join(''));
      
      // Solo logear si no es placeholder
      if (collaborator.imageUrl && !collaborator.imageUrl.includes('placehold.co')) {
        console.log(`🖼️ Fundador ${collaborator.name} tiene foto real:`, collaborator.imageUrl);
      }
      
      return imageUrl;
    } else {
      // Para colaboradores, usar logoUrl principalmente
      const imageUrl = collaborator.logoUrl || collaborator.imageUrl || 'https://placehold.co/200x200/1e293b/ffffff?text=' + (collaborator.name.split(' ').map(n => n[0]).join(''));
      
      // Solo logear si no es placeholder
      if (collaborator.logoUrl && !collaborator.logoUrl.includes('placehold.co')) {
        console.log(`🖼️ Colaborador ${collaborator.name} tiene logo real:`, collaborator.logoUrl);
      }
      
      return imageUrl;
    }
  }
}


