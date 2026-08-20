/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

/**
 * Typing the environment is what turns `import.meta.env.VITE_API_RUL` from a
 * silent `undefined` into a compile error.
 *
 * Note that everything here is `string` — never `boolean` or `number`. Vite
 * inlines the raw text from the `.env` file, so `VITE_FEATURE_REPORTS=false`
 * arrives as the string `'false'`, which is truthy. Typing it as `string` is
 * what forces the explicit comparison in `src/config/index.ts`.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FEATURE_REPORTS?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
