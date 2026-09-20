<script setup lang="ts">
/**
 * Three tabs, one slot of screen.
 *
 * `mode="out-in"` is what keeps the layout still: the old panel leaves, and only
 * then does the new one enter. The default mode runs both at once, so for a
 * moment two panels occupy the same place and everything below them jumps. The
 * price is a total duration that is the SUM of the two phases.
 *
 * `appear` runs the enter transition on the very first render too, so the panel
 * you land on behaves like every panel you switch to.
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

    <Transition name="fade" mode="out-in" appear>
      <component :is="currentTab" :releases="currentReleases" />
    </Transition>
  </section>
</template>
