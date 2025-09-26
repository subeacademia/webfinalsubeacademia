import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Session } from '../data/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private readonly collectionName = 'sessions';

  constructor(private firestore: Firestore) {}

  // Obtener todas las sesiones
  getAllSessions(): Observable<Session[]> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const q = query(sessionsRef, orderBy('startAt', 'asc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session)))
    );
  }

  // Obtener sesiones por certificación
  getSessionsByCertification(certificationId: string): Observable<Session[]> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const q = query(
      sessionsRef, 
      where('certificationId', '==', certificationId),
      orderBy('startAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session)))
    );
  }

  // Obtener sesiones por estado
  getSessionsByStatus(status: Session['status']): Observable<Session[]> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const q = query(
      sessionsRef, 
      where('status', '==', status),
      orderBy('startAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session)))
    );
  }

  // Obtener sesiones próximas
  getUpcomingSessions(): Observable<Session[]> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const now = new Date();
    const q = query(
      sessionsRef, 
      where('startAt', '>=', now),
      where('status', 'in', ['programada', 'en_curso']),
      orderBy('startAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session)))
    );
  }

  // Obtener sesión por ID
  getSessionById(id: string): Observable<Session | null> {
    const sessionRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(sessionRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() } as Session;
        }
        return null;
      })
    );
  }

  // Crear nueva sesión
  createSession(session: Omit<Session, 'id'>): Observable<string> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const sessionData = {
      ...session,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin', // TODO: Obtener del usuario actual
      updatedBy: 'admin'  // TODO: Obtener del usuario actual
    };
    
    return from(addDoc(sessionsRef, sessionData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Actualizar sesión
  updateSession(id: string, session: Partial<Session>): Observable<void> {
    const sessionRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...session,
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Obtener del usuario actual
    };
    
    return from(updateDoc(sessionRef, updateData));
  }

  // Cambiar estado de sesión
  updateSessionStatus(id: string, status: Session['status']): Observable<void> {
    const updateData: Partial<Session> = {
      status,
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Obtener del usuario actual
    };

    return this.updateSession(id, updateData);
  }

  // Eliminar sesión
  deleteSession(id: string): Observable<void> {
    const sessionRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(sessionRef));
  }

  // Obtener sesiones por rango de fechas
  getSessionsByDateRange(startDate: Date, endDate: Date): Observable<Session[]> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const q = query(
      sessionsRef, 
      where('startAt', '>=', startDate),
      where('startAt', '<=', endDate),
      orderBy('startAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session)))
    );
  }

  // Obtener sesiones por modalidad de entrega
  getSessionsByDelivery(delivery: Session['delivery']): Observable<Session[]> {
    const sessionsRef = collection(this.firestore, this.collectionName);
    const q = query(
      sessionsRef, 
      where('delivery', '==', delivery),
      orderBy('startAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session)))
    );
  }

  // Obtener estadísticas de sesiones
  getSessionStats(): Observable<{
    total: number;
    byStatus: Record<Session['status'], number>;
    upcoming: number;
    completed: number;
    cancelled: number;
  }> {
    return this.getAllSessions().pipe(
      map(sessions => {
        const stats = {
          total: sessions.length,
          byStatus: {
            'programada': 0,
            'en_curso': 0,
            'completada': 0,
            'cancelada': 0
          } as Record<Session['status'], number>,
          upcoming: 0,
          completed: 0,
          cancelled: 0
        };

        const now = new Date();

        sessions.forEach(session => {
          stats.byStatus[session.status]++;
          
          if (session.startAt > now && session.status === 'programada') {
            stats.upcoming++;
          } else if (session.status === 'completada') {
            stats.completed++;
          } else if (session.status === 'cancelada') {
            stats.cancelled++;
          }
        });

        return stats;
      })
    );
  }
}
