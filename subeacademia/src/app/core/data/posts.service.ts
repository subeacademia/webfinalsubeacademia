import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, docData, addDoc, updateDoc, query, where, orderBy, collectionData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { TranslationService } from '../ai/translation.service';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private db = inject(Firestore);
  private translator = inject(TranslationService);

  list(lang = 'es'){
    const col = collection(this.db, 'posts');
    const q = query(col, where('lang','==',lang), where('status','in',['draft','published']), orderBy('publishedAt','desc'));
    return collectionData(q, { idField:'id' });
  }
  get(id:string){
    return docData(doc(this.db,'posts',id), { idField:'id' });
  }
  async create(data:any){
    const col = collection(this.db,'posts');
    const base = { ...data, lang: 'es', langBase: 'es', createdAt: Date.now() };
    const ref = await addDoc(col, base);
    await this.tryTranslateAndSet(ref.id, base);
    return ref;
  }

  async update(id:string, data:any){
    await updateDoc(doc(this.db,'posts',id), data);
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

