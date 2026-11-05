import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// TODO (step 2): `import { sentryVitePlugin } from '@sentry/vite-plugin';` (already
// installed), and read the `version` of package.json for the default release.

export default defineConfig({
  build: {
    // A first attempt at readable stack traces: the maps are generated… and
    // PUBLISHED next to the bundle, with every line of the source code in them.
    // TODO (step 1): generated, but not referenced by the bundle.
    sourcemap: true,
  },
  plugins: [
    react(),
    // TODO (step 2): sentryVitePlugin({ … }), LAST:
    //   - org / project / authToken from process.env (SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN)
    //   - release.name: process.env.SENTRY_RELEASE ?? `issue-tracker-web@${version}`
    //   - sourcemaps.filesToDeleteAfterUpload: ['./dist/**/*.map']
    //   - telemetry: false
  ],
});
