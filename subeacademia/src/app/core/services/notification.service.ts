import { Injectable, inject } from '@angular/core';
import { ToastComponent, ToastMessage } from '../../shared/ui-kit/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastComponent?: ToastComponent;

  setToastComponent(component: ToastComponent) {
    this.toastComponent = component;
  }

  success(title: string, message: string, duration?: number) {
    this.showToast({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message: string, duration?: number) {
    this.showToast({
      type: 'error',
      title,
      message,
      duration
    });
  }

  warning(title: string, message: string, duration?: number) {
    this.showToast({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message: string, duration?: number) {
    this.showToast({
      type: 'info',
      title,
      message,
      duration
    });
  }

  private showToast(toast: Omit<ToastMessage, 'id'>) {
    if (this.toastComponent) {
      this.toastComponent.addToast(toast);
    } else {
      console.warn('ToastComponent not initialized');
    }
  }
}
