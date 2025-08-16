import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, setDoc, deleteDoc, query, where, updateDoc, orderBy, limit, getDocs } from '@angular/fire/firestore';
import { Project } from '../models';
import { Observable, from, firstValueFrom, defer, of } from 'rxjs';
import { TranslationService } from '../ai/translation.service';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly db = inject(Firestore);
  private readonly col = collection(this.db, 'projects');
  private readonly translator = inject(TranslationService);

  list(lang: string, status: 'draft'|'published'|'scheduled'|null = null): Observable<Project[]> {
    const qRef = query(
      this.col,
      where('lang','==',lang),
      where('status','==','published'),
      orderBy('publishedAt','desc')
    );
    
    return new Observable<Project[]>((observer) => {
      getDocs(qRef).then(snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Project[];
        observer.next(items); observer.complete();
      }).catch(async (e:any) => {
        if (String(e?.message || '').includes('requires an index')){
          const snap = await getDocs(query(this.col, where('status','==','published'), limit(50)));
          let items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Project[];
          items = items.filter(c => (c as any).lang === lang);
          items.sort((a:any,b:any)=> (b.publishedAt?.toMillis?.() ?? 0) - (a.publishedAt?.toMillis?.() ?? 0));
          observer.next(items); observer.complete();
        } else {
          defer(() => collectionData(qRef, { idField: 'id' })).subscribe(v => { observer.next(v as Project[]); observer.complete(); });
        }
      });
    });
  }

  get(id: string): Observable<Project | undefined> {
    return defer(() => docData(doc(this.db, `projects/${id}`), { idField: 'id' }) as unknown as Observable<Project | undefined>);
  }

  async getBySlug(slug: string): Promise<Project | null> {
    try {
      const qRef = query(this.col, where('slug', '==', slug), limit(1));
      const snap = await getDocs(qRef);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...(d.data() as any) } as Project;
    } catch {
      return null;
    }
  }

  // Método para obtener todos los proyectos (para exportación)
  async getAllProjects(): Promise<Project[]> {
    try {
      const qRef = query(this.col, orderBy('createdAt', 'desc'));
      const snap = await getDocs(qRef);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Project[];
    } catch (error) {
      console.error('Error obteniendo todos los proyectos:', error);
      return [];
    }
  }

  findProjectsByCompetencies(competencyIds: string[]): Observable<Project[]> {
    if (!competencyIds || competencyIds.length === 0) {
      return of([]);
    }

    // Buscar proyectos que contengan al menos una de las competencias especificadas
    const qRef = query(
      this.col,
      where('status', '==', 'published'),
      where('relatedCompetencies', 'array-contains-any', competencyIds),
      limit(3)
    );

    return new Observable<Project[]>((observer) => {
      getDocs(qRef).then(snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Project[];
        observer.next(items);
        observer.complete();
      }).catch(async (e: any) => {
        if (String(e?.message || '').includes('requires an index')) {
          // Fallback: buscar en memoria si no hay índice
          const snap = await getDocs(query(this.col, where('status', '==', 'published'), limit(50)));
          let items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Project[];
          items = items.filter(c => 
            c.relatedCompetencies && 
            c.relatedCompetencies.some(compId => competencyIds.includes(compId))
          );
          items = items.slice(0, 3);
          observer.next(items);
          observer.complete();
        } else {
          observer.error(e);
        }
      });
    });
  }

  async create(data: Project) {
    const base:any = { 
      ...data, 
      lang: 'es', 
      langBase: 'es', 
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: data.status || 'draft'
    };
    const ref = await addDoc(this.col, base as any);
    await this.tryTranslateAndSet(ref.id, base);
    return ref;
  }

  async update(id: string, data: Partial<Project>) {
    const updateData = { ...data, updatedAt: Date.now() };
    await setDoc(doc(this.db, `projects/${id}`), updateData as any, { merge: true });
    await this.tryTranslateAndSet(id, updateData);
  }

  remove(id: string) { 
    return from(deleteDoc(doc(this.db, `projects/${id}`))); 
  }

  private async tryTranslateAndSet(id:string, base:any){
    try{
      if ((base.langBase || base.lang) === 'es'){
        const title = (base as any).title; 
        const summary = (base as any).summary; 
        const description = (base as any).description || '';
        const clientName = (base as any).clientName || '';
        
        const [en, pt] = await Promise.all([
          firstValueFrom(this.translator.translate({ title, summary, content: description, to: 'en' })),
          firstValueFrom(this.translator.translate({ title, summary, content: description, to: 'pt' })),
        ]);
        
        const translations:any = {};
        if (en) translations.en = { 
          title: en.title || title, 
          summary: en.summary || summary, 
          description: en.content || description,
          clientName: clientName
        };
        if (pt) translations.pt = { 
          title: pt.title || title, 
          summary: pt.summary || summary, 
          description: pt.content || description,
          clientName: clientName
        };
        
        await updateDoc(doc(this.db,'projects',id), { translations });
      }
    }catch{
      // no-op
    }
  }
}
