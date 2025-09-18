import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { LogosService } from '../../core/data/logos.service';
import { Logo } from '../../core/models/logo.model';
import { MediaService } from '../../core/data/media.service';
import { StorageService } from '../../core/storage.service';
import { ToastService } from '../../core/services/ui/toast/toast.service';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgFor],
	template: `
    <div class="container mx-auto p-4 md:p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Logos</h1>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Total: {{ empresas().length + educacion().length + alianzas().length }} logos
        </div>
      </div>

      <!-- Modal de Edición -->
      <div *ngIf="isEditing()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Editar Logo</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
              <input type="text" [(ngModel)]="editForm.name" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo</label>
              <select [(ngModel)]="editForm.type" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="Empresa">Empresa</option>
                <option value="Institución Educativa">Institución Educativa</option>
                <option value="Alianza Estratégica">Alianza Estratégica</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sitio Web (opcional)</label>
              <input type="url" [(ngModel)]="editForm.websiteUrl" placeholder="https://ejemplo.com"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button (click)="cancelEdit()" class="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              Cancelar
            </button>
            <button (click)="saveEdit()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Guardar
            </button>
          </div>
        </div>
      </div>

      <!-- Botón para Activar Carga Masiva -->
      <div class="mb-6 text-center">
        <button (click)="toggleBulkUpload()" 
                class="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg">
          <span class="mr-2">📦</span>
          {{ showBulkUpload() ? 'Ocultar Carga Masiva' : 'Activar Carga Masiva' }}
        </button>
      </div>

      <!-- Panel de Carga Masiva -->
      <div *ngIf="showBulkUpload()" class="mb-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-green-200 dark:border-green-700 rounded-xl p-6 shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-green-700 dark:text-green-300 flex items-center">
          📦 Carga Masiva de Logos
        </h2>
        
        <!-- Selector de Tipo y Archivos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de Logo</label>
            <select [(ngModel)]="bulkUploadType" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="Empresa">🏢 Empresa</option>
              <option value="Institución Educativa">🎓 Institución Educativa</option>
              <option value="Alianza Estratégica">🤝 Alianza Estratégica</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Seleccionar Múltiples Archivos</label>
            <input type="file" 
                   id="bulkFileInput"
                   (change)="onBulkFilesSelected($event)" 
                   accept="image/*" 
                   multiple 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
          </div>
        </div>

        <!-- Lista de Logos para Editar -->
        <div *ngIf="bulkUploadLogos.length > 0" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Editar Información de Logos ({{ bulkUploadLogos.length }} archivos)
          </h3>
          
          <div class="max-h-96 overflow-y-auto space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div *ngFor="let logoData of bulkUploadLogos; let i = index" 
                 class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              
              <!-- Previsualización -->
              <div class="flex-shrink-0">
                <img *ngIf="logoData.imageUrl" [src]="logoData.imageUrl" [alt]="logoData.name" 
                     class="w-16 h-16 object-contain bg-white rounded border">
                <div *ngIf="!logoData.imageUrl" class="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                  📷
                </div>
              </div>
              
              <!-- Campos de Edición -->
              <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" 
                       [(ngModel)]="logoData.name" 
                       placeholder="Nombre del logo"
                       class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                <input type="url" 
                       [(ngModel)]="logoData.websiteUrl" 
                       placeholder="https://sitio-web.com (opcional)"
                       class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white">
              </div>
              
              <!-- Botón Eliminar -->
              <button (click)="removeBulkLogo(i)" 
                      class="flex-shrink-0 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      title="Eliminar este logo">
                ✕
              </button>
            </div>
          </div>

          <!-- Barra de Progreso -->
          <div *ngIf="isBulkUploading()" class="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div class="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300" 
                 [style.width.%]="bulkUploadProgress()">
            </div>
            <div class="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              Subiendo... {{ bulkUploadProgress() }}%
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex justify-end gap-3">
            <button (click)="resetBulkUpload()" 
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    [disabled]="isBulkUploading()">
              Limpiar Todo
            </button>
            <button (click)="saveBulkLogos()" 
                    class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    [disabled]="isBulkUploading() || bulkUploadLogos.length === 0">
              <span *ngIf="isBulkUploading()" class="mr-2">⏳</span>
              {{ isBulkUploading() ? 'Guardando...' : '💾 Guardar Todos (' + bulkUploadLogos.length + ')' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Formularios de Subida -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Instituciones Educativas -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400 flex items-center">
            🎓 Instituciones Educativas ({{ educacion().length }})
          </h2>
          <form (ngSubmit)="onUpload('Institución Educativa')" class="space-y-4">
            <input type="file" (change)="onFileSelected($event, 'Institución Educativa')" accept="image/*" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" required>
            <input type="text" [(ngModel)]="newLogoName.education" name="educationLogoName" 
                   placeholder="Nombre de la institución" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <input type="url" [(ngModel)]="newLogoWebsite.education" name="educationLogoWebsite" 
                   placeholder="https://sitio-web.com (opcional)" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <button type="submit" class="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
                    [disabled]="isUploading.education || !selectedFile.education">
              <span *ngIf="isUploading.education" class="mr-2">⏳</span>
              {{ isUploading.education ? 'Subiendo...' : '📤 Subir Logo' }}
            </button>
            <div *ngIf="uploadProgress.education && (uploadProgress.education | async) as progress" class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-purple-600 h-2 rounded-full" [style.width.%]="progress"></div>
            </div>
          </form>
        </div>

        <!-- Empresas -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
            🏢 Empresas ({{ empresas().length }})
          </h2>
          <form (ngSubmit)="onUpload('Empresa')" class="space-y-4">
            <input type="file" (change)="onFileSelected($event, 'Empresa')" accept="image/*" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" required>
            <input type="text" [(ngModel)]="newLogoName.company" name="companyLogoName" 
                   placeholder="Nombre de la empresa" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <input type="url" [(ngModel)]="newLogoWebsite.company" name="companyLogoWebsite" 
                   placeholder="https://sitio-web.com (opcional)" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
                    [disabled]="isUploading.company || !selectedFile.company">
              <span *ngIf="isUploading.company" class="mr-2">⏳</span>
              {{ isUploading.company ? 'Subiendo...' : '📤 Subir Logo' }}
            </button>
            <div *ngIf="uploadProgress.company && (uploadProgress.company | async) as progress" class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="progress"></div>
            </div>
          </form>
        </div>

        <!-- Alianzas Estratégicas -->
        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-orange-600 dark:text-orange-400 flex items-center">
            🤝 Alianzas Estratégicas ({{ alianzas().length }})
          </h2>
          <form (ngSubmit)="onUpload('Alianza Estratégica')" class="space-y-4">
            <input type="file" (change)="onFileSelected($event, 'Alianza Estratégica')" accept="image/*" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" required>
            <input type="text" [(ngModel)]="newLogoName.alliance" name="allianceLogoName" 
                   placeholder="Nombre de la alianza" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
            <input type="url" [(ngModel)]="newLogoWebsite.alliance" name="allianceLogoWebsite" 
                   placeholder="https://sitio-web.com (opcional)" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <button type="submit" class="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
                    [disabled]="isUploading.alliance || !selectedFile.alliance">
              <span *ngIf="isUploading.alliance" class="mr-2">⏳</span>
              {{ isUploading.alliance ? 'Subiendo...' : '📤 Subir Logo' }}
            </button>
            <div *ngIf="uploadProgress.alliance && (uploadProgress.alliance | async) as progress" class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-orange-600 h-2 rounded-full" [style.width.%]="progress"></div>
            </div>
          </form>
        </div>
      </div>

      <!-- Previsualización -->
      <div *ngIf="previewUrl" class="mb-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">📸 Previsualización</h3>
        <div class="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <img [src]="previewUrl" alt="preview" class="max-h-24 object-contain"/>
        </div>
      </div>

      <!-- Galería de Logos -->
      <div class="space-y-8">
        <!-- Instituciones Educativas -->
        <div *ngIf="educacion().length > 0" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400 flex items-center">
            🎓 Instituciones Educativas
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            <div *ngFor="let logo of educacion()" 
                 class="relative group bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-lg transition-all duration-200 hover:border-purple-300">
              
              <!-- Imagen del Logo -->
              <div class="aspect-square flex items-center justify-center mb-2 bg-white rounded-md p-2">
                <img [src]="logo.imageUrl" [alt]="logo.name" class="max-w-full max-h-full object-contain">
              </div>
              
              <!-- Nombre del Logo -->
              <div class="text-xs text-center text-gray-700 dark:text-gray-300 font-medium truncate" [title]="logo.name">
                {{ logo.name }}
              </div>
              
              <!-- Indicador de sitio web -->
              <div *ngIf="logo.websiteUrl" class="text-center mt-1">
                <span class="text-xs text-purple-600 dark:text-purple-400">🔗</span>
              </div>
              
              <!-- Botones de Acción -->
              <div class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="startEditLogo(logo)" 
                        class="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs flex items-center justify-center" 
                        title="Editar">
                  ✏️
                </button>
                <button (click)="deleteLogo(logo)" 
                        class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center" 
                        title="Eliminar">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empresas -->
        <div *ngIf="empresas().length > 0" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400 flex items-center">
            🏢 Empresas
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            <div *ngFor="let logo of empresas()" 
                 class="relative group bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
              
              <!-- Imagen del Logo -->
              <div class="aspect-square flex items-center justify-center mb-2 bg-white rounded-md p-2">
                <img [src]="logo.imageUrl" [alt]="logo.name" class="max-w-full max-h-full object-contain">
              </div>
              
              <!-- Nombre del Logo -->
              <div class="text-xs text-center text-gray-700 dark:text-gray-300 font-medium truncate" [title]="logo.name">
                {{ logo.name }}
              </div>
              
              <!-- Indicador de sitio web -->
              <div *ngIf="logo.websiteUrl" class="text-center mt-1">
                <span class="text-xs text-blue-600 dark:text-blue-400">🔗</span>
              </div>
              
              <!-- Botones de Acción -->
              <div class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="startEditLogo(logo)" 
                        class="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs flex items-center justify-center" 
                        title="Editar">
                  ✏️
                </button>
                <button (click)="deleteLogo(logo)" 
                        class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center" 
                        title="Eliminar">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Alianzas Estratégicas -->
        <div *ngIf="alianzas().length > 0" class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400 flex items-center">
            🤝 Alianzas Estratégicas
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            <div *ngFor="let logo of alianzas()" 
                 class="relative group bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-lg transition-all duration-200 hover:border-orange-300">
              
              <!-- Imagen del Logo -->
              <div class="aspect-square flex items-center justify-center mb-2 bg-white rounded-md p-2">
                <img [src]="logo.imageUrl" [alt]="logo.name" class="max-w-full max-h-full object-contain">
              </div>
              
              <!-- Nombre del Logo -->
              <div class="text-xs text-center text-gray-700 dark:text-gray-300 font-medium truncate" [title]="logo.name">
                {{ logo.name }}
              </div>
              
              <!-- Indicador de sitio web -->
              <div *ngIf="logo.websiteUrl" class="text-center mt-1">
                <span class="text-xs text-orange-600 dark:text-orange-400">🔗</span>
              </div>
              
              <!-- Botones de Acción -->
              <div class="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="startEditLogo(logo)" 
                        class="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs flex items-center justify-center" 
                        title="Editar">
                  ✏️
                </button>
                <button (click)="deleteLogo(logo)" 
                        class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center" 
                        title="Eliminar">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div *ngIf="empresas().length === 0 && educacion().length === 0 && alianzas().length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-6xl mb-4">📁</div>
          <h3 class="text-xl font-semibold mb-2">No hay logos todavía</h3>
          <p>Sube tu primer logo usando los formularios de arriba.</p>
        </div>
      </div>
    </div>
	`
})
export class LogosPageComponent {
    private readonly logos = inject(LogosService);
    private readonly media = inject(MediaService);
    private readonly storage = inject(StorageService);
    private readonly toast = inject(ToastService);
    private readonly auth = inject(Auth);

