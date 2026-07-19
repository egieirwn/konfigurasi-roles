import { writable, derived } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

const toasts = writable<Toast[]>([]);

export function addToast(message: string, type: ToastType = 'info', duration: number = 4000) {
  const id = crypto.randomUUID();
  const toast: Toast = { id, message, type, duration };

  toasts.update((all) => [...all, toast]);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

export function removeToast(id: string) {
  toasts.update((all) => all.filter((t) => t.id !== id));
}

export const toastStore = {
  subscribe: toasts.subscribe,
  add: addToast,
  remove: removeToast,
  success: (msg: string) => addToast(msg, 'success'),
  error: (msg: string) => addToast(msg, 'error'),
  warning: (msg: string) => addToast(msg, 'warning'),
  info: (msg: string) => addToast(msg, 'info'),
};
