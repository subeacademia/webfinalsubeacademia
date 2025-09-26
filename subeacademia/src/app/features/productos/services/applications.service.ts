import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Application, ApplicationStatus } from '../data/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private readonly collectionName = 'applications';

  constructor(private firestore: Firestore) {}

  // Obtener todas las aplicaciones
  getAllApplications(): Observable<Application[]> {
    const applicationsRef = collection(this.firestore, this.collectionName);
    const q = query(applicationsRef, orderBy('createdAt', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application)))
    );
  }

  // Obtener aplicaciones por estado
  getApplicationsByStatus(status: ApplicationStatus): Observable<Application[]> {
    const applicationsRef = collection(this.firestore, this.collectionName);
    const q = query(
      applicationsRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application)))
    );
  }

  // Obtener aplicaciones por certificación
  getApplicationsByCertification(certificationId: string): Observable<Application[]> {
    const applicationsRef = collection(this.firestore, this.collectionName);
    const q = query(
      applicationsRef, 
      where('certificationId', '==', certificationId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application)))
    );
  }

  // Obtener aplicación por ID
  getApplicationById(id: string): Observable<Application | null> {
    const applicationRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(applicationRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return { id: doc.id, ...doc.data() } as Application;
        }
        return null;
      })
    );
  }

  // Crear nueva aplicación
  createApplication(application: Omit<Application, 'id'>): Observable<string> {
    const applicationsRef = collection(this.firestore, this.collectionName);
    const applicationData = {
      ...application,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user', // TODO: Obtener del usuario actual
      updatedBy: 'user'  // TODO: Obtener del usuario actual
    };
    
    return from(addDoc(applicationsRef, applicationData)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Actualizar aplicación
  updateApplication(id: string, application: Partial<Application>): Observable<void> {
    const applicationRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...application,
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Obtener del usuario actual
    };
    
    return from(updateDoc(applicationRef, updateData));
  }

  // Cambiar estado de aplicación
  updateApplicationStatus(id: string, status: ApplicationStatus, notes?: string): Observable<void> {
    const updateData: Partial<Application> = {
      status,
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Obtener del usuario actual
    };

    if (status === 'Aprobada' || status === 'Rechazada') {
      updateData.decisionAt = new Date();
    }

    if (notes) {
      updateData.notes = notes;
    }

    return this.updateApplication(id, updateData);
  }

  // Agendar entrevista
  scheduleInterview(id: string, scheduledAt: Date, panel?: string[]): Observable<void> {
    const updateData: Partial<Application> = {
      interview: {
        scheduledAt,
        panel
      },
      status: 'EntrevistaAgendada',
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Obtener del usuario actual
    };

    return this.updateApplication(id, updateData);
  }

  // Registrar puntuaciones
  updateScores(id: string, scores: Partial<Application['scores']>): Observable<void> {
    const updateData: Partial<Application> = {
      scores: {
        ...scores
      },
      updatedAt: new Date(),
      updatedBy: 'admin' // TODO: Obtener del usuario actual
    };

    return this.updateApplication(id, updateData);
  }

  // Eliminar aplicación
  deleteApplication(id: string): Observable<void> {
    const applicationRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(applicationRef));
  }

  // Obtener estadísticas de aplicaciones
  getApplicationStats(): Observable<{
    total: number;
    byStatus: Record<ApplicationStatus, number>;
    pendingReview: number;
    approved: number;
    rejected: number;
  }> {
    return this.getAllApplications().pipe(
      map(applications => {
        const stats = {
          total: applications.length,
          byStatus: {
            'Recibida': 0,
            'EnRevisión': 0,
            'EntrevistaAgendada': 0,
            'Aprobada': 0,
            'Rechazada': 0
          } as Record<ApplicationStatus, number>,
          pendingReview: 0,
          approved: 0,
          rejected: 0
        };

        applications.forEach(app => {
          stats.byStatus[app.status]++;
          
          if (app.status === 'Recibida' || app.status === 'EnRevisión') {
            stats.pendingReview++;
          } else if (app.status === 'Aprobada') {
            stats.approved++;
          } else if (app.status === 'Rechazada') {
            stats.rejected++;
          }
        });

        return stats;
      })
    );
  }
}
