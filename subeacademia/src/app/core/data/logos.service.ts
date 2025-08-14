import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { Observable, defer } from 'rxjs';
import { ClientLogo, LogoType } from '../models/logo.model';
import { MediaService } from './media.service';
import { StorageService } from '../storage.service';

@Injectable({ providedIn: 'root' })
export class LogosService {
	private readonly firestore: Firestore = inject(Firestore);
	private readonly media = inject(MediaService);
    private readonly storage = inject(StorageService);

	private logosColRef(path = 'logos') { return collection(this.firestore, path); }

	listByType(type: LogoType): Observable<ClientLogo[]> {
		return defer(() => collectionData(
			query(this.logosColRef(), where('type', '==', type), orderBy('order', 'asc')),
			{ idField: 'id' }
		)) as unknown as Observable<ClientLogo[]>;
	}

	listAll(): Observable<ClientLogo[]> {
		return defer(() => collectionData(
			query(this.logosColRef(), orderBy('type', 'asc'), orderBy('order', 'asc')),
			{ idField: 'id' }
		)) as unknown as Observable<ClientLogo[]>;
	}

    async addLogo(file: File, info: { name?: string; type: LogoType; order?: number }): Promise<ClientLogo> {
        // Normaliza a altura fija y fondo transparente y sube directo a /public/logos
        const normalized = await this.media.normalizeLogoImage(file, { targetHeight: 64, maxWidth: 220, paddingX: 12, format: 'image/png' });
        const upload = await this.storage.uploadTo('public/logos', normalized || file);
		const data: ClientLogo = {
			name: info.name,
			type: info.type,
			order: info.order ?? Date.now(),
			url: upload.url,
			path: upload.path,
			createdAt: serverTimestamp() as any,
		};
		const ref = await addDoc(this.logosColRef(), data as any);
		return { ...(data as any), id: ref.id } as ClientLogo;
	}

	async updateLogo(id: string, data: Partial<ClientLogo>): Promise<void> {
		await updateDoc(doc(this.firestore, 'logos', id), data as any);
	}

	async deleteLogo(item: ClientLogo): Promise<void> {
		try { if (item.path) await this.media.delete(item.path); } catch {}
		if (item.id) await deleteDoc(doc(this.firestore, 'logos', item.id));
	}
}


