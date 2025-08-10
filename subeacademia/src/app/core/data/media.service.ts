import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';

@Injectable({ providedIn:'root' })
export class MediaService {
  private storage = inject(Storage);

  upload(file: File, folder='public/media', onProgress?: (p:number)=>void) {
    const normFolder = folder.startsWith('public/') ? folder : `public/${folder}`;
    const key = `${normFolder}/${Date.now()}-${(crypto as any).randomUUID?.() || Math.random()}-${file.name}`;
    const r = ref(this.storage, key);
    const task = uploadBytesResumable(r, file, { contentType: file.type });

    return new Promise<{url:string,path:string,contentType:string,size:number}>((resolve, reject)=>{
      task.on('state_changed',
        (snap)=>{
          if (onProgress) onProgress(Math.round((snap.bytesTransferred/snap.totalBytes)*100));
        },
        (err)=> reject(err),
        async ()=> {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path:key, contentType:file.type, size:file.size });
        }
      );
    });
  }

  delete(path:string){ return deleteObject(ref(this.storage, path)); }
}

