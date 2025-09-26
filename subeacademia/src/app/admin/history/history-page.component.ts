import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HistoryService } from '../../core/data/history.service';
import { HistoryEvent } from '../../core/models/history-event.model';
import { HistoryBulkUploadService, HistoryBulkUploadResult, HistoryBulkUploadProgress } from '../../core/services/history-bulk-upload.service';
import { ToastService } from '../../core/services/ui/toast/toast.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Historia</h1>
    <div class="flex gap-2 flex-wrap">
      <button class="btn btn-secondary" (click)="downloadCurrentStructure()">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Descargar JSON
      </button>
      <button class="btn btn-secondary" (click)="triggerJsonUpload()">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"></path>
        </svg>
        Cargar JSON
      </button>
      <button class="btn" (click)="openCreate()">Añadir hito</button>
    </div>
  </div>

  <!-- Input oculto para la carga de archivos -->
  <input 
    type="file" 
    class="hidden" 
    accept=".json"
    (change)="handleJsonFile($event)"
    #fileInput>

  <div class="overflow-x-auto border border-white/10 rounded-lg">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="text-left bg-white/5">
          <th class="p-3">Orden</th>
          <th class="p-3">Año</th>
          <th class="p-3">Título</th>
          <th class="p-3">Descripción</th>
          <th class="p-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let e of events()" class="border-t border-white/10">
          <td class="p-3">{{ e.order ?? 0 }}</td>
          <td class="p-3 font-medium">{{ e.year }}</td>
          <td class="p-3">{{ e.title }}</td>
          <td class="p-3 max-w-[480px] truncate" title="{{e.description}}">{{ e.description }}</td>
          <td class="p-3 text-right space-x-2">
            <button class="btn" (click)="openEdit(e)">Editar</button>
            <button class="btn btn-danger" (click)="remove(e)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div *ngIf="isOpen()" class="fixed inset-0 z-50 grid place-items-center">
    <div class="absolute inset-0 bg-black/50" (click)="close()"></div>
    <div class="relative bg-[var(--panel)] p-4 rounded-lg w-[min(600px,90vw)] max-h-[85vh] border border-white/10 overflow-y-auto">
      <h2 class="text-lg font-semibold mb-4">{{ editingId() ? 'Editar' : 'Añadir' }} hito</h2>
      <form [formGroup]="form" class="grid gap-3" (ngSubmit)="save()">
        <div class="grid md:grid-cols-3 gap-3">
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Orden</span>
            <input type="number" class="input" formControlName="order" />
          </label>
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Año</span>
            <input type="number" class="input" formControlName="year" />
          </label>
          <label class="grid gap-1">
            <span class="text-xs text-[var(--muted)]">Título</span>
            <input class="input" formControlName="title" />
          </label>
        </div>
        <label class="grid gap-1">
          <span class="text-xs text-[var(--muted)]">Descripción</span>
          <textarea rows="4" class="input" formControlName="description"></textarea>
        </label>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn" (click)="close()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</div>
  `
})
export class HistoryPageComponent {
  private fb = inject(FormBuilder);
  private svc = inject(HistoryService);
  private toast = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  events = signal<HistoryEvent[]>([]);
  isOpen = signal(false);
  editingId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    order: [0],
    year: [2024, [Validators.required]],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  constructor(){
    this.svc.list().subscribe(v => this.events.set(v));
  }

  openCreate(){ this.editingId.set(null); this.form.reset({ order:0, year:2024, title:'', description:'' }); this.isOpen.set(true); }
  openEdit(e: HistoryEvent){ this.editingId.set(e.id ?? null); this.form.patchValue(e as any); this.isOpen.set(true); }
  close(){ this.isOpen.set(false); }

  async save(){
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const id = this.editingId();
    if (id) await this.svc.update(id, val);
    else await this.svc.add(val);
    this.close();
  }
  async remove(e: HistoryEvent){ if (!e.id) return; if (confirm('¿Eliminar hito?')) await this.svc.delete(e.id); }

  // Método para descargar la estructura actual como JSON
  downloadCurrentStructure(): void {
    try {
      const currentEvents = this.events();
      
      // Crear la estructura de datos para exportar
      let exportData;
      
      if (currentEvents.length === 0) {
        // Si no hay eventos, crear estructura de ejemplo
        exportData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          description: 'Estructura de ejemplo para eventos de historia. Reemplaza los ejemplos con tus propios datos.',
          history: [
            {
              year: 2024,
              title: "Ejemplo: Lanzamiento de la plataforma",
              description: "Descripción detallada del evento de historia. Puedes escribir aquí toda la información relevante sobre este hito importante.",
              order: 1
            },
            {
              year: 2023,
              title: "Ejemplo: Desarrollo inicial del proyecto",
              description: "Otra descripción de ejemplo. Cada evento debe tener un año, título y descripción. El campo 'order' controla el orden de aparición.",
              order: 2
            },
            {
              year: 2022,
              title: "Ejemplo: Fundación de la empresa",
              description: "Tercer ejemplo de evento histórico. Puedes agregar tantos eventos como necesites. Recuerda que el año debe ser un número.",
              order: 3
            }
          ]
        };
      } else {
        // Si hay eventos, exportar los datos actuales
        exportData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          history: currentEvents.map(event => ({
            id: event.id,
            year: event.year,
            title: event.title,
            description: event.description,
            order: event.order || 0
          }))
        };
      }

      // Convertir a JSON con formato legible
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Crear y descargar el archivo
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre del archivo según si hay datos o es estructura de ejemplo
      const fileName = currentEvents.length === 0 
        ? `estructura-historia-ejemplo-${new Date().toISOString().split('T')[0]}.json`
        : `historia-completa-${new Date().toISOString().split('T')[0]}.json`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mensaje diferente según si hay datos o es estructura de ejemplo
      const message = currentEvents.length === 0 
        ? 'Se ha descargado la estructura de ejemplo. Puedes editarla y cargarla con tus propios datos.'
        : `Se ha descargado la estructura con ${currentEvents.length} eventos de historia`;
      
      this.toast.success(message);
      
    } catch (error: any) {
      console.error('Error al descargar la estructura:', error);
      this.toast.error(`Error al descargar la estructura: ${error.message}`);
    }
  }

  // Método para activar la carga de archivo JSON
  triggerJsonUpload(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  // Método para manejar la carga del archivo JSON
  async handleJsonFile(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    try {
      this.toast.info('Procesando archivo de historia...');
      
      // Leer el archivo
      const content = await this.readFileAsText(file);
      
      // Parsear JSON
      let historyData: any;
      try {
        historyData = JSON.parse(content);
      } catch (parseError) {
        throw new Error('El archivo no contiene un JSON válido');
      }

      // Validar estructura
      if (!this.validateHistoryStructure(historyData)) {
        throw new Error('El archivo JSON no tiene la estructura correcta de historia');
      }

      // Extraer los eventos de historia
      const events = Array.isArray(historyData.history) ? historyData.history : [historyData.history];
      
      // Procesar cada evento
      let successCount = 0;
      let errorCount = 0;
      
      for (const eventData of events) {
        try {
          if (eventData.id) {
            // Actualizar evento existente
            await this.svc.update(eventData.id, eventData);
          } else {
            // Crear nuevo evento
            await this.svc.add(eventData);
          }
          successCount++;
        } catch (eventError: any) {
          console.error(`Error procesando evento ${eventData.title || eventData.id}:`, eventError);
          errorCount++;
        }
      }

      // Mostrar resultado
      if (errorCount === 0) {
        this.toast.success(`Se han cargado ${successCount} eventos de historia exitosamente`);
      } else {
        this.toast.warning(`Se cargaron ${successCount} eventos, ${errorCount} con errores`);
      }

      // Recargar la lista
      this.svc.list().subscribe(v => this.events.set(v));
      
      // Limpiar el input
      target.value = '';
      
    } catch (error: any) {
      this.toast.error(`Error al procesar el archivo: ${error.message}`);
      target.value = '';
    }
  }

  // Función auxiliar para leer archivo como texto
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  }

  // Función para validar la estructura del JSON de historia
  private validateHistoryStructure(data: any): boolean {
    // Verificar que existe la propiedad history
    if (!data.history) {
      return false;
    }

    // Verificar que history es un array
    const events = Array.isArray(data.history) ? data.history : [data.history];
    
    // Validar cada evento
    return events.every((event: any) => 
      typeof event.year === 'number' &&
      typeof event.title === 'string' &&
      typeof event.description === 'string' &&
      event.title.trim().length > 0 &&
      event.description.trim().length > 0
    );
  }
}


