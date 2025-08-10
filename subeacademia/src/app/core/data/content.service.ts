import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, query, where, orderBy, limit, getDocs, startAfter } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly db = inject(Firestore);
  private readonly platformId = inject(PLATFORM_ID);

  listPosts(_lang: string, size = 12, cursorPublishedAt?: number | null): Observable<any[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    const colRef = collection(this.db, 'posts');
    const parts: any[] = [
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(size),
    ];
    if (typeof cursorPublishedAt === 'number') parts.splice(2, 0, startAfter(cursorPublishedAt));
    const qRef = query(colRef, ...parts as any);
    return collectionData(qRef, { idField: 'id' }) as unknown as Observable<any[]>;
  }

  listCourses(_lang: string, size = 12, cursorPublishedAt?: number | null): Observable<any[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    const colRef = collection(this.db, 'courses');
    const parts: any[] = [
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(size),
    ];
    if (typeof cursorPublishedAt === 'number') parts.splice(2, 0, startAfter(cursorPublishedAt));
    const qRef = query(colRef, ...parts as any);
    return collectionData(qRef, { idField: 'id' }) as unknown as Observable<any[]>;
  }
}

