import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Certificacion, CertificationState, CertificationAudience, CertificationCategory, RouteType } from '../data/certificacion.model';

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
    return this.updateCertificacion(id, { active: activo });
  }

  // Nuevos métodos para el sistema de certificaciones mejorado

  // Generar slug automático
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim();
  }

  // Obtener certificaciones por estado
  getCertificacionesByState(state: CertificationState): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(
      certificacionesRef, 
      where('state', '==', state),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Obtener certificaciones por audiencia
  getCertificacionesByAudience(audience: CertificationAudience): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(
      certificacionesRef, 
      where('audience', 'in', [audience, 'Ambas']),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Obtener certificaciones por categoría
  getCertificacionesByCategory(category: CertificationCategory): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(
      certificacionesRef, 
      where('category', '==', category),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Obtener certificaciones por tipo de ruta
  getCertificacionesByRouteType(routeType: RouteType): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(
      certificacionesRef, 
      where('routeTypes', 'array-contains', routeType),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Buscar certificaciones con filtros múltiples
  searchCertificaciones(filters: {
    search?: string;
    audience?: CertificationAudience;
    category?: CertificationCategory;
    routeType?: RouteType;
    state?: CertificationState;
    language?: string;
    modality?: string;
    validity?: boolean;
  }): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    let q = query(certificacionesRef, where('active', '==', true));

    // Aplicar filtros
    if (filters.audience) {
      q = query(q, where('audience', 'in', [filters.audience, 'Ambas']));
    }
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.routeType) {
      q = query(q, where('routeTypes', 'array-contains', filters.routeType));
    }
    if (filters.state) {
      q = query(q, where('state', '==', filters.state));
    }
    if (filters.language) {
      q = query(q, where('languages', 'array-contains', filters.language));
    }
    if (filters.validity !== undefined) {
      if (filters.validity) {
        q = query(q, where('validityMonths', '>', 0));
      } else {
        q = query(q, where('validityMonths', '==', null));
      }
    }

    q = query(q, orderBy('createdAt', 'desc'));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        let results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Certificacion));

        // Aplicar filtro de búsqueda de texto en el cliente
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          results = results.filter(cert => 
            cert.title.toLowerCase().includes(searchTerm) ||
            cert.shortDescription.toLowerCase().includes(searchTerm) ||
            cert.longDescription.toLowerCase().includes(searchTerm) ||
            cert.competencies.some(comp => comp.toLowerCase().includes(searchTerm))
          );
        }

        // Aplicar filtro de modalidad en el cliente
        if (filters.modality) {
          results = results.filter(cert => {
            const modalities = cert.modalities;
            switch (filters.modality) {
              case 'asincronica': return modalities.asincronica;
              case 'enVivo': return modalities.enVivo;
              case 'hibrida': return modalities.hibrida;
              case 'presencial': return modalities.presencial;
              default: return true;
            }
          });
        }

        return results;
      })
    );
  }

  // Obtener certificaciones destacadas (para homepage)
  getFeaturedCertificaciones(limitCount: number = 6): Observable<Certificacion[]> {
    const certificacionesRef = collection(this.firestore, this.collectionName);
    const q = query(
      certificacionesRef, 
      where('active', '==', true),
      where('state', '==', 'Disponible'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Certificacion)))
    );
  }

  // Obtener certificaciones próximas
  getUpcomingCertificaciones(): Observable<Certificacion[]> {
    return this.getCertificacionesByState('Próximamente');
  }

  // Validar datos de certificación antes de guardar
  validateCertificationData(certification: Partial<Certificacion>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!certification.title?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (!certification.shortDescription?.trim()) {
      errors.push('La descripción corta es obligatoria');
    }

    if (!certification.longDescription?.trim()) {
      errors.push('La descripción larga es obligatoria');
    }

    if (!certification.audience) {
      errors.push('La audiencia es obligatoria');
    }

    if (!certification.category) {
      errors.push('La categoría es obligatoria');
    }

    if (!certification.routeTypes || certification.routeTypes.length === 0) {
      errors.push('Debe seleccionar al menos un tipo de ruta');
    }

    if (!certification.endorsers || !certification.endorsers.includes('SUBE-IA')) {
      errors.push('SUBE-IA debe estar incluido en los avales');
    }

    if (certification.evaluation?.weights) {
      const weights = certification.evaluation.weights;
      const totalWeight = (weights.exam || 0) + (weights.project || 0) + (weights.interview || 0) + (weights.defense || 0);
      if (totalWeight !== 100) {
        errors.push('Los pesos de evaluación deben sumar 100%');
      }
    }

    if (certification.routeTypes?.includes('Convalidación') && certification.durationHours && certification.durationHours > 0) {
      errors.push('Las certificaciones de convalidación deben tener 0 horas de duración');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Crear certificación con validación
  createCertificacionWithValidation(certificacion: Omit<Certificacion, 'id'>): Observable<{ success: boolean; id?: string; errors?: string[] }> {
    const validation = this.validateCertificationData(certificacion);
    
    if (!validation.valid) {
      return new Observable(observer => {
        observer.next({ success: false, errors: validation.errors });
        observer.complete();
      });
    }

    // Generar slug si no existe
    if (!certificacion.slug) {
      certificacion.slug = this.generateSlug(certificacion.title);
    }

    const certificacionesRef = collection(this.firestore, this.collectionName);
    const certificacionData = {
      ...certificacion,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin', // TODO: Obtener del usuario actual
      updatedBy: 'admin'  // TODO: Obtener del usuario actual
    };
    
    return from(addDoc(certificacionesRef, certificacionData)).pipe(
      map(docRef => ({ success: true, id: docRef.id }))
    );
  }
}
