<script setup lang="ts">
defineProps<{ id: number }>();

/**
 * STEP 4 — async component, Suspense, error boundary.
 *
 * `InvoiceDetail.vue` has a top-level `await`: it CANNOT be mounted without a
 * `<Suspense>` around it. Nothing renders it yet — that is your job.
 *
 * TODO 4.1: import it with `defineAsyncComponent(() => import('@/components/InvoiceDetail.vue'))`,
 *   so the detail leaves the main chunk (you will check that in step 7).
 *
 * TODO 4.2: mount it inside a `<Suspense>` and give the `#fallback` slot a real
 *   skeleton — not the word "Loading". Two loading states now exist in this app
 *   (`useAsyncData` in the list, `Suspense` here): be ready to explain, in the
 *   review, why the same app uses both.
 *
 * TODO 4.3: the boundary lives in `src/components/ErrorBoundary.vue`, already
 *   wrapped around `<RouterView>` in `App.vue`. Open `/invoices/999`: the fetch
 *   rejects. Make the boundary catch it instead of blanking the app.
 *
 * TODO 4.4 (bonus): a `:key="id"` on the async component, so navigating from
 *   invoice 1 to invoice 2 re-suspends instead of showing stale data.
 */
</script>

<template>
  <section>
    <p class="muted">TODO 4.1 — invoice {{ id }} is not rendered yet.</p>
  </section>
</template>
