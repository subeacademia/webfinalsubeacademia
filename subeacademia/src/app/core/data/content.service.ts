import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);

  listPosts(lang: string, size = 30): Observable<any[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    const colRef = collection(this.db, 'posts');
    const qRef = query(
      colRef,
      where('lang', '==', lang),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(size)
    );
    return collectionData(qRef, { idField: 'id' }) as unknown as Observable<any[]>;
  }

  listCourses(lang: string, size = 30): Observable<any[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    const colRef = collection(this.db, 'courses');
    const qRef = query(
      colRef,
      where('lang', '==', lang),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(size)
    );
    return collectionData(qRef, { idField: 'id' }) as unknown as Observable<any[]>;
  }
}

