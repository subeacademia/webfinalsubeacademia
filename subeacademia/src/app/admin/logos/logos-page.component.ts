import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogosService } from '../../core/data/logos.service';
import { Logo } from '../../core/models/logo.model';
import { MediaService } from '../../core/data/media.service';
import { StorageService } from '../../core/storage.service';
import { ToastService } from '../../core/ui/toast/toast.service';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgFor],
	template: `
	<div class="space-y-6">
		<h1 class="text-2xl font-semibold">Gestor de Logos</h1>

    <div class="card p-4 space-y-3">
        <div class="grid md:grid-cols-4 gap-3 items-end">
				<label class="block">Archivo
                <input type="file" accept="image/*" class="ui-input" (change)="onFile($event)">
				</label>
				<label class="block">Nombre
					<input class="ui-input" [(ngModel)]="form.name" placeholder="Nombre opcional">
				</label>
				<label class="block">Tipo
					<select class="ui-input" [(ngModel)]="logoType">
						<option value="Empresa">Empresa</option>
						<option value="Institución Educativa">Institución Educativa</option>
					</select>
				</label>
				<button class="btn btn-primary" (click)="add()" [disabled]="busy()">Añadir</button>
			</div>
			<div *ngIf="busy()" class="text-sm text-[var(--muted)]">Procesando…</div>
        <div *ngIf="previewUrl" class="flex items-center gap-3">
            <div class="text-sm text-[var(--muted)]">Previsualización normalizada:</div>
            <div class="card p-3 inline-flex items-center justify-center min-w-[180px]">
                <img [src]="previewUrl" alt="preview" class="h-16 object-contain"/>
            </div>
        </div>
		</div>

		<div class="grid md:grid-cols-2 gap-6">
			<div>
				<h2 class="h3 mb-2">Empresas</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					<div *ngFor="let l of empresas()" class="card p-3 flex items-center justify-center">
						<img [src]="l.imageUrl" alt="logo" class="h-16 object-contain"/>
						<div class="mt-2 w-full flex gap-2">
							<button class="btn w-full" (click)="remove(l)">Eliminar</button>
						</div>
					</div>
				</div>
			</div>
			<div>
				<h2 class="h3 mb-2">Instituciones de educación</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					<div *ngFor="let l of educacion()" class="card p-3 flex items-center justify-center">
						<img [src]="l.imageUrl" alt="logo" class="h-16 object-contain"/>
						<div class="mt-2 w-full flex gap-2">
							<button class="btn w-full" (click)="remove(l)">Eliminar</button>
						</div>
					</div>
				</div>
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

	empresas = signal<Logo[]>([]);
	educacion = signal<Logo[]>([]);
	busy = signal(false);
	file: File | null = null;
	form: { name?: string } = {};
	logoType: string = 'Empresa';
	previewUrl: string | null = null;

	constructor(){
		this.logos.listByType('Empresa').subscribe(v => this.empresas.set(v));
		this.logos.listByType('Institución Educativa').subscribe(v => this.educacion.set(v));
	}

    onFile(e: any){
		this.file = (e.target?.files?.[0] as File) || null;
		this.previewUrl = null;
		if (this.file) {
            // Genera preview normalizada (sin subir)
            this.media.normalizeLogoImage(this.file, { targetHeight: 64, maxWidth: 220, paddingX: 12, format: 'image/png' })
                .then((normalized) => {
                    const fileForPreview = normalized || this.file!;
                    this.previewUrl = URL.createObjectURL(fileForPreview);
                })
                .catch(()=>{ this.previewUrl = URL.createObjectURL(this.file!); });
		}
	}

	async add(){
		if (!this.file) return;
		this.busy.set(true);
		try {
            // Normaliza y sube la imagen a Firebase Storage
            const normalized = await this.media.normalizeLogoImage(this.file, { targetHeight: 64, maxWidth: 220, paddingX: 12, format: 'image/png' });
            const upload = await this.storage.uploadTo('public/logos', normalized || this.file);
            
            // Crea el objeto Logo y lo guarda en Firestore
            const logo: Logo = {
                name: this.form.name || this.file.name,
                imageUrl: upload.url,
                type: this.logoType as 'Empresa' | 'Institución Educativa'
            };
            
            await this.logos.addLogo(logo);
            
            // Limpia el formulario y recarga la lista
            this.file = null;
            this.previewUrl = null;
            this.form.name = '';
            
            // Muestra notificación de éxito
            this.toast.success('Logo añadido exitosamente');
            
            // Recarga la lista de logos para mostrar el nuevo
            this.refreshLogos();
            
		} catch (error) {
            console.error('Error al añadir logo:', error);
            this.toast.error('Error al añadir logo. Por favor, inténtalo de nuevo.');
		} finally {
			this.busy.set(false);
		}
	}

	async remove(item: Logo){
		await this.logos.deleteLogo(item);
	}

	private refreshLogos() {
		// Recarga las listas de logos
		this.logos.listByType('Empresa').subscribe(v => this.empresas.set(v));
		this.logos.listByType('Institución Educativa').subscribe(v => this.educacion.set(v));
	}
}


