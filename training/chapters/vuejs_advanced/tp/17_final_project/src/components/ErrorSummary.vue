<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { fieldId } from '@/utils/fieldId';

/**
 * Provided. One list at the top of the form, one link per error, focus moved
 * here on a failed submit — so the next Tab lands on the first faulty field.
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
    .map(([name, message]) => ({ name, message: message as string, href: `#${fieldId(name)}` })),
);

watch(
  () => props.submitCount,
  async () => {
    if (entries.value.length === 0) return;
    await nextTick();
    container.value?.focus();
  },
);
</script>

<template>
  <div
    v-if="entries.length > 0"
    ref="container"
    class="error-summary"
    role="alert"
    tabindex="-1"
    data-testid="error-summary"
  >
    <p><strong>{{ entries.length }} field(s) need your attention</strong></p>
    <ul>
      <li v-for="entry in entries" :key="entry.name">
        <a :href="entry.href">{{ entry.message }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.error-summary {
  border: 1px solid var(--danger);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.error-summary p {
  margin: 0 0 0.4rem;
}
ul {
  margin: 0;
  padding-left: 1.2rem;
}
</style>
