<script setup lang="ts">
/**
 * Counts every ticket of the desk, open or not.
 *
 * The props are now exactly what the template reads. `tickets` is the array
 * `App.vue` holds in a `ref`, whose identity does not change while you type —
 * so Vue skips this component on every keystroke, and its counter stays put.
 */
import { computed, onUpdated } from 'vue';
import type { Ticket, TicketStatus } from '../api/fakeApi';
import { countRender } from './renderStats';

const props = defineProps<{ tickets: Ticket[] }>();

const counts = computed(() => {
  const empty: Record<TicketStatus, number> = { open: 0, pending: 0, closed: 0 };
  return props.tickets.reduce((acc, ticket) => {
    acc[ticket.status] += 1;
    return acc;
  }, empty);
});

const longestWait = computed(() =>
  props.tickets.reduce((worst, ticket) => Math.max(worst, ticket.waitingMinutes), 0),
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
      These numbers never change while you type — and now the counter agrees.
    </p>
  </section>
</template>
