/**
 * The one module that reads the configuration. Everything else calls
 * `getConfig()` — so "what does this app read from its environment?" has a
 * one-file answer.
 */

/** What the container writes into `/env.js` at startup (docker/40-env-js.sh). */
export interface RuntimeEnv {
  API_BASE_URL?: string;
  APP_ENVIRONMENT?: string;
}

declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

export interface AppConfig {
  /** Without a trailing slash. */
  apiBaseUrl: string;
  environment: string;
}

/**
 * The runtime value when there is one, the build-time value otherwise. An empty
 * string counts as "not set": it is what the container writes for a variable it
 * was not given, and what a manifest with `value: ''` produces.
 */
function pick(runtime: string | undefined, buildTime: string | undefined): string {
  return runtime?.trim() || buildTime?.trim() || '';
}

export function getConfig(): AppConfig {
  // Read at CALL time, not at module load: `/env.js` is a classic script that
  // runs before the bundle, but reading lazily keeps this testable and never
  // depends on the order of the imports.
  const runtime = window.__ENV__ ?? {};

  // `import.meta.env.VITE_…` is replaced by its value at `vite build` time —
  // it is the default baked into the image. `window.__ENV__` is written when the
  // container STARTS: the same image runs in staging and in production.
  const apiBaseUrl = pick(runtime.API_BASE_URL, import.meta.env.VITE_API_BASE_URL);
  if (!apiBaseUrl) {
    // Failing here, with both names, beats a `fetch('/people')` against the
    // wrong origin that nobody can trace back to a missing variable.
    throw new Error('No API base URL: set API_BASE_URL on the container, or VITE_API_BASE_URL at build time.');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    environment: pick(runtime.APP_ENVIRONMENT, import.meta.env.VITE_APP_ENVIRONMENT) || 'development',
  };
}
