<script setup lang="ts">
/**
 * Three tabs, one slot of screen. Switching them today is instant and the layout
 * jumps: for one frame the two panels are in the DOM together.
 *
 * TODO 4: wrap the `<component :is>` in a `<Transition>`:
 *   - `name="fade"`, so the six classes are the ones you wrote in
 *     `transitions.css`
 *   - `mode="out-in"`, so the old panel leaves BEFORE the new one enters —
 *     without it, the two stack and the layout jumps
 *   - `appear`, so the first panel fades in on load like every other one
 */
import { computed, ref } from 'vue';
import ShippedTab from './ShippedTab.vue';
import InProgressTab from './InProgressTab.vue';
import IdeasTab from './IdeasTab.vue';
import type { Release } from '../api/fakeApi';

const props = defineProps<{ releases: Release[] }>();

const TABS = [
  { key: 'shipped', label: 'Shipped', component: ShippedTab },
  { key: 'in-progress', label: 'In progress', component: InProgressTab },
  { key: 'idea', label: 'Ideas', component: IdeasTab },
] as const;

const current = ref<(typeof TABS)[number]['key']>('shipped');

const currentTab = computed(() => TABS.find((tab) => tab.key === current.value)!.component);
const currentReleases = computed(() => props.releases.filter((r) => r.status === current.value));
</script>

<template>
  <section>
    <h2>Board</h2>
    <div class="row">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        :data-testid="`tab-${tab.key}`"
        :aria-pressed="current === tab.key"
        @click="current = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <component :is="currentTab" :releases="currentReleases" />
  </section>
</template>
