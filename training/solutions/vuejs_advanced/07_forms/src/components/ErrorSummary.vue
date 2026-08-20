<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { fieldId } from '@/utils/fieldId';

/**
 * STEP 6 — The error summary.
 *
 * On an invalid submit, a sighted user scans the page for the red bits. Everyone
 * else needs this: one list, at the top, with a link per error, and the focus
 * moved to it.
 */
const props = defineProps<{
  errors: Record<string, string | undefined>;
  /** Bumped on every submit attempt, so we know when to (re)announce. */
  submitCount: number;
}>();

const container = ref<HTMLElement | null>(null);

const entries = computed(() =>
  Object.entries(props.errors)
    .filter(([, message]) => Boolean(message))
    .map(([path, message]) => ({ path, message: message as string, href: `#${fieldId(path)}` })),
);

watch(
  () => props.submitCount,
  async () => {
    if (entries.value.length === 0) return;

    // `nextTick` because the summary may not be in the DOM yet: this watcher
    // fires on the submit that CREATED the errors.
    await nextTick();

    // Moving the focus here does two things at once: the message is announced,
    // and the next Tab lands on the first link — one keystroke from the first
    // faulty field. `tabindex="-1"` makes the div focusable programmatically
    // without inserting it into the tab order.
    container.value?.focus();
  },
);
</script>

<template>
  <div v-if="entries.length > 0" ref="container" class="summary" role="alert" tabindex="-1">
    <p><strong>{{ entries.length }} field(s) need your attention</strong></p>
    <ul>
      <li v-for="entry in entries" :key="entry.path">
        <!-- These links only work because every control carries `fieldId(path)`
             as its id — `TextField` does it, and the hand-written controls in
             `VeeForm.vue` (plan, company, consent) do it too. A summary that
             links to nothing is worse than no summary. -->
        <a :href="entry.href">{{ entry.message }}</a>
      </li>
    </ul>
  </div>
</template>
