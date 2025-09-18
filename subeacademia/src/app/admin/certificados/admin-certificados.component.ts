import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Certificate } from '../../core/models';
import { CertificateService } from '../../features/productos/services/certificate.service';
import { CertificateBulkUploadService, BulkUploadResult, BulkUploadProgress } from '../../core/services/certificate-bulk-upload.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
	selector: 'app-admin-certificados',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule],
	template: `
	<div class="space-y-6">
	  <div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Sistema de Certificados</h1>
	    <div class="flex gap-3 flex-wrap">
	      <button (click)="showStats = !showStats" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
	        {{ showStats ? 'Ocultar' : 'Mostrar' }} Estadísticas
	      </button>
	      <button (click)="showBulkUpload = true" class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center">
	        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"></path>
	        </svg>
	        Carga Masiva
	      </button>
	      <button (click)="downloadTemplate()" class="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center">
	        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
	        </svg>
	        Plantilla Excel
	      </button>
	      <button (click)="seedExamples()" class="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cargar Ejemplos</button>
	    </div>
	  </div>

	  <!-- Estadísticas -->
	  <div *ngIf="showStats" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-lg">
	    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Estadísticas de Certificados</h2>
	    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
	      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
	        <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
	        <div class="text-sm text-gray-600 dark:text-gray-300">Total</div>
	      </div>
	      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
	        <div class="text-2xl font-bold text-green-600">{{ stats.active }}</div>
	        <div class="text-sm text-gray-600 dark:text-gray-300">Activos</div>
	      </div>
	      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
	        <div class="text-2xl font-bold text-red-600">{{ stats.revoked }}</div>
	        <div class="text-sm text-gray-600 dark:text-gray-300">Revocados</div>
	      </div>
	      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
	        <div class="text-2xl font-bold text-purple-600">{{ stats.recentIssued }}</div>
	        <div class="text-sm text-gray-600 dark:text-gray-300">Este mes</div>
	      </div>
	    </div>
	  </div>

	  <!-- Formulario de emisión -->
	  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
	    <h2 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
	      <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
	      </svg>
	      Emitir Nuevo Certificado
	    </h2>
	    <form [formGroup]="certificateForm" (ngSubmit)="emit()" class="space-y-6">
	      <div class="grid md:grid-cols-2 gap-6">
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Estudiante *</label>
	          <input formControlName="studentName" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: María González" />
	          <div *ngIf="certificateForm.get('studentName')?.invalid && certificateForm.get('studentName')?.touched" class="text-red-500 text-sm mt-1">
	            El nombre del estudiante es requerido
	          </div>
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Curso *</label>
	          <input formControlName="courseName" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: Introducción a la IA" />
	          <div *ngIf="certificateForm.get('courseName')?.invalid && certificateForm.get('courseName')?.touched" class="text-red-500 text-sm mt-1">
	            El nombre del curso es requerido
	          </div>
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Finalización *</label>
	          <input type="date" formControlName="completionDate" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
	          <div *ngIf="certificateForm.get('completionDate')?.invalid && certificateForm.get('completionDate')?.touched" class="text-red-500 text-sm mt-1">
	            La fecha de finalización es requerida
	          </div>
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Certificado</label>
	          <select formControlName="certificateType" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
	            <option value="completion">Completación</option>
	            <option value="achievement">Logro</option>
	            <option value="participation">Participación</option>
	          </select>
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructor</label>
	          <input formControlName="instructorName" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nombre del instructor" />
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duración del Curso</label>
	          <input formControlName="courseDuration" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ej: 40 horas" />
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calificación</label>
	          <input type="number" formControlName="grade" min="0" max="100" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0-100" />
	        </div>
	        <div>
	          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email del Emisor</label>
	          <input type="email" formControlName="issuerEmail" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="admin@subeia.tech" />
	        </div>
	      </div>

	      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
	        <div class="flex items-center gap-4">
	          <button type="submit" [disabled]="isGenerating || certificateForm.invalid" class="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center">
	            <svg *ngIf="isGenerating" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
	              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
	              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
	            </svg>
	            {{ isGenerating ? 'Generando...' : 'Emitir Certificado' }}
	          </button>
	          <button type="button" (click)="resetForm()" class="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Limpiar</button>
	        </div>
	        <div *ngIf="status" class="flex items-center gap-2" [class.text-green-600]="ok" [class.text-red-600]="!ok">
	          <svg *ngIf="ok" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
	          </svg>
	          <svg *ngIf="!ok" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
	          </svg>
	          <span class="font-medium">{{ status }}</span>
	        </div>
	      </div>
	    </form>
	  </div>

	  <!-- Lista de certificados -->
	  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
	    <div class="p-6 border-b border-gray-200 dark:border-gray-600">
	      <div class="flex items-center justify-between">
	        <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
	          <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
	          </svg>
	          Certificados Emitidos ({{ certificates.length }})
	        </h2>
	        <div class="flex items-center gap-3">
	          <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar certificados..." class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" />
	          <select [(ngModel)]="statusFilter" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
	            <option value="">Todos los estados</option>
	            <option value="active">Activos</option>
	            <option value="revoked">Revocados</option>
	            <option value="expired">Expirados</option>
	          </select>
	        </div>
	      </div>
	    </div>

	    <div class="overflow-x-auto">
	      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
	        <thead class="bg-gray-50 dark:bg-gray-700">
	          <tr>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estudiante</th>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Curso</th>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">QR</th>
	            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
	          </tr>
	        </thead>
	        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
	          <tr *ngFor="let c of filteredCertificates; trackBy: trackByCertificate" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
	            <td class="px-6 py-4 whitespace-nowrap">
	              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ c.studentName }}</div>
	              <div class="text-sm text-gray-500 dark:text-gray-400">{{ c.instructorName || 'Sin instructor' }}</div>
	            </td>
	            <td class="px-6 py-4">
	              <div class="text-sm text-gray-900 dark:text-white">{{ c.courseName }}</div>
	              <div class="text-sm text-gray-500 dark:text-gray-400">{{ c.certificateType || 'completion' | titlecase }}</div>
	            </td>
	            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">{{ c.completionDate.toDate() | date:'mediumDate' }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ c.issuedDate.toDate() | date:'short' }}</div>
	            </td>
	            <td class="px-6 py-4 whitespace-nowrap">
	              <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">{{ c.certificateCode }}</code>
	            </td>
	            <td class="px-6 py-4 whitespace-nowrap">
	              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" [class]="getStatusClass(c.status)">
	                {{ getStatusText(c.status) }}
	              </span>
	            </td>
	            <td class="px-6 py-4 whitespace-nowrap">
	              <button *ngIf="c.qrCode" (click)="showQR(c)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
	                Ver QR
	              </button>
	              <span *ngIf="!c.qrCode" class="text-gray-400 text-sm">No disponible</span>
	            </td>
	            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
	              <a class="text-blue-600 hover:text-blue-800" [href]="'/es/certificados/validar/' + c.certificateCode" target="_blank">Validar</a>
	              <button *ngIf="c.status === 'active'" (click)="revokeCertificate(c.id!)" class="text-yellow-600 hover:text-yellow-800">Revocar</button>
	              <button (click)="remove(c.id)" class="text-red-600 hover:text-red-800">Eliminar</button>
	            </td>
	          </tr>
	          <tr *ngIf="filteredCertificates.length === 0">
	            <td colspan="7" class="px-6 py-12 text-center">
	              <div class="text-gray-500 dark:text-gray-400">
	                <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
	                </svg>
	                <p class="text-lg font-medium">Sin certificados emitidos</p>
	                <p class="text-sm">Comienza emitiendo tu primer certificado usando el formulario de arriba.</p>
	              </div>
	            </td>
	          </tr>
	        </tbody>
	      </table>
	    </div>
	  </div>

	  <!-- Modal QR -->
	  <div *ngIf="showQRModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeQRModal()">
	    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full mx-4" (click)="$event.stopPropagation()">
	      <div class="text-center">
	        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Código QR del Certificado</h3>
	        <div class="mb-4">
	          <img [src]="selectedCertificateQR" alt="Código QR" class="mx-auto rounded-lg" />
	        </div>
	        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Escanea este código para validar el certificado</p>
	        <div class="flex gap-2">
	          <button (click)="downloadQR()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
	            Descargar
	          </button>
	          <button (click)="closeQRModal()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
	            Cerrar
	          </button>
	        </div>
	      </div>
	    </div>
	  </div>

	  <!-- Modal de Carga Masiva -->
	  <div *ngIf="showBulkUpload" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
	    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
	      <div class="p-6 border-b border-gray-200 dark:border-gray-600">
	        <div class="flex items-center justify-between">
	          <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
	            <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"></path>
	            </svg>
	            Carga Masiva de Certificados
	          </h2>
	          <button (click)="closeBulkUpload()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
	            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
	            </svg>
	          </button>
	        </div>
	      </div>

	      <div class="p-6">
	        <!-- Paso 1: Instrucciones -->
	        <div *ngIf="bulkUploadStep === 1" class="space-y-6">
	          <div class="text-center">
	            <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
	              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
	              </svg>
	            </div>
	            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Instrucciones de Carga Masiva</h3>
	            <p class="text-gray-600 dark:text-gray-400">Sigue estos pasos para cargar múltiples certificados desde Excel</p>
	          </div>

	          <div class="grid md:grid-cols-2 gap-6">
	            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
	              <h4 class="font-semibold text-blue-900 dark:text-blue-200 mb-3">1. Descargar Plantilla</h4>
	              <p class="text-sm text-blue-800 dark:text-blue-300 mb-4">Descarga la plantilla de Excel con el formato correcto y ejemplos.</p>
	              <button (click)="downloadTemplate()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
	                Descargar Plantilla Excel
	              </button>
	            </div>

	            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
	              <h4 class="font-semibold text-green-900 dark:text-green-200 mb-3">2. Completar Datos</h4>
	              <p class="text-sm text-green-800 dark:text-green-300 mb-4">Completa la plantilla con los datos de los estudiantes y certificados.</p>
	              <div class="text-xs text-green-700 dark:text-green-400">
	                <p>• Nombre del Estudiante (obligatorio)</p>
	                <p>• Nombre del Curso (obligatorio)</p>
	                <p>• Fecha de Finalización (obligatorio)</p>
	                <p>• Tipo, Instructor, Duración, etc. (opcional)</p>
	              </div>
	            </div>
	          </div>

	          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
	            <h4 class="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Notas Importantes</h4>
	            <div class="grid md:grid-cols-2 gap-4 text-sm text-yellow-800 dark:text-yellow-300">
	              <div>
	                <p>• Las fechas deben estar en formato YYYY-MM-DD</p>
	                <p>• No modifiques los nombres de las columnas</p>
	                <p>• Elimina la hoja "Instrucciones" antes de subir</p>
	              </div>
	              <div>
	                <p>• La calificación debe ser entre 0 y 100</p>
	                <p>• Los códigos únicos y QR se generan automáticamente</p>
	                <p>• Máximo 500 certificados por carga</p>
	              </div>
	            </div>
	          </div>

	          <div class="flex justify-end">
	            <button (click)="bulkUploadStep = 2" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
	              Continuar a Subir Archivo
	            </button>
	          </div>
	        </div>

	        <!-- Paso 2: Subir Archivo -->
	        <div *ngIf="bulkUploadStep === 2" class="space-y-6">
	          <div class="text-center">
	            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
	              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"></path>
	              </svg>
	            </div>
	            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Subir Archivo Excel</h3>
	            <p class="text-gray-600 dark:text-gray-400">Selecciona el archivo Excel completado con los datos de los certificados</p>
	          </div>

	          <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-400 transition-colors" [class.border-green-400]="selectedFile">
	            <input type="file" #fileInput accept=".xlsx,.xls" (change)="onFileSelected($event)" class="hidden" />
	            <div *ngIf="!selectedFile">
	              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
	              </svg>
	              <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Arrastra tu archivo Excel aquí</p>
	              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">o haz clic para seleccionar</p>
	              <button (click)="fileInput.click()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
	                Seleccionar Archivo
	              </button>
	            </div>

	            <div *ngIf="selectedFile" class="text-green-600 dark:text-green-400">
	              <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
	              </svg>
	              <p class="text-lg font-medium mb-1">{{ selectedFile.name }}</p>
	              <p class="text-sm text-gray-500 dark:text-gray-400">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
	              <button (click)="removeSelectedFile()" class="mt-2 text-sm text-red-600 hover:text-red-800">
	                Remover archivo
	              </button>
	            </div>
	          </div>

	          <div class="flex justify-between">
	            <button (click)="bulkUploadStep = 1" class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
	              Volver
	            </button>
	            <button (click)="processBulkUpload()" [disabled]="!selectedFile || isProcessing" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
	              {{ isProcessing ? 'Procesando...' : 'Procesar Certificados' }}
	            </button>
	          </div>
	        </div>

	        <!-- Paso 3: Progreso -->
	        <div *ngIf="bulkUploadStep === 3" class="space-y-6">
	          <div class="text-center">
	            <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
	              <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
	                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
	                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
	              </svg>
	            </div>
	            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Procesando Certificados</h3>
	            <p class="text-gray-600 dark:text-gray-400">{{ bulkUploadProgress.message }}</p>
	          </div>

	          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
	            <div class="flex items-center justify-between mb-2">
	              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
	              <span class="text-sm text-gray-500 dark:text-gray-400">{{ bulkUploadProgress.currentRow }} / {{ bulkUploadProgress.totalRows }}</span>
	            </div>
	            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
	              <div class="bg-green-600 h-3 rounded-full transition-all duration-300" [style.width.%]="bulkUploadProgress.percentage"></div>
	            </div>
	            <div class="text-center mt-2">
	              <span class="text-lg font-semibold text-green-600">{{ bulkUploadProgress.percentage }}%</span>
	            </div>
	          </div>
	        </div>

	        <!-- Paso 4: Resultados -->
	        <div *ngIf="bulkUploadStep === 4" class="space-y-6">
	          <div class="text-center">
	            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" [class]="bulkUploadResult.successful > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'">
	              <svg *ngIf="bulkUploadResult.successful > 0" class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
	              </svg>
	              <svg *ngIf="bulkUploadResult.successful === 0" class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
	              </svg>
	            </div>
	            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Procesamiento Completado</h3>
	            <p class="text-gray-600 dark:text-gray-400">Revisa los resultados de la carga masiva</p>
	          </div>

	          <div class="grid md:grid-cols-3 gap-4">
	            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
	              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ bulkUploadResult.totalProcessed }}</div>
	              <div class="text-sm text-blue-800 dark:text-blue-300">Total Procesados</div>
	            </div>
	            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
	              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ bulkUploadResult.successful }}</div>
	              <div class="text-sm text-green-800 dark:text-green-300">Exitosos</div>
	            </div>
	            <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
	              <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ bulkUploadResult.failed }}</div>
	              <div class="text-sm text-red-800 dark:text-red-300">Fallidos</div>
	            </div>
	          </div>

	          <div *ngIf="bulkUploadResult.errors.length > 0" class="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
	            <h4 class="font-semibold text-red-900 dark:text-red-200 mb-3">Errores Encontrados</h4>
	            <div class="max-h-40 overflow-y-auto space-y-2">
	              <div *ngFor="let error of bulkUploadResult.errors.slice(0, 5)" class="text-sm text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-800/20 rounded p-2">
	                <span class="font-medium">Fila {{ error.row }}:</span> {{ error.studentName }} - {{ error.error }}
	              </div>
	              <div *ngIf="bulkUploadResult.errors.length > 5" class="text-sm text-red-700 dark:text-red-400 text-center">
	                ... y {{ bulkUploadResult.errors.length - 5 }} errores más
	              </div>
	            </div>
	          </div>

	          <div class="flex justify-between flex-wrap gap-3">
	            <div class="flex gap-3">
	              <button *ngIf="bulkUploadResult.successful > 0" (click)="downloadSuccessReport()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
	                Descargar Exitosos
	              </button>
	              <button *ngIf="bulkUploadResult.failed > 0" (click)="downloadErrorReport()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
	                Descargar Errores
	              </button>
	            </div>
	            <div class="flex gap-3">
	              <button (click)="resetBulkUpload()" class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
	                Nueva Carga
	              </button>
	              <button (click)="closeBulkUpload()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
	                Cerrar
	              </button>
	            </div>
	          </div>
	        </div>
	      </div>
	    </div>
	  </div>
	</div>
	`
})
export class AdminCertificadosComponent implements OnInit {
	certificates: (Certificate & { id: string })[] = [];
	filteredCertificates: (Certificate & { id: string })[] = [];
	certificateForm: FormGroup;
	status = '';
	ok = false;
	isGenerating = false;
	showStats = false;
	stats: any = { total: 0, active: 0, revoked: 0, expired: 0, recentIssued: 0 };
	searchTerm = '';
	statusFilter = '';
	showQRModal = false;
	selectedCertificateQR = '';
	selectedCertificate: Certificate | null = null;

