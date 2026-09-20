import type { ToastApi } from './types';

/**
 * What the plugin registers at **runtime**, TypeScript learns here — and nowhere
 * else. `app.config.globalProperties.$toast = notify` tells Vue; only this file
 * tells `vue-tsc`. That extra step is the price `globalProperties` and global
 * components charge that a typed `InjectionKey` does not.
 */
declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: ToastApi['notify'];
  }

  interface GlobalComponents {
    ToastHost: typeof import('./ToastHost.vue')['default'];
  }
}

export type { ToastApi };
