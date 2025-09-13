import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Firestore, collection, collectionData, orderBy, query, doc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UiModalComponent } from '../../shared/ui-kit/modal/modal';
import { PdfService } from '../../features/diagnostico/services/pdf.service';
import { LeadsService } from '../../core/services/leads.service';
import { LeadData, LeadType } from '../../features/diagnostico/data/diagnostic.models';
import { Subscription } from 'rxjs';

interface DiagnosticRow {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  fecha?: any;
  tipo?: LeadType;
  telefono?: string;
  estado?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DatePipe, UiModalComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Leads · Diagnósticos</h1>
      <div class="flex gap-2">
        <button class="btn btn-sm" (click)="filterByType('all')" [class.btn-primary]="currentFilter() === 'all'">Todos</button>
        <button class="btn btn-sm" (click)="filterByType('persona_natural')" [class.btn-primary]="currentFilter() === 'persona_natural'">Personas</button>
        <button class="btn btn-sm" (click)="filterByType('empresa')" [class.btn-primary]="currentFilter() === 'empresa'">Empresas</button>
      </div>
    </div>

    <div class="border rounded overflow-hidden">
      <div class="grid grid-cols-12 bg-[var(--panel)]/50 p-3 text-sm font-medium">
        <div class="col-span-2">Tipo</div>
        <div class="col-span-2">Nombre</div>
        <div class="col-span-2">Email</div>
        <div class="col-span-2">Empresa</div>
        <div class="col-span-2">Estado</div>
        <div class="col-span-1">Fecha</div>
        <div class="col-span-1 text-right">Acción</div>
      </div>
      <div *ngFor="let d of filteredLeads()" class="grid grid-cols-12 p-3 border-t items-center text-sm">
        <div class="col-span-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                [class]="d.tipo === 'empresa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
            {{ d.tipo === 'empresa' ? '🏢 Empresa' : '👤 Persona' }}
          </span>
        </div>
        <div class="col-span-2 truncate">{{ d.nombre }}</div>
        <div class="col-span-2 truncate">{{ d.email }}</div>
        <div class="col-span-2 truncate">{{ d.empresa || '-' }}</div>
        <div class="col-span-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                [class]="getStatusClass(d.estado)">
            {{ getStatusLabel(d.estado) }}
          </span>
        </div>
        <div class="col-span-1">{{ d.fecha | date: 'short' }}</div>
        <div class="col-span-1 text-right">
          <button class="btn btn-sm" (click)="open(d.id)">Ver</button>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-2">
      <button class="btn" (click)="prev()" [disabled]="page() === 1">Anterior</button>
      <div>Página {{ page() }} / {{ totalPages() }}</div>
      <button class="btn" (click)="next()" [disabled]="page() >= totalPages()">Siguiente</button>
    </div>

