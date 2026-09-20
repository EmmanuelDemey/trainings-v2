<script setup lang="ts">
/**
 * The only component that legitimately re-renders when the filter changes.
 *
 * The empty state is a branch, not a styling detail: a table with a header and
 * no row reads as a bug, and it is the state you reached by setting `filter`
 * straight from the Components tab.
 */
import { onUpdated } from 'vue';
import type { Ticket } from '../api/fakeApi';
import { countRender } from './renderStats';

defineProps<{ tickets: Ticket[] }>();

onUpdated(() => countRender('TicketList'));
</script>

<template>
  <section>
    <h2>Tickets</h2>

    <p v-if="tickets.length === 0" class="muted" data-testid="empty">
      No ticket matches this filter. Clear it to see the whole desk again.
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>Subject</th>
          <th>Requester</th>
          <th>Status</th>
          <th>Waiting</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id" data-testid="ticket-row">
          <td>{{ ticket.id }}</td>
          <td>{{ ticket.subject }}</td>
          <td class="muted">{{ ticket.requester }}</td>
          <td>{{ ticket.status }}</td>
          <td>{{ ticket.waitingMinutes }} min</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
