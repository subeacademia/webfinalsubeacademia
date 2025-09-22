import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private autoId = 1;
  toasts = signal<Toast[]>([]);

  show(kind: ToastKind, message: string, timeoutMs = 3000) {
    const id = this.autoId++;
    this.toasts.update(list => {
      const next = [...list.filter(t => t.id !== id), { id, kind, message }];
      return next.slice(-5); // no apilar más de 5
    });
    setTimeout(() => this.dismiss(id), timeoutMs);
  }

  success(msg: string) { this.show('success', msg); }
  error(msg: string) { this.show('error', msg, 5000); }
  info(msg: string) { this.show('info', msg); }
  warning(msg: string) { this.show('warning', msg); }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}


