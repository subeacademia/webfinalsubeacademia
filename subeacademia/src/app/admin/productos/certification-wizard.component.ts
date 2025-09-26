import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { FileUploadService } from '../../core/services/file-upload.service';
import { 
  Certificacion, 
  CertificationState, 
  CertificationAudience, 
  CertificationCategory, 
  RouteType,
  Language,
  Currency,
  RecertificationType
} from '../../features/productos/data/certificacion.model';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-certification-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, I18nTranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-4xl mx-auto px-4">
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
              {{ isEditing ? 'Editar' : 'Crear' }} Certificación
            </h1>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p class="text-gray-600 dark:text-gray-400 text-center py-8">
            Wizard completo en desarrollo. Usa el formulario simple para crear certificaciones.
          </p>
          <div class="flex justify-center">
            <button (click)="goBack()" 
                    class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Volver al Listado
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CertificationWizardComponent implements OnInit, OnDestroy {
  wizardForm!: FormGroup;
  currentStep = 1;
  isEditing = false;
  certificationId?: string;
  private readonly unsubscribe$ = new Subject<void>();

  // File upload properties
  heroImageFile?: File;
  heroImagePreview?: string;
  heroImageUploading = false;
  heroImageProgress = 0;
  sealImageFile?: File;
  sealImagePreview?: string;
  sealImageUploading = false;
  sealImageProgress = 0;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private certificacionesService: CertificacionesService,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadCertificationData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeForm(): void {
    this.wizardForm = this.fb.group({
      // Paso 1: Básicos
      title: ['', [Validators.required, Validators.minLength(5)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      shortDescription: ['', [Validators.required, Validators.minLength(10)]],
      longDescription: [''],
      
      // Paso 2: Clasificación
      audience: ['', Validators.required],
      category: ['', Validators.required],
      routeFormacion: [false],
      routeConvalidacion: [false],
      
      // Paso 3: Entrega
      durationHours: [0, [Validators.min(0)]],
      languageEs: [true],
      languageEn: [false],
      modalityAsincronica: [false],
      modalityEnVivo: [false],
      modalityHibrida: [false],
      modalityPresencial: [false],
      
      // Paso 4: Economía
      priceCLP: [0, [Validators.min(0)]],
      priceUSD: [0, [Validators.min(0)]],
      priceEUR: [0, [Validators.min(0)]],
      pricingNotes: [''],
      paymentLink: [''],
      
      // Paso 5: Avales
      avaleSubeIA: [true],
      avaleArchIADS: [false],
      doubleSeal: [false],
      
      // Paso 6: Evaluación y Competencias
      competencies: [''],
      regulatoryAlignment: [''],
      
      // Paso 7: Vigencia y Recertificación
      validityMonths: [null, [Validators.min(1)]],
      state: ['Disponible', Validators.required],
      recertificationRequired: [false],
      
      // Paso 8: Medios y Publicación
      heroImageUrl: [''],
      sealImageUrl: [''],
      metaTitle: [''],
      metaDescription: ['']
    });
  }

  private setupFormSubscriptions(): void {
    // Auto-generar slug desde el título
    this.wizardForm.get('title')?.valueChanges.subscribe(title => {
      if (title && !this.isEditing) {
        const slug = this.generateSlug(title);
        this.wizardForm.patchValue({ slug });
      }
    });
  }

  private loadCertificationData(): void {
    // Lógica para cargar datos si estamos editando
    // Por ahora, solo inicializamos el formulario
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Navigation methods
  nextStep(): void {
    if (this.currentStep < 8) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/productos/certificaciones']);
  }

  // Form submission
  onSubmit(): void {
    if (this.wizardForm.valid) {
      const formData = this.wizardForm.value;
      const certificationData = this.mapFormToCertification(formData);
      
      if (this.isEditing) {
        this.updateCertification(certificationData);
      } else {
        this.createCertification(certificationData);
      }
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
      durationHours: formData.durationHours || 0,
      modalities: {
        asincronica: formData.modalityAsincronica,
        enVivo: formData.modalityEnVivo,
        hibrida: formData.modalityHibrida,
        presencial: formData.modalityPresencial
      },
      languages: this.getLanguages(formData),
      currencies: {
        CLP: formData.priceCLP || 0,
        USD: formData.priceUSD || 0,
        EUR: formData.priceEUR || 0
      },
      pricingNotes: formData.pricingNotes,
      paymentLink: formData.paymentLink,
      endorsers: this.getEndorsers(formData),
      doubleSeal: formData.doubleSeal,
      validityMonths: formData.validityMonths,
      recertification: {
        required: formData.recertificationRequired,
        type: 'curso' as RecertificationType,
        hoursCEU: 10
      },
      evaluation: {
        exam: true,
        project: true,
        interview: false,
        defense: false,
        weights: {
          exam: 40,
          project: 60
        }
      },
      validationTrack: {
        enabled: formData.routeConvalidacion,
        portfolioRequired: true,
        allowedFormats: ['pdf', 'url'],
        autoInterviewBooking: true,
        SLA_days: 7
      },
      competencies: this.getCompetencies(formData.competencies),
      regulatoryAlignment: this.getRegulatoryAlignment(formData.regulatoryAlignment),
      prerequisites: [],
      pathways: {
        predecessors: [],
        successors: []
      },
      heroImageUrl: formData.heroImageUrl,
      sealImageUrl: formData.sealImageUrl,
      gallery: [],
      seo: {
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
  }

  private getRouteTypes(formData: any): RouteType[] {
    const routes: RouteType[] = [];
    if (formData.routeFormacion) routes.push('Formación');
    if (formData.routeConvalidacion) routes.push('Convalidación');
    return routes;
  }

  private getLanguages(formData: any): Language[] {
    const languages: Language[] = [];
    if (formData.languageEs) languages.push('es');
    if (formData.languageEn) languages.push('en');
    return languages;
  }

  private getEndorsers(formData: any): string[] {
    const endorsers: string[] = ['SUBE-IA'];
    if (formData.avaleArchIADS) endorsers.push('ARCHIADS');
    return endorsers;
  }

  private getCompetencies(competenciesText: string): string[] {
    return competenciesText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }

  private getRegulatoryAlignment(regulatoryText: string): string[] {
    return regulatoryText
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);
  }

  private createCertification(certificationData: Omit<Certificacion, 'id'>): void {
    this.isSubmitting = true;
    this.certificacionesService.createCertificacionWithValidation(certificationData)
      .pipe(takeUntil(this.unsubscribe$))
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

  private updateCertification(certificationData: Omit<Certificacion, 'id'>): void {
    if (this.certificationId) {
      this.isSubmitting = true;
      this.certificacionesService.updateCertificacion(this.certificationId, certificationData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (certification) => {
            console.log('Certificación actualizada:', certification);
            this.showSuccess('Certificación actualizada exitosamente');
            this.isSubmitting = false;
            this.goBack();
          },
          error: (error) => {
            console.error('Error actualizando certificación:', error);
            this.showError('Error al actualizar la certificación');
            this.isSubmitting = false;
          }
        });
    }
  }

  // Progress calculation
  getProgressPercentage(): number {
    return Math.round((this.currentStep / 8) * 100);
  }

  // File upload methods
  onHeroImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!this.fileUploadService.validateFileType(file)) {
        this.showError('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).');
        event.target.value = ''; // Limpiar input
        return;
      }
      
      // Validar tamaño
      if (!this.fileUploadService.validateFileSize(file, 5)) {
        this.showError('El archivo es demasiado grande. Máximo 5MB.');
        event.target.value = ''; // Limpiar input
        return;
      }
      
      this.heroImageFile = file;
      this.createImagePreview(file, 'hero');
      this.showSuccess('Imagen seleccionada correctamente');
    }
  }

  onSealImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!this.fileUploadService.validateFileType(file)) {
        this.showError('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).');
        event.target.value = ''; // Limpiar input
        return;
      }
      
      // Validar tamaño
      if (!this.fileUploadService.validateFileSize(file, 5)) {
        this.showError('El archivo es demasiado grande. Máximo 5MB.');
        event.target.value = ''; // Limpiar input
        return;
      }
      
      this.sealImageFile = file;
      this.createImagePreview(file, 'seal');
      this.showSuccess('Imagen seleccionada correctamente');
    }
  }

  private createImagePreview(file: File, type: 'hero' | 'seal'): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'hero') {
        this.heroImagePreview = e.target?.result as string;
      } else {
        this.sealImagePreview = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  async uploadHeroImage(): Promise<void> {
    if (!this.heroImageFile) return;

    this.heroImageUploading = true;
    this.heroImageProgress = 0;
    
    try {
      this.fileUploadService.uploadFileWithProgress(this.heroImageFile, 'hero-images')
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result) => {
            this.heroImageProgress = result.progress;
            if (result.url) {
              this.wizardForm.patchValue({ heroImageUrl: result.url });
              this.heroImageUploading = false;
              this.heroImageProgress = 100;
            }
          },
          error: (error) => {
            console.error('Error uploading hero image:', error);
            this.showError(`Error al subir la imagen hero: ${error.message}`);
            this.heroImageUploading = false;
            this.heroImageProgress = 0;
          }
        });
    } catch (error) {
      console.error('Error uploading hero image:', error);
      this.showError('Error al subir la imagen hero');
      this.heroImageUploading = false;
      this.heroImageProgress = 0;
    }
  }

  async uploadSealImage(): Promise<void> {
    if (!this.sealImageFile) return;

    this.sealImageUploading = true;
    this.sealImageProgress = 0;
    
    try {
      this.fileUploadService.uploadFileWithProgress(this.sealImageFile, 'seal-images')
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result) => {
            this.sealImageProgress = result.progress;
            if (result.url) {
              this.wizardForm.patchValue({ sealImageUrl: result.url });
              this.sealImageUploading = false;
              this.sealImageProgress = 100;
            }
          },
          error: (error) => {
            console.error('Error uploading seal image:', error);
            this.showError(`Error al subir la imagen del sello: ${error.message}`);
            this.sealImageUploading = false;
            this.sealImageProgress = 0;
          }
        });
    } catch (error) {
      console.error('Error uploading seal image:', error);
      this.showError('Error al subir la imagen del sello');
      this.sealImageUploading = false;
      this.sealImageProgress = 0;
    }
  }

  removeHeroImage(): void {
    this.heroImageFile = undefined;
    this.heroImagePreview = undefined;
    this.wizardForm.patchValue({ heroImageUrl: '' });
  }

  removeSealImage(): void {
    this.sealImageFile = undefined;
    this.sealImagePreview = undefined;
    this.wizardForm.patchValue({ sealImageUrl: '' });
  }

  // Notification methods
  private showSuccess(message: string): void {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remover después de 3 segundos
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
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  private showWarning(message: string): void {
    // Crear notificación de advertencia
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remover después de 4 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}