	// Carga masiva
	showBulkUpload = false;
	bulkUploadStep = 1;
	selectedFile: File | null = null;
	isProcessing = false;
	bulkUploadProgress: BulkUploadProgress = {
		currentRow: 0,
		totalRows: 0,
		percentage: 0,
		status: 'processing',
		message: ''
	};
	bulkUploadResult: BulkUploadResult = {
		totalProcessed: 0,
		successful: 0,
		failed: 0,
		errors: [],
		successfulCertificates: []
	};

	constructor(
		private svc: CertificateService,
		private fb: FormBuilder,
		private bulkUploadService: CertificateBulkUploadService
	) {
		this.certificateForm = this.createForm();
		this.refresh();
	}

	ngOnInit() {
		this.loadStats();
		this.setupFilters();
	}

	private createForm(): FormGroup {
		return this.fb.group({
			studentName: ['', [Validators.required, Validators.minLength(2)]],
			courseName: ['', [Validators.required, Validators.minLength(3)]],
			completionDate: ['', Validators.required],
			certificateType: ['completion'],
			instructorName: [''],
			courseDuration: [''],
			grade: [null, [Validators.min(0), Validators.max(100)]],
			issuerEmail: ['admin@subeia.tech', Validators.email]
		});
	}

	private setupFilters() {
		// Configurar filtros reactivos
		setInterval(() => {
			this.applyFilters();
		}, 300);
	}

