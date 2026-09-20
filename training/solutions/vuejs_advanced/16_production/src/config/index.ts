/**
 * STEP 4 — Environment configuration.
 *
 * One module reads `import.meta.env`, everything else imports from here. That
 * makes the surface auditable: you can answer "what does this app read from the
 * environment?" by reading one file.
 */

export interface AppConfig {
  apiUrl: string;
  mode: string;
  isProduction: boolean;
  features: {
    reports: boolean;
  };
}

/**
 * Validate at module load, and fail loudly.
 *
 * The alternative is not "no error" — it is an error at 3am, on a
 * `fetch('undefined/api/invoices')` that returns the host's 404 page, from a
 * user who cannot tell you which page they were on. A blank screen at startup
 * with the missing variable named in the console is strictly better.
 *
 * Test it: comment out `VITE_API_URL` in `.env` and run `npm run dev`.
 */
const REQUIRED = ['VITE_API_URL'] as const;

const missing = REQUIRED.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing environment variable(s): ${missing.join(', ')}. ` +
      `Check your .env / .env.${import.meta.env.MODE} file.`,
  );
}

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  features: {
    // `=== 'true'`, not `Boolean(...)`. Env values are STRINGS: `'false'` is a
    // non-empty string, therefore truthy, so `Boolean('false')` is `true` and
    // your disabled feature ships enabled. This is the single most common
    // feature-flag bug there is.
    reports: import.meta.env.VITE_FEATURE_REPORTS === 'true',
  },
};

/**
 * STEP 4.4 — the evidence.
 *
 *   npm run build:staging
 *   grep -o "https://staging[^\"']*" dist/assets/*.js
 *   → https://staging.api.example.com
 *
 * So: can a `VITE_` variable hold a secret? **No.** Vite does not "pass" these
 * to the app — it TEXTUALLY REPLACES `import.meta.env.VITE_X` with its value at
 * build time. The value is in the JavaScript that every visitor downloads, and
 * `grep` finds it in seconds. Nothing prefixed `VITE_` is private: not an API
 * key, not a token, not a Sentry auth token (the DSN is fine — it is designed to
 * be public).
 *
 * A secret belongs to code the user never receives: a backend, a serverless
 * function, an edge middleware. If the browser can use it, so can anyone reading
 * the bundle.
 */
