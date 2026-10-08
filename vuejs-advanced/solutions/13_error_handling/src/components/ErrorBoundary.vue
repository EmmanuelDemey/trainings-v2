<script setup lang="ts">
/**
 * The wrapper. It exists **because a component never catches its own errors**:
 * `handleError` starts its walk at `instance.parent`, so covering a subtree
 * means being outside it. That constraint, not a style preference, is why error
 * boundaries are a component in Vue as in React.
 *
 * `shallowRef`, not `ref`: an `Error` is not data. Deep reactivity buys nothing
 * here and trips on exotic error objects.
 *
 * `return false` ends the walk — which also means `app.config.errorHandler`
 * never hears about it. That is why the reporting happens here, on the way out:
 * the boundary decides what the **user** sees, `errorHandler` what **you** see.
 */
import { onErrorCaptured, shallowRef } from 'vue';
import { capture, messageOf } from '../observability/reporter';

defineProps<{ label: string }>();

const error = shallowRef<unknown>(null);
const phase = shallowRef('');

onErrorCaptured((err, _instance, info) => {
  error.value = err;
  phase.value = info;
  capture(err, { info, source: 'boundary' });
  return false;
});

function retry(): void {
  error.value = null;
  phase.value = '';
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
