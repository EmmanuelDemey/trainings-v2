<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

/**
 * STEP 4 — the boundary that keeps one broken view from blanking the app.
 *
 * `/invoices/999` rejects in `InvoiceDetail`'s async setup. Without a boundary
 * the rejection propagates to the app root, the subtree never renders, and the
 * user gets a blank page with a console message they will never read.
 *
 * Note that `<Suspense>` does NOT do this: its `#fallback` covers "not resolved
 * yet", and a rejected promise is not "not yet", it is "never".
 */
const error = ref<Error | null>(null);

/** Bumped on retry, to force a brand-new subtree rather than a patched one. */
const attempt = ref(0);

onErrorCaptured((caught: unknown) => {
  error.value = caught instanceof Error ? caught : new Error(String(caught));

  // `false` stops the propagation: this boundary has handled it, so it must not
  // also reach `app.config.errorHandler`. Return `true` (or nothing) instead and
  // the same failure is reported twice — once here to the user, once to your
  // error tracker as if nobody had caught it. Which you want depends on whether
  // this boundary is a real recovery or a nicer-looking crash; a recovery
  // returns `false` and, if it still matters, reports it deliberately.
  return false;
});

function retry(): void {
  error.value = null;
  attempt.value += 1;
}

/**
 * What a boundary does NOT catch:
 *
 *  - an error thrown in an EVENT HANDLER — it does reach `onErrorCaptured`,
 *    because Vue invokes handlers through `callWithErrorHandling`;
 *  - an error thrown from a `setTimeout` callback, a `.then()`, or any callback
 *    Vue did not invoke — it does NOT. There is no component on the stack by
 *    then. Those need `window.onerror` / `unhandledrejection`.
 *
 * So the boundary is the *component-tree* safety net, never the whole net.
 */
</script>

<template>
  <section v-if="error" class="error-boundary" role="alert" data-testid="error-boundary">
    <h2>Something went wrong</h2>
    <p class="error">{{ error.message }}</p>
    <button type="button" @click="retry">Try again</button>
  </section>
  <slot v-else :key="attempt" />
</template>

<style scoped>
.error-boundary {
  border-color: var(--danger);
}
</style>
