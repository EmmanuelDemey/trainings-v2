/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The DSN of your Sentry project — in `.env.local`, optional during the workshops. */
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
