import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

/**
 * A SECOND config, dedicated to browser mode (`npm run test:browser`), so that
 * the everyday `npm test` never has to start a browser or a driver.
 *
 * In a real project you would rather declare the two as `test.projects` in a
 * single config — see the slides of chapter 8.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // `*.browser.spec.ts` only: the jsdom specs would fail here (MSW, fake timers).
    include: ['tests/**/*.browser.spec.ts'],
    setupFiles: ['./tests/setup.browser.ts'],
    browser: {
      enabled: true,
      // WebDriver protocol, the same one Selenium speaks. WebdriverIO downloads
      // the matching driver on first run.
      provider: 'webdriverio',
      // `false` (or `npm run test:browser:headed`) to watch the tests run.
      headless: true,
      // A fixed viewport, otherwise a layout assertion depends on the window.
      viewport: { width: 1280, height: 720 },
      // One entry per browser to run. Add `{ browser: 'firefox' }` and both run.
      instances: [
        {
          browser: 'chrome',
          capabilities: {
            // Chrome's own sandbox cannot start when the kernel forbids
            // unprivileged user namespaces — the default on Ubuntu >= 24.04
            // (`/proc/sys/kernel/apparmor_restrict_unprivileged_userns` is 1)
            // and inside most CI containers. Harmless here: this browser only
            // ever loads our own test page. Drop the flag if your kernel allows
            // the sandbox.
            'goog:chromeOptions': { args: ['--no-sandbox', '--disable-dev-shm-usage'] },
          },
        },
      ],
    },
  },
});
