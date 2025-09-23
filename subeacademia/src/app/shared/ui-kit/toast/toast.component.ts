import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-20 right-4 z-[9999] space-y-2">
      <div *ngFor="let toast of toasts()" 
           class="transform transition-all duration-300 ease-in-out"
           [class]="getToastClasses(toast.type)"
           (click)="removeToast(toast.id)">
        
        <div class="flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <svg *ngIf="toast.type === 'success'" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <svg *ngIf="toast.type === 'error'" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <svg *ngIf="toast.type === 'warning'" class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <svg *ngIf="toast.type === 'info'" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ toast.title }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close button -->
          <button (click)="removeToast(toast.id)" 
                  class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-enter {
      animation: toastEnter 0.3s ease-out;
    }
    
    .toast-exit {
      animation: toastExit 0.3s ease-in;
    }
    
    @keyframes toastEnter {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes toastExit {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `]
})
export class ToastComponent {
  toasts = signal<ToastMessage[]>([]);

  addToast(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }
  }

  removeToast(id: string) {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  getToastClasses(type: ToastMessage['type']): string {
    const baseClasses = 'toast-enter cursor-pointer';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800`;
    }
  }
}
