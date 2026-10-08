import type { ComputedRef, InjectionKey } from 'vue';

export type ToastLevel = 'info' | 'success' | 'error';
export type ToastPosition = 'top-right' | 'bottom-center';

export interface Toast {
  id: number;
  message: string;
  level: ToastLevel;
}

/** What `createToast()` accepts. Every key is optional — that is the contract. */
export interface ToastOptions {
  position?: ToastPosition;
  /** Milliseconds before a toast dismisses itself. */
  duration?: number;
  /** How many toasts may be on screen at once. The oldest goes first. */
  max?: number;
}

/** What the plugin provides, and what `useToast()` returns. */
export interface ToastApi {
  /** A read-only view: only the plugin may push. */
  readonly toasts: ComputedRef<readonly Toast[]>;
  /** Resolved once, at creation — not read again per call. */
  readonly position: ToastPosition;
  notify(message: string, level?: ToastLevel): number;
  dismiss(id: number): void;
  clear(): void;
}

/**
 * A typed key beats a string: the type flows from here to every `inject()`, and
 * a `Symbol` cannot collide with another library's key.
 */
export const toastKey: InjectionKey<ToastApi> = Symbol('toast');
