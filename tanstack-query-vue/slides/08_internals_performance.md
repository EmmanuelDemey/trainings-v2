---
layout: cover
---

# 08 - Internals and performance

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** what `useQuery` does in Vue: a `computed` of options, an
  observer, a `reactive` state, a scope
- **Predict** what re-renders when the cache changes
- **Keep** a Vue app fast with TanStack Query: `select`, `shallow`, keys, and
  the cost of deep reactivity

---
src: ../../tanstack-query-common/slides/08_internals_performance/architecture.md
---

---

# The Vue adapter, opened

```ts
// @tanstack/vue-query — useBaseQuery, simplified
const client = queryClient || useQueryClient();                  // inject

const defaultedOptions = computed(() => {                        // tracks the getter, the refs
  const options = typeof input === 'function' ? input() : input;
  return client.defaultQueryOptions(cloneDeepUnref(options));    // refs unwrapped
});

const observer = new QueryObserver(client, defaultedOptions.value);
const state = options.shallow ? shallowReactive(observer.getCurrentResult())
                              : reactive(observer.getCurrentResult());

const unsubscribe = observer.subscribe((result) => updateState(state, result));
watch(defaultedOptions, () => observer.setOptions(defaultedOptions.value));   // new key → new query
onScopeDispose(unsubscribe);                                     // component unmounted → observer gone

return toRefs(readonly(state));                                  // + refetch, suspense
```

- **Everything** that matters lives in `query-core`, shared with React and
  Angular: the cache, the dedup, the timers, the retries
- Vue only adds: **when** to recompute the options (a `computed`), **where**
  to put the result (a `reactive`), and **when** to stop (`onScopeDispose`)

---
src: ../../tanstack-query-common/slides/08_internals_performance/query-lifecycle.md
---

---
src: ../../tanstack-query-common/slides/08_internals_performance/performance.md
---

---

# Performance — what is Vue's

| Knob | Why, in Vue |
|---|---|
| `shallow: true` (per query, or in `defaultOptions`) | `data` in a `shallowReactive`: no proxy per row of a big payload — the data is replaced, never mutated |
| `select` | the component gets — and re-renders on — only what it uses: a refetch that brings the same count changes nothing |
| `computed` over `data` | derive once per change of `data`, not once per render — `data.value.filter(…)` in the template runs at every render |
| `:key="issue.id"` | structural sharing keeps unchanged rows **the same objects**: Vue patches only the rows that changed |
| one getter per query | everything read in it is tracked: read a big store in it, and every change of the store re-evaluates the options |
| `useQuery` in `setup`, not in a `watch` | each call creates an observer, unsubscribed with its scope — called in a watcher, they pile up |

- `markRaw` on data you put in the cache yourself, if it is huge and never
  rendered as a whole

---
src: ../../tanstack-query-common/slides/08_internals_performance/checklist.md
---

---
src: ../../tanstack-query-common/slides/retro.md
---
