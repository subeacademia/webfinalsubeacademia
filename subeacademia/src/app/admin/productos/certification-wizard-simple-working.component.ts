import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { 
  Certificacion, 
  CertificationState, 
  CertificationAudience, 
  CertificationCategory,
  RouteType
} from '../../features/productos/data/certificacion.model';

@Component({
  selector: 'app-certification-wizard-simple-working',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-4 mb-4">
            <button (click)="goBack()" 
                    class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Crear Nueva Certificación
            </h1>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form [formGroup]="certificationForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Información Básica -->
            <div class="space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Información Básica</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título de la Certificación *
                  </label>
                  <input type="text" 
                         formControlName="title"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="Ej: Certificación en Madurez Organizacional en IA">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL) *
                  </label>
                  <input type="text" 
                         formControlName="slug"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="certificacion-madurez-organizacional-ia">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción Corta *
                </label>
                <textarea formControlName="shortDescription"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Descripción breve de la certificación"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción Larga
                </label>
                <textarea formControlName="longDescription"
                          rows="4"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Descripción detallada de la certificación"></textarea>
              </div>
            </div>

            <!-- Clasificación -->
            <div class="space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Clasificación</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Audiencia *
                  </label>
                  <select formControlName="audience"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Seleccionar audiencia</option>
                    <option value="Empresas">Empresas</option>
                    <option value="Personas">Personas</option>
                    <option value="Ambas">Ambas</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select formControlName="category"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Seleccionar categoría</option>
                    <option value="Madurez Organizacional">Madurez Organizacional</option>
                    <option value="Competencias Personas/Equipos">Competencias Personas/Equipos</option>
                    <option value="Sectorial">Sectorial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rutas de Certificación *
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="routeFormacion" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">Formación</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="routeConvalidacion" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">Convalidación</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Economía -->
            <div class="space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Economía</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio CLP
                  </label>
                  <input type="number" 
                         formControlName="priceCLP"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="850000">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio USD
                  </label>
                  <input type="number" 
                         formControlName="priceUSD"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="1000">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio EUR
                  </label>
                  <input type="number" 
                         formControlName="priceEUR"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="900">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link de Pago
                </label>
                <input type="url" 
                       formControlName="paymentLink"
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                       placeholder="https://buy.stripe.com/example">
              </div>
            </div>

            <!-- Estado -->
            <div class="space-y-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Estado</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado de la Certificación
                </label>
                <select formControlName="state"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="Disponible">Disponible</option>
                  <option value="Próximamente">Próximamente</option>
                  <option value="NoDisponible">No Disponible</option>
                </select>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button type="button" 
                      (click)="goBack()" 
                      class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancelar
              </button>
              
              <button type="submit" 
                      [disabled]="certificationForm.invalid || isSubmitting"
                      class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isSubmitting">Crear Certificación</span>
                <span *ngIf="isSubmitting">Creando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CertificationWizardSimpleWorkingComponent implements OnInit {
  certificationForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private certificacionesService: CertificacionesService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    console.log('CertificationWizardSimpleWorkingComponent initialized');
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.certificationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      shortDescription: ['', [Validators.required, Validators.minLength(10)]],
      longDescription: [''],
      audience: ['', Validators.required],
      category: ['', Validators.required],
      routeFormacion: [false],
      routeConvalidacion: [false],
      priceCLP: [0, [Validators.min(0)]],
      priceUSD: [0, [Validators.min(0)]],
      priceEUR: [0, [Validators.min(0)]],
      paymentLink: [''],
      state: ['Disponible', Validators.required]
    });
  }

  private setupFormSubscriptions(): void {
    // Auto-generar slug desde el título
    this.certificationForm.get('title')?.valueChanges.subscribe(title => {
      if (title) {
        const slug = this.generateSlug(title);
        this.certificationForm.patchValue({ slug });
      }
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  goBack(): void {
    this.router.navigate(['/admin/productos/certificaciones']);
  }

  onSubmit(): void {
    if (this.certificationForm.valid) {
      const formData = this.certificationForm.value;
      const certificationData = this.mapFormToCertification(formData);
      this.createCertification(certificationData);
    }
  }

  private mapFormToCertification(formData: any): Omit<Certificacion, 'id'> {
    return {
      title: formData.title,
      slug: formData.slug,
      shortDescription: formData.shortDescription,
      longDescription: formData.longDescription,
      state: formData.state as CertificationState,
      active: true,
      versionPlan: '2025.1',
      audience: formData.audience as CertificationAudience,
      category: formData.category as CertificationCategory,
      routeTypes: this.getRouteTypes(formData),
      durationHours: 0,
      modalities: {
        asincronica: true,
        enVivo: false,
        hibrida: false,
        presencial: false
      },
      languages: ['es'],
      currencies: {
        CLP: formData.priceCLP || 0,
        USD: formData.priceUSD || 0,
        EUR: formData.priceEUR || 0
      },
      pricingNotes: '',
      paymentLink: formData.paymentLink,
      endorsers: ['SUBE-IA'],
      doubleSeal: false,
      validityMonths: 24,
      recertification: {
        required: false,
        type: 'curso',
        hoursCEU: 0
      },
      evaluation: {
        exam: true,
        project: false,
        interview: false,
        defense: false,
        weights: {
          exam: 100
        }
      },
      validationTrack: {
        enabled: formData.routeConvalidacion,
        portfolioRequired: true,
        allowedFormats: ['pdf', 'url'],
        autoInterviewBooking: true,
        SLA_days: 7
      },
      competencies: [],
      regulatoryAlignment: [],
      prerequisites: [],
      pathways: {
        predecessors: [],
        successors: []
      },
      heroImageUrl: '',
      sealImageUrl: '',
      gallery: [],
      seo: {
        metaTitle: formData.title,
        metaDescription: formData.shortDescription
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
  }

  private getRouteTypes(formData: any): RouteType[] {
    const routes: RouteType[] = [];
    if (formData.routeFormacion) routes.push('Formación' as RouteType);
    if (formData.routeConvalidacion) routes.push('Convalidación' as RouteType);
    return routes;
  }

  private createCertification(certificationData: Omit<Certificacion, 'id'>): void {
    this.isSubmitting = true;
    this.certificacionesService.createCertificacionWithValidation(certificationData)
      .subscribe({
        next: (certification) => {
          console.log('Certificación creada:', certification);
          this.showSuccess('Certificación creada exitosamente');
          this.isSubmitting = false;
          this.goBack();
        },
        error: (error) => {
          console.error('Error creando certificación:', error);
          this.showError('Error al crear la certificación');
          this.isSubmitting = false;
        }
      });
  }

  private showSuccess(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  private showError(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
}
