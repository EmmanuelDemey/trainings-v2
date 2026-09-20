<script setup lang="ts">
/**
 * Counts every ticket of the desk, open or not. The filter is none of its
 * business — and yet its render counter moves on every keystroke.
 *
 * TODO 3.2: narrow this component's props to what it actually reads. The `state`
 *   object it receives today is rebuilt by `App.vue` on every render, so Vue can
 *   never skip this component. Take `tickets: Ticket[]` instead, and have
 *   `App.vue` pass the array itself.
 */
import { computed, onUpdated } from 'vue';
import type { Ticket, TicketStatus } from '../api/fakeApi';
import { countRender } from './renderStats';

const props = defineProps<{
  state: { tickets: Ticket[]; filter: string };
}>();

const counts = computed(() => {
  const empty: Record<TicketStatus, number> = { open: 0, pending: 0, closed: 0 };
  return props.state.tickets.reduce((acc, ticket) => {
    acc[ticket.status] += 1;
    return acc;
  }, empty);
});

const longestWait = computed(() =>
  props.state.tickets.reduce((worst, ticket) => Math.max(worst, ticket.waitingMinutes), 0),
);

onUpdated(() => countRender('StatsPanel'));
</script>

<template>
  <section>
    <h2>Desk stats</h2>
    <div class="row">
      <span>Open: <strong data-testid="open-count">{{ counts.open }}</strong></span>
      <span>Pending: <strong>{{ counts.pending }}</strong></span>
      <span>Closed: <strong>{{ counts.closed }}</strong></span>
      <span class="muted">Longest wait: {{ longestWait }} min</span>
    </div>
    <p class="muted">
      These numbers never change while you type. Watch this panel's counter anyway.
    </p>
  </section>
</template>
