---
layout: cover
---

# 06 - Debugging with the devtools

## Testing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Install** and use `@tanstack/vue-query-devtools`, next to the Vue Devtools
- **Render** a component in a test with a fresh client — `@testing-library/vue`
  or `@vue/test-utils`
- **Test** a composable that uses TanStack Query, in a host component
- **Map** what you write with Vitest to Jest, and spy without cleanup code

---
src: ../../tanstack-query-common/slides/06_devtools_testing/devtools.md
---

---

# `@tanstack/vue-query-devtools`

```vue
<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
</script>

<template>
  <RouterView />
  <VueQueryDevtools :initial-is-open="false" button-position="bottom-right" position="bottom" />
</template>
```

| Prop | What |
|---|---|
| `initialIsOpen` | open on load |
| `buttonPosition` | `top-left` · `top-right` · `bottom-left` · `bottom-right` · `relative` |
| `position` | where the panel opens: `top` · `bottom` · `left` · `right` |
| `client` | another `QueryClient` than the injected one |
| `hideDisabledQueries`, `theme`, `errorTypes` | less noise, light / dark, custom errors to trigger |

- `VueQueryDevtoolsPanel`: the panel **embedded** in your own layout (an
  admin page, a debug drawer)
- **Production**: `import { VueQueryDevtools } from '@tanstack/vue-query-devtools/production'`,
  lazy-loaded behind a flag — the default import is an empty stub there

---

# And the Vue Devtools?

<div style="display: flex; gap: 2em;">
<div>

### TanStack Query devtools

- **The cache**: every query, its key, its status, its observers, its data
- **Actions**: refetch, invalidate, reset, remove, trigger loading / error
- **Mutations** tab: what was written, with what variables

</div>
<div>

### Vue Devtools (browser extension)

- **The components**: which one holds which `useQuery`, and its **refs** —
  `data`, `isPending`, `isFetching`… as the template sees them
- **Timeline**: component renders and events — did a refetch re-render the
  whole page, or one badge?

</div>
</div>

<br />

- Two views of the same thing: the **cache** (TanStack), and **what the
  components got from it** (Vue)
- `VueQueryPlugin`'s `enableDevtoolsV6Plugin: true` adds a TanStack inspector
  to the **legacy** Vue Devtools v6 — prefer the package above with Vue 3

---
src: ../../tanstack-query-common/slides/06_devtools_testing/testing-principles.md
---

---

# `renderWithClient` — with `@testing-library/vue`

```ts
// src/tests/renderWithClient.ts
import { render } from '@testing-library/vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

export function renderWithClient(component: Component, props: Record<string, unknown> = {}) {
  const queryClient = createTestQueryClient();
  const result = render(component, { props, global: { plugins: [[VueQueryPlugin, { queryClient }]] } });
  return { ...result, queryClient };
}
```

```ts
it('shows a loading state, then the open issues', async () => {
  renderWithClient(IssueList);
  expect(screen.getByTestId('list-loading')).toBeTruthy();
  expect(await screen.findByTestId('issue-1')).toBeTruthy();
});
```

- `global.plugins` is `@vue/test-utils`' `mount` option — Testing Library
  passes it through: `mount(IssueList, { global: { plugins: […] } })` works the same
- Auto-cleanup needs a global `afterEach`: `globals: true` in `vitest.config.ts`

---

# Testing a composable — a host component

```ts
// src/tests/withSetup.ts
export function withSetup<T>(composable: () => T) {
  let result: T | undefined;
  const Host = defineComponent({
    setup() {
      result = composable();         // inject works: we are in setup
      return () => null;             // renders nothing
    },
  });
  const { queryClient, unmount } = renderWithClient(Host);
  return { result: result as T, queryClient, unmount };
}
```

```ts
it('creates the issue, then invalidates every issue query', async () => {
  const { result, queryClient } = withSetup(() => useCreateIssue());
  using invalidate = vi.spyOn(queryClient, 'invalidateQueries');

  await result.mutateAsync({ title: 'Totals are rounded three times' });

  expect(result.data.value?.id).toBe(43);
  expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
});
```

- Vue has no `renderHook`: the composable needs a component's **setup** for
  `inject` and an **effect scope** for its cleanup — the host gives both
- `unmount()` disposes the scope: the observers unsubscribe

---
src: ../../tanstack-query-common/slides/06_devtools_testing/jest-vitest.md
---

---

# The Vue side of Jest

```js
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { customExportConditions: ['node', 'node-addons'] },
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
```

- `@vue/vue3-jest` compiles the single-file components — what
  `@vitejs/plugin-vue` does for Vitest
- `customExportConditions`: Vue's `exports` would otherwise resolve to its
  browser build under jsdom
- The `@/` alias, declared once more: Jest does not read `vite.config.ts`
- The tests themselves — `@testing-library/vue`, `screen`, `findBy*`,
  `jest.spyOn`, `using` — do not change

---
layout: cover
---

# Hands-on

## Workshop 06 — Debugging and testing
