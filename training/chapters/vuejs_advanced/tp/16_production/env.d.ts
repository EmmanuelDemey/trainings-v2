/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

/**
 * TODO 4.1: type the environment variables this app reads. Without this,
 * `import.meta.env.VITE_API_URL` is `any` and a typo is invisible.
 *
 *   interface ImportMetaEnv {
 *     readonly VITE_API_URL: string;
 *     readonly VITE_FEATURE_REPORTS?: string;
 *     readonly VITE_SENTRY_DSN?: string;
 *   }
 *
 *   interface ImportMeta {
 *     readonly env: ImportMetaEnv;
 *   }
 */
