import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toastt {
  id: number;
  type: ToastType;
  message: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<Toastt[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private icons: Record<ToastType, string> = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
    warning: '⚠'
  };

  show(message: string, type: ToastType = 'success', duration = 3500): void {
    const toast: Toastt = {
      id: ++this.counter,
      type,
      message,
      icon: this.icons[type]
    };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'error', 5000); }
  info(message: string):    void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
