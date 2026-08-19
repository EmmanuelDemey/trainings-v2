<script setup lang="ts">
import { ref } from 'vue';

/**
 * STEP 4 — the boundary that keeps one broken view from blanking the app.
 *
 * TODO 4.3: implement it with `onErrorCaptured((err) => { ... })`:
 *   - store the error and render the fallback instead of the slot
 *   - return `false` to stop the propagation, and be able to say WHY that
 *     matters for `app.config.errorHandler` (chapter 8bis)
 *   - "Try again" clears the error and re-renders the slot. A `:key` you bump
 *     is the usual way to force a fresh subtree.
 *
 * Then check what a boundary does NOT catch: throw from an event handler, and
 * throw from a `setTimeout`. One of the two reaches you. Know which.
 */
const error = ref<Error | null>(null);

function retry(): void {
  error.value = null;
}
</script>

<template>
  <section v-if="error" class="error-boundary" role="alert" data-testid="error-boundary">
    <h2>Something went wrong</h2>
    <p class="error">{{ error.message }}</p>
    <button type="button" @click="retry">Try again</button>
  </section>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  border-color: var(--danger);
}
</style>
