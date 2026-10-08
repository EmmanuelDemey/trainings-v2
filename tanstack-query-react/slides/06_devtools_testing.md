---
layout: cover
---

# 06 - Debugging with the devtools · testing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Debug** a React Query app with `ReactQueryDevtools` — and ship them, lazily,
  to production
- **Test** components that query with React Testing Library and Vitest, each
  test in a fresh client
- **Test** a custom hook in isolation with `renderHook` and a wrapper
- **Fake** the right layer — the server, a module with `vi.mock` — and spy with
  `using`
- **Run** the same tests under Jest

---
src: ../../tanstack-query-common/slides/06_devtools_testing/devtools.md
---

---

# `ReactQueryDevtools` — the two flavours

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// The floating button + panel, rendered inside the provider
<ReactQueryDevtools buttonPosition="top-right" initialIsOpen={false} />
```

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';

// Only the panel, where YOU put it — a tab of your own debug drawer
<ReactQueryDevtoolsPanel style={{ height: 400 }} />
```

- Development only: in a production build, `ReactQueryDevtools` renders `null`
  and the bundler drops it
- `client={otherClient}` to inspect a client that is not the one of the
  nearest provider
- `errorTypes` adds custom errors to the "trigger error" action — test your
  error boundaries from the panel

---

# The devtools in production, on demand

```tsx
// Not in the main bundle: a separate chunk, downloaded only when asked for
const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/production').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

function App() {
  const [showDevtools, setShowDevtools] = useState(false);

  useEffect(() => {
    // From the browser console: window.toggleDevtools()
    // (typed with `declare global { interface Window { toggleDevtools?: () => void } }`)
    window.toggleDevtools = () => setShowDevtools((shown) => !shown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
```

- `@tanstack/react-query-devtools/production` is not stripped in production
- `lazy` + `Suspense`: users who never call it never download it

---
src: ../../tanstack-query-common/slides/06_devtools_testing/testing-principles.md
---

---

# React Testing Library + Vitest — the setup

```ts
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
  },
});
```

```ts
// src/tests/setup.ts — RTL cleans up on its own only with `globals: true`
afterEach(() => {
  cleanup();
});
```

- `cleanup()` unmounts what `render` mounted: the provider unmounts, its client
  unsubscribes from focus and online events — nothing leaks into the next test
- `@testing-library/react` re-exports `screen`, `waitFor`, `within`… and wraps
  them in `act()` for you
- `@testing-library/user-event` for clicks and typing:
  `const user = userEvent.setup()` once per test

---

# `renderWithClient`

```tsx
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

export function renderWithClient(ui: ReactElement, queryClient = createTestQueryClient()) {
  return Object.assign(render(ui, { wrapper: createWrapper(queryClient) }), { queryClient });
}
```

```tsx
it('shows a loading state, then the open issues', async () => {
  renderWithClient(<IssueList />);
  expect(screen.getByTestId('list-loading')).toBeTruthy();
  expect(await screen.findByTestId('issue-1')).toBeTruthy();
});
```

---

# A hook in isolation — `renderHook`

```tsx
it('invalidates every issue query once the issue is created', async () => {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(issueKeys.list('open'), []);          // seed the cache
  using invalidate = vi.spyOn(queryClient, 'invalidateQueries'); // restored at the end of the block

  const { result } = renderHook(() => useCreateIssue(), { wrapper: createWrapper(queryClient) });
  await act(() => result.current.mutateAsync({ title: 'Totals are rounded three times' }));

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
  expect(queryClient.getQueryState(issueKeys.list('open'))?.isInvalidated).toBe(true);
});
```

- `renderHook` renders a tiny component that calls the hook, inside the
  `wrapper`: a hook that uses `useQueryClient()` needs the provider like any other
- `result.current` is the hook's **latest** return value — read it after `waitFor`,
  not from a variable taken before
- Test the hook when it holds **logic** (callbacks, cache writes); a hook that
  only forwards `queryOptions` is tested through its components

---

# Mocking a module

```tsx
// IssueList.mocked.spec.tsx — vi.mock is hoisted: it applies to the whole file
vi.mock('../api/fakeApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/fakeApi')>()),
  fetchIssues: vi.fn(),
}));

it('shows the error the query function rejects with', async () => {
  vi.mocked(fetchIssues).mockRejectedValue(new ApiError(500, 'The mocked server exploded'));
  renderWithClient(<IssueList />);
  expect((await screen.findByTestId('list-error')).textContent).toContain('exploded');
});
```

- Partial mock: everything real but `fetchIssues` — `ApiError` stays the real class
- The component gets the error **you** wrote: rename the real message, change the
  signature — this test stays green. Prefer faking the **server** (the fake API's
  switches here, MSW on a real backend); mock a module when there is no other way

---
src: ../../tanstack-query-common/slides/06_devtools_testing/jest-vitest.md
---

---

# The same tests under Jest

```js
// jest.config.js
export default {
  testEnvironment: 'jsdom',                                // npm i -D jest-environment-jsdom
  transform: { '^.+\\.(t|j)sx?$': '@swc/jest' },           // or ts-jest
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.{ts,tsx}'],
};
```

```ts
// what changes in the tests
import { jest } from '@jest/globals';      // or `globals`, then nothing to import
jest.mock('../api/fakeApi', () => ({ ...jest.requireActual('../api/fakeApi'), fetchIssues: jest.fn() }));
using invalidate = jest.spyOn(queryClient, 'invalidateQueries');   // Jest ≥ 30: spies are disposable too
```

- React Testing Library, user-event and the helpers are **identical**
- With Jest's `globals` (the default), RTL cleans up after each test on its own:
  the setup file's `afterEach` becomes optional
- `using` needs the transform to keep (or lower) it: `@swc/jest` with
  `jsc.parser.explicitResourceManagement`, or TypeScript ≥ 5.2 through `ts-jest`

---

## Workshop 06 — Testing
