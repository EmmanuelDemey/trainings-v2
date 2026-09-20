<script setup lang="ts">
/**
 * The trap, in one component: it registers `onErrorCaptured` **and** throws.
 *
 * It never catches itself. Vue's `handleError` starts at `instance.parent`, so
 * this hook is not even consulted — the error goes straight past it, to whatever
 * is wrapping this component.
 *
 * TODO 3: leave this file alone. Run it, watch its own hook do nothing, then
 *   wrap it in `<ErrorBoundary>` in `App.vue` and watch that one catch it.
 *   Write down, in the Definition of Done, the line of `runtime-core` that
 *   explains why.
 */
import { onErrorCaptured } from 'vue';
import { capture } from '../observability/reporter';

const props = defineProps<{ broken: boolean }>();

onErrorCaptured((err, _instance, info) => {
  // Never reached for this component's own render.
  capture(err, { info: `self:${info}`, source: 'boundary' });
  return false;
});

function label(): string {
  if (props.broken) throw new Error('SelfHealingPanel cannot render');
  return 'All good';
}
</script>

<template>
  <div data-testid="self-healing">{{ label() }}</div>
</template>