	empresas = signal<Logo[]>([]);
	educacion = signal<Logo[]>([]);
	alianzas = signal<Logo[]>([]);
	
	selectedFile: { education: File | null, company: File | null, alliance: File | null } = { education: null, company: null, alliance: null };
	newLogoName: { education: string, company: string, alliance: string } = { education: '', company: '', alliance: '' };
	newLogoWebsite: { education: string, company: string, alliance: string } = { education: '', company: '', alliance: '' };
	
	isUploading: { education: boolean, company: boolean, alliance: boolean } = { education: false, company: false, alliance: false };
	uploadProgress: { education: any, company: any, alliance: any } = { education: null, company: null, alliance: null };
	
	previewUrl: string | null = null;

	// Estados para edición
	editingLogo: Logo | null = null;
	editForm = { name: '', type: 'Empresa' as 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica', websiteUrl: '' };
	isEditing = signal<boolean>(false);

	// Estados para carga masiva
	bulkUploadFiles: File[] = [];
	bulkUploadType: 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica' = 'Empresa';
	bulkUploadLogos: Array<{file: File, name: string, websiteUrl: string, imageUrl?: string}> = [];
	isBulkUploading = signal<boolean>(false);
	bulkUploadProgress = signal<number>(0);
	showBulkUpload = signal<boolean>(false);

	constructor(){
		this.loadLogos();
	}

	private loadLogos() {
		this.logos.listByType('Empresa').subscribe(v => this.empresas.set(v));
		this.logos.listByType('Institución Educativa').subscribe(v => this.educacion.set(v));
		this.logos.listByType('Alianza Estratégica').subscribe(v => this.alianzas.set(v));
	}

    onFileSelected(event: any, type: 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica'): void {
		const file = event.target.files[0];
		if (file) {
			if (type === 'Empresa') {
				this.selectedFile.company = file;
			} else if (type === 'Institución Educativa') {
				this.selectedFile.education = file;
			} else {
				this.selectedFile.alliance = file;
			}
			
			// Generar previsualización
			this.previewUrl = null;
			this.media.normalizeLogoImage(file)
				.then((normalized) => {
					const fileForPreview = normalized || file;
					this.previewUrl = URL.createObjectURL(fileForPreview);
				})
				.catch(() => { 
					this.previewUrl = URL.createObjectURL(file); 
				});
		}
	}

	onUpload(type: 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica'): void {
		let file: File | null = null;
		let name: string = '';
		let websiteUrl: string = '';
		let uploadType: 'company' | 'education' | 'alliance';

		if (type === 'Empresa') {
			file = this.selectedFile.company;
			name = this.newLogoName.company;
			websiteUrl = this.newLogoWebsite.company;
			uploadType = 'company';
		} else if (type === 'Institución Educativa') {
			file = this.selectedFile.education;
			name = this.newLogoName.education;
			websiteUrl = this.newLogoWebsite.education;
			uploadType = 'education';
		} else {
			file = this.selectedFile.alliance;
			name = this.newLogoName.alliance;
			websiteUrl = this.newLogoWebsite.alliance;
			uploadType = 'alliance';
		}
		
		if (!file || !name) {
			this.toast.error('Por favor, selecciona un archivo y escribe un nombre.');
			return;
		}

		this.isUploading[uploadType] = true;
		this.uploadLogo(file, name, websiteUrl, type, uploadType);
	}

	private async uploadLogo(file: File, name: string, websiteUrl: string, type: 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica', uploadType: 'company' | 'education' | 'alliance') {
		try {
			// Debug: Verificar estado de autenticación
			console.log('LogosPageComponent: Verificando autenticación...');
			console.log('Usuario actual:', this.auth.currentUser);
			console.log('Email del usuario:', this.auth.currentUser?.email);
			
			// Normalizar y subir la imagen
			const normalized = await this.media.normalizeLogoImage(file);
			const upload = await this.storage.uploadTo('public/logos', normalized || file);
			
			// Crear el objeto Logo y guardarlo en Firestore
			const logo: Logo = {
				name: name,
				imageUrl: upload.url,
				type: type
			};
			
			// Solo agregar websiteUrl si tiene un valor válido
			const trimmedUrl = websiteUrl.trim();
			if (trimmedUrl) {
				logo.websiteUrl = trimmedUrl;
			}
			
			console.log('LogosPageComponent: Intentando guardar logo en Firestore:', logo);
			await this.logos.addLogo(logo);
			
			// Limpiar formulario y recargar lista
			this.resetForm(uploadType);
			this.loadLogos();
			
			this.toast.success('Logo añadido exitosamente');
			
		} catch (error: any) {
			console.error('Error al añadir logo:', error);
			console.error('Detalles del error:', {
				message: error?.message || 'Error desconocido',
				code: error?.code || 'Sin código',
				user: this.auth.currentUser?.email
			});
			this.toast.error('Error al añadir logo. Por favor, inténtalo de nuevo.');
		} finally {
			this.isUploading[uploadType] = false;
			this.uploadProgress[uploadType] = null;
		}
	}

	private resetForm(type: 'company' | 'education' | 'alliance') {
		this.selectedFile[type] = null;
		this.newLogoName[type] = '';
		this.newLogoWebsite[type] = '';
		this.previewUrl = null;
		
		// Limpiar el input file
		const fileInputs = document.querySelectorAll('input[type=file]') as NodeListOf<HTMLInputElement>;
		fileInputs.forEach(input => input.value = '');
	}

	async deleteLogo(logo: Logo): Promise<void> {
		const confirmMessage = `¿Estás seguro de que quieres eliminar el logo de "${logo.name}"?\n\nEsta acción no se puede deshacer.`;
		if (confirm(confirmMessage)) {
			try {
				await this.logos.deleteLogo(logo);
				this.loadLogos();
				this.toast.success(`Logo de ${logo.name} eliminado exitosamente`);
			} catch (error) {
				console.error('Error al eliminar el logo:', error);
				this.toast.error('Hubo un error al eliminar el logo.');
			}
		}
	}

	// Funciones para editar logos
	startEditLogo(logo: Logo): void {
		this.editingLogo = logo;
		this.editForm.name = logo.name;
		this.editForm.type = logo.type || 'Empresa';
		this.editForm.websiteUrl = logo.websiteUrl || '';
		this.isEditing.set(true);
	}

	cancelEdit(): void {
		this.editingLogo = null;
		this.editForm = { name: '', type: 'Empresa', websiteUrl: '' };
		this.isEditing.set(false);
	}

	async saveEdit(): Promise<void> {
		if (!this.editingLogo || !this.editForm.name.trim()) {
			this.toast.error('El nombre no puede estar vacío');
			return;
		}

		try {
			const updatedData: Partial<Logo> = {
				name: this.editForm.name.trim(),
				type: this.editForm.type
			};

			// Solo agregar websiteUrl si tiene un valor válido
			const trimmedUrl = this.editForm.websiteUrl.trim();
			if (trimmedUrl) {
				updatedData.websiteUrl = trimmedUrl;
			}

			await this.logos.updateLogo(this.editingLogo.id!, updatedData);
			this.loadLogos();
			this.cancelEdit();
			this.toast.success('Logo actualizado exitosamente');
		} catch (error) {
			console.error('Error al actualizar el logo:', error);
			this.toast.error('Hubo un error al actualizar el logo.');
		}
	}

	// Métodos para carga masiva
	onBulkFilesSelected(event: any): void {
		const files = Array.from(event.target.files) as File[];
		if (files.length === 0) return;

		this.bulkUploadFiles = files;
		this.bulkUploadLogos = files.map(file => ({
			file: file,
			name: file.name.replace(/\.[^/.]+$/, ""), // Quitar extensión
			websiteUrl: ''
		}));
		
		// Generar previsualizaciones
		this.generateBulkPreviews();
	}

	private async generateBulkPreviews(): Promise<void> {
		for (let i = 0; i < this.bulkUploadLogos.length; i++) {
			const logoData = this.bulkUploadLogos[i];
			try {
				const normalized = await this.media.normalizeLogoImage(logoData.file);
				const fileForPreview = normalized || logoData.file;
				logoData.imageUrl = URL.createObjectURL(fileForPreview);
			} catch (error) {
				logoData.imageUrl = URL.createObjectURL(logoData.file);
			}
		}
	}

	toggleBulkUpload(): void {
		this.showBulkUpload.set(!this.showBulkUpload());
		if (!this.showBulkUpload()) {
			this.resetBulkUpload();
		}
	}

	resetBulkUpload(): void {
		this.bulkUploadFiles = [];
		this.bulkUploadLogos = [];
		this.bulkUploadProgress.set(0);
		this.isBulkUploading.set(false);
		
		// Limpiar input file
		const fileInput = document.querySelector('#bulkFileInput') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}

	async saveBulkLogos(): Promise<void> {
		if (this.bulkUploadLogos.length === 0) {
			this.toast.error('No hay logos para guardar');
			return;
		}

		// Verificar que todos tengan nombre
		const logosWithoutName = this.bulkUploadLogos.filter(logo => !logo.name.trim());
		if (logosWithoutName.length > 0) {
			this.toast.error('Todos los logos deben tener un nombre');
			return;
		}

		this.isBulkUploading.set(true);
		this.bulkUploadProgress.set(0);

		try {
			const total = this.bulkUploadLogos.length;
			
			for (let i = 0; i < total; i++) {
				const logoData = this.bulkUploadLogos[i];
				
				// Subir imagen
				const normalized = await this.media.normalizeLogoImage(logoData.file);
				const upload = await this.storage.uploadTo('public/logos', normalized || logoData.file);
				
				// Crear objeto logo
				const logo: Logo = {
					name: logoData.name.trim(),
					imageUrl: upload.url,
					type: this.bulkUploadType
				};
				
				// Solo agregar websiteUrl si tiene valor
				if (logoData.websiteUrl.trim()) {
					logo.websiteUrl = logoData.websiteUrl.trim();
				}
				
				// Guardar en Firestore
				await this.logos.addLogo(logo);
				
				// Actualizar progreso
				this.bulkUploadProgress.set(Math.round(((i + 1) / total) * 100));
			}
			
			this.toast.success(`${total} logos guardados exitosamente`);
			this.loadLogos();
			this.resetBulkUpload();
			this.showBulkUpload.set(false);
			
		} catch (error: any) {
			console.error('Error en carga masiva:', error);
			this.toast.error('Error al guardar algunos logos. Revisa la consola.');
		} finally {
			this.isBulkUploading.set(false);
		}
	}

	removeBulkLogo(index: number): void {
		this.bulkUploadLogos.splice(index, 1);
		this.bulkUploadFiles.splice(index, 1);
	}
}


