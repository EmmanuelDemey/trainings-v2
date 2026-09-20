<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchTicket, type Ticket } from '@/api/client';

const route = useRoute();
const ticket = ref<Ticket | null>(null);
const missing = ref(false);

onMounted(async () => {
  try {
    ticket.value = await fetchTicket(Number(route.params.id));
  } catch {
    missing.value = true;
  }
});
</script>

<template>
  <section>
    <p v-if="missing" class="error" data-testid="ticket-missing">No such ticket.</p>
    <template v-else-if="ticket">
      <h2 data-testid="ticket-subject">{{ ticket.subject }}</h2>
      <p class="muted">{{ ticket.requester }} — {{ ticket.priority }} — {{ ticket.status }}</p>
    </template>
    <p v-else data-testid="ticket-loading">Loading…</p>
    <RouterLink to="/tickets">Back to the queue</RouterLink>
  </section>
</template>
