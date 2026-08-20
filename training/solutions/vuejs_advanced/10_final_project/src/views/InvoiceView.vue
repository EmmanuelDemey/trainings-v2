<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

defineProps<{ id: number }>();

/**
 * STEP 4 — async component, Suspense, error boundary.
 *
 * `InvoiceDetail.vue` has a top-level `await`, so it cannot be mounted without a
 * `<Suspense>` around it. Loading it with `defineAsyncComponent` also takes it
 * out of the main chunk — check `dist/assets/` after `npm run build`.
 *
 * The `as typeof import(...)['default']` is what keeps the props type-checked:
 * `defineAsyncComponent` returns a loosely-typed component, so without it
 * `:id="id"` is unchecked. `typeof import(...)` sits in a TYPE position, so it
 * is erased — a real `import InvoiceDetail from ...` next to the dynamic one
 * would make Rollup emit `[INEFFECTIVE_DYNAMIC_IMPORT]` and fold the component
 * straight back into this chunk, which is the opposite of the point.
 */
const AsyncInvoiceDetail = defineAsyncComponent(
  () => import('@/components/InvoiceDetail.vue'),
) as (typeof import('@/components/InvoiceDetail.vue'))['default'];
</script>

<template>
  <!--
    TWO loading states in one app, and they are not redundant:

     - `useAsyncData` in the list view owns a request whose state the view wants
       to READ (retry on error, show stale data while refreshing);
     - `<Suspense>` here owns a component that cannot exist before its data does.
       There is nothing to show but a fallback, so there is nothing to hold.

    Rule of thumb: `Suspense` when the component IS the request, `useAsyncData`
    when the component OUTLIVES the request.

    `:key="id"` re-creates the component when the route param changes, so
    /invoices/1 → /invoices/2 re-suspends instead of showing invoice 1's data
    while invoice 2 loads. Remove it and the header updates before the body does.
  -->
  <Suspense>
    <AsyncInvoiceDetail :key="id" :id="id" />

    <template #fallback>
      <article class="skeleton" data-testid="invoice-skeleton" aria-busy="true">
        <div class="skeleton-line skeleton-line--title" />
        <div class="skeleton-line" />
        <div class="skeleton-line" />
        <div class="skeleton-line skeleton-line--short" />
      </article>
    </template>
  </Suspense>
</template>

<style scoped>
.skeleton {
  display: grid;
  gap: 0.6rem;
}
.skeleton-line {
  height: 0.9rem;
  border-radius: 4px;
  background: var(--border);
  animation: pulse 1.4s ease-in-out infinite;
}
.skeleton-line--title {
  height: 1.4rem;
  width: 60%;
}
.skeleton-line--short {
  width: 30%;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
