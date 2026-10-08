---
layout: cover
---

# 06 - Debugging with the devtools · testing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Install** the TanStack Query devtools with `withDevtools`, and **choose**
  what ships to production
- **Debug** a query from its key, its state and its observers
- **Test** components that query with `@testing-library/angular`, Vitest and
  `ng test` — a fresh client per test
- **Fake** the server at the right level: its switches, or a provider in TestBed
- **Test** an inject function alone, with `TestBed.runInInjectionContext`

---
src: ../../tanstack-query-common/slides/06_devtools_testing/devtools.md
---

---

# Devtools in Angular — `withDevtools`

```ts
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';

provideTanStackQuery(createQueryClient(), withDevtools());

// with options — a function, re-evaluated: it may read signals
provideTanStackQuery(
  createQueryClient(),
  withDevtools(() => ({ initialIsOpen: false, buttonPosition: 'bottom-left' })),
);
```

| Entry point | Development build | Production build |
|---|---|---|
| `…/devtools` | the panel | **a stub** — nothing is bundled |
| `…/devtools/production` | the panel | the panel (lazy-loaded) |

- The switch is the `development` export condition: the Angular builder sets it
  when scripts are not optimised (`ng serve`, `--configuration development`),
  `production` otherwise (`ng build`)
- Devtools on demand in production: `…/devtools/production` +
  `withDevtools((flags: Flags) => ({ loadDevtools: flags.devtools() }), { deps: [Flags] })`
- An embedded panel instead of the floating one: `injectDevtoolsPanel` from
  `…/devtools-panel`

---
src: ../../tanstack-query-common/slides/06_devtools_testing/testing-principles.md
---

---

# `ng test` — Vitest, through the Angular CLI

```json
// angular.json
"test": {
  "builder": "@angular/build:unit-test",
  "options": { "tsConfig": "tsconfig.spec.json", "include": ["**/*.spec.ts"] }
}
```

- Vitest (the default runner) in **jsdom**: no browser, no Karma, no `vitest.config.ts`
- `include` is relative to `sourceRoot` (`src/`): `src/tests/shared/workshop.spec.ts`
  is found. `import { describe, it, expect, vi } from 'vitest'` works, and so do
  the globals (`"types": ["vitest/globals"]` in `tsconfig.spec.json`)
- TestBed is initialised for you — **zoneless**, like the app: signals schedule
  change detection, Testing Library's `findBy*` / `waitFor` wait for the DOM
- The builder **bundles** the specs with the app before Vitest runs them — which
  matters for mocking (two slides on)

---

# A fresh client per test

```ts
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

export async function renderWithClient<T>(component: Type<T>, options: RenderComponentOptions<T> = {}) {
  const queryClient = createTestQueryClient();
  const result = await render(component, {
    ...options,
    providers: [provideTanStackQuery(queryClient), ...(options.providers ?? [])],
  });
  return { ...result, queryClient };
}
```

```ts
it('shows "Loading…" first, then the open issues', async () => {
  await renderWithClient(IssueList);
  expect(screen.getByTestId('list-loading')).toBeTruthy();
  expect(await screen.findByTestId('issue-1')).toBeTruthy();
});
```

- After each test, Testing Library destroys the fixture and TestBed its
  injector — which **unmounts** the client: nothing leaks into the next test

---

# Mocking — the Angular way is DI

```txt
Error: The "vi.mock" and related methods are not supported for relative imports
with the Angular unit-test system. Please use Angular TestBed for mocking dependencies.
```

```ts
// the app reads the API through a token…
export const ISSUE_API = new InjectionToken<IssueApi>('ISSUE_API', {
  providedIn: 'root',
  factory: () => ({ fetchIssues, createIssue, deleteIssue }),
});

// …so a test provides another one
await renderWithClient(IssueList, {
  providers: [{ provide: ISSUE_API, useValue: {
    fetchIssues: vi.fn<IssueApi['fetchIssues']>().mockRejectedValue(new ApiError(500, 'Boom')),
    createIssue: vi.fn<IssueApi['createIssue']>(),
    deleteIssue: vi.fn<IssueApi['deleteIssue']>(),
  } }],
});
```

- Same trade-off as `vi.mock`: the mock proves the component shows an error, not
  that the real `fetchIssues` fails that way. The fake server's switch tests more
- With `HttpClient`: `provideHttpClientTesting()` + `HttpTestingController`

---

# Testing an inject function

```ts
it('creates the issue, then invalidates every issue query', async () => {
  const queryClient = createTestQueryClient();
  TestBed.configureTestingModule({ providers: [provideTanStackQuery(queryClient)] });
  using invalidate = vi.spyOn(queryClient, 'invalidateQueries');   // restored at the end of the test

  const createIssue = TestBed.runInInjectionContext(() => injectCreateIssue());
  createIssue.mutate('Totals are rounded three times');

  await vi.waitFor(() => expect(createIssue.isSuccess()).toBe(true));
  expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
});
```

- `TestBed.runInInjectionContext` lends the injection context a field
  initializer has in a component — no host component to write
- `using` (TypeScript ≥ 5.2, `"lib": [..., "esnext.disposable"]`): Vitest's spies
  are disposable, `mockRestore()` runs when the scope ends — no `afterEach`
- `vi.waitFor` polls: the result signals update when the adapter's effect runs

---
src: ../../tanstack-query-common/slides/06_devtools_testing/jest-vitest.md
---

---

# Jest in an Angular project

```bash
npm install -D jest jest-environment-jsdom jest-preset-angular @types/jest
```

- `jest-preset-angular` compiles the components and sets TestBed up (it has a
  zoneless setup too); `@testing-library/angular` and every test of the
  workshop stay as they are — `vi.fn` → `jest.fn`, `vi.spyOn` → `jest.spyOn`
- Jest transforms **each module** on its own, without bundling: there,
  `jest.mock('../api/fakeApi')` does work — the DI seam still reads better
- Angular's own direction: **Vitest** is the default runner of new CLI projects
  (Karma remains an option); the CLI's Jest builder was experimental and is not
  the default path

---

## Workshop 06 — Debugging and testing
