<script setup lang="ts">
/**
 * Presentational, and already covered by `tests/TicketTable.spec.ts` — the unit
 * level of this app is done. Everything you write in this workshop sits above it.
 */
import type { Ticket } from '@/api/client';

defineProps<{ tickets: Ticket[] }>();
defineEmits<{ close: [id: number] }>();
</script>

<template>
  <p v-if="tickets.length === 0" class="muted" data-testid="empty">Nothing in the queue.</p>

  <table v-else>
    <thead>
      <tr><th>#</th><th>Subject</th><th>Requester</th><th>Priority</th><th>Status</th><th></th></tr>
    </thead>
    <tbody>
      <tr v-for="ticket in tickets" :key="ticket.id" data-testid="ticket-row">
        <td>{{ ticket.id }}</td>
        <td>
          <RouterLink :to="`/tickets/${ticket.id}`" data-testid="ticket-link">{{ ticket.subject }}</RouterLink>
        </td>
        <td class="muted">{{ ticket.requester }}</td>
        <td :data-priority="ticket.priority">{{ ticket.priority }}</td>
        <td data-testid="ticket-status">{{ ticket.status }}</td>
        <td>
          <button
            type="button"
            data-testid="close-ticket"
            :disabled="ticket.status === 'closed'"
            @click="$emit('close', ticket.id)"
          >
            Close
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
