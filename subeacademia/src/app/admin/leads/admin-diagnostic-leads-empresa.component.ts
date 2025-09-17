import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiModalComponent } from '../../shared/ui-kit/modal/modal';
import { ConfirmationModalComponent } from '../../shared/ui-kit/confirmation-modal/confirmation-modal.component';
import { ToastComponent } from '../../shared/ui-kit/toast/toast.component';
import { DiagnosticsService } from '../../features/diagnostico/services/diagnostics.service';
import { NotificationService } from '../../core/services/notification.service';
import { ReporteDiagnosticoEmpresa } from '../../features/diagnostico/data/empresa-diagnostic.models';

interface EmpresaRow {
  id: string;
  razonSocial: string;
  emailContacto: string;
  nombreContacto: string;
  categoriaTamano: string;
  fecha: number;
  ig_ia_nivel: string;
  ig_ia_0a100: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe, UiModalComponent, ConfirmationModalComponent, ToastComponent, FormsModule],
  template: `
    <!-- Header con estadísticas -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold mb-4">Diagnósticos de Empresas - IA</h1>
      <p class="text-[var(--muted)] mb-4">Administra los diagnósticos de madurez en IA realizados por empresas</p>
      
      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="stats()">
        <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M7 7h.01M7 3h.01"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-[var(--muted)]">Total Empresas</p>
              <p class="text-2xl font-semibold">{{ stats()?.total || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-[var(--muted)]">Nivel Avanzado+</p>
              <p class="text-2xl font-semibold">{{ stats()?.avanzadas || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-[var(--muted)]">Este Mes</p>
              <p class="text-2xl font-semibold">{{ stats()?.thisMonth || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
          <div class="flex items-center">
            <div class="p-2 bg-orange-100 rounded-lg">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-[var(--muted)]">Promedio IG-IA</p>
              <p class="text-2xl font-semibold">{{ stats()?.promedioIG || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">
          <button class="btn btn-sm" (click)="filterByLevel('all')" [class.btn-primary]="currentFilter() === 'all'">Todos</button>
          <button class="btn btn-sm" (click)="filterByLevel('Transformador')" [class.btn-primary]="currentFilter() === 'Transformador'">Transformador</button>
          <button class="btn btn-sm" (click)="filterByLevel('Avanzado')" [class.btn-primary]="currentFilter() === 'Avanzado'">Avanzado</button>
          <button class="btn btn-sm" (click)="filterByLevel('Intermedio')" [class.btn-primary]="currentFilter() === 'Intermedio'">Intermedio</button>
          <button class="btn btn-sm" (click)="filterByLevel('Básico')" [class.btn-primary]="currentFilter() === 'Básico'">Básico</button>
          <button class="btn btn-sm" (click)="filterByLevel('Incipiente')" [class.btn-primary]="currentFilter() === 'Incipiente'">Incipiente</button>
        </div>
        <div class="flex gap-2">
          <input type="text" placeholder="Buscar por empresa o contacto..." 
                 [(ngModel)]="searchTerm" 
                 (input)="onSearchChange()"
                 class="input input-sm w-64">
        </div>
      </div>
    </div>

    <!-- Tabla de diagnósticos -->
    <div class="border rounded overflow-hidden">
      <div class="grid grid-cols-12 bg-[var(--panel)]/50 p-3 text-sm font-medium">
        <div class="col-span-3">Empresa</div>
        <div class="col-span-2">Contacto</div>
        <div class="col-span-2">Email</div>
        <div class="col-span-1">Tamaño</div>
        <div class="col-span-2">Nivel IA</div>
        <div class="col-span-1">Fecha</div>
        <div class="col-span-1 text-right">Acciones</div>
      </div>
      <div *ngFor="let d of filteredEmpresas()" class="grid grid-cols-12 p-3 border-t items-center text-sm hover:bg-[var(--panel)]/30">
        <div class="col-span-3">
          <div class="truncate font-medium">{{ d.razonSocial }}</div>
          <div class="text-xs text-[var(--muted)]">{{ d.categoriaTamano }}</div>
        </div>
        <div class="col-span-2 truncate">{{ d.nombreContacto }}</div>
        <div class="col-span-2 truncate">{{ d.emailContacto }}</div>
        <div class="col-span-1">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                [class]="getSizeClass(d.categoriaTamano)">
            {{ d.categoriaTamano }}
          </span>
        </div>
        <div class="col-span-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [class]="getLevelClass(d.ig_ia_nivel)">
              {{ d.ig_ia_nivel }}
            </span>
            <span class="text-xs text-[var(--muted)]">{{ d.ig_ia_0a100 }}/100</span>
          </div>
        </div>
        <div class="col-span-1">{{ d.fecha | date: 'short' }}</div>
        <div class="col-span-1 text-right">
          <div class="flex gap-1">
            <button class="btn btn-xs" (click)="open(d.id)">Ver</button>
            <button class="btn btn-xs btn-error" (click)="deleteEmpresa(d.id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="mt-3 flex items-center gap-2">
      <button class="btn" (click)="prev()" [disabled]="page() === 1">Anterior</button>
      <div>Página {{ page() }} / {{ totalPages() }}</div>
      <button class="btn" (click)="next()" [disabled]="page() >= totalPages()">Siguiente</button>
    </div>

    <!-- Modal Detalle Diagnóstico -->
    <app-ui-modal [isOpen]="isOpen()" size="xl" (close)="close()">
      <div slot="header" class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="text-lg font-semibold truncate">{{ selectedEmpresa()?.metadata?.razonSocial || 'Detalle del diagnóstico' }}</div>
          <div class="text-sm text-[var(--muted)]">{{ selectedFecha() | date: 'medium' }}</div>
        </div>
      </div>
      <div slot="body">
        <div #printArea class="space-y-6" *ngIf="selectedEmpresa()">
          <!-- Datos de la Empresa -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-[var(--muted)]">Razón Social</div>
              <div class="font-medium">{{ selectedEmpresa()?.metadata?.razonSocial || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">RUT</div>
              <div class="font-medium">{{ selectedEmpresa()?.metadata?.rut || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Contacto</div>
              <div class="font-medium">{{ selectedEmpresa()?.metadata?.nombreContacto || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Email</div>
              <div class="font-medium">{{ selectedEmpresa()?.metadata?.emailContacto || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Categoría</div>
              <div class="font-medium">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      [class]="getSizeClass(selectedEmpresa()?.metadata?.categoriaTamano)">
                  {{ selectedEmpresa()?.metadata?.categoriaTamano }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Ventas UF Anual</div>
              <div class="font-medium">{{ (selectedEmpresa()?.metadata?.ventasUFAnual | number) || '-' }}</div>
            </div>
          </div>

          <!-- Resumen de Puntuaciones -->
          <div class="bg-[var(--panel)] rounded-lg p-6 border border-[var(--border)]">
            <h3 class="text-lg font-semibold mb-4">Índice General de IA (IG-IA)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-3xl font-bold" [class]="getLevelClass(selectedEmpresa()?.puntajes?.ig_ia_nivel)">
                  {{ selectedEmpresa()?.puntajes?.ig_ia_0a100 || 0 }}/100
                </div>
                <div class="text-sm text-[var(--muted)]">Puntuación</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-semibold" [class]="getLevelClass(selectedEmpresa()?.puntajes?.ig_ia_nivel)">
                  {{ selectedEmpresa()?.puntajes?.ig_ia_1a7 || 0 }}/7
                </div>
                <div class="text-sm text-[var(--muted)]">Nota</div>
              </div>
              <div class="text-center">
                <div class="text-xl font-semibold" [class]="getLevelClass(selectedEmpresa()?.puntajes?.ig_ia_nivel)">
                  {{ selectedEmpresa()?.puntajes?.ig_ia_nivel || 'Sin evaluar' }}
                </div>
                <div class="text-sm text-[var(--muted)]">Nivel</div>
              </div>
            </div>
          </div>

          <!-- Dimensiones -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Evaluación por Dimensiones</h3>
            <div class="space-y-3" *ngIf="selectedEmpresa()?.puntajes?.dimensiones">
              <div *ngFor="let dim of selectedEmpresa()?.puntajes?.dimensiones" 
                   class="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <div class="font-medium">{{ dim.nombre }}</div>
                  <div class="text-sm text-[var(--muted)]">{{ dim.nivel }}</div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold" [class]="getLevelClass(dim.nivel)">{{ dim.indice_0_100 }}/100</div>
                  <div class="text-sm text-[var(--muted)]">{{ dim.nota_1_7 }}/7</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Plan de Acción (si existe) -->
          <div *ngIf="selectedEmpresa()?.planDeAccion">
            <h3 class="text-lg font-semibold mb-4">Plan de Acción Generado por IA</h3>
            
            <!-- Resumen Ejecutivo -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
              <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">Resumen Ejecutivo</h4>
              <p class="text-sm text-blue-700 dark:text-blue-300">{{ selectedEmpresa()?.planDeAccion?.resumenEjecutivo }}</p>
            </div>

            <!-- Puntos Fuertes -->
            <div class="mb-4">
              <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">Puntos Fuertes</h4>
              <div class="space-y-2" *ngIf="selectedEmpresa()?.planDeAccion?.puntosFuertes">
                <div *ngFor="let punto of selectedEmpresa()?.planDeAccion?.puntosFuertes" 
                     class="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                  <div class="font-medium text-green-800 dark:text-green-200">{{ punto.punto }}</div>
                  <div class="text-sm text-green-700 dark:text-green-300">{{ punto.justificacion }}</div>
                </div>
              </div>
            </div>

            <!-- Áreas de Mejora -->
            <div class="mb-4">
              <h4 class="font-semibold text-orange-800 dark:text-orange-200 mb-2">Áreas de Mejora</h4>
              <div class="space-y-2" *ngIf="selectedEmpresa()?.planDeAccion?.areasMejora">
                <div *ngFor="let area of selectedEmpresa()?.planDeAccion?.areasMejora" 
                     class="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800">
                  <div class="font-medium text-orange-800 dark:text-orange-200">{{ area.area }}</div>
                  <div class="text-sm text-orange-700 dark:text-orange-300">{{ area.justificacion }}</div>
                </div>
              </div>
            </div>

            <!-- Recomendaciones por Horizonte -->
            <div class="space-y-4" *ngIf="selectedEmpresa()?.planDeAccion?.recomendaciones">
              <div>
                <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-2">Primeros 90 días</h4>
                <div class="space-y-2" *ngIf="selectedEmpresa()?.planDeAccion?.recomendaciones?.horizonte_90_dias">
                  <div *ngFor="let accion of selectedEmpresa()?.planDeAccion?.recomendaciones?.horizonte_90_dias" 
                       class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800">
                    <div class="font-medium text-purple-800 dark:text-purple-200">{{ accion.accion }}</div>
                    <div class="text-sm text-purple-700 dark:text-purple-300">{{ accion.detalle }}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">180 días</h4>
                <div class="space-y-2" *ngIf="selectedEmpresa()?.planDeAccion?.recomendaciones?.horizonte_180_dias">
                  <div *ngFor="let accion of selectedEmpresa()?.planDeAccion?.recomendaciones?.horizonte_180_dias" 
                       class="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-200 dark:border-indigo-800">
                    <div class="font-medium text-indigo-800 dark:text-indigo-200">{{ accion.accion }}</div>
                    <div class="text-sm text-indigo-700 dark:text-indigo-300">{{ accion.detalle }}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold text-teal-800 dark:text-teal-200 mb-2">365 días</h4>
                <div class="space-y-2" *ngIf="selectedEmpresa()?.planDeAccion?.recomendaciones?.horizonte_365_dias">
                  <div *ngFor="let accion of selectedEmpresa()?.planDeAccion?.recomendaciones?.horizonte_365_dias" 
                       class="bg-teal-50 dark:bg-teal-900/20 p-3 rounded border border-teal-200 dark:border-teal-800">
                    <div class="font-medium text-teal-800 dark:text-teal-200">{{ accion.accion }}</div>
                    <div class="text-sm text-teal-700 dark:text-teal-300">{{ accion.detalle }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-ui-modal>

    <!-- Modal de Confirmación -->
    <app-confirmation-modal 
      [isOpen]="showDeleteConfirm()"
      title="Eliminar Diagnóstico"
      message="¿Estás seguro de que quieres eliminar este diagnóstico de empresa? Esta acción no se puede deshacer."
      type="danger"
      confirmText="Eliminar"
      cancelText="Cancelar"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()">
    </app-confirmation-modal>

    <!-- Toast Notifications -->
    <app-toast #toastComponent></app-toast>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDiagnosticLeadsEmpresaComponent {
  private readonly router = inject(Router);
  private readonly diagnosticsService = inject(DiagnosticsService);
  private readonly notificationService = inject(NotificationService);

  @ViewChild('printArea') printArea?: ElementRef<HTMLElement>;
  @ViewChild('toastComponent') toastComponent?: ToastComponent;

  page = signal(1);
  pageSize = 20;
  currentFilter = signal<'all' | string>('all');
  searchTerm = '';
  stats = signal<any>(null);

  private readonly empresasSig = signal<EmpresaRow[]>([]);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.empresasSig().length / this.pageSize)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.empresasSig().slice(start, start + this.pageSize);
  });

  readonly filteredEmpresas = computed(() => {
    let empresas = this.empresasSig();
    const filter = this.currentFilter();
    
    // Filtrar por nivel
    if (filter !== 'all') {
      empresas = empresas.filter(empresa => empresa.ig_ia_nivel === filter);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      empresas = empresas.filter(empresa => 
        empresa.razonSocial.toLowerCase().includes(term) || 
        empresa.nombreContacto.toLowerCase().includes(term) ||
        empresa.emailContacto.toLowerCase().includes(term)
      );
    }
    
    return empresas;
  });

  isOpen = signal(false);
  selectedId = signal<string | null>(null);
  private selectedEmpresaSig = signal<ReporteDiagnosticoEmpresa | null>(null);
  selectedEmpresa = this.selectedEmpresaSig;

  // Estados para confirmación de eliminación
  showDeleteConfirm = signal(false);
  empresaToDelete = signal<string | null>(null);

  constructor(){
    this.loadEmpresas();
    this.loadStats();
  }

  ngAfterViewInit() {
    // Inicializar el servicio de notificaciones
    if (this.toastComponent) {
      this.notificationService.setToastComponent(this.toastComponent);
    }
  }

  private loadEmpresas() {
    this.diagnosticsService.getSavedEmpresaDiagnostics().subscribe((empresas: ReporteDiagnosticoEmpresa[]) => {
      const mapped = empresas.map((empresa) => ({
        id: empresa.metadata.id || '',
        razonSocial: empresa.metadata.razonSocial,
        emailContacto: empresa.metadata.emailContacto,
        nombreContacto: empresa.metadata.nombreContacto,
        categoriaTamano: empresa.metadata.categoriaTamano,
        fecha: empresa.metadata.fecha,
        ig_ia_nivel: empresa.puntajes.ig_ia_nivel,
        ig_ia_0a100: empresa.puntajes.ig_ia_0a100
      } as EmpresaRow));
      this.empresasSig.set(mapped);
    });
  }

  private loadStats() {
    // Calcular estadísticas básicas
    const empresas = this.empresasSig();
    const total = empresas.length;
    const avanzadas = empresas.filter(e => e.ig_ia_nivel === 'Avanzado' || e.ig_ia_nivel === 'Transformador').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = empresas.filter(e => {
      const fecha = new Date(e.fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    }).length;

    const promedioIG = empresas.length > 0 ? 
      Math.round(empresas.reduce((sum, e) => sum + e.ig_ia_0a100, 0) / empresas.length) : 0;

    this.stats.set({
      total,
      avanzadas,
      thisMonth,
      promedioIG
    });
  }

  prev(){ if (this.page() > 1) this.page.set(this.page() - 1); }
  next(){ if (this.page() < this.totalPages()) this.page.set(this.page() + 1); }

  filterByLevel(level: 'all' | string) {
    this.currentFilter.set(level);
    this.page.set(1); // Reset a la primera página
  }

  getSizeClass(size?: string): string {
    switch (size) {
      case 'Micro': return 'bg-green-100 text-green-800';
      case 'Pequeña': return 'bg-blue-100 text-blue-800';
      case 'Mediana': return 'bg-yellow-100 text-yellow-800';
      case 'Grande': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getLevelClass(level?: string): string {
    switch (level) {
      case 'Transformador': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Avanzado': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermedio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Básico': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Incipiente': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  open(id: string){
    this.selectedId.set(id);
    this.isOpen.set(true);
    
    // Buscar la empresa en los datos cargados
    const empresas = this.empresasSig();
    const empresaRow = empresas.find(e => e.id === id);
    if (empresaRow) {
      // Cargar los datos completos del diagnóstico
      // Por ahora, necesitaríamos un método en el servicio para obtener por ID
      // Simulamos con los datos que tenemos
      console.log('Abriendo diagnóstico de empresa:', empresaRow);
      // this.selectedEmpresaSig.set(empresaCompleta);
    }
  }

  close(){
    this.isOpen.set(false);
    this.selectedId.set(null);
    this.selectedEmpresaSig.set(null);
  }

  selectedFecha = computed(() => this.selectedEmpresa()?.metadata?.fecha ? new Date(this.selectedEmpresa()!.metadata.fecha) : null);

  // Métodos para búsqueda
  onSearchChange() {
    this.page.set(1); // Reset a la primera página al buscar
  }

  // Métodos para eliminación
  deleteEmpresa(id: string) {
    this.empresaToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  async confirmDelete() {
    const id = this.empresaToDelete();
    if (!id) return;

    try {
      // Aquí necesitaríamos implementar un método de eliminación en el servicio
      // await this.diagnosticsService.deleteEmpresaDiagnostic(id);
      console.log('Eliminando diagnóstico de empresa:', id);
      this.loadEmpresas(); // Recargar la lista
      this.loadStats(); // Recargar estadísticas
      this.notificationService.success('Diagnóstico eliminado', 'El diagnóstico se ha eliminado correctamente');
    } catch (error: any) {
      console.error('❌ Error eliminando diagnóstico:', error);
      this.notificationService.error('Error al eliminar', 'No se pudo eliminar el diagnóstico');
    } finally {
      this.cancelDelete();
    }
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.empresaToDelete.set(null);
  }
}
