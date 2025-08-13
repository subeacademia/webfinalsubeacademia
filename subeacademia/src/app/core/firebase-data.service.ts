import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy, limit } from '@angular/fire/firestore';
import { LogService } from './log.service';
import { Observable, catchError, defer, map, of, switchMap } from 'rxjs';

type Post = { id?: string; status?: string; lang?: string; tags?: string[]; title?: string; publishedAt?: any; };
type Course = { id?: string; status?: string; level?: string; topic?: string; title?: string; publishedAt?: any; };

@Injectable({ providedIn: 'root' })
export class FirebaseDataService {
  private fs = inject(Firestore);
  private log = inject(LogService);

  /** Helper que intenta primary y, si falla por índice/permiso, usa fallback y deja log. */
  private safeQuery<T>(area: 'posts'|'courses'|'home',
    primary$: Observable<T[]>,
    fallback$: Observable<T[]>,
    details?: any
  ): Observable<T[]> {
    return primary$.pipe(
      catchError(err => {
        const indexed = this.log.indexNeeded({ area, details }, err);
        if (!indexed) this.log.error(`[${area}] Error consultando Firestore`, err);
        this.log.warn(`[${area}] Usando Fallback sin índice`);
        return fallback$;
      })
    );
  }

  /** -------- POSTS -------- */
  getPublishedPosts(params?: { lang?: string; queryText?: string; limit?: number }): Observable<Post[]> {
    const n = params?.limit ?? 12;

    // PRIMARY (requiere índices)
    const postsCol = collection(this.fs, 'posts');
    const constraints: any[] = [ where('status','==','published'), orderBy('publishedAt','desc'), limit(n) ];
    if (params?.lang) constraints.splice(1, 0, where('lang','==', params.lang)); // status + lang + orderBy => índice
    const primary$ = defer(() => collectionData(query(postsCol, ...constraints), { idField: 'id' }) as Observable<Post[]>);

    // FALLBACK (sin índices) compatible con reglas: filtra en server por status y ordena en cliente
    const fbConstraints: any[] = [ where('status','==','published'), limit(n*3) ];
    const fallback$ = (defer(() => collectionData(query(postsCol, ...fbConstraints), { idField: 'id' }) as Observable<Post[]>))
      .pipe(
        map((rows: Post[]) => {
          let r = rows.filter(x => x?.status === 'published');
          if (params?.lang) r = r.filter(x => x.lang === params.lang);
          if (params?.queryText) {
            const q = params.queryText.toLowerCase();
            r = r.filter(x => (x.title ?? '').toLowerCase().includes(q) || (x?.tags ?? []).some(t => t.toLowerCase().includes(q)));
          }
          r.sort((a:any,b:any)=>{
            const av = (a?.publishedAt?.toMillis?.() ?? a?.publishedAt ?? 0) as number;
            const bv = (b?.publishedAt?.toMillis?.() ?? b?.publishedAt ?? 0) as number;
            return bv - av;
          });
          return r.slice(0, n);
        })
      );

    return this.safeQuery('posts', primary$, fallback$, { ...params });
  }

  /** -------- COURSES -------- */
  getPublishedCourses(params?: { level?: string; topic?: string; limit?: number }): Observable<Course[]> {
    const n = params?.limit ?? 12;

    // PRIMARY (requiere índices)
    const coursesCol = collection(this.fs, 'courses');
    const constraints: any[] = [ where('status','==','published'), orderBy('publishedAt','desc'), limit(n) ];
    if (params?.level) constraints.splice(1, 0, where('level','==', params.level)); // status + level + orderBy => índice
    if (params?.topic) constraints.splice(1, 0, where('topic','==', params.topic)); // status + topic + orderBy => otro índice
    const primary$ = defer(() => collectionData(query(coursesCol, ...constraints), { idField: 'id' }) as Observable<Course[]>);

    // FALLBACK (sin índices) compatible con reglas
    const fbConstraints: any[] = [ where('status','==','published'), limit(n*3) ];
    const fallback$ = (defer(() => collectionData(query(coursesCol, ...fbConstraints), { idField: 'id' }) as Observable<Course[]>))
      .pipe(
        map((rows: Course[]) => {
          let r = rows.filter(x => x?.status === 'published');
          if (params?.level) r = r.filter(x => x.level === params.level);
          if (params?.topic) r = r.filter(x => x.topic === params.topic);
          r.sort((a:any,b:any)=>{
            const av = (a?.publishedAt?.toMillis?.() ?? a?.publishedAt ?? 0) as number;
            const bv = (b?.publishedAt?.toMillis?.() ?? b?.publishedAt ?? 0) as number;
            return bv - av;
          });
          return r.slice(0, n);
        })
      );

    return this.safeQuery('courses', primary$, fallback$, { ...params });
  }

  /** -------- HOME (destacados) -------- */
  getHomeFeatured(lang?: string): Observable<{posts: Post[]; courses: Course[]}> {
    return this.getPublishedPosts({ lang, limit: 3 }).pipe(
      switchMap(posts => this.getPublishedCourses({ limit: 3 }).pipe(
        map(courses => ({ posts, courses }))
      ))
    );
  }

  /** Hints de índices compuestos para crear en la consola */
  getIndexHints() {
    return [
      { collection: 'posts',   fields: ['status asc', 'publishedAt desc'] },
      { collection: 'posts',   fields: ['status asc', 'lang asc', 'publishedAt desc'] },
      { collection: 'courses', fields: ['status asc', 'publishedAt desc'] },
      { collection: 'courses', fields: ['status asc', 'level asc', 'publishedAt desc'] },
      { collection: 'courses', fields: ['status asc', 'topic asc', 'publishedAt desc'] },
    ];
  }
}

