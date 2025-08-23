import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Firestore, collection, collectionData, orderBy, query, doc, docData } from '@angular/fire/firestore';
import { Router, RouterLink } from '@angular/router';
import { UiModalComponent } from '../../shared/ui-kit/modal/modal';
import { PdfService } from '../../features/diagnostico/services/pdf.service';
import { Subscription } from 'rxjs';

interface DiagnosticRow {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  fecha?: any;
}

@Component({
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DatePipe, RouterLink, UiModalComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Diagnóstico · Leads</h1>
    </div>

    <div class="border rounded overflow-hidden">
      <div class="grid grid-cols-12 bg-[var(--panel)]/50 p-3 text-sm font-medium">
        <div class="col-span-3">Nombre</div>
        <div class="col-span-3">Email</div>
        <div class="col-span-3">Empresa</div>
        <div class="col-span-2">Fecha</div>
        <div class="col-span-1 text-right">Acción</div>
      </div>
      <div *ngFor="let d of paged()" class="grid grid-cols-12 p-3 border-t items-center text-sm">
        <div class="col-span-3 truncate">{{ d.nombre }}</div>
        <div class="col-span-3 truncate">{{ d.email }}</div>
        <div class="col-span-3 truncate">{{ d.empresa || '-' }}</div>
        <div class="col-span-2">{{ d.fecha | date: 'short' }}</div>
        <div class="col-span-1 text-right">
          <button class="btn" (click)="open(d.id)">Ver</button>
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
            <div class="text-sm text-[var(--muted)] mb-2">Contexto</div>
            <div class="grid md:grid-cols-2 gap-2">
              <div *ngFor="let kv of contextoEntries()" class="flex items-center justify-between gap-4 rounded border border-[var(--border)] px-3 py-2">
                <div class="text-sm text-[var(--muted)] truncate">{{ kv.key }}</div>
                <div class="text-sm font-medium truncate">{{ kv.value ?? '-' }}</div>
              </div>
            </div>
          </div>

          <!-- ARES (respuestas) -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm text-[var(--muted)]">ARES · Respuestas</div>
              <div class="text-xs text-[var(--muted)]">Total: {{ aresCount() }}</div>
            </div>
            <div class="max-h-72 overflow-auto border border-[var(--border)] rounded">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-0">
                <div *ngFor="let kv of aresEntries()" class="flex items-center justify-between gap-3 px-3 py-2 border-t border-[var(--border)]">
                  <div class="text-xs text-[var(--muted)] truncate">{{ kv.key }}</div>
                  <div class="text-sm font-medium">{{ kv.value ?? '-' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Competencias -->
          <div>
            <div class="text-sm text-[var(--muted)] mb-2">Competencias · Niveles</div>
            <div class="grid md:grid-cols-2 gap-2">
              <div *ngFor="let kv of competenciasEntries()" class="flex items-center justify-between gap-4 rounded border border-[var(--border)] px-3 py-2">
                <div class="text-sm text-[var(--muted)] truncate">{{ kv.key }}</div>
                <div class="text-sm font-medium truncate">{{ kv.value ?? '-' }}</div>
              </div>
            </div>
          </div>

          <!-- Resumen ejecutivo (si existe) -->
          <div *ngIf="selected()?.report?.resumen_ejecutivo as resumen">
            <div class="text-sm text-[var(--muted)] mb-2">Resumen ejecutivo</div>
            <div class="prose prose-sm max-w-none text-[var(--fg)]">{{ resumen }}</div>
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

  @ViewChild('printArea') printArea?: ElementRef<HTMLElement>;

  page = signal(1);
  pageSize = 20;
  lang = signal('es');

  private readonly rowsSig = signal<DiagnosticRow[]>([]);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.rowsSig().length / this.pageSize)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.rowsSig().slice(start, start + this.pageSize);
  });

  isOpen = signal(false);
  selectedId = signal<string | null>(null);
  private selectedSub?: Subscription;
  private readonly selectedSig = signal<any | null>(null);
  selected = this.selectedSig;

  constructor(){
    const col = collection(this.db, 'diagnostics');
    const q = query(col, orderBy('timestamp', 'desc'));
    collectionData(q, { idField: 'id' }).subscribe((docs: any[]) => {
      const mapped = (docs || []).map((d) => {
        const lead = d?.lead || d?.diagnosticData?.lead || d?.form?.lead || {};
        return {
          id: d.id,
          nombre: lead?.nombre || lead?.name || '',
          email: lead?.email || '',
          empresa: lead?.empresa || lead?.company || '',
          fecha: d?.fecha?.toDate?.() || d?.timestamp?.toDate?.() || null,
        } as DiagnosticRow;
      });
      this.rowsSig.set(mapped);
    });
  }

  prev(){ if (this.page() > 1) this.page.set(this.page() - 1); }
  next(){ if (this.page() < this.totalPages()) this.page.set(this.page() + 1); }

  open(id: string){
    this.selectedId.set(id);
    this.isOpen.set(true);
    if (this.selectedSub) {
      this.selectedSub.unsubscribe();
      this.selectedSub = undefined;
    }
    const ref = doc(this.db, 'diagnostics', id);
    this.selectedSub = docData(ref, { idField: 'id' }).subscribe((data: any) => {
      this.selectedSig.set(data || null);
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

  // Helpers para acceder a campos en ubicaciones alternativas
  private leadObj(): any {
    const d = this.selected();
    return d?.lead || d?.diagnosticData?.lead || d?.form?.lead || null;
  }
  leadNombre(): string | null { return this.leadObj()?.nombre || this.leadObj()?.name || null; }
  leadEmail(): string | null { return this.leadObj()?.email || null; }
  leadTelefono(): string | null { return this.leadObj()?.telefono || null; }
  leadAceptaComunicaciones(): boolean { return !!this.leadObj()?.aceptaComunicaciones; }

  private formObj(): any {
    const d = this.selected();
    return d?.form || d?.diagnosticData || null;
  }
  formSegmento(): string | null { return this.formObj()?.segmento || null; }
  formObjetivo(): string | null { return this.formObj()?.objetivo || null; }
  selectedFecha(): Date | null {
    const d = this.selected();
    return d?.fecha?.toDate?.() || d?.timestamp?.toDate?.() || d?.fecha || d?.timestamp || null;
  }
  contextoEntries(): { key: string, value: any }[] {
    const ctx = this.formObj()?.contexto || {};
    return Object.keys(ctx || {}).map(k => ({ key: k, value: ctx[k] }));
    }
  aresEntries(): { key: string, value: any }[] {
    const res = this.formObj()?.ares?.respuestas || {};
    return Object.keys(res || {}).map(k => ({ key: k, value: res[k] }));
  }
  aresCount(): number { return this.aresEntries().length; }
  competenciasEntries(): { key: string, value: any }[] {
    const niveles = this.formObj()?.competencias?.niveles || {};
    return Object.keys(niveles || {}).map(k => ({ key: k, value: niveles[k] }));
  }
}


