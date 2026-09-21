<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fieldId } from '@/utils/fieldId';

/**
 * STEP 5 — The error summary.
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
  () => {
    // TODO 5.5: after a failed submit, move the focus to this summary so the
    //           next Tab lands on the first faulty field.
    //           Hints: `await nextTick()`, a `tabindex="-1"` on the container.
  },
);
</script>

<template>
  <div v-if="entries.length > 0" ref="container" class="summary" role="alert">
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
