// src/app/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  
  // Expõe os toasts como readonly
  readonly toasts$ = this.toasts.asReadonly();

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private show(type: ToastType, message: string, duration: number = 4000): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    // Adiciona o toast
    this.toasts.update(current => [...current, toast]);

    // Remove automaticamente após a duração
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}