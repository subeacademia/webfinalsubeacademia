import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';

@Injectable({ providedIn: 'root' })
export class LogService {
  indexNeeded(ctx: { area: 'posts' | 'courses' | 'home'; details?: any }, err: unknown) {
    const fe = err as FirebaseError;
    if (fe?.code === 'failed-precondition' && /index/i.test(fe.message)) {
      console.warn(`[Firestore][${ctx.area}] Falta índice compuesto. Abre el enlace que imprime Firebase en esta consola y créalo.`, ctx.details ?? '');
      return true;
    }
    return false;
  }
  error(msg: string, data?: any) { console.error(msg, data ?? ''); }
  warn(msg: string, data?: any)  { console.warn(msg, data ?? ''); }
  info(msg: string, data?: any)  { console.log(msg, data ?? ''); }
}

