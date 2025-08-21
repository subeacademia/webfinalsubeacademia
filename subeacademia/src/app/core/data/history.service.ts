import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, defer, of } from 'rxjs';
import { HistoryEvent } from '../models/history-event.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);
  private colRef = collection(this.db, 'history');

  list(): Observable<HistoryEvent[]> {
    if (!isPlatformBrowser(this.platformId)) return of([] as HistoryEvent[]);
    const q = query(this.colRef, orderBy('order', 'asc')) as any;
    return defer(() => collectionData(q, { idField: 'id' }) as unknown as Observable<HistoryEvent[]>);
  }
  async add(item: HistoryEvent) { const r = await addDoc(this.colRef, item as any); return r.id; }
  async update(id: string, changes: Partial<HistoryEvent>) { await updateDoc(doc(this.db, 'history', id), changes as any); }
  async delete(id: string) { await deleteDoc(doc(this.db, 'history', id)); }
}


