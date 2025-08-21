import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, orderBy, getDocs, deleteDoc, doc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  aceptaComunicaciones: boolean;
  timestamp: any;
  source: string;
  diagnosticData?: any;
}

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6" *ngIf="leads$ | async as leads; else loading">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Leads
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Administra los leads capturados desde el diagnóstico de IA
        </p>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Leads</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ leads.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Aceptan Comunicaciones</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ getLeadsAceptanComunicaciones(leads) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Este Mes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ getLeadsEsteMes(leads) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
              <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Fuente</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">Diagnóstico</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Leads -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Lista de Leads</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Teléfono
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Comunicaciones
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let lead of leads" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ lead.nombre }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ lead.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ lead.telefono || 'No especificado' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span *ngIf="lead.aceptaComunicaciones" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sí
                  </span>
                  <span *ngIf="!lead.aceptaComunicaciones" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    No
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ formatDate(lead.timestamp) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="viewLeadDetails(lead)" 
                          class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    Ver
                  </button>
                  <button (click)="deleteLead(lead.id)" 
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estado vacío -->
        <div *ngIf="leads.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay leads</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Los leads aparecerán aquí cuando los usuarios completen el diagnóstico.
          </p>
        </div>
      </div>
    </div>
    <ng-template #loading>
      <div class="p-6 text-center text-gray-500">Cargando leads...</div>
    </ng-template>
  `,
  styleUrls: []
})
export class AdminLeadsComponent implements OnInit {
  private readonly firestore = inject(Firestore);
  
  leads$!: Observable<Lead[]>;
  leads: Lead[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadLeads();
  }

  async loadLeads(): Promise<void> {
    try {
      this.isLoading = true;
      const leadsRef = collection(this.firestore, 'leads');
      const q = query(leadsRef, orderBy('timestamp', 'desc'));
      this.leads$ = collectionData(q, { idField: 'id' }) as Observable<Lead[]>;
      // Mantener una copia local para acciones sincrónicas cuando sea necesario
      this.leads$.subscribe(data => this.leads = data);
      console.log('✅ Leads en streaming habilitados');
    } catch (error) {
      console.error('❌ Error al cargar leads:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteLead(leadId: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      try {
        const leadRef = doc(this.firestore, 'leads', leadId);
        await deleteDoc(leadRef);
        
        // Remover de la lista local
        this.leads = this.leads.filter(lead => lead.id !== leadId);
        
        console.log('✅ Lead eliminado:', leadId);
      } catch (error) {
        console.error('❌ Error al eliminar lead:', error);
        alert('Error al eliminar el lead');
      }
    }
  }

  viewLeadDetails(lead: Lead): void {
    // Aquí podrías abrir un modal o navegar a una página de detalles
    console.log('Detalles del lead:', lead);
    alert(`Detalles del lead:\nNombre: ${lead.nombre}\nEmail: ${lead.email}\nTeléfono: ${lead.telefono || 'No especificado'}\nAcepta comunicaciones: ${lead.aceptaComunicaciones ? 'Sí' : 'No'}`);
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getLeadsEsteMes(list: Lead[]): number {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    return list.filter(lead => {
      if (!lead.timestamp) return false;
      const fechaLead = (lead.timestamp as any)?.toDate ? (lead.timestamp as any).toDate() : new Date(lead.timestamp as any);
      return fechaLead >= inicioMes;
    }).length;
  }

  getLeadsAceptanComunicaciones(list: Lead[]): number {
    return (list || []).filter(l => !!l.aceptaComunicaciones).length;
  }
}
