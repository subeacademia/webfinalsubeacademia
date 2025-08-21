import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable, of, defer } from 'rxjs';
import { Collaborator } from '../models/collaborator.model';

@Injectable({ providedIn: 'root' })
export class CollaboratorsService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);

  private colRef = collection(this.db, 'collaborators');

  getCollaborators(): Observable<Collaborator[]> {
    if (!isPlatformBrowser(this.platformId)) return of([] as Collaborator[]);
    return defer(() => collectionData(this.colRef, { idField: 'id' }) as unknown as Observable<Collaborator[]>);
  }

  async addCollaborator(data: Collaborator): Promise<string> {
    const docRef = await addDoc(this.colRef, data as any);
    return docRef.id;
  }

  async updateCollaborator(id: string, changes: Partial<Collaborator>): Promise<void> {
    const ref = doc(this.db, 'collaborators', id);
    await updateDoc(ref, changes as any);
  }

  async deleteCollaborator(id: string): Promise<void> {
    const ref = doc(this.db, 'collaborators', id);
    await deleteDoc(ref);
  }
}


