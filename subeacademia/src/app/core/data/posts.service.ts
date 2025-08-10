import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, setDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Post } from '../models';
import { Observable, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly db = inject(Firestore);
  private readonly col = collection(this.db, 'posts');

  list(lang: string, status: 'draft'|'published'|'scheduled'|null = null, search = ''): Observable<Post[]> {
    let q = query(this.col, where('lang','==',lang));
    // TODO: aplicar filtros por status/search si se requiere (orderBy/where)
    return collectionData(q, { idField: 'id' }) as unknown as Observable<Post[]>;
  }

  get(id: string): Observable<Post | undefined> {
    return docData(doc(this.db, `posts/${id}`), { idField: 'id' }) as unknown as Observable<Post | undefined>;
  }

  create(data: Post) { return from(addDoc(this.col, data)); }
  update(id: string, data: Partial<Post>) { return from(setDoc(doc(this.db, `posts/${id}`), data as any, { merge: true })); }
  remove(id: string) { return from(deleteDoc(doc(this.db, `posts/${id}`))); }
}

