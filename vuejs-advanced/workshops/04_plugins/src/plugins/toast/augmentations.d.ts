import type { ToastApi } from './types';

/**
 * What a plugin registers at **runtime**, TypeScript learns here — and nowhere
 * else. This file is the price `globalProperties` and global components charge
 * that a typed `InjectionKey` does not.
 *
 * TODO 2: declare `ToastHost` as a global component, then delete its local
 *   import from `App.vue`. `app.component()` tells Vue; only this tells `vue-tsc`.
 *
 * TODO 3: declare `$toast` so `<button @click="$toast('Saved')">` is typed in
 *   every template. Without it, a global property is an `any` waiting to happen.
 */
declare module 'vue' {
  interface ComponentCustomProperties {
    // $toast: ToastApi['notify'];
  }

  interface GlobalComponents {
    // ToastHost: typeof import('./ToastHost.vue')['default'];
  }
}

export type { ToastApi };
