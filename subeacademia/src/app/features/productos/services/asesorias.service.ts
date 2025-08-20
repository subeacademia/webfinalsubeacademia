import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Asesoria } from '../data/asesoria.model';

@Injectable({
  providedIn: 'root'
})
export class AsesoriasService {
  private readonly collectionName = 'asesorias';

  constructor(private firestore: Firestore) {}

  // Obtener todas las asesorías
  getAsesorias(): Observable<Asesoria[]> {
    const asesoriasRef = collection(this.firestore, this.collectionName);
    const q = query(asesoriasRef, where('activo', '==', true), orderBy('fechaCreacion', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Asesoria)))
    );
  }

  // Obtener todas las asesorías (incluyendo inactivas) para admin
  getAllAsesorias(): Observable<Asesoria[]> {
    const asesoriasRef = collection(this.firestore, this.collectionName);
    const q = query(asesoriasRef, orderBy('fechaCreacion', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Asesoria)))
    );
  }

  // Obtener asesoría por ID
  getAsesoriaById(id: string): Observable<Asesoria | null> {
    const asesoriaRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(asesoriaRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() } as Asesoria;
        }
        return null;
      })
    );
  }

  // Obtener asesoría por slug
  getAsesoriaBySlug(slug: string): Observable<Asesoria | null> {
    const asesoriasRef = collection(this.firestore, this.collectionName);
    const q = query(asesoriasRef, where('slug', '==', slug), where('activo', '==', true));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Asesoria;
        }
        return null;
      })
    );
  }

  // Crear nueva asesoría
  createAsesoria(asesoria: Omit<Asesoria, 'id'>): Observable<string> {
    const asesoriasRef = collection(this.firestore, this.collectionName);
    const asesoriaData = {
      ...asesoria,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    
    return from(addDoc(asesoriasRef, asesoriaData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Actualizar asesoría existente
  updateAsesoria(id: string, asesoria: Partial<Asesoria>): Observable<void> {
    const asesoriaRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...asesoria,
      fechaActualizacion: new Date()
    };
    
    return from(updateDoc(asesoriaRef, updateData));
  }

  // Eliminar asesoría
  deleteAsesoria(id: string): Observable<void> {
    const asesoriaRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(asesoriaRef));
  }

  // Cambiar estado de activación
  toggleAsesoriaStatus(id: string, activo: boolean): Observable<void> {
    return this.updateAsesoria(id, { activo });
  }
}
