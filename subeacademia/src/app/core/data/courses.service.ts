import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, setDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Course } from '../models';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly db = inject(Firestore);
  private readonly col = collection(this.db, 'courses');

  list(lang: string, status: 'draft'|'published'|'scheduled'|null = null): Observable<Course[]> {
    let q = query(this.col, where('lang','==',lang));
    return collectionData(q, { idField: 'id' }) as unknown as Observable<Course[]>;
  }

  get(id: string): Observable<Course | undefined> {
    return docData(doc(this.db, `courses/${id}`), { idField: 'id' }) as unknown as Observable<Course | undefined>;
  }

  create(data: Course) { return from(addDoc(this.col, data)); }
  update(id: string, data: Partial<Course>) { return from(setDoc(doc(this.db, `courses/${id}`), data as any, { merge: true })); }
  remove(id: string) { return from(deleteDoc(doc(this.db, `courses/${id}`))); }
}

