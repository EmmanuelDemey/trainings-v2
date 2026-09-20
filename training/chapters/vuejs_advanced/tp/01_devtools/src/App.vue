<script setup lang="ts">
/**
 * The support desk dashboard. It works. Open the Devtools panel next to it and
 * it stops looking fine: two components re-render several times a second while
 * nothing on screen changes.
 *
 * TODO 2.2: the clock lives here, so App re-renders every second — and so does
 *   everything it passes a fresh prop to. Move the ticking state into a
 *   `ClockBadge.vue` component of its own, which renders `{{ time }}` inside
 *   `data-testid="clock"`, counts its renders as `'ClockBadge'`, and clears its
 *   interval on unmount. `App.vue` must stop reading `now`.
 *
 * TODO 3.1: `:state="{ tickets, filter }"` and `:tickets="tickets.filter(...)"`
 *   build a NEW object and a NEW array on every render of this component, so Vue
 *   can never skip a child. Hoist both into `computed()` — and once StatsPanel
 *   takes a `tickets` prop (TODO 3.2), pass it `tickets` itself, which never
 *   changes identity while you type.
 */
import { computed, onUnmounted, onUpdated, ref } from 'vue';
import FilterBar from './components/FilterBar.vue';
import StatsPanel from './components/StatsPanel.vue';
import TicketList from './components/TicketList.vue';
import RenderCounters from './components/RenderCounters.vue';
import { countRender } from './components/renderStats';
import { loadTickets, type Ticket } from './api/fakeApi';
import { matches } from './tickets';

const tickets = ref<Ticket[]>(loadTickets());
const filter = ref('');

const now = ref(new Date());
const timer = setInterval(() => {
  now.value = new Date();
}, 1000);
onUnmounted(() => clearInterval(timer));

const time = computed(() => now.value.toLocaleTimeString('en-GB'));

onUpdated(() => countRender('App'));
</script>

<template>
  <h1>
    Support desk
    <span class="muted" data-testid="clock">{{ time }}</span>
  </h1>

  <FilterBar v-model="filter" />

  <StatsPanel :state="{ tickets, filter }" />

  <TicketList :tickets="tickets.filter((ticket) => matches(ticket, filter))" />

  <RenderCounters />
</template>
