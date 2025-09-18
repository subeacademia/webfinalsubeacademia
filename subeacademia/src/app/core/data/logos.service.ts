import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { Observable, defer, EMPTY, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logo } from '../models/logo.model';
import { MediaService } from './media.service';
import { StorageService } from '../storage.service';

@Injectable({ providedIn: 'root' })
export class LogosService {
	private readonly firestore: Firestore = inject(Firestore);
	private readonly media = inject(MediaService);
    private readonly storage = inject(StorageService);

	private logosColRef(path = 'logos') { return collection(this.firestore, path); }

	listByType(type: 'Empresa' | 'Institución Educativa' | 'Alianza Estratégica'): Observable<Logo[]> {
		return defer(() => collectionData(
			query(this.logosColRef(), where('type', '==', type), orderBy('createdAt', 'desc')),
			{ idField: 'id' }
		)).pipe(
			tap((logos) => console.log(`LogosService: Cargados ${logos.length} logos de tipo "${type}"`)),
			catchError((error) => {
				console.error(`LogosService: Error al cargar logos de tipo "${type}":`, error);
				// Devolver array vacío en caso de error para que el fallback funcione
				return of([]);
			})
		) as unknown as Observable<Logo[]>;
	}

	listAll(): Observable<Logo[]> {
		return defer(() => collectionData(
			query(this.logosColRef(), orderBy('type', 'asc'), orderBy('createdAt', 'desc')),
			{ idField: 'id' }
		)).pipe(
			tap((logos) => console.log(`LogosService: Cargados ${logos.length} logos en total`)),
			catchError((error) => {
				console.error('LogosService: Error al cargar todos los logos:', error);
				// Devolver array vacío en caso de error para que el fallback funcione
				return of([]);
			})
		) as unknown as Observable<Logo[]>;
	}

    async addLogo(logo: Logo): Promise<Logo> {
		try {
			console.log('LogosService: Intentando agregar logo:', logo);
			const data = {
				...logo,
				createdAt: serverTimestamp() as any,
			};
			console.log('LogosService: Datos a enviar a Firestore:', data);
			const ref = await addDoc(this.logosColRef(), data as any);
			console.log('LogosService: Logo agregado exitosamente con ID:', ref.id);
			return { ...(data as any), id: ref.id } as Logo;
		} catch (error) {
			console.error('LogosService: Error detallado al agregar logo:', error);
			throw error;
		}
	}

	async updateLogo(id: string, data: Partial<Logo>): Promise<void> {
		await updateDoc(doc(this.firestore, 'logos', id), data as any);
	}

	async deleteLogo(item: Logo): Promise<void> {
		if (item.id) await deleteDoc(doc(this.firestore, 'logos', item.id));
	}
}


