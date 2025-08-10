import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';
import { getMockCourses, getMockPosts } from './mock-content';
import { Post } from '../models/post.model';
import { Course } from '../models/course.model';
import { generateSlug } from '../utils/slug.util';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly firestore: Firestore = inject(Firestore);

  // Posts
  getPostById(id: string): Observable<Post | undefined> {
    const ref = doc(this.firestore, 'posts', id);
    return docData(ref, { idField: 'id' }) as Observable<Post | undefined>;
  }

  getPostsByLangAndStatus(lang: 'es' | 'pt' | 'en', status: 'draft' | 'published' | 'scheduled', max = 50): Observable<Post[]> {
    const ref = collection(this.firestore, 'posts');
    const q = query(ref, where('lang', '==', lang), where('status', '==', status), orderBy('publishedAt', 'desc'), limit(max));
    return (collectionData(q, { idField: 'id' }) as unknown as Observable<Post[]>)
      .pipe(
        catchError(() => of([])),
        map((arr) => (arr && arr.length ? arr : getMockPosts(lang)))
      );
  }

  getPostBySlug(lang: 'es' | 'pt' | 'en', slug: string): Promise<Post | null> {
    const ref = collection(this.firestore, 'posts');
    const q = query(ref, where('slug', '==', slug), where('lang', '==', lang), limit(1));
    return getDocs(q).then(snap => {
      if (!snap.empty) return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as Post;
      const fallback = getMockPosts(lang).find((p) => p.slug === slug) || null;
      return fallback;
    }).catch(() => getMockPosts(lang).find((p) => p.slug === slug) || null);
  }

  createPost(post: Post): Promise<void> {
    if (!post.slug) post.slug = generateSlug(post.title);
    const ref = doc(this.firestore, 'posts', post.id);
    return setDoc(ref, post as any, { merge: false });
  }

  updatePost(id: string, data: Partial<Post>): Promise<void> {
    const ref = doc(this.firestore, 'posts', id);
    return updateDoc(ref, data as any);
  }

  deletePost(id: string): Promise<void> {
    const ref = doc(this.firestore, 'posts', id);
    return deleteDoc(ref);
  }

  // Courses
  getCourseById(id: string): Observable<Course | undefined> {
    const ref = doc(this.firestore, 'courses', id);
    return docData(ref, { idField: 'id' }) as Observable<Course | undefined>;
  }

  getCoursesByLangAndStatus(lang: 'es' | 'pt' | 'en', status: 'draft' | 'published' | 'scheduled', max = 50): Observable<Course[]> {
    const ref = collection(this.firestore, 'courses');
    const q = query(ref, where('lang', '==', lang), where('status', '==', status), orderBy('publishedAt', 'desc'), limit(max));
    return (collectionData(q, { idField: 'id' }) as unknown as Observable<Course[]>)
      .pipe(
        catchError(() => of([])),
        map((arr) => (arr && arr.length ? arr : getMockCourses(lang)))
      );
  }

  getCourseBySlug(lang: 'es' | 'pt' | 'en', slug: string): Promise<Course | null> {
    const ref = collection(this.firestore, 'courses');
    const q = query(ref, where('slug', '==', slug), where('lang', '==', lang), limit(1));
    return getDocs(q).then(snap => {
      if (!snap.empty) return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as Course;
      const fallback = getMockCourses(lang).find((c) => c.slug === slug) || null;
      return fallback;
    }).catch(() => getMockCourses(lang).find((c) => c.slug === slug) || null);
  }

  createCourse(course: Course): Promise<void> {
    if (!course.slug) course.slug = generateSlug(course.title);
    const ref = doc(this.firestore, 'courses', course.id);
    return setDoc(ref, course as any, { merge: false });
  }

  updateCourse(id: string, data: Partial<Course>): Promise<void> {
    const ref = doc(this.firestore, 'courses', id);
    return updateDoc(ref, data as any);
  }

  deleteCourse(id: string): Promise<void> {
    const ref = doc(this.firestore, 'courses', id);
    return deleteDoc(ref);
  }
}

