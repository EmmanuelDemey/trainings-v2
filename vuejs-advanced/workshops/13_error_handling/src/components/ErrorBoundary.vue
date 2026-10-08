<script setup lang="ts">
/**
 * The wrapper. It exists **because a component never catches its own errors**:
 * Vue starts the walk at `instance.parent`, so to cover a subtree you have to be
 * outside it.
 *
 * Already done for you: the two `shallowRef`s — not `ref`s: an `Error` is not
 * data, making it deeply reactive costs for nothing and trips on exotic error
 * objects — and the fallback in the template, which reads them.
 *
 * TODO 1: catch the subtree.
 *   - `onErrorCaptured((err, instance, info) => …)`: keep both the error and
 *     Vue's `info` string, report them with `capture(err, { info, source: 'boundary' })`,
 *     and `return false` to stop the walk here
 *   - report **before** you return `false`: stopping the walk also stops
 *     `app.config.errorHandler` from hearing about it — boundaries decide what
 *     the *user* sees, `errorHandler` decides what *you* see
 *   - `retry()` clears the error, so the subtree gets a second chance
 */
import { shallowRef } from 'vue';
import { capture, messageOf } from '../observability/reporter';

defineProps<{ label: string }>();

const error = shallowRef<unknown>(null);
const phase = shallowRef('');

function retry(): void {
  // TODO 1: clear the error — and the phase — so the slot renders again.
}
</script>

<template>
  <slot v-if="!error" />

  <div v-else role="alert" data-testid="boundary-fallback">
    <p data-testid="boundary-message">
      <strong>{{ label }}</strong> is unavailable — {{ messageOf(error) }}
    </p>
    <p class="muted" data-testid="boundary-info">Failed during: {{ phase }}</p>
    <button type="button" data-testid="retry" @click="retry()">Retry</button>
  </div>
</template>
