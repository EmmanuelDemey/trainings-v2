<script setup lang="ts">
/**
 * The wrapper. It exists **because a component never catches its own errors**:
 * Vue starts the walk at `instance.parent`, so to cover a subtree you have to be
 * outside it.
 *
 * TODO 1: catch the subtree.
 *   - hold the error in a **`shallowRef`**, not a `ref`: an `Error` is not data,
 *     making it deeply reactive costs for nothing and trips on exotic error objects
 *   - `onErrorCaptured((err, instance, info) => …)`: keep both the error and
 *     Vue's `info` string, report them with `capture(err, { info, source: 'boundary' })`,
 *     and `return false` to stop the walk here
 *   - render the fallback instead of the slot, with the message and the `info`
 *   - a `Retry` button clears the error, so the subtree gets a second chance
 *
 * TODO 2: `return false` also stops the **reporting** above you. That is why the
 *   boundary reports on its own way out — boundaries decide what the *user*
 *   sees, `errorHandler` decides what *you* see.
 */
import { shallowRef } from 'vue';
import { capture, messageOf } from '../observability/reporter';

defineProps<{ label: string }>();

const error = shallowRef<unknown>(null);
</script>

<template>
  <slot />
</template>
