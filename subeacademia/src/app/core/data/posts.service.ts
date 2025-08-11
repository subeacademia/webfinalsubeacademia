import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, docData, addDoc, updateDoc, query, where, orderBy, collectionData, limit, getDocs } from '@angular/fire/firestore';
import { firstValueFrom, defer } from 'rxjs';
import { TranslationService } from '../ai/translation.service';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private db = inject(Firestore);
  private translator = inject(TranslationService);
  private auth = inject(Auth, { optional: true });

  list(lang = 'es'){
    const col = collection(this.db, 'posts');
    const q = query(
      col,
      where('lang','==',lang),
      where('status','==','published'),
      orderBy('publishedAt','desc')
    );
    // Preferimos consulta optimizada; si requiere índice, fallback en memoria
    return new Promise<any[]>((resolve) => {
      getDocs(q).then(snap => {
        resolve(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      }).catch(async (e:any) => {
        if (String(e?.message || '').includes('requires an index')){
          const snap = await getDocs(query(col, where('status','==','published'), limit(50)));
          let items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          items = items.filter(p => p.lang === lang);
          items.sort((a:any,b:any)=> (b.publishedAt?.toMillis?.() ?? 0) - (a.publishedAt?.toMillis?.() ?? 0));
          resolve(items);
        } else {
          defer(() => collectionData(q, { idField:'id' })).subscribe(v => resolve(v as any));
        }
      });
    });
  }
  get(id:string){
    return defer(() => docData(doc(this.db,'posts',id), { idField:'id' }));
  }
  async create(data:any){
    const col = collection(this.db,'posts');
    const userEmail = this.auth?.currentUser?.email || null;
    const now = Date.now();
    const base = { ...data, createdAt: now, updatedAt: now, authorEmail: userEmail };
    const ref = await addDoc(col, base);
    await this.tryTranslateAndSet(ref.id, base);
    return ref;
  }

  async update(id:string, data:any){
    await updateDoc(doc(this.db,'posts',id), { ...data, updatedAt: Date.now() });
    await this.tryTranslateAndSet(id, data);
  }

  private async tryTranslateAndSet(id:string, base:any){
    try{
      if ((base.langBase || base.lang) === 'es'){
        const title = base.title; const summary = base.summary; const content = base.content;
        const [en, pt] = await Promise.all([
          firstValueFrom(this.translator.translate({ title, summary, content, to: 'en' })),
          firstValueFrom(this.translator.translate({ title, summary, content, to: 'pt' })),
        ]);
        const translations:any = {};
        if (en) translations.en = { title: en.title || title, summary: en.summary || summary, content: en.content || content };
        if (pt) translations.pt = { title: pt.title || title, summary: pt.summary || summary, content: pt.content || content };
        await updateDoc(doc(this.db,'posts',id), { translations });
      }
    }catch{
      // no-op, no rompemos el flujo de guardado
    }
  }
}

