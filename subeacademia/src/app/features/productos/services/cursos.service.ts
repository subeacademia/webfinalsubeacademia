import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Curso } from '../data/producto.model';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private readonly collectionName = 'cursos';
  private firestore = inject(Firestore);

  // Obtener todos los cursos
  getCursos(): Observable<Curso[]> {
    const cursosRef = collection(this.firestore, this.collectionName);
    const q = query(cursosRef, where('activo', '==', true), orderBy('fechaCreacion', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Curso)))
    );
  }

  // Obtener todos los cursos (incluyendo inactivos) para admin
  getAllCursos(): Observable<Curso[]> {
    const cursosRef = collection(this.firestore, this.collectionName);
    const q = query(cursosRef, orderBy('fechaCreacion', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Curso)))
    );
  }

  // Obtener curso por ID
  getCursoById(id: string): Observable<Curso | null> {
    const cursoRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(cursoRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() } as Curso;
        }
        return null;
      })
    );
  }

  // Obtener curso por slug
  getCursoBySlug(slug: string): Observable<Curso | null> {
    const cursosRef = collection(this.firestore, this.collectionName);
    const q = query(cursosRef, where('slug', '==', slug), where('activo', '==', true));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Curso;
        }
        return null;
      })
    );
  }

  // Crear nuevo curso
  createCurso(curso: Omit<Curso, 'id'>): Observable<string> {
    const cursosRef = collection(this.firestore, this.collectionName);
    const cursoData = {
      ...curso,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    
    return from(addDoc(cursosRef, cursoData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Actualizar curso existente
  updateCurso(id: string, curso: Partial<Curso>): Observable<void> {
    const cursoRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...curso,
      fechaActualizacion: new Date()
    };
    
    return from(updateDoc(cursoRef, updateData));
  }

  // Eliminar curso
  deleteCurso(id: string): Observable<void> {
    const cursoRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(cursoRef));
  }

  // Cambiar estado de activación
  toggleCursoStatus(id: string, activo: boolean): Observable<void> {
    return this.updateCurso(id, { activo });
  }
}
