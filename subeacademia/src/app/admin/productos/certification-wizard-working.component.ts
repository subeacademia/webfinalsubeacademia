import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { FileUploadService } from '../../core/services/file-upload.service';
import { 
  Certificacion, 
  CertificationState, 
  CertificationAudience, 
  CertificationCategory, 
  RouteType,
  Language,
  RecertificationType
} from '../../features/productos/data/certificacion.model';

@Component({
  selector: 'app-certification-wizard-working',
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
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                 [style.width.%]="(currentStep / 8) * 100"></div>
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Paso {{ currentStep }} de 8</span>
            <span>{{ getProgressPercentage() }}% completado</span>
          </div>
        </div>

        <!-- Wizard Content -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form [formGroup]="wizardForm" (ngSubmit)="onSubmit()">
            
            <!-- Paso 1: Básicos -->
            <div *ngIf="currentStep === 1" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Información Básica</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          rows="5"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Descripción detallada de la certificación"></textarea>
              </div>
            </div>

            <!-- Paso 2: Clasificación -->
            <div *ngIf="currentStep === 2" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Clasificación</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <!-- Paso 3: Entrega -->
            <div *ngIf="currentStep === 3" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Entrega</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duración (horas)
                  </label>
                  <input type="number" 
                         formControlName="durationHours"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="40">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idiomas
                  </label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="checkbox" formControlName="languageEs" class="mr-2">
                      <span class="text-gray-700 dark:text-gray-300">Español</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" formControlName="languageEn" class="mr-2">
                      <span class="text-gray-700 dark:text-gray-300">Inglés</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modalidades
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="modalityAsincronica" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">Asincrónica</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="modalityEnVivo" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">En Vivo</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="modalityHibrida" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">Híbrida</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="modalityPresencial" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">Presencial</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Paso 4: Economía -->
            <div *ngIf="currentStep === 4" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Economía</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Notas de Precio
                </label>
                <textarea formControlName="pricingNotes"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Información adicional sobre precios"></textarea>
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

            <!-- Paso 5: Avales -->
            <div *ngIf="currentStep === 5" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Avales y Sellos</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avales
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="avaleSubeIA" [checked]="true" [disabled]="true" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">SUBE-IA (Obligatorio)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" formControlName="avaleArchIADS" class="mr-2">
                    <span class="text-gray-700 dark:text-gray-300">ARCHIADS (Opcional)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Doble Sello
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="doubleSeal" class="mr-2">
                  <span class="text-gray-700 dark:text-gray-300">Mostrar doble sello (SUBE-IA + ARCHIADS)</span>
                </label>
              </div>
            </div>

            <!-- Paso 6: Evaluación y Competencias -->
            <div *ngIf="currentStep === 6" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Evaluación y Competencias</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Competencias
                </label>
                <textarea formControlName="competencies"
                          rows="4"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Lista de competencias, una por línea"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alineación Regulatoria
                </label>
                <textarea formControlName="regulatoryAlignment"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Ej: AI Act – riesgo, transparencia, supervisión humana"></textarea>
              </div>
            </div>

            <!-- Paso 7: Vigencia y Recertificación -->
            <div *ngIf="currentStep === 7" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Vigencia y Recertificación</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vigencia (meses)
                  </label>
                  <input type="number" 
                         formControlName="validityMonths"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                         placeholder="24">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select formControlName="state"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="Disponible">Disponible</option>
                    <option value="Próximamente">Próximamente</option>
                    <option value="NoDisponible">No Disponible</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recertificación Requerida
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="recertificationRequired" class="mr-2">
                  <span class="text-gray-700 dark:text-gray-300">Requiere recertificación</span>
                </label>
              </div>
            </div>

            <!-- Paso 8: Medios y Publicación -->
            <div *ngIf="currentStep === 8" class="space-y-6">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Medios y Publicación</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagen Hero
                  </label>
                  <input type="file" 
                         (change)="onHeroImageSelected($event)"
                         accept="image/*"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                  
                  <!-- Image Preview -->
                  <div *ngIf="heroImagePreview" class="space-y-4 mt-4">
                    <img [src]="heroImagePreview" 
                         alt="Hero preview" 
                         class="mx-auto h-32 w-auto rounded-lg object-cover">
                    <div class="flex justify-center space-x-2">
                      <button type="button" 
                              (click)="uploadHeroImage()"
                              [disabled]="heroImageUploading"
                              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">
                        <span *ngIf="!heroImageUploading">Subir a Firebase</span>
                        <span *ngIf="heroImageUploading">Subiendo...</span>
                      </button>
                      <button type="button" 
                              (click)="removeHeroImage()"
                              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <!-- Manual URL Input -->
                  <div class="mt-2">
                    <input type="url" 
                           formControlName="heroImageUrl"
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="O ingresar URL directamente:">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Imagen Sello
                  </label>
                  <input type="file" 
                         (change)="onSealImageSelected($event)"
                         accept="image/*"
                         class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                  
                  <!-- Image Preview -->
                  <div *ngIf="sealImagePreview" class="space-y-4 mt-4">
                    <img [src]="sealImagePreview" 
                         alt="Seal preview" 
                         class="mx-auto h-32 w-auto rounded-lg object-cover">
                    <div class="flex justify-center space-x-2">
                      <button type="button" 
                              (click)="uploadSealImage()"
                              [disabled]="sealImageUploading"
                              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">
                        <span *ngIf="!sealImageUploading">Subir a Firebase</span>
                        <span *ngIf="sealImageUploading">Subiendo...</span>
                      </button>
                      <button type="button" 
                              (click)="removeSealImage()"
                              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                        Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <!-- Manual URL Input -->
                  <div class="mt-2">
                    <input type="url" 
                           formControlName="sealImageUrl"
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="O ingresar URL directamente:">
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Título SEO
                </label>
                <input type="text" 
                       formControlName="metaTitle"
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                       placeholder="Título para SEO">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Descripción SEO
                </label>
                <textarea formControlName="metaDescription"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Descripción para SEO"></textarea>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-8">
              <button type="button" 
                      (click)="previousStep()" 
                      [disabled]="currentStep === 1"
                      class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Anterior
              </button>
              
              <div class="flex gap-2">
                <button type="button" 
                        (click)="goBack()" 
                        class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancelar
                </button>
                
                <button type="button" 
                        (click)="nextStep()" 
                        [disabled]="currentStep === 8"
                        *ngIf="currentStep < 8"
                        class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Siguiente
                </button>
                
                <button type="submit" 
                        *ngIf="currentStep === 8"
                        [disabled]="wizardForm.invalid || isSubmitting"
                        class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="!isSubmitting">Guardar Certificación</span>
                  <span *ngIf="isSubmitting">Guardando...</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CertificationWizardWorkingComponent implements OnInit {
  wizardForm!: FormGroup;
  currentStep = 1;
  isEditing = false;
  isSubmitting = false;

  // File upload properties
  heroImageFile?: File;
  heroImagePreview?: string;
  heroImageUploading = false;
  sealImageFile?: File;
  sealImagePreview?: string;
  sealImageUploading = false;

  constructor(
    private fb: FormBuilder,
    private certificacionesService: CertificacionesService,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    console.log('CertificationWizardWorkingComponent initialized');
    this.setupFormSubscriptions();
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
      if (title) {
        const slug = this.generateSlug(title);
        this.wizardForm.patchValue({ slug });
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

  // Progress calculation
  getProgressPercentage(): number {
    return Math.round((this.currentStep / 8) * 100);
  }

  onSubmit(): void {
    if (this.wizardForm.valid) {
      const formData = this.wizardForm.value;
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

  // File upload methods
  onHeroImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.fileUploadService.validateFileType(file)) {
        this.showError('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).');
        event.target.value = '';
        return;
      }
      
      if (!this.fileUploadService.validateFileSize(file, 5)) {
        this.showError('El archivo es demasiado grande. Máximo 5MB.');
        event.target.value = '';
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
      if (!this.fileUploadService.validateFileType(file)) {
        this.showError('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WEBP).');
        event.target.value = '';
        return;
      }
      
      if (!this.fileUploadService.validateFileSize(file, 5)) {
        this.showError('El archivo es demasiado grande. Máximo 5MB.');
        event.target.value = '';
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
    try {
      const url = await this.fileUploadService.uploadFile(this.heroImageFile, 'hero-images').toPromise();
      this.wizardForm.patchValue({ heroImageUrl: url });
      this.heroImageUploading = false;
      this.showSuccess('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error uploading hero image:', error);
      this.showError('Error al subir la imagen hero');
      this.heroImageUploading = false;
    }
  }

  async uploadSealImage(): Promise<void> {
    if (!this.sealImageFile) return;

    this.sealImageUploading = true;
    try {
      const url = await this.fileUploadService.uploadFile(this.sealImageFile, 'seal-images').toPromise();
      this.wizardForm.patchValue({ sealImageUrl: url });
      this.sealImageUploading = false;
      this.showSuccess('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error uploading seal image:', error);
      this.showError('Error al subir la imagen del sello');
      this.sealImageUploading = false;
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
