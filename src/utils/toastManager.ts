interface ToastOptions {
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(message: string, options: ToastOptions = { type: 'info' }) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      message,
      type: options.type,
      duration: options.duration ?? (options.type === 'error' ? 8000 : 5000)
    };

    this.toasts.push(toast);
    this.notify();

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(id);
    }, toast.duration);

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  // Convenience methods
  success(message: string, duration?: number) {
    return this.show(message, { type: 'success', duration });
  }

  error(message: string, duration?: number) {
    return this.show(message, { type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    return this.show(message, { type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    return this.show(message, { type: 'info', duration });
  }

  // Special method for JWT errors
  jwtExpired() {
    return this.error(
      'Your session has expired. Please refresh the page to continue.',
      10000 // Show for 10 seconds
    );
  }
}

export const toastManager = new ToastManager();

// Export types for use in components
export type { Toast, ToastOptions };
