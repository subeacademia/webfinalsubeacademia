import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CertificacionesService } from '../services/certificaciones.service';
import { SessionsService } from '../services/sessions.service';
import { ApplicationsService } from '../services/applications.service';
import { Certificacion, RouteType } from '../data/certificacion.model';
import { Session } from '../data/session.model';
import { Application } from '../data/application.model';
import { I18nTranslatePipe } from '../../../core/i18n/i18n.pipe';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-certification-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, I18nTranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <div class="flex items-center gap-4 mb-4">
              <button (click)="goBack()" 
                      class="flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Volver
              </button>
            </div>
            
            <h1 class="text-4xl font-bold mb-4">
              {{ certificacion?.title || certificacion?.titulo }}
            </h1>
            
            <p class="text-xl text-purple-100 mb-6">
              {{ certificacion?.shortDescription || certificacion?.descripcion }}
            </p>
            
            <!-- Badges -->
            <div class="flex flex-wrap gap-4 mb-6">
              <span *ngFor="let route of certificacion?.routeTypes" 
                    class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {{ route }}
              </span>
              <span *ngIf="certificacion?.state === 'Próximamente'" 
                    class="px-3 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full text-sm font-medium">
                Próximamente
              </span>
            </div>
            
            <!-- Avales -->
            <div class="flex items-center gap-4">
              <span class="text-purple-200">Avalado por:</span>
              <div class="flex gap-2">
                <span *ngFor="let endorser of certificacion?.endorsers" 
                      class="px-3 py-1 bg-white/10 backdrop-blur-sm rounded text-sm">
                  {{ endorser }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
          
          <!-- Tabs Navigation -->
          <div class="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav class="flex space-x-8">
              <button *ngFor="let route of certificacion?.routeTypes" 
                      (click)="activeTab = route"
                      [class]="activeTab === route ? 
                        'border-purple-500 text-purple-600 dark:text-purple-400' : 
                        'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                      class="py-2 px-1 border-b-2 font-medium text-sm transition-colors">
                {{ route }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="grid lg:grid-cols-3 gap-8">
            
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- Formación Tab -->
              <div *ngIf="activeTab === 'Formación'">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Información de Formación</h2>
                  
                  <div class="space-y-6">
                    <!-- Descripción -->
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">¿Qué aprenderás?</h3>
                      <div class="prose dark:prose-invert max-w-none">
                        <p class="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                          {{ certificacion?.longDescription }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Competencias -->
                    <div *ngIf="getCompetencies().length">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Competencias que desarrollarás</h3>
                      <ul class="grid md:grid-cols-2 gap-2">
                        <li *ngFor="let competency of getCompetencies()" 
                            class="flex items-center text-gray-600 dark:text-gray-300">
                          <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          {{ competency }}
                        </li>
                      </ul>
                    </div>
                    
                    <!-- Modalidades -->
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Modalidades Disponibles</h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div *ngIf="certificacion?.modalities?.asincronica" 
                             class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div class="text-2xl mb-2">📚</div>
                          <div class="text-sm font-medium">Asincrónica</div>
                        </div>
                        <div *ngIf="certificacion?.modalities?.enVivo" 
                             class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div class="text-2xl mb-2">🎥</div>
                          <div class="text-sm font-medium">En Vivo</div>
                        </div>
                        <div *ngIf="certificacion?.modalities?.hibrida" 
                             class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div class="text-2xl mb-2">🔄</div>
                          <div class="text-sm font-medium">Híbrida</div>
                        </div>
                        <div *ngIf="certificacion?.modalities?.presencial" 
                             class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div class="text-2xl mb-2">🏢</div>
                          <div class="text-sm font-medium">Presencial</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Sesiones Próximas -->
                    <div *ngIf="sessions?.length">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Próximas Sesiones</h3>
                      <div class="space-y-4">
                        <div *ngFor="let session of sessions" 
                             class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div class="flex justify-between items-start">
                            <div>
                              <h4 class="font-medium text-gray-900 dark:text-white">
                                {{ session.startAt | date:'dd/MM/yyyy' }} - {{ session.endAt | date:'dd/MM/yyyy' }}
                              </h4>
                              <p class="text-sm text-gray-600 dark:text-gray-400">
                                {{ session.delivery | titlecase }}
                                <span *ngIf="session.location"> - {{ session.location }}</span>
                              </p>
                              <p *ngIf="session.capacity" class="text-sm text-gray-500">
                                Capacidad: {{ session.capacity }} participantes
                              </p>
                            </div>
                            <a *ngIf="session.enrollmentUrl" 
                               [href]="session.enrollmentUrl" 
                               target="_blank"
                               class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                              Inscribirse
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Convalidación Tab -->
              <div *ngIf="activeTab === 'Convalidación'">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Proceso de Convalidación</h2>
                  
                  <div class="space-y-6">
                    <!-- Descripción del proceso -->
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">¿Cómo funciona la convalidación?</h3>
                      <p class="text-gray-600 dark:text-gray-300">
                        La convalidación te permite obtener esta certificación demostrando tu experiencia y competencias 
                        a través de un portafolio de evidencias y una entrevista con nuestros expertos.
                      </p>
                    </div>
                    
                    <!-- Requisitos -->
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requisitos</h3>
                      <ul class="space-y-2">
                        <li class="flex items-center text-gray-600 dark:text-gray-300">
                          <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          Experiencia mínima de 2 años en el área
                        </li>
                        <li class="flex items-center text-gray-600 dark:text-gray-300">
                          <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          Portafolio de evidencias (PDF o URL)
                        </li>
                        <li class="flex items-center text-gray-600 dark:text-gray-300">
                          <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                          </svg>
                          Entrevista con panel de expertos
                        </li>
                      </ul>
                    </div>
                    
                    <!-- Formulario de postulación -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Postular a Convalidación</h3>
                      
                      <form [formGroup]="applicationForm" (ngSubmit)="submitApplication()" class="space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre Completo *
                          </label>
                          <input type="text" 
                                 formControlName="fullName"
                                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input type="email" 
                                 formControlName="email"
                                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Portafolio de Evidencias *
                          </label>
                          <div class="space-y-2">
                            <input type="url" 
                                   formControlName="portfolioUrl"
                                   placeholder="https://ejemplo.com/portafolio"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <p class="text-sm text-gray-500">O sube un archivo PDF</p>
                            <input type="file" 
                                   accept=".pdf"
                                   (change)="onFileSelected($event)"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Experiencia Relevante
                          </label>
                          <textarea formControlName="experience"
                                    rows="4"
                                    placeholder="Describe tu experiencia en el área..."
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                        </div>
                        
                        <button type="submit" 
                                [disabled]="applicationForm.invalid || submitting"
                                class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg">
                          {{ submitting ? 'Enviando...' : 'Postular a Convalidación' }}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              
              <!-- Información General -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h3>
                
                <div class="space-y-4">
                  <div>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Audiencia:</span>
                    <p class="text-gray-900 dark:text-white">{{ certificacion?.audience }}</p>
                  </div>
                  
                  <div>
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Categoría:</span>
                    <p class="text-gray-900 dark:text-white">{{ certificacion?.category }}</p>
                  </div>
                  
                  <div *ngIf="getDurationHours() > 0">
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Duración:</span>
                    <p class="text-gray-900 dark:text-white">{{ getDurationHours() }} horas</p>
                  </div>
                  
                  <div *ngIf="getValidityMonths()">
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Vigencia:</span>
                    <p class="text-gray-900 dark:text-white">{{ getValidityMonths() }} meses</p>
                  </div>
                  
                  <div *ngIf="getLanguages().length">
                    <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Idiomas:</span>
                    <p class="text-gray-900 dark:text-white">{{ getLanguageNames(getLanguages()).join(', ') }}</p>
                  </div>
                </div>
              </div>

              <!-- Precios -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Precios</h3>
                
                <div class="space-y-3">
                  <div *ngIf="certificacion?.currencies?.USD" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">USD:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ certificacion?.currencies?.USD }}</span>
                  </div>
                  <div *ngIf="certificacion?.currencies?.EUR" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">EUR:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">€{{ certificacion?.currencies?.EUR }}</span>
                  </div>
                  <div *ngIf="certificacion?.currencies?.CLP" class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">CLP:</span>
                    <span class="font-semibold text-gray-900 dark:text-white">{{ certificacion?.currencies?.CLP | number }}</span>
                  </div>
                </div>
                
                <div *ngIf="getPricingNotes()" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ getPricingNotes() }}</p>
                </div>
              </div>

              <!-- CTA Buttons -->
              <div class="space-y-3">
                <a *ngIf="getPaymentLink()" 
                   [href]="getPaymentLink()" 
                   target="_blank"
                   class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium block">
                  Pagar Ahora
                </a>
                
                <button *ngIf="certificacion?.audience === 'Empresas'" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium">
                  Cotizar in-company
                </button>
                
                <button *ngIf="certificacion?.audience === 'Personas'" 
                        class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium">
                  Inscribirme
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CertificationDetailComponent implements OnInit, OnDestroy {
  certificacion: Certificacion | null = null;
  sessions: Session[] = [];
  activeTab: RouteType = 'Formación';
  applicationForm!: FormGroup;
  submitting = false;
  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private certificacionesService: CertificacionesService,
    private sessionsService: SessionsService,
    private applicationsService: ApplicationsService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadCertification(slug);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeForm(): void {
    this.applicationForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      portfolioUrl: [''],
      experience: ['']
    });
  }

  private loadCertification(slug: string): void {
    this.certificacionesService.getCertificacionBySlug(slug)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(certificacion => {
        if (certificacion) {
          this.certificacion = certificacion;
          
          // Cargar sesiones si tiene ruta de formación
          if (certificacion.routeTypes?.includes('Formación')) {
            this.loadSessions(certificacion.id);
          }
          
          // Establecer tab activo
          if (certificacion.routeTypes?.length) {
            this.activeTab = certificacion.routeTypes[0];
          }
        } else {
          this.router.navigate(['/productos/certificaciones']);
        }
      });
  }

  private loadSessions(certificationId: string): void {
    this.sessionsService.getSessionsByCertification(certificationId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(sessions => {
        this.sessions = sessions;
      });
  }

  goBack(): void {
    this.router.navigate(['/productos/certificaciones']);
  }

  submitApplication(): void {
    if (this.applicationForm.valid && this.certificacion) {
      this.submitting = true;
      
      const applicationData = {
        certificationId: this.certificacion.id,
        portfolio: {
          type: 'url' as const,
          value: this.applicationForm.value.portfolioUrl
        },
        interview: {},
        scores: {},
        status: 'Recibida' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user',
        updatedBy: 'user'
      };

      this.applicationsService.createApplication(applicationData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.submitting = false;
          alert('Postulación enviada correctamente. Te contactaremos pronto.');
          this.applicationForm.reset();
        });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implementar subida de archivo
      console.log('Archivo seleccionado:', file);
    }
  }

  getLanguageNames(languages: string[]): string[] {
    const languageMap: { [key: string]: string } = {
      'es': 'Español',
      'en': 'Inglés',
      'pt': 'Portugués'
    };
    
    return languages.map(lang => languageMap[lang] || lang);
  }

  getCompetencies(): string[] {
    return this.certificacion?.competencies || [];
  }

  getDurationHours(): number {
    return this.certificacion?.durationHours || 0;
  }

  getValidityMonths(): number | null {
    return this.certificacion?.validityMonths || null;
  }

  getLanguages(): string[] {
    return this.certificacion?.languages || [];
  }

  getPricingNotes(): string {
    return this.certificacion?.pricingNotes || '';
  }

  getPaymentLink(): string {
    return this.certificacion?.paymentLink || '';
  }
}
