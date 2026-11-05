import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  build: {
    // The maps are generated — Sentry needs them — but the bundle does not
    // point to them: no `//# sourceMappingURL=` comment, nothing for a browser
    // (or a competitor) to download.
    sourcemap: 'hidden',
  },
  plugins: [
    react(),
    // LAST: it reads the output of every other plugin.
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // A secret: in the CI's environment, never in the repository. Without it
      // the plugin warns and uploads nothing — the build still succeeds.
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Injected in the bundle: `Sentry.init` picks it up, no `release` option needed.
      release: { name: process.env.SENTRY_RELEASE ?? `issue-tracker-web@${version}` },
      sourcemaps: {
        // Uploaded to Sentry, then deleted: they never reach the web server.
        filesToDeleteAfterUpload: ['./dist/**/*.map'],
      },
      telemetry: false,
    }),
  ],
});
