<script setup lang="ts">
/**
 * The only component that legitimately re-renders when the filter changes.
 *
 * TODO 4: when the list it receives is empty, this table renders a header and
 *   nothing else — the app looks broken rather than empty. Render a message
 *   instead, in an element carrying `data-testid="empty"`, and keep the table
 *   out of the DOM in that case.
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

    <table>
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
