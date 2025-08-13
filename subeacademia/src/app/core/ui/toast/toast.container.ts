import { Component, computed, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[100] space-y-2">
      <div *ngFor="let t of toasts()" class="px-4 py-3 rounded shadow text-white flex items-center gap-3"
        [ngClass]="{
          'bg-green-600': t.kind==='success',
          'bg-red-600': t.kind==='error',
          'bg-blue-600': t.kind==='info',
          'bg-yellow-600': t.kind==='warning'
        }">
        <span class="text-sm">{{ t.message }}</span>
        <button class="text-white/80 hover:text-white" (click)="dismiss(t.id)" aria-label="Cerrar">✕</button>
      </div>
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly toast = inject(ToastService);
  toasts = computed(() => this.toast.toasts());
  dismiss(id: number) { this.toast.dismiss(id); }
}


