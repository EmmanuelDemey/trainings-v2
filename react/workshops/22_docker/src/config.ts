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

export function getConfig(): AppConfig {
  // TODO 1.1: the VITE_ variables are replaced by `vite build`: once the image
  //   is built, they are frozen. Read `window.__ENV__` FIRST — the container
  //   rewrites it at startup — and fall back to `import.meta.env` when a runtime
  //   value is missing or empty.
  // TODO 1.2: drop the trailing slash of the URL, and default the environment
  //   to 'development'.
  // TODO 1.3: no URL anywhere is a deployment mistake: throw an Error naming
  //   both `API_BASE_URL` and `VITE_API_BASE_URL`, so whoever reads the
  //   console knows what to set.
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    environment: import.meta.env.VITE_APP_ENVIRONMENT,
  };
}