	private applyFilters() {
		let filtered = [...this.certificates];

		if (this.searchTerm) {
			const term = this.searchTerm.toLowerCase();
			filtered = filtered.filter(cert => 
				cert.studentName.toLowerCase().includes(term) ||
				cert.courseName.toLowerCase().includes(term) ||
				cert.certificateCode.toLowerCase().includes(term)
			);
		}

		if (this.statusFilter) {
			filtered = filtered.filter(cert => cert.status === this.statusFilter);
		}

		this.filteredCertificates = filtered;
	}

	trackByCertificate(index: number, cert: Certificate & { id: string }) {
		return cert.id;
	}

	async refresh() {
		this.svc.getAllCertificates().subscribe(list => {
			this.certificates = list;
			this.applyFilters();
			this.loadStats();
		});
	}

	async loadStats() {
		try {
			this.stats = await this.svc.getCertificateStats();
		} catch (error) {
			console.error('Error loading stats:', error);
		}
	}

	async emit() {
		if (this.certificateForm.invalid) {
			this.certificateForm.markAllAsTouched();
			return;
		}

		this.status = '';
		this.ok = false;
		this.isGenerating = true;

		try {
			const formValue = this.certificateForm.value;
			const certificateData = {
				studentName: formValue.studentName,
				courseName: formValue.courseName,
				completionDate: new Date(formValue.completionDate),
				certificateType: formValue.certificateType,
				instructorName: formValue.instructorName,
				courseDuration: formValue.courseDuration,
				grade: formValue.grade,
				issuerEmail: formValue.issuerEmail
			};

			await this.svc.createCertificate(certificateData);
			this.status = 'Certificado emitido exitosamente con código QR';
			this.ok = true;
			this.resetForm();
			this.refresh();
		} catch (e) {
			console.error(e);
			this.status = 'Error al emitir certificado';
			this.ok = false;
		} finally {
			this.isGenerating = false;
		}
	}

