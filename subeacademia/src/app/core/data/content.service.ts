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
    const col = collection(this.db, 'posts');
    const q = query(
      col,
      where('lang', '==', lang),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(size)
    );
    return collectionData(q, { idField: 'id' }) as unknown as Observable<any[]>;
  }

  listCourses(lang: string, size = 30): Observable<any[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    const col = collection(this.db, 'courses');
    const q = query(
      col,
      where('lang', '==', lang),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(size)
    );
    return collectionData(q, { idField: 'id' }) as unknown as Observable<any[]>;
  }
}

