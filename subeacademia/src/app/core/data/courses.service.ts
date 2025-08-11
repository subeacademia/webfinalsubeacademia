import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, setDoc, deleteDoc, query, where, updateDoc, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Course } from '../models';
import { Observable, from, firstValueFrom, defer } from 'rxjs';
import { TranslationService } from '../ai/translation.service';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly db = inject(Firestore);
  private readonly col = collection(this.db, 'courses');
  private readonly translator = inject(TranslationService);

  list(lang: string, status: 'draft'|'published'|'scheduled'|null = null): Observable<Course[]> {
    const qRef = query(
      this.col,
      where('lang','==',lang),
      where('status','==','published'),
      orderBy('publishedAt','desc')
    );
    // Encapsular fallback en memoria si requiere índice
    return new Observable<Course[]>((observer) => {
      getDocs(qRef).then(snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Course[];
        observer.next(items); observer.complete();
      }).catch(async (e:any) => {
        if (String(e?.message || '').includes('requires an index')){
          const snap = await getDocs(query(this.col, where('status','==','published'), limit(50)));
          let items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Course[];
          items = items.filter(c => (c as any).lang === lang);
          items.sort((a:any,b:any)=> (b.publishedAt?.toMillis?.() ?? 0) - (a.publishedAt?.toMillis?.() ?? 0));
          observer.next(items); observer.complete();
        } else {
          defer(() => collectionData(qRef, { idField: 'id' })).subscribe(v => { observer.next(v as Course[]); observer.complete(); });
        }
      });
    });
  }

  get(id: string): Observable<Course | undefined> {
    return defer(() => docData(doc(this.db, `courses/${id}`), { idField: 'id' }) as unknown as Observable<Course | undefined>);
  }

  async create(data: Course) {
    const base:any = { ...data, lang: 'es', langBase: 'es', createdAt: Date.now() };
    const ref = await addDoc(this.col, base as any);
    await this.tryTranslateAndSet(ref.id, base);
    return ref;
  }
  async update(id: string, data: Partial<Course>) {
    await setDoc(doc(this.db, `courses/${id}`), data as any, { merge: true });
    await this.tryTranslateAndSet(id, data);
  }
  remove(id: string) { return from(deleteDoc(doc(this.db, `courses/${id}`))); }

  private async tryTranslateAndSet(id:string, base:any){
    try{
      if ((base.langBase || base.lang) === 'es'){
        const title = (base as any).title; const summary = (base as any).summary; const content = (base as any).content || '';
        const [en, pt] = await Promise.all([
          firstValueFrom(this.translator.translate({ title, summary, content, to: 'en' })),
          firstValueFrom(this.translator.translate({ title, summary, content, to: 'pt' })),
        ]);
        const translations:any = {};
        if (en) translations.en = { title: en.title || title, summary: en.summary || summary, content: en.content || content };
        if (pt) translations.pt = { title: pt.title || title, summary: pt.summary || summary, content: pt.content || content };
        await updateDoc(doc(this.db,'courses',id), { translations });
      }
    }catch{
      // no-op
    }
  }
}