	resetForm() {
		this.certificateForm.reset({
			certificateType: 'completion',
			issuerEmail: 'admin@subeia.tech'
		});
		this.status = '';
	}

	async remove(id?: string) {
		if (!id) return;
		if (!confirm('¿Estás seguro de que deseas eliminar este certificado? Esta acción no se puede deshacer.')) {
			return;
		}
		try {
			await this.svc.deleteCertificate(id);
			this.refresh();
		} catch (error) {
			console.error('Error eliminando certificado:', error);
			alert('Error al eliminar el certificado');
		}
	}

	async revokeCertificate(id: string) {
		if (!confirm('¿Estás seguro de que deseas revocar este certificado?')) {
			return;
		}
		try {
			await this.svc.revokeCertificate(id);
			this.refresh();
		} catch (error) {
			console.error('Error revocando certificado:', error);
			alert('Error al revocar el certificado');
		}
	}

	showQR(certificate: Certificate & { id: string }) {
		if (certificate.qrCode) {
			this.selectedCertificate = certificate;
			this.selectedCertificateQR = certificate.qrCode;
			this.showQRModal = true;
		}
	}

	closeQRModal() {
		this.showQRModal = false;
		this.selectedCertificate = null;
		this.selectedCertificateQR = '';
	}

	downloadQR() {
		if (this.selectedCertificateQR && this.selectedCertificate) {
			const link = document.createElement('a');
			link.href = this.selectedCertificateQR;
			link.download = `qr-${this.selectedCertificate.certificateCode}.png`;
			link.click();
		}
	}

