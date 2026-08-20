/**
 * Setup file for the BROWSER mode project only.
 *
 * Two differences with `tests/setup.ts`:
 *
 * 1. The real stylesheet is imported. In jsdom, CSS is parsed but never applied
 *    — `getComputedStyle()` answers with defaults, `var(--accent)` resolves to
 *    nothing. Here the browser applies it for real, which is the whole point.
 * 2. No MSW. `msw/node` interposes on Node's http layer and cannot run in a
 *    browser: the browser equivalent is `setupWorker` from `msw/browser`, which
 *    needs `npx msw init public/` to install its service worker.
 */
import '../src/style.css';
