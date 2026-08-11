<script setup lang="ts">
/**
 * Vue passes the rejection reason to `errorComponent` as an `error` prop.
 * Never swallow it: show something actionable.
 *
 * Note: `defineAsyncComponent` does not wire a retry button for you — the retry
 * logic lives in the `onError` option of the async component definition. Here we
 * simply reload as a last resort, which is also the right move when the failure
 * comes from a stale chunk after a new deployment.
 */
defineProps<{ error?: Error }>();

const reload = (): void => window.location.reload();
</script>

<template>
  <div class="error" data-testid="chart-error" role="alert">
    <strong>The chart could not be loaded.</strong>
    <p class="muted">{{ error?.message ?? 'Unknown error' }}</p>
    <button type="button" @click="reload">Reload the page</button>
  </div>
</template>
