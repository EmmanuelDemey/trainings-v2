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

// TODO 4.2: validate the REQUIRED variables at module load, and throw a clear
//   error listing what is missing. Failing at startup beats failing at 3am on a
//   `undefined/api/invoices` request.
//
//   const REQUIRED = ['VITE_API_URL'] as const;
//   const missing = REQUIRED.filter((key) => !import.meta.env[key]);
//   if (missing.length > 0) throw new Error(`Missing env variables: ${missing.join(', ')}`);
//
//   Test it: comment out VITE_API_URL in `.env` and run `npm run dev`.

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  features: {
    // TODO 4.3: read `VITE_FEATURE_REPORTS`. Careful — env values are STRINGS:
    //   'false' is truthy. Compare explicitly.
    reports: false,
  },
};

// TODO 4.4: build with `npm run build:staging` and confirm the staging API URL
//   ended up in the bundle:
//     grep -r "staging" dist/assets/*.js
//
//   Then answer: could you put an API secret in a VITE_ variable? Find the
//   evidence in `dist/`, do not answer from memory.
