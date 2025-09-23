import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, orderBy, query, doc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UiModalComponent } from '../../shared/ui-kit/modal/modal';
import { ConfirmationModalComponent } from '../../shared/ui-kit/confirmation-modal/confirmation-modal.component';
import { ToastComponent } from '../../shared/ui-kit/toast/toast.component';
import { PdfService } from '../../features/diagnostico/services/pdf.service';
import { LeadsService } from '../../core/services/leads.service';
import { NotificationService } from '../../core/services/notification.service';
import { LeadData, LeadType } from '../../features/diagnostico/data/diagnostic.models';
import { ExtendedDiagnosticLead } from '../../core/models/lead.model';
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
  resumenNivel?: string;
  aresAvg?: number;
  competenciasAvg?: number;
  objetivoBreve?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe, UiModalComponent, ConfirmationModalComponent, ToastComponent, FormsModule],
  template: `
    <!-- Header con estadísticas -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold mb-4">Gestión de Leads</h1>
      <p class="text-[var(--muted)] mb-4">Administra los leads capturados desde el diagnóstico de IA</p>
      
      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="stats()">
        <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-[var(--muted)]">Total Leads</p>
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
              <p class="text-sm font-medium text-[var(--muted)]">Aceptan Comunicaciones</p>
              <p class="text-2xl font-semibold">{{ stats()?.acceptsCommunications || 0 }}</p>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-[var(--muted)]">Fuente</p>
              <p class="text-sm font-semibold">Diagnóstico</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y Acciones -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-2">
        <button class="btn btn-sm" (click)="filterByType('all')" [class.btn-primary]="currentFilter() === 'all'">Todos</button>
        <button class="btn btn-sm" (click)="filterByType('persona_natural')" [class.btn-primary]="currentFilter() === 'persona_natural'">Personas</button>
        <button class="btn btn-sm" (click)="filterByType('empresa')" [class.btn-primary]="currentFilter() === 'empresa'">Empresas</button>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-warning" (click)="resetOldLeads()" [disabled]="isResetting()">
            <svg *ngIf="!isResetting()" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <div *ngIf="isResetting()" class="loading loading-spinner loading-xs mr-1"></div>
            {{ isResetting() ? 'Limpiando...' : 'Limpiar Leads Antiguos' }}
          </button>
          <input type="text" placeholder="Buscar por nombre o email..." 
                 [(ngModel)]="searchTerm" 
                 (input)="onSearchChange()"
                 class="input input-sm w-64">
        </div>
      </div>
    </div>

    <!-- Tabla de leads mejorada -->
    <div class="border rounded overflow-hidden">
      <div class="grid grid-cols-16 bg-[var(--panel)]/50 p-3 text-sm font-medium">
        <div class="col-span-1">Tipo</div>
        <div class="col-span-2">Nombre</div>
        <div class="col-span-2">Email</div>
        <div class="col-span-2">Empresa</div>
        <div class="col-span-1">Nivel</div>
        <div class="col-span-1">ARES</div>
        <div class="col-span-2">Respuestas Clave</div>
        <div class="col-span-2">Estado</div>
        <div class="col-span-1">Fecha</div>
        <div class="col-span-2 text-right">Acciones</div>
      </div>
      <div *ngFor="let d of filteredLeads()" class="grid grid-cols-16 p-3 border-t items-center text-sm hover:bg-[var(--panel)]/30">
        <div class="col-span-1">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                [class]="d.tipo === 'empresa' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
            {{ d.tipo === 'empresa' ? '🏢' : '👤' }}
          </span>
        </div>
        <div class="col-span-2 truncate font-medium">{{ d.nombre }}</div>
        <div class="col-span-2 truncate text-[var(--muted)]">{{ d.email }}</div>
        <div class="col-span-2 truncate">{{ d.empresa || '-' }}</div>
        <div class="col-span-1">
          <div class="flex flex-col items-center gap-1">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [class]="getMaturityLevelClass(d.aresAvg)">
              {{ d.resumenNivel || '-' }}
            </span>
            <div class="text-xs text-[var(--muted)]">
              {{ getMaturityLevelIcon(d.aresAvg) }}
            </div>
          </div>
        </div>
        <div class="col-span-1">
          <div class="flex items-center gap-1">
            <div class="text-sm font-medium">{{ (d.aresAvg || 0) }}/5</div>
            <div class="w-8 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div class="h-1 rounded-full transition-all duration-300" 
                   [class]="getProgressBarClass(d.aresAvg)"
                   [style.width.%]="(d.aresAvg || 0) * 20"></div>
            </div>
          </div>
        </div>
        <div class="col-span-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <div class="text-xs text-[var(--muted)]">
                <span class="font-medium">{{ getKeyResponsesCount(d) }}</span> respuestas
              </div>
              <div class="w-2 h-2 rounded-full" [class]="getDiagnosticStatusClass(d)"></div>
            </div>
            <div class="text-xs">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                    [class]="getCompetencyLevelClass(d.competenciasAvg)">
                {{ getCompetencyLevel(d.competenciasAvg) }}
              </span>
            </div>
            <button class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 flex items-center gap-1"
                    (click)="toggleResponsePreview(d.id)">
              <span>{{ expandedResponses.has(d.id) ? 'Ocultar' : 'Ver respuestas' }}</span>
              <span>{{ expandedResponses.has(d.id) ? '👆' : '👇' }}</span>
            </button>
          </div>
        </div>
        <div class="col-span-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                [class]="getStatusClass(d.estado)">
            {{ getStatusLabel(d.estado) }}
          </span>
        </div>
        <div class="col-span-1 text-xs text-[var(--muted)]">{{ d.fecha | date: 'short' }}</div>
        <div class="col-span-2 text-right">
          <div class="flex gap-1 flex-wrap">
            <button class="btn btn-xs btn-primary" (click)="viewDiagnosticDetails(d.id)" title="Ver respuestas del diagnóstico">
              📊 Diagnóstico
            </button>
            <button class="btn btn-xs btn-outline" (click)="open(d.id)" title="Ver detalles completos">
              👁️ Ver
            </button>
            <button class="btn btn-xs btn-outline" (click)="editLead(d.id)" title="Editar lead">
              ✏️ Editar
            </button>
            <button class="btn btn-xs btn-error" (click)="deleteLead(d.id)" title="Eliminar lead">
              🗑️
            </button>
          </div>
        </div>
        
        <!-- Fila expandible con respuestas del diagnóstico -->
        <div *ngIf="expandedResponses.has(d.id)" class="col-span-16 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Resumen ARES -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 class="font-semibold text-sm mb-3 text-blue-800 dark:text-blue-200">📊 Evaluación ARES</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-600 dark:text-gray-400">Puntuación General:</span>
                  <span class="font-medium">{{ d.aresAvg || 0 }}/5</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-600 dark:text-gray-400">Nivel de Madurez:</span>
                  <span class="font-medium">{{ d.resumenNivel || 'N/A' }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div class="h-1.5 rounded-full transition-all duration-300" 
                       [class]="getProgressBarClass(d.aresAvg)"
                       [style.width.%]="(d.aresAvg || 0) * 20"></div>
                </div>
              </div>
            </div>
            
            <!-- Resumen Competencias -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 class="font-semibold text-sm mb-3 text-green-800 dark:text-green-200">🎯 Competencias en IA</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-600 dark:text-gray-400">Puntuación Promedio:</span>
                  <span class="font-medium">{{ d.competenciasAvg || 0 }}/5</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-600 dark:text-gray-400">Nivel de Competencia:</span>
                  <span class="font-medium">{{ getCompetencyLevel(d.competenciasAvg) }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div class="h-1.5 rounded-full transition-all duration-300" 
                       [class]="getProgressBarClass(d.competenciasAvg)"
                       [style.width.%]="(d.competenciasAvg || 0) * 20"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Acciones rápidas -->
          <div class="mt-4 flex gap-2 justify-end">
            <button class="btn btn-xs btn-primary" (click)="viewDiagnosticDetails(d.id)">
              📊 Ver Diagnóstico Completo
            </button>
            <button class="btn btn-xs btn-outline" (click)="open(d.id)">
              👁️ Ver Detalles
            </button>
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
          <div class="text-lg font-semibold truncate">{{ leadNombre() || 'Detalle del diagnóstico' }}</div>
          <div class="text-sm text-[var(--muted)]">{{ selectedFecha() | date: 'medium' }}</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm" (click)="downloadPdf()" [disabled]="!canDownloadPdf()">Descargar PDF</button>
          <button class="btn btn-sm btn-outline" (click)="toggleEditMode()">
            {{ isEditMode() ? 'Cancelar' : 'Editar' }}
          </button>
        </div>
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
              <div class="font-medium" *ngIf="!isEditMode()">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      [class]="getStatusClass(leadEstado())">
                  {{ getStatusLabel(leadEstado()) }}
                </span>
              </div>
              <select *ngIf="isEditMode()" [(ngModel)]="editForm().status" class="select select-sm w-full">
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="interesado">Interesado</option>
                <option value="no_interesado">No Interesado</option>
                <option value="convertido">Convertido</option>
              </select>
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Nombre</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadNombre() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().name" class="input input-sm w-full" placeholder="Nombre">
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Email</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadEmail() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().email" class="input input-sm w-full" placeholder="Email">
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Teléfono</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadTelefono() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().phone" class="input input-sm w-full" placeholder="Teléfono">
            </div>
            <div>
              <div class="text-sm text-[var(--muted)]">Comunicaciones</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadAceptaComunicaciones() ? 'Sí' : 'No' }}</div>
              <label class="flex items-center gap-2" *ngIf="isEditMode()">
                <input type="checkbox" [(ngModel)]="editForm().acceptsCommunications" class="checkbox checkbox-sm">
                <span class="text-sm">Acepta comunicaciones</span>
              </label>
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Empresa</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadEmpresa() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().companyName" class="input input-sm w-full" placeholder="Empresa">
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Cargo</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadCargo() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().position" class="input input-sm w-full" placeholder="Cargo">
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Industria</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadIndustria() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().industry" class="input input-sm w-full" placeholder="Industria">
            </div>
            <div *ngIf="leadTipo() === 'empresa'">
              <div class="text-sm text-[var(--muted)]">Tamaño Empresa</div>
              <div class="font-medium" *ngIf="!isEditMode()">{{ leadTamanoEmpresa() || '-' }}</div>
              <input *ngIf="isEditMode()" [(ngModel)]="editForm().companySize" class="input input-sm w-full" placeholder="Tamaño">
            </div>
          </div>

          <!-- Notas del administrador -->
          <div>
            <div class="text-sm text-[var(--muted)] mb-2">Notas del Administrador</div>
            <div *ngIf="!isEditMode()" class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div class="text-sm text-yellow-800 dark:text-yellow-200">{{ selected()?.notes || 'Sin notas' }}</div>
            </div>
            <textarea *ngIf="isEditMode()" 
                      [(ngModel)]="editForm().notes" 
                      class="textarea textarea-sm w-full" 
                      placeholder="Agregar notas sobre este lead..."
                      rows="3"></textarea>
          </div>

          <!-- Botones de acción en modo edición -->
          <div *ngIf="isEditMode()" class="flex gap-2 pt-4 border-t">
            <button class="btn btn-sm btn-primary" (click)="saveChanges()" [disabled]="isSaving()">
              {{ isSaving() ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button class="btn btn-sm btn-outline" (click)="cancelEdit()">Cancelar</button>
          </div>

          <!-- Resumen Ejecutivo del Diagnóstico -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100">Resumen del Diagnóstico</h3>
                <p class="text-sm text-blue-700 dark:text-blue-300">Evaluación completa de madurez en IA</p>
              </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ getGeneralAresScore() }}/5</div>
                <div class="text-sm text-blue-700 dark:text-blue-300">Puntuación ARES</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ getGeneralCompetenciesScore() }}/5</div>
                <div class="text-sm text-blue-700 dark:text-blue-300">Competencias</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ getMaturityLevel() }}</div>
                <div class="text-sm text-blue-700 dark:text-blue-300">Nivel de Madurez</div>
              </div>
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
            <div class="flex items-center justify-between mb-4">
              <div class="text-lg font-semibold text-[var(--fg)]">📊 ARES · Evaluación de Madurez en IA</div>
              <div class="text-sm text-[var(--muted)] bg-[var(--panel)] px-3 py-1 rounded-full">
                {{ aresCount() }} preguntas evaluadas
              </div>
            </div>
            
            <!-- Resumen de puntuaciones ARES -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
                <div class="text-sm text-[var(--muted)] mb-1">Puntuación General</div>
                <div class="text-2xl font-bold" [class]="getGeneralScoreClass()">
                  {{ getGeneralAresScore() }}/5
                </div>
              </div>
              <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
                <div class="text-sm text-[var(--muted)] mb-1">Nivel de Madurez</div>
                <div class="text-lg font-semibold" [class]="getModalMaturityLevelClass()">
                  {{ getMaturityLevel() }}
                </div>
              </div>
              <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
                <div class="text-sm text-[var(--muted)] mb-1">Progreso</div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-300" 
                       [class]="getModalProgressBarClass()"
                       [style.width.%]="getProgressPercentage()"></div>
                </div>
                <div class="text-xs text-[var(--muted)] mt-1">{{ getProgressPercentage() }}% completado</div>
              </div>
            </div>

            <!-- Detalle de respuestas ARES -->
            <div class="max-h-80 overflow-auto border border-[var(--border)] rounded-lg">
              <div class="divide-y divide-[var(--border)]">
                <div *ngFor="let kv of aresEntries(); let i = index" 
                     class="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--panel)]/50 transition-colors">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-[var(--fg)] truncate">{{ kv.key }}</div>
                    <div class="text-xs text-[var(--muted)] mt-1">Pregunta {{ i + 1 }}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-medium text-[var(--muted)]">
                      {{ kv.value ?? '-' }}/5
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [class]="getScoreClass(kv.value)">
                      {{ getScoreLabel(kv.value) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Competencias -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="text-lg font-semibold text-[var(--fg)]">🎯 Competencias en IA · Evaluación</div>
              <div class="text-sm text-[var(--muted)] bg-[var(--panel)] px-3 py-1 rounded-full">
                {{ competenciasEntries().length }} competencias evaluadas
              </div>
            </div>

            <!-- Resumen de competencias -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
                <div class="text-sm text-[var(--muted)] mb-1">Puntuación Promedio</div>
                <div class="text-2xl font-bold" [class]="getGeneralScoreClass()">
                  {{ getGeneralCompetenciesScore() }}/5
                </div>
              </div>
              <div class="bg-[var(--panel)] rounded-lg p-4 border border-[var(--border)]">
                <div class="text-sm text-[var(--muted)] mb-1">Nivel de Competencia</div>
                <div class="text-lg font-semibold" [class]="getModalMaturityLevelClass()">
                  {{ getModalCompetencyLevel() }}
                </div>
              </div>
            </div>

            <!-- Detalle de competencias -->
            <div class="max-h-80 overflow-auto border border-[var(--border)] rounded-lg">
              <div class="divide-y divide-[var(--border)]">
                <div *ngFor="let kv of competenciasEntries(); let i = index" 
                     class="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--panel)]/50 transition-colors">
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-[var(--fg)] truncate">{{ kv.key }}</div>
                    <div class="text-xs text-[var(--muted)] mt-1">Competencia {{ i + 1 }}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="text-sm font-medium text-[var(--muted)]">
                      {{ kv.value ?? '-' }}/5
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          [class]="getScoreClass(kv.value)">
                      {{ getScoreLabel(kv.value) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen ejecutivo y recomendaciones (si existe) -->
          <div *ngIf="selected()?.diagnosticData?.report?.resumen_ejecutivo as resumen">
            <div class="text-lg font-semibold mb-4">Resumen del Diagnóstico de IA</div>
            <div class="prose prose-sm max-w-none text-[var(--fg)] bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
              <h4 class="text-blue-800 dark:text-blue-200 font-semibold mb-2">Resumen Ejecutivo</h4>
              <p class="text-blue-700 dark:text-blue-300">{{ resumen }}</p>
            </div>
          </div>

          <!-- Plan de Acción y Recomendaciones -->
          <div *ngIf="selected()?.diagnosticData?.report?.plan_accion">
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
              <h4 class="text-green-800 dark:text-green-200 font-semibold mb-2">Plan de Acción Recomendado</h4>
              <div class="text-green-700 dark:text-green-300 text-sm" [innerHTML]="selected()?.diagnosticData?.report?.plan_accion"></div>
            </div>
          </div>

          <!-- Fortalezas y Oportunidades -->
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div *ngIf="selected()?.diagnosticData?.report?.fortalezas" class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 class="text-green-800 dark:text-green-200 font-semibold mb-2">🎯 Fortalezas Identificadas</h4>
              <div class="text-green-700 dark:text-green-300 text-sm" [innerHTML]="selected()?.diagnosticData?.report?.fortalezas"></div>
            </div>
            <div *ngIf="selected()?.diagnosticData?.report?.oportunidades" class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 class="text-orange-800 dark:text-orange-200 font-semibold mb-2">🚀 Oportunidades de Mejora</h4>
              <div class="text-orange-700 dark:text-orange-300 text-sm" [innerHTML]="selected()?.diagnosticData?.report?.oportunidades"></div>
            </div>
          </div>

          <!-- Información comercial relevante -->
          <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 class="text-purple-800 dark:text-purple-200 font-semibold mb-3">💼 Información Comercial</h4>
            <div class="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-purple-600 dark:text-purple-400 font-medium">Nivel de Madurez:</span>
                <span class="ml-2 text-purple-800 dark:text-purple-200">{{ getMaturityLevel() }}</span>
              </div>
              <div>
                <span class="text-purple-600 dark:text-purple-400 font-medium">Puntuación General:</span>
                <span class="ml-2 text-purple-800 dark:text-purple-200">{{ getGeneralAresScore() }}/5</span>
              </div>
              <div *ngIf="leadTipo() === 'empresa'">
                <span class="text-purple-600 dark:text-purple-400 font-medium">Industria:</span>
                <span class="ml-2 text-purple-800 dark:text-purple-200">{{ leadIndustria() || 'No especificada' }}</span>
              </div>
              <div *ngIf="leadTipo() === 'empresa'">
                <span class="text-purple-600 dark:text-purple-400 font-medium">Tamaño:</span>
                <span class="ml-2 text-purple-800 dark:text-purple-200">{{ leadTamanoEmpresa() || 'No especificado' }}</span>
              </div>
            </div>
            <div class="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p class="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                💡 <strong>Oportunidad Comercial:</strong> Basado en el nivel {{ getMaturityLevel() }} y las respuestas del diagnóstico, 
                este lead podría estar interesado en {{ getCommercialSuggestion() }}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </app-ui-modal>

    <!-- Modal de Confirmación -->
    <app-confirmation-modal 
      [isOpen]="showDeleteConfirm()"
      title="Eliminar Lead"
      message="¿Estás seguro de que quieres eliminar este lead? Esta acción no se puede deshacer."
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
export class AdminDiagnosticLeadsComponent {
  private readonly db = inject(Firestore);
  private readonly router = inject(Router);
  private readonly pdfService = inject(PdfService);
  private readonly leadsService = inject(LeadsService);
  private readonly notificationService = inject(NotificationService);

  @ViewChild('printArea') printArea?: ElementRef<HTMLElement>;
  @ViewChild('toastComponent') toastComponent?: ToastComponent;

  page = signal(1);
  pageSize = 20;
  lang = signal('es');
  currentFilter = signal<'all' | 'persona_natural' | 'empresa'>('all');
  searchTerm = '';
  stats = signal<any>(null);

  private readonly rowsSig = signal<DiagnosticRow[]>([]);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.rowsSig().length / this.pageSize)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.rowsSig().slice(start, start + this.pageSize);
  });

  readonly filteredLeads = computed(() => {
    let leads = this.rowsSig();
    const filter = this.currentFilter();
    
    // Filtrar por tipo
    if (filter !== 'all') {
      leads = leads.filter(lead => lead.tipo === filter);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      leads = leads.filter(lead => 
        lead.nombre.toLowerCase().includes(term) || 
        lead.email.toLowerCase().includes(term)
      );
    }
    
    return leads;
  });

  isOpen = signal(false);
  selectedId = signal<string | null>(null);
  private selectedSub?: Subscription;
  private readonly selectedSig = signal<any | null>(null);
  selected = this.selectedSig;

  // Estados para edición
  isEditMode = signal(false);
  isSaving = signal(false);
  editForm = signal({
    name: '',
    email: '',
    phone: '',
    status: 'nuevo' as LeadData['status'],
    acceptsCommunications: false,
    companyName: '',
    position: '',
    industry: '',
    companySize: '',
    notes: ''
  });

  // Estados para confirmación de eliminación
  showDeleteConfirm = signal(false);
  leadToDelete = signal<string | null>(null);

  // Estado para reseteo de leads antiguos
  isResetting = signal(false);

  // Estado para respuestas expandidas
  expandedResponses = new Set<string>();

  constructor(){
    this.testFirebaseConnection();
    this.loadLeads();
    this.loadStats();
  }

  private async testFirebaseConnection() {
    try {
      const isConnected = await this.leadsService.testConnection();
      if (!isConnected) {
        this.notificationService.warning('Conexión Firebase', 'Hay problemas de conectividad con la base de datos. Algunas funciones pueden no funcionar correctamente.');
      }
    } catch (error) {
      console.error('Error verificando conexión:', error);
    }
  }

  ngAfterViewInit() {
    // Inicializar el servicio de notificaciones
    if (this.toastComponent) {
      this.notificationService.setToastComponent(this.toastComponent);
    }
  }

  private loadLeads() {
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
        estado: lead.status,
        resumenNivel: (lead as any)?.summary?.maturityLevel || undefined,
        aresAvg: (lead as any)?.summary?.aresAverage || this.calcAresAvgFromLead(lead),
        competenciasAvg: (lead as any)?.summary?.competenciesAverage || this.calcCompetenciasAvgFromLead(lead),
        objetivoBreve: (lead.diagnosticResponses?.objetivo?.objetivo || [])?.[0] || ''
      } as DiagnosticRow));
      this.rowsSig.set(mapped);
    });
  }

  private calcAresAvgFromLead(lead: LeadData): number | undefined {
    const ares = lead?.diagnosticResponses?.ares || lead?.diagnosticData?.ares || undefined;
    if (!ares) return undefined;
    const values = Object.values(ares)
      .map((v: any) => (typeof v === 'object' && v !== null ? (v as any).value : v))
      .filter((n: any) => typeof n === 'number' && !isNaN(n));
    if (values.length === 0) return undefined;
    return Math.round((values.reduce((s, n) => s + n, 0) / values.length) * 10) / 10;
  }

  private calcCompetenciasAvgFromLead(lead: LeadData): number | undefined {
    const competencias = lead?.diagnosticResponses?.competencias || lead?.diagnosticData?.competencias || undefined;
    if (!competencias) return undefined;
    const values = Object.values(competencias)
      .map((v: any) => (typeof v === 'object' && v !== null ? (v as any).value : v))
      .filter((n: any) => typeof n === 'number' && !isNaN(n));
    if (values.length === 0) return undefined;
    return Math.round((values.reduce((s, n) => s + n, 0) / values.length) * 10) / 10;
  }

  private async loadStats() {
    try {
      const stats = await this.leadsService.getLeadsStats();
      this.stats.set(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
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

  // Nuevos métodos para la interfaz mejorada
  getMaturityLevelClass(score?: number): string {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-blue-100 text-blue-800';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
    if (score >= 1.5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  getProgressBarClass(score?: number): string {
    if (!score) return 'bg-gray-400';
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 3.5) return 'bg-blue-500';
    if (score >= 2.5) return 'bg-yellow-500';
    if (score >= 1.5) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getKeyResponsesCount(lead: DiagnosticRow): number {
    // Obtener el lead completo para contar las respuestas
    const fullLead = this.rowsSig().find(l => l.id === lead.id);
    if (!fullLead) return 0;
    
    // Buscar en la colección de leads para obtener los datos completos
    // Por ahora retornamos un valor estimado basado en los datos disponibles
    return lead.aresAvg ? Math.round(lead.aresAvg * 10) : 0;
  }

  getCompetencyLevelClass(score?: number): string {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-blue-100 text-blue-800';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
    if (score >= 1.5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  getCompetencyLevel(score?: number): string {
    if (!score) return 'N/A';
    if (score >= 4.5) return 'Avanzado';
    if (score >= 3.5) return 'Intermedio';
    if (score >= 2.5) return 'Básico';
    if (score >= 1.5) return 'Inicial';
    return 'Principiante';
  }

  // Métodos para el modal (sin parámetros)
  getModalMaturityLevelClass(): string {
    const score = this.getGeneralAresScore();
    return this.getMaturityLevelClass(score);
  }

  getModalProgressBarClass(): string {
    const percentage = this.getProgressPercentage();
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getModalCompetencyLevel(): string {
    const score = this.getGeneralCompetenciesScore();
    return this.getCompetencyLevel(score);
  }

  // Métodos adicionales que faltan
  getGeneralCompetenciesScore(): number {
    const competencias = this.selected()?.diagnosticData?.competencias || this.selected()?.diagnosticResponses?.competencias || {};
    const scores = Object.values(competencias).map((value: any) => 
      typeof value === 'object' && value !== null ? value.value : value
    ).filter(score => typeof score === 'number' && !isNaN(score));
    
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  }

  getProgressPercentage(): number {
    const ares = this.selected()?.diagnosticData?.ares || this.selected()?.diagnosticResponses?.ares || {};
    const totalQuestions = Object.keys(ares).length;
    const answeredQuestions = Object.values(ares).filter(value => 
      value !== null && value !== undefined && value !== '-'
    ).length;
    
    if (totalQuestions === 0) return 0;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }

  toggleResponsePreview(leadId: string): void {
    if (this.expandedResponses.has(leadId)) {
      this.expandedResponses.delete(leadId);
    } else {
      this.expandedResponses.add(leadId);
    }
  }

  getMaturityLevelIcon(score?: number): string {
    if (!score) return '❓';
    if (score >= 4.5) return '🚀';
    if (score >= 3.5) return '⭐';
    if (score >= 2.5) return '📈';
    if (score >= 1.5) return '🌱';
    return '🌱';
  }

  getDiagnosticStatusClass(lead: DiagnosticRow): string {
    const hasAres = lead.aresAvg && lead.aresAvg > 0;
    const hasCompetencias = lead.competenciasAvg && lead.competenciasAvg > 0;
    
    if (hasAres && hasCompetencias) {
      return 'bg-green-500'; // Completo
    } else if (hasAres || hasCompetencias) {
      return 'bg-yellow-500'; // Parcial
    } else {
      return 'bg-red-500'; // Incompleto
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
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    if (numValue >= 4) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (numValue >= 3) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    } else if (numValue >= 2) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  }

  getScoreLabel(value: any): string {
    if (value === null || value === undefined || value === '-') {
      return 'Sin datos';
    }
    
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'Sin datos';
    }
    
    if (numValue >= 4) {
      return 'Excelente';
    } else if (numValue >= 3) {
      return 'Bueno';
    } else if (numValue >= 2) {
      return 'Regular';
    } else {
      return 'Necesita mejora';
    }
  }

  // Métodos para cálculos de ARES
  getGeneralAresScore(): number {
    const ares = this.selected()?.diagnosticData?.ares || this.selected()?.diagnosticResponses?.ares || {};
    const scores = Object.values(ares).map((value: any) => 
      typeof value === 'object' && value !== null ? value.value : value
    ).filter(score => typeof score === 'number' && !isNaN(score));
    
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  }

  getGeneralScoreClass(): string {
    const score = this.getGeneralAresScore();
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getMaturityLevel(): string {
    const score = this.getGeneralAresScore();
    if (score >= 4.5) return 'Avanzado';
    if (score >= 3.5) return 'Intermedio';
    if (score >= 2.5) return 'Básico';
    if (score >= 1.5) return 'Inicial';
    return 'Principiante';
  }


  /**
   * Genera sugerencias comerciales basadas en el nivel de madurez y respuestas
   */
  getCommercialSuggestion(): string {
    const score = this.getGeneralAresScore();
    const leadType = this.leadTipo();
    const industry = this.leadIndustria();
    
    let suggestion = '';
    
    if (score >= 4) {
      suggestion = 'servicios de optimización avanzada y consultoría estratégica en IA';
    } else if (score >= 3) {
      suggestion = 'soluciones de automatización y capacitación especializada';
    } else if (score >= 2) {
      suggestion = 'cursos de fundamentos de IA y herramientas básicas de automatización';
    } else {
      suggestion = 'talleres introductorios y evaluaciones de preparación para IA';
    }
    
    if (leadType === 'empresa' && industry) {
      suggestion += ` específicos para el sector ${industry.toLowerCase()}`;
    }
    
    return suggestion;
  }

  // Métodos para búsqueda
  onSearchChange() {
    this.page.set(1); // Reset a la primera página al buscar
  }

  // Métodos para edición
  editLead(id: string) {
    this.open(id);
    this.toggleEditMode();
  }

  toggleEditMode() {
    if (!this.isEditMode()) {
      // Inicializar formulario de edición con datos actuales
      const lead = this.selected();
      if (lead) {
        this.editForm.set({
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          status: lead.status || 'nuevo',
          acceptsCommunications: lead.acceptsCommunications || false,
          companyName: lead.companyName || '',
          position: lead.position || '',
          industry: lead.industry || '',
          companySize: lead.companySize || '',
          notes: lead.notes || ''
        });
      }
    }
    this.isEditMode.set(!this.isEditMode());
  }

  async saveChanges() {
    if (!this.selectedId()) return;
    
    this.isSaving.set(true);
    try {
      await this.leadsService.updateLead(this.selectedId()!, this.editForm());
      this.isEditMode.set(false);
      this.loadLeads(); // Recargar la lista
      this.loadStats(); // Recargar estadísticas
      this.notificationService.success('Lead actualizado', 'Los cambios se han guardado correctamente');
    } catch (error: any) {
      console.error('❌ Error actualizando lead:', error);
      
      let errorMessage = 'No se pudieron guardar los cambios.';
      if (error?.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para actualizar este lead.';
      } else if (error?.code === 'not-found') {
        errorMessage = 'El lead no existe o fue eliminado.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      this.notificationService.error('Error al actualizar', errorMessage);
    } finally {
      this.isSaving.set(false);
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }

  // Métodos para eliminación
  deleteLead(id: string) {
    this.leadToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  async confirmDelete() {
    const id = this.leadToDelete();
    if (!id) return;

    try {
      await this.leadsService.deleteLead(id);
      this.loadLeads(); // Recargar la lista
      this.loadStats(); // Recargar estadísticas
      this.notificationService.success('Lead eliminado', 'El lead se ha eliminado correctamente');
    } catch (error: any) {
      console.error('❌ Error eliminando lead:', error);
      
      let errorMessage = 'No se pudo eliminar el lead.';
      if (error?.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para eliminar este lead.';
      } else if (error?.code === 'not-found') {
        errorMessage = 'El lead no existe o ya fue eliminado.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      this.notificationService.error('Error al eliminar', errorMessage);
    } finally {
      this.cancelDelete();
    }
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.leadToDelete.set(null);
  }

  /**
   * Navega a los detalles completos del diagnóstico asociado al lead
   */
  async viewDiagnosticDetails(leadId: string) {
    try {
      // Obtener el lead para conseguir el diagnosticId
      const lead = await this.leadsService.getLeadById(leadId);
      if (lead && (lead as ExtendedDiagnosticLead).diagnosticId) {
        const diagnosticId = (lead as ExtendedDiagnosticLead).diagnosticId;
        // Navegar a la vista del diagnóstico completo
        this.router.navigate(['/admin/diagnostics', diagnosticId]);
      } else {
        this.notificationService.warning('Diagnóstico no encontrado', 'No se pudo encontrar el diagnóstico asociado a este lead.');
      }
    } catch (error) {
      console.error('❌ Error obteniendo detalles del diagnóstico:', error);
      this.notificationService.error('Error', 'No se pudo acceder al diagnóstico completo.');
    }
  }

  /**
   * Resetea todos los leads antiguos del diagnóstico anterior
   */
  async resetOldLeads() {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los leads del diagnóstico anterior? Esta acción no se puede deshacer.')) {
      return;
    }

    this.isResetting.set(true);
    try {
      const result = await this.leadsService.resetOldLeads();
      
      if (result.deleted > 0) {
        this.notificationService.success(
          'Limpieza completada', 
          `Se eliminaron ${result.deleted} leads antiguos. ${result.errors > 0 ? `${result.errors} errores encontrados.` : 'Sin errores.'}`
        );
      } else {
        this.notificationService.info('Sin cambios', 'No se encontraron leads antiguos para eliminar.');
      }

      // Recargar datos
      this.loadLeads();
      this.loadStats();
    } catch (error: any) {
      console.error('❌ Error durante la limpieza:', error);
      this.notificationService.error(
        'Error en la limpieza', 
        'No se pudieron eliminar los leads antiguos: ' + (error?.message || 'Error desconocido')
      );
    } finally {
      this.isResetting.set(false);
    }
  }
}


