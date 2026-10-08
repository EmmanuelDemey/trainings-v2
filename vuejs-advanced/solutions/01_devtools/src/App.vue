<script setup lang="ts">
/**
 * The support desk dashboard, once the panel has been read.
 *
 * Two changes, both about **prop identity**: the ticking clock moved into its
 * own component, and the two props that were rebuilt on every render are now
 * `computed` — or, for the stats, the array itself. Vue skips a child whose
 * props are identical, and that is the only lever there was.
 */
import { computed, onUpdated, ref } from 'vue';
import ClockBadge from './components/ClockBadge.vue';
import FilterBar from './components/FilterBar.vue';
import StatsPanel from './components/StatsPanel.vue';
import TicketList from './components/TicketList.vue';
import RenderCounters from './components/RenderCounters.vue';
import { countRender } from './components/renderStats';
import { loadTickets, type Ticket } from './api/fakeApi';
import { matches } from './tickets';

const tickets = ref<Ticket[]>(loadTickets());
const filter = ref('');

const visibleTickets = computed(() => tickets.value.filter((ticket) => matches(ticket, filter.value)));

onUpdated(() => countRender('App'));
</script>

<template>
  <h1>
    Support desk
    <ClockBadge />
  </h1>

  <FilterBar v-model="filter" />

  <StatsPanel :tickets="tickets" />

  <TicketList :tickets="visibleTickets" />

  <RenderCounters />
</template>
