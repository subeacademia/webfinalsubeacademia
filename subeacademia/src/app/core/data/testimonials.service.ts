import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, where } from '@angular/fire/firestore';
import { Observable, defer, EMPTY, of, timer } from 'rxjs';
import { catchError, tap, switchMap, timeout } from 'rxjs/operators';
import { Testimonial } from '../models/testimonial.model';

@Injectable({ providedIn: 'root' })
export class TestimonialsService {
	private readonly firestore: Firestore = inject(Firestore);

	private testimonialsColRef(path = 'testimonials') { return collection(this.firestore, path); }


	listActive(): Observable<Testimonial[]> {
		console.log('🔄 TestimonialsService: Cargando testimonios desde Firestore...');
		
		return defer(() => 
			collectionData(
				query(
					this.testimonialsColRef(), 
					where('isActive', '==', true)
				),
				{ idField: 'id' }
			)
		).pipe(
			tap((testimonials) => {
				// Ordenar manualmente por displayOrder
				testimonials.sort((a, b) => (a['displayOrder'] || 0) - (b['displayOrder'] || 0));
				console.log(`✅ TestimonialsService: Cargados ${testimonials.length} testimonios activos`);
			}),
			catchError((error) => {
				console.error('❌ TestimonialsService: Error al cargar testimonios:', error);
				return of([]);
			})
		) as unknown as Observable<Testimonial[]>;
	}

	listAll(): Observable<Testimonial[]> {
		return defer(() => 
			collectionData(
				query(this.testimonialsColRef(), orderBy('createdAt', 'desc')),
				{ idField: 'id' }
			)
		).pipe(
			tap((testimonials) => console.log(`TestimonialsService: Cargados ${testimonials.length} testimonios`)),
			catchError((error) => {
				console.error('TestimonialsService: Error al cargar testimonios:', error);
				return of([]);
			})
		) as unknown as Observable<Testimonial[]>;
	}

	async addTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'createdBy'>): Promise<void> {
		try {
			const testimonialData = {
				...testimonial,
				createdAt: serverTimestamp(),
				createdBy: 'admin', // TODO: Obtener del usuario autenticado
				isActive: testimonial.isActive ?? true,
				displayOrder: testimonial.displayOrder ?? 0
			};

			await addDoc(this.testimonialsColRef(), testimonialData);
			console.log('TestimonialsService: Testimonio añadido exitosamente');
		} catch (error) {
			console.error('TestimonialsService: Error al añadir testimonio:', error);
			throw error;
		}
	}

	async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<void> {
		try {
			const testimonialRef = doc(this.firestore, 'testimonials', id);
			await updateDoc(testimonialRef, {
				...updates,
				updatedAt: serverTimestamp()
			});
			console.log('TestimonialsService: Testimonio actualizado exitosamente');
		} catch (error) {
			console.error('TestimonialsService: Error al actualizar testimonio:', error);
			throw error;
		}
	}

	async deleteTestimonial(testimonial: Testimonial): Promise<void> {
		if (!testimonial.id) {
			throw new Error('No se puede eliminar un testimonio sin ID');
		}

		try {
			const testimonialRef = doc(this.firestore, 'testimonials', testimonial.id);
			await deleteDoc(testimonialRef);
			console.log('TestimonialsService: Testimonio eliminado exitosamente');
		} catch (error) {
			console.error('TestimonialsService: Error al eliminar testimonio:', error);
			throw error;
		}
	}
}
