<script setup lang="ts">
/**
 * The trap, in one component: it registers `onErrorCaptured` **and** throws.
 *
 * It never catches itself. Vue's `handleError` starts at `instance.parent`, so
 * this hook is not even consulted — the error goes straight past it, to whatever
 * is wrapping this component.
 *
 * Nothing was changed here, and nothing needed to be: the fix was to wrap it.
 *
 *   // runtime-core, handleError()
 *   let cur = instance.parent;   // ⬅ not `instance`
 *
 * That one line is the whole story — and the reason error boundaries are a
 * wrapper component in Vue as in React.
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
