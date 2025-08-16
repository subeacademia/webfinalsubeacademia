import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { Observable, defer } from 'rxjs';
import { Logo } from '../models/logo.model';
import { MediaService } from './media.service';
import { StorageService } from '../storage.service';

@Injectable({ providedIn: 'root' })
export class LogosService {
	private readonly firestore: Firestore = inject(Firestore);
	private readonly media = inject(MediaService);
    private readonly storage = inject(StorageService);

	private logosColRef(path = 'logos') { return collection(this.firestore, path); }

	listByType(type: 'Empresa' | 'Institución Educativa'): Observable<Logo[]> {
		return defer(() => collectionData(
			query(this.logosColRef(), where('type', '==', type), orderBy('createdAt', 'desc')),
			{ idField: 'id' }
		)) as unknown as Observable<Logo[]>;
	}

	listAll(): Observable<Logo[]> {
		return defer(() => collectionData(
			query(this.logosColRef(), orderBy('type', 'asc'), orderBy('createdAt', 'desc')),
			{ idField: 'id' }
		)) as unknown as Observable<Logo[]>;
	}

    async addLogo(logo: Logo): Promise<Logo> {
		const data = {
			...logo,
			createdAt: serverTimestamp() as any,
		};
		const ref = await addDoc(this.logosColRef(), data as any);
		return { ...(data as any), id: ref.id } as Logo;
	}

	async updateLogo(id: string, data: Partial<Logo>): Promise<void> {
		await updateDoc(doc(this.firestore, 'logos', id), data as any);
	}

	async deleteLogo(item: Logo): Promise<void> {
		if (item.id) await deleteDoc(doc(this.firestore, 'logos', item.id));
	}
}