    <!-- Modal Detalle Diagnóstico -->
    <app-ui-modal [isOpen]="isOpen()" size="xl" (close)="close()">
      <div slot="header" class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="text-lg font-semibold truncate">{{ leadNombre() || 'Detalle del diagnóstico' }}</div>
          <div class="text-sm text-[var(--muted)]">{{ selectedFecha() | date: 'medium' }}</div>
        </div>
        <button class="btn" (click)="downloadPdf()" [disabled]="!canDownloadPdf()">Descargar PDF</button>
      </div>
      <div slot="body">
        <div #printArea class="space-y-6">
          <!-- Datos del Lead -->
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-[var(--muted)]">Tipo</div>
              <div class="font-medium">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      [class]="leadTipo() === 'empresa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ leadTipo() === 'empresa' ? '🏢 Empresa' : '👤 Persona Natural' }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Estado</div>
              <div class="font-medium">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      [class]="getStatusClass(leadEstado())">
                  {{ getStatusLabel(leadEstado()) }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Nombre</div>
              <div class="font-medium">{{ leadNombre() || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Email</div>
              <div class="font-medium">{{ leadEmail() || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Teléfono</div>
              <div class="font-medium">{{ leadTelefono() || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Comunicaciones</div>
              <div class="font-medium">{{ leadAceptaComunicaciones() ? 'Sí' : 'No' }}</div>
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Empresa</div>
              <div class="font-medium">{{ leadEmpresa() || '-' }}</div>
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Cargo</div>
              <div class="font-medium">{{ leadCargo() || '-' }}</div>
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Industria</div>
              <div class="font-medium">{{ leadIndustria() || '-' }}</div>
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Tamaño Empresa</div>
              <div class="font-medium">{{ leadTamanoEmpresa() || '-' }}</div>
            </div>
          </div>

          <!-- Metadatos -->
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-[var(--muted)]">Segmento</div>
              <div class="font-medium">{{ formSegmento() || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Objetivo</div>
              <div class="font-medium">{{ formObjetivo() || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Fecha</div>
              <div class="font-medium">{{ selectedFecha() | date: 'medium' }}</div>
            </div>
          </div>

          <!-- Contexto -->
          <div>
            <div class="text-sm text-[var(--muted)] mb-2">Contexto Profesional</div>
            <div class="grid md:grid-cols-2 gap-2">
              <div *ngFor="let kv of contextoEntries()" class="flex items-center justify-between gap-4 rounded border border-[var(--border)] px-3 py-2">
                <div class="text-sm text-[var(--muted)] truncate">{{ kv.key }}</div>
                <div class="text-sm font-medium truncate">{{ kv.value ?? '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Objetivos -->
          <div>
            <div class="text-sm text-[var(--muted)] mb-2">Objetivos del Cliente</div>
            <div class="rounded border border-[var(--border)] px-3 py-2">
              <div class="text-sm font-medium">{{ formObjetivo() || 'No especificado' }}</div>
            </div>
          </div>

          <!-- ARES (respuestas) -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm text-[var(--muted)]">ARES · Evaluación de Madurez en IA</div>
              <div class="text-xs text-[var(--muted)]">Total: {{ aresCount() }} preguntas</div>
            </div>
            <div class="max-h-72 overflow-auto border border-[var(--border)] rounded">
              <div class="grid grid-cols-1 gap-0">
                <div *ngFor="let kv of aresEntries()" class="flex items-center justify-between gap-3 px-3 py-2 border-t border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div class="text-sm text-[var(--muted)] flex-1">{{ kv.key }}</div>
                  <div class="text-sm font-medium text-right min-w-[60px]">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [class]="getScoreClass(kv.value)">
                      {{ kv.value ?? '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Competencias -->
          <div>
            <div class="text-sm text-[var(--muted)] mb-2">Competencias en IA · Evaluación</div>
            <div class="max-h-72 overflow-auto border border-[var(--border)] rounded">
              <div class="grid grid-cols-1 gap-0">
                <div *ngFor="let kv of competenciasEntries()" class="flex items-center justify-between gap-3 px-3 py-2 border-t border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div class="text-sm text-[var(--muted)] flex-1">{{ kv.key }}</div>
                  <div class="text-sm font-medium text-right min-w-[60px]">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [class]="getScoreClass(kv.value)">
                      {{ kv.value ?? '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen ejecutivo (si existe) -->
          <div *ngIf="selected()?.diagnosticData?.report?.resumen_ejecutivo as resumen">
            <div class="text-sm text-[var(--muted)] mb-2">Resumen Ejecutivo</div>
            <div class="prose prose-sm max-w-none text-[var(--fg)] bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-[var(--border)]">
              {{ resumen }}
            </div>
          </div>

          <!-- Notas del administrador -->
          <div *ngIf="selected()?.notes">
            <div class="text-sm text-[var(--muted)] mb-2">Notas del Administrador</div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div class="text-sm text-yellow-800 dark:text-yellow-200">{{ selected()?.notes }}</div>
            </div>
          </div>
        </div>
      </div>
    </app-ui-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDiagnosticLeadsComponent {
  private readonly db = inject(Firestore);
  private readonly router = inject(Router);
  private readonly pdfService = inject(PdfService);
  private readonly leadsService = inject(LeadsService);

  @ViewChild('printArea') printArea?: ElementRef<HTMLElement>;

  page = signal(1);
  pageSize = 20;
  lang = signal('es');
  currentFilter = signal<'all' | 'persona_natural' | 'empresa'>('all');

  private readonly rowsSig = signal<DiagnosticRow[]>([]);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.rowsSig().length / this.pageSize)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.rowsSig().slice(start, start + this.pageSize);
  });

  readonly filteredLeads = computed(() => {
    const leads = this.rowsSig();
    const filter = this.currentFilter();
    
    if (filter === 'all') {
      return leads;
    }
    
    return leads.filter(lead => lead.tipo === filter);
  });

  isOpen = signal(false);
  selectedId = signal<string | null>(null);
  private selectedSub?: Subscription;
  private readonly selectedSig = signal<any | null>(null);
  selected = this.selectedSig;

  constructor(){
    // Cargar leads desde la nueva colección
    this.leadsService.getLeads().subscribe((leads: LeadData[]) => {
      const mapped = leads.map((lead) => ({
        id: lead.id || '',
        nombre: lead.name,
        email: lead.email,
        empresa: lead.companyName || '',
        fecha: lead.createdAt,
        tipo: lead.type,
        telefono: lead.phone,
        estado: lead.status
      } as DiagnosticRow));
      this.rowsSig.set(mapped);
    });
  }

  prev(){ if (this.page() > 1) this.page.set(this.page() - 1); }
  next(){ if (this.page() < this.totalPages()) this.page.set(this.page() + 1); }

  filterByType(type: 'all' | 'persona_natural' | 'empresa') {
    this.currentFilter.set(type);
    this.page.set(1); // Reset a la primera página
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'nuevo': return 'bg-yellow-100 text-yellow-800';
      case 'contactado': return 'bg-blue-100 text-blue-800';
      case 'interesado': return 'bg-green-100 text-green-800';
      case 'no_interesado': return 'bg-red-100 text-red-800';
      case 'convertido': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'nuevo': return 'Nuevo';
      case 'contactado': return 'Contactado';
      case 'interesado': return 'Interesado';
      case 'no_interesado': return 'No Interesado';
      case 'convertido': return 'Convertido';
      default: return 'Desconocido';
    }
  }

  open(id: string){
    this.selectedId.set(id);
    this.isOpen.set(true);
    if (this.selectedSub) {
      this.selectedSub.unsubscribe();
      this.selectedSub = undefined;
    }
    // Cargar datos del lead desde la nueva colección
    this.leadsService.getLeadById(id).then((lead: LeadData | null) => {
      if (lead) {
        this.selectedSig.set(lead);
      }
    });
  }

  close(){
    this.isOpen.set(false);
    this.selectedId.set(null);
    this.selectedSig.set(null);
    if (this.selectedSub) {
      this.selectedSub.unsubscribe();
      this.selectedSub = undefined;
    }
  }

  // Métodos computados para extraer datos del lead
  leadNombre = computed(() => this.selected()?.name || '');
  leadEmail = computed(() => this.selected()?.email || '');
  leadTelefono = computed(() => this.selected()?.phone || '');
  leadTipo = computed(() => this.selected()?.type || '');
  leadEmpresa = computed(() => this.selected()?.companyName || '');
  leadCargo = computed(() => this.selected()?.position || '');
  leadIndustria = computed(() => this.selected()?.industry || '');
  leadTamanoEmpresa = computed(() => this.selected()?.companySize || '');
  leadAceptaComunicaciones = computed(() => this.selected()?.acceptsCommunications || false);
  leadEstado = computed(() => this.selected()?.status || '');
  selectedFecha = computed(() => this.selected()?.createdAt || null);

  canDownloadPdf(): boolean {
    const d = this.selected();
    return !!(d && d.report && d.scores && this.printArea?.nativeElement);
  }

  async downloadPdf(){
    const d = this.selected();
    const el = this.printArea?.nativeElement;
    if (!d || !d.report || !d.scores || !el) return;
    try {
      await this.pdfService.generateDiagnosticReport(d.report as any, d.scores, el);
    } catch {}
  }

  // Métodos para extraer datos del diagnóstico
  formSegmento = computed(() => {
    const d = this.selected();
    return d?.diagnosticData?.contexto?.industria || d?.diagnosticResponses?.contexto?.industria || '';
  });

  formObjetivo = computed(() => {
    const d = this.selected();
    return d?.diagnosticData?.objetivo?.objetivo?.join(', ') || d?.diagnosticResponses?.objetivo?.objetivo?.join(', ') || '';
  });

  contextoEntries = computed(() => {
    const d = this.selected();
    const contexto = d?.diagnosticData?.contexto || d?.diagnosticResponses?.contexto || {};
    return Object.entries(contexto).map(([key, value]) => ({
      key: this.getContextoLabel(key),
      value: Array.isArray(value) ? value.join(', ') : value
    }));
  });

  aresEntries = computed(() => {
    const d = this.selected();
    const ares = d?.diagnosticData?.ares || d?.diagnosticResponses?.ares || {};
    return Object.entries(ares).map(([key, value]) => ({
      key: this.getAresLabel(key),
      value: typeof value === 'object' && value !== null ? (value as any).value : value
    }));
  });

  aresCount = computed(() => this.aresEntries().length);

  competenciasEntries = computed(() => {
    const d = this.selected();
    const competencias = d?.diagnosticData?.competencias || d?.diagnosticResponses?.competencias || {};
    return Object.entries(competencias).map(([key, value]) => ({
      key: this.getCompetenciaLabel(key),
      value: typeof value === 'object' && value !== null ? (value as any).value : value
    }));
  });

  // Métodos helper para etiquetas
  private getContextoLabel(key: string): string {
    const labels: { [key: string]: string } = {
      'rol': 'Rol',
      'industria': 'Industria',
      'area': 'Área',
      'equipo': 'Equipo'
    };
    return labels[key] || key;
  }

  private getAresLabel(key: string): string {
    // Aquí puedes mapear las claves de ARES a etiquetas legibles
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getCompetenciaLabel(key: string): string {
    // Aquí puedes mapear las claves de competencias a etiquetas legibles
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getScoreClass(value: any): string {
    if (value === null || value === undefined || value === '-') {
      return 'bg-gray-100 text-gray-800';
    }
    
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'bg-gray-100 text-gray-800';
    }
    
    if (numValue >= 4) {
      return 'bg-green-100 text-green-800';
    } else if (numValue >= 3) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (numValue >= 2) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  }
}


