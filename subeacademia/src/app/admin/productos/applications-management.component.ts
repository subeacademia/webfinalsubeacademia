import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationsService } from '../../features/productos/services/applications.service';
import { CertificacionesService } from '../../features/productos/services/certificaciones.service';
import { Application, ApplicationStatus } from '../../features/productos/data/application.model';
import { Certificacion } from '../../features/productos/data/certificacion.model';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';

@Component({
  selector: 'app-applications-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, I18nTranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/productos" 
             class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver a Productos
          </a>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Convalidaciones</h1>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats?.total || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats?.pendingReview || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Aprobadas</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats?.approved || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Rechazadas</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats?.rejected || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <form [formGroup]="filtersForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
            <select formControlName="status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Todos los estados</option>
              <option value="Recibida">Recibida</option>
              <option value="EnRevisión">En Revisión</option>
              <option value="EntrevistaAgendada">Entrevista Agendada</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certificación</label>
            <select formControlName="certificationId" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Todas las certificaciones</option>
              <option *ngFor="let cert of certificaciones" [value]="cert.id">{{ cert.title || cert.titulo }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Búsqueda</label>
            <input type="text" formControlName="search" placeholder="Buscar por nombre o email..." class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
          </div>

          <div class="flex items-end">
            <button type="button" (click)="clearFilters()" class="w-full px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
              Limpiar Filtros
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de aplicaciones -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aplicaciones de Convalidación</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aplicante</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Certificación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let application of filteredApplications" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ application.userId || 'Usuario' }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ application.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ getCertificationName(application.certificationId) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [class]="getStatusClass(application.status)">
                    {{ application.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ application.createdAt | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="viewApplication(application)"
                          class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                    Ver
                  </button>
                  <button (click)="updateApplicationStatus(application)"
                          class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                    Gestionar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredApplications.length === 0" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
          No hay aplicaciones que coincidan con los filtros.
        </div>
      </div>

      <!-- Modal de gestión de aplicación -->
      <div *ngIf="selectedApplication" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Gestionar Aplicación</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <!-- Información de la aplicación -->
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">Información General</h4>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                <p><strong>Certificación:</strong> {{ getCertificationName(selectedApplication.certificationId) }}</p>
                <p><strong>Estado:</strong> {{ selectedApplication.status }}</p>
                <p><strong>Fecha de aplicación:</strong> {{ selectedApplication.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                <p *ngIf="selectedApplication.portfolio"><strong>Portafolio:</strong> 
                  <a [href]="selectedApplication.portfolio.value" target="_blank" class="text-blue-600 hover:text-blue-800">
                    Ver portafolio
                  </a>
                </p>
              </div>
            </div>

            <!-- Formulario de gestión -->
            <form [formGroup]="managementForm" (ngSubmit)="submitManagement()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nuevo Estado</label>
                  <select formControlName="status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="EnRevisión">En Revisión</option>
                    <option value="EntrevistaAgendada">Entrevista Agendada</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </div>

                <div *ngIf="managementForm.get('status')?.value === 'EntrevistaAgendada'">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Entrevista</label>
                  <input type="datetime-local" formControlName="interviewDate" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
                  <textarea formControlName="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Notas adicionales..."></textarea>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancelar
                </button>
                <button type="submit" [disabled]="managementForm.invalid" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ApplicationsManagementComponent implements OnInit, OnDestroy {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  certificaciones: Certificacion[] = [];
  stats: any = null;
  selectedApplication: Application | null = null;
  managementForm!: FormGroup;
  filtersForm!: FormGroup;
  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private applicationsService: ApplicationsService,
    private certificacionesService: CertificacionesService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadApplications();
    this.loadCertificaciones();
    this.loadStats();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeForms(): void {
    this.filtersForm = this.fb.group({
      status: [''],
      certificationId: [''],
      search: ['']
    });

    this.managementForm = this.fb.group({
      status: ['', Validators.required],
      interviewDate: [''],
      notes: ['']
    });
  }

  private loadApplications(): void {
    this.applicationsService.getAllApplications()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(applications => {
        this.applications = applications;
        this.filteredApplications = applications;
      });
  }

  private loadCertificaciones(): void {
    this.certificacionesService.getAllCertificaciones()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(certificaciones => {
        this.certificaciones = certificaciones;
      });
  }

  private loadStats(): void {
    this.applicationsService.getApplicationStats()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  private setupFilters(): void {
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filters => {
        this.filteredApplications = this.applications.filter(app => {
          const matchesStatus = !filters.status || app.status === filters.status;
          const matchesCertification = !filters.certificationId || app.certificationId === filters.certificationId;
          const matchesSearch = !filters.search || 
            (app.userId && app.userId.toLowerCase().includes(filters.search.toLowerCase()));
          
          return matchesStatus && matchesCertification && matchesSearch;
        });
      });
  }

  getCertificationName(certificationId: string): string {
    const cert = this.certificaciones.find(c => c.id === certificationId);
    return cert ? (cert.title || cert.titulo || 'Sin título') : 'Certificación no encontrada';
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case 'Recibida':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'EnRevisión':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'EntrevistaAgendada':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Aprobada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Rechazada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  viewApplication(application: Application): void {
    this.selectedApplication = application;
    this.managementForm.patchValue({
      status: application.status,
      notes: application.notes || ''
    });
  }

  updateApplicationStatus(application: Application): void {
    this.selectedApplication = application;
    this.managementForm.patchValue({
      status: application.status,
      notes: application.notes || ''
    });
  }

  closeModal(): void {
    this.selectedApplication = null;
    this.managementForm.reset();
  }

  submitManagement(): void {
    if (this.managementForm.valid && this.selectedApplication) {
      const formData = this.managementForm.value;
      
      this.applicationsService.updateApplicationStatus(
        this.selectedApplication.id,
        formData.status,
        formData.notes
      ).pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.loadApplications();
        this.loadStats();
        this.closeModal();
      });
    }
  }

  clearFilters(): void {
    this.filtersForm.reset();
  }
}