	getStatusClass(status: string): string {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
			case 'revoked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
			case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
		}
	}

	getStatusText(status: string): string {
		switch (status) {
			case 'active': return 'Activo';
			case 'revoked': return 'Revocado';
			case 'expired': return 'Expirado';
			default: return 'Desconocido';
		}
	}

	// Métodos de carga masiva
	downloadTemplate(): void {
		this.bulkUploadService.downloadTemplate();
	}

	closeBulkUpload(): void {
		this.showBulkUpload = false;
		this.resetBulkUpload();
	}

	resetBulkUpload(): void {
		this.bulkUploadStep = 1;
		this.selectedFile = null;
		this.isProcessing = false;
		this.bulkUploadProgress = {
			currentRow: 0,
			totalRows: 0,
			percentage: 0,
			status: 'processing',
			message: ''
		};
		this.bulkUploadResult = {
			totalProcessed: 0,
			successful: 0,
			failed: 0,
			errors: [],
			successfulCertificates: []
		};
	}

	onFileSelected(event: any): void {
		const file = event.target.files[0];
		if (file) {
			if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			    file.type === 'application/vnd.ms-excel') {
				this.selectedFile = file;
			} else {
				alert('Por favor selecciona un archivo Excel (.xlsx o .xls)');
				event.target.value = '';
			}
		}
	}

	removeSelectedFile(): void {
		this.selectedFile = null;
	}

	async processBulkUpload(): Promise<void> {
		if (!this.selectedFile) {
			return;
		}

		this.isProcessing = true;
		this.bulkUploadStep = 3;

		try {
			this.bulkUploadResult = await this.bulkUploadService.processExcelFile(
				this.selectedFile,
				(progress) => {
					this.bulkUploadProgress = progress;
				}
			);

			this.bulkUploadStep = 4;
			this.refresh(); // Actualizar lista de certificados

		} catch (error) {
			console.error('Error en carga masiva:', error);
			alert(`Error procesando el archivo: ${error}`);
			this.bulkUploadStep = 2;
		} finally {
			this.isProcessing = false;
		}
	}

	downloadSuccessReport(): void {
		this.bulkUploadService.downloadSuccessReport(this.bulkUploadResult);
	}

	downloadErrorReport(): void {
		this.bulkUploadService.downloadErrorReport(this.bulkUploadResult);
	}

	async seedExamples() {
		const today = new Date();
		const samples = [
			{ 
				studentName: 'Ana Pérez', 
				courseName: 'Introducción a la IA', 
				completionDate: today, 
				certificateType: 'completion' as const,
				instructorName: 'Dr. Carlos Mendoza',
				courseDuration: '40 horas',
				grade: 95
			},
			{ 
				studentName: 'Luis García', 
				courseName: 'IA para Marketing', 
				completionDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()-7), 
				certificateType: 'achievement' as const,
				instructorName: 'Dra. María Silva',
				courseDuration: '60 horas',
				grade: 88
			},
			{ 
				studentName: 'María López', 
				courseName: 'Aprendizaje Automático', 
				completionDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()-30), 
				certificateType: 'completion' as const,
				instructorName: 'Dr. Roberto Jiménez',
				courseDuration: '80 horas',
				grade: 92
			},
		];
		
		for (const sample of samples) {
			try {
				await this.svc.createCertificate(sample);
			} catch (error) {
				console.error('Error creating sample certificate:', error);
			}
		}
		this.refresh();
	}
}


