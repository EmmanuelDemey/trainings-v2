# Jest or Vitest?

The programme says **Jest**; the workshops run **Vitest**. Same model, same API:

<div style="display: flex; gap: 2em;">
<div>

### What is identical

- `describe`, `it` / `test`, `expect`, `beforeEach`, `afterEach`
- The **matchers**: `toBe`, `toEqual`, `toHaveBeenCalledWith`,
  `rejects.toThrow`…
- **Testing Library** — the same packages, the same queries, the same
  `userEvent`, whatever the runner
- Mocks, spies, fake timers, snapshot tests — same concepts, `vi` instead of
  `jest`

</div>
<div>

### Why Vitest here

- Reuses the **Vite** config of the app: TypeScript, aliases, `.vue` files,
  no Babel / `ts-jest` to configure
- Native **ESM** — Jest's ESM support is still behind a flag
- Fast watch mode, and `vitest --browser` for a real browser
- Jest stays common in existing codebases (and Angular projects with
  `jest-preset-angular`): everything learnt today applies there

</div>
</div>

---

# The mapping

| Jest | Vitest | |
|---|---|---|
| globals `describe`, `it`, `expect` | `import { describe, it, expect } from 'vitest'` (or `globals: true`) | |
| `jest.fn()` | `vi.fn()` | |
| `jest.spyOn(obj, 'm')` | `vi.spyOn(obj, 'm')` | |
| `jest.mock('./api')` | `vi.mock('./api')` | both hoisted |
| `jest.requireActual('./api')` | `await vi.importActual('./api')` / `importOriginal` | async in Vitest |
| `jest.mocked(fn)` | `vi.mocked(fn)` | typing helper |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` | |
| `jest.advanceTimersByTime(ms)` | `vi.advanceTimersByTime(ms)` / `await vi.advanceTimersByTimeAsync(ms)` | prefer the async one with promises |
| `jest.clearAllMocks()` / `restoreAllMocks()` | `vi.clearAllMocks()` / `vi.restoreAllMocks()` | |
| `jest.config.js`, `testEnvironment: 'jsdom'` | `vitest.config.ts` / `test:` in `vite.config.ts`, `environment: 'jsdom'` | |
| `setupFilesAfterEach` → `setupFilesAfterEnv` | `setupFiles` | |

<style>
table { font-size: 0.78em; }
</style>

---

# Spies that clean up after themselves

```ts
import { expect, it, vi } from 'vitest';
import * as api from '../api/fakeApi';

it('asks the server once for two components', async () => {
  using fetchSpy = vi.spyOn(api, 'fetchIssues');      // restored at the end of the block

  await renderApp();
  await screen.findByTestId('issue-1');

  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy).toHaveBeenCalledWith('open');
});
```

- `using` (Explicit Resource Management, TypeScript ≥ 5.2): the spy is
  **disposed** at the end of the scope — Vitest ≥ 3 calls `mockRestore()` —
  even if an assertion throws
- No `afterEach(() => spy.mockRestore())`, no `let spy` outside the test
- Jest ≥ 30 supports the same `using spy = jest.spyOn(…)`
- Don't put `using` in a `beforeEach`: the spy would be restored at the end of
  the **hook**, before the test runs

---

# Running the workshop tests under Jest

If your team runs Jest, the specs port with a few changes:

```js
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },   // or babel-jest / @swc/jest
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
};
```

1. Replace `import { … } from 'vitest'` by `@jest/globals` (or rely on globals)
2. `vi.` → `jest.`; `vi.mock` with `importOriginal` → `jest.mock` +
   `jest.requireActual`
3. Framework files: `.vue` needs `@vue/vue3-jest`; Angular uses
   `jest-preset-angular`; React works with `ts-jest` / SWC
4. Run with `NODE_OPTIONS=--experimental-vm-modules npx jest` for native ESM

- **Nothing** changes in the Testing Library code, the `renderApp` helper's
  logic, or the TanStack Query setup — the principles of this chapter are
  runner-independent
