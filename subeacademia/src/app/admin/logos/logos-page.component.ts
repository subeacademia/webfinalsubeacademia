import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogosService } from '../../core/data/logos.service';
import { ClientLogo } from '../../core/models/logo.model';
import { MediaService } from '../../core/data/media.service';

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
					<select class="ui-input" [(ngModel)]="form.type">
						<option value="empresa">Empresa</option>
						<option value="educacion">Institución educativa</option>
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
						<img [src]="l.url" alt="logo" class="h-16 object-contain"/>
						<div class="mt-2 w-full flex gap-2">
							<button class="btn w-full" (click)="move(l, -1)">←</button>
							<button class="btn w-full" (click)="move(l, 1)">→</button>
							<button class="btn w-full" (click)="remove(l)">Eliminar</button>
						</div>
					</div>
				</div>
			</div>
			<div>
				<h2 class="h3 mb-2">Instituciones de educación</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					<div *ngFor="let l of educacion()" class="card p-3 flex items-center justify-center">
						<img [src]="l.url" alt="logo" class="h-16 object-contain"/>
						<div class="mt-2 w-full flex gap-2">
							<button class="btn w-full" (click)="move(l, -1)">←</button>
							<button class="btn w-full" (click)="move(l, 1)">→</button>
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

	empresas = signal<ClientLogo[]>([]);
	educacion = signal<ClientLogo[]>([]);
	busy = signal(false);
	file: File | null = null;
	form: { name?: string; type: 'empresa' | 'educacion'; order?: number } = { type: 'empresa' };
	previewUrl: string | null = null;

	constructor(){
		this.logos.listByType('empresa').subscribe(v => this.empresas.set(v));
		this.logos.listByType('educacion').subscribe(v => this.educacion.set(v));
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
            await this.logos.addLogo(this.file, { name: this.form.name, type: this.form.type, order: Date.now() });
			this.file = null;
            this.previewUrl = null;
		} finally {
			this.busy.set(false);
		}
	}

	async remove(item: ClientLogo){
		await this.logos.deleteLogo(item);
	}

	async move(item: ClientLogo, delta: number){
		const list = item.type === 'empresa' ? this.empresas() : this.educacion();
		const idx = list.findIndex(i => i.id === item.id);
		if (idx < 0) return;
		const neighbor = list[idx + delta];
		const newOrder = neighbor ? (neighbor.order ?? 0) + (delta < 0 ? -1 : 1) : (Date.now());
		await this.logos.updateLogo(item.id!, { order: newOrder });
	}
}


