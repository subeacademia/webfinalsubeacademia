import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Certificacion } from '../data/certificacion.model';

@Injectable({
  providedIn: 'root'
})
export class CertificacionesService {
  private readonly collectionName = 'certificaciones';

  constructor(private firestore: Firestore) {}

  // Obtener todas las certificaciones
  getCertificaciones(): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(certificacionesRef, where('activo', '==', true), orderBy('fechaCreacion', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Obtener todas las certificaciones (incluyendo inactivas) para admin
  getAllCertificaciones(): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(certificacionesRef, orderBy('fechaCreacion', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Obtener certificación por ID
  getCertificacionById(id: string): Observable<Certificacion | null> {
    const certificacionRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(certificacionRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() } as Certificacion;
        }
        return null;
      })
    );
  }

  // Obtener certificación por slug
  getCertificacionBySlug(slug: string): Observable<Certificacion | null> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(certificacionesRef, where('slug', '==', slug), where('activo', '==', true));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Certificacion;
        }
        return null;
      })
    );
  }

  // Crear nueva certificación
  createCertificacion(certificacion: Omit<Certificacion, 'id'>): Observable<string> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const certificacionData = {
      ...certificacion,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    
    return from(addDoc(certificacionesRef, certificacionData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Actualizar certificación existente
  updateCertificacion(id: string, certificacion: Partial<Certificacion>): Observable<void> {
    const certificacionRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...certificacion,
      fechaActualizacion: new Date()
    };
    
    return from(updateDoc(certificacionRef, updateData));
  }

  // Eliminar certificación
  deleteCertificacion(id: string): Observable<void> {
    const certificacionRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(certificacionRef));
  }

  // Cambiar estado de activación
  toggleCertificacionStatus(id: string, activo: boolean): Observable<void> {
    return this.updateCertificacion(id, { activo });
  }
}